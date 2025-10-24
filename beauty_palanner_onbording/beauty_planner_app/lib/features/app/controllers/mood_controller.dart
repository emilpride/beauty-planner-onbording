import 'dart:async';
import 'package:intl/intl.dart';
import 'package:logger/logger.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';
import 'dart:math' as math;

import '../../../data/models/mood_model.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/mood/mood_repository.dart';
import '../../../utils/formatters/formatters.dart';
import '../../../utils/local_storage/storage_utility.dart';

final logger = Logger();

class MoodController extends GetxController {
  static const Duration _syncInterval = Duration(minutes: 5);
  static const Duration _cleanupInterval = Duration(hours: 12);
  static const int _maxRetryAttempts = 3;
  static const Duration _retryInterval = Duration(minutes: 2);

  // Core data structures - offline-first
  final RxMap<String, MoodEntry> moodEntryMap = <String, MoodEntry>{}.obs;
  final RxMap<String, MoodEntry> pendingUpdates = <String, MoodEntry>{}.obs;
  final RxSet<String> pendingDeletes = <String>{}.obs;
  final RxSet<String> failedSyncIds = <String>{}.obs;

  // State management
  final RxBool _isInitialized = false.obs;
  final RxBool _isSyncing = false.obs;
  final Rx<DateTime?> _lastSuccessfulSync = Rx<DateTime?>(null);
  final RxString _lastSyncError = ''.obs;

  // UI state
  final Rx<DateTime> focusedDay = DateTime.now().obs;
  final List<String> months = DateFormat.MMMM().dateSymbols.MONTHS;
  List<int> years = [];
  final RxMap<String, int> moodData =
      <String, int>{}.obs; // For calendar display
  final RxInt x = 0.obs;

  // Dependencies
  late final MoodRepository _moodRepository;
  Completer<void>? _initCompleter;
  Completer<void>? _syncCompleter;

  // Timers
  Timer? _syncTimer;
  Timer? _cleanupTimer;
  Timer? _retryTimer;
  Timer? _syncDebounceTimer;

  // User reference
  Rx<UserModel> userModel = UserModel.empty().obs;

  final Logger _logger = logger;
  bool _saveInProgress = false;

  @override
  void onInit() {
    super.onInit();
    _moodRepository = Get.put(MoodRepository());
    _setupUserWatcher();
  }

  @override
  void onClose() {
    _syncTimer?.cancel();
    _cleanupTimer?.cancel();
    _retryTimer?.cancel();
    _syncDebounceTimer?.cancel();
    _logger.d('MoodController disposed.');
    super.onClose();
  }

  static MoodController get instance => Get.find();

  // Getters
  bool get isInitialized => _isInitialized.value;
  bool get isSyncing => _isSyncing.value;
  DateTime? get lastSuccessfulSync => _lastSuccessfulSync.value;
  String get lastSyncError => _lastSyncError.value;
  bool get hasPendingUpdates =>
      pendingUpdates.isNotEmpty || pendingDeletes.isNotEmpty;
  bool get hasFailedSyncs => failedSyncIds.isNotEmpty;

  void _setupUserWatcher() {
    ever(userModel, (UserModel user) {
      if (_isInitialized.value && user.id.isNotEmpty) {
        _generateMoodData();
      }
    });
  }

  Future<void> ensureInitialized() async {
    if (_isInitialized.value) return;

    if (_initCompleter != null && !_initCompleter!.isCompleted) {
      return _initCompleter!.future;
    }

    _initCompleter = Completer<void>();

    try {
      await initialize();
      moodEntryMap.isNotEmpty
          ? years = List.generate(
            moodEntryMap.values.last.date.year -
                moodEntryMap.values.first.date.year,
            (index) => moodEntryMap.values.first.date.year + index,
          )
          : years = [DateTime.now().year, DateTime.now().year + 1];
      // _loadMockData();
      _initCompleter!.complete();
    } catch (e) {
      if (!_initCompleter!.isCompleted) {
        _initCompleter!.completeError(e);
      }
      rethrow;
    }
  }

  // Public API methods
  Future<void> addMoodEntry(int moodValue, String feeling) async {
    if (!_isInitialized.value) return;

    final today = DateTime.now();
    final dateKey = _generateDateKey(today);

    // Check if entry already exists for today
    final existingEntry = moodEntryMap[dateKey];

    final entry = MoodEntry(
      id: existingEntry?.id ?? const Uuid().v4(),
      userId: userModel.value.id,
      date: DateTime(today.year, today.month, today.day),
      mood: moodValue,
      feeling: feeling,
      updatedAt: DateTime.now(),
    );

    // Update local storage immediately (offline-first)
    moodEntryMap[dateKey] = entry;
    pendingUpdates[dateKey] = entry;

    // Update UI data
    _generateMoodData();

    x.value++;

    // Save locally and schedule sync
    await _saveAllLocalData();
    _scheduleBackgroundSync();

    _logger.i(
      'Added mood entry for $dateKey: mood=$moodValue, feeling=$feeling',
    );
  }

  Future<void> updateMoodEntry(
    DateTime date,
    int moodValue,
    String feeling,
  ) async {
    if (!_isInitialized.value) return;

    final dateKey = _generateDateKey(date);
    final existingEntry = moodEntryMap[dateKey];

    if (existingEntry == null) {
      _logger.w('No mood entry found for $dateKey to update');
      return;
    }

    final updatedEntry = existingEntry.copyWith(
      mood: moodValue,
      feeling: feeling,
      updatedAt: DateTime.now(),
    );

    // Update local storage
    moodEntryMap[dateKey] = updatedEntry;
    pendingUpdates[dateKey] = updatedEntry;

    // Update UI data
    _generateMoodData();

    await _saveAllLocalData();
    _scheduleBackgroundSync();

    _logger.i('Updated mood entry for $dateKey');
  }

  Future<void> deleteMoodEntry(DateTime date) async {
    if (!_isInitialized.value) return;

    final dateKey = _generateDateKey(date);
    final entry = moodEntryMap[dateKey];

    if (entry == null) {
      _logger.w('No mood entry found for $dateKey to delete');
      return;
    }

    // Remove from local storage
    moodEntryMap.remove(dateKey);
    pendingUpdates.remove(dateKey);
    pendingDeletes.add(dateKey);

    // Update UI data
    _generateMoodData();

    await _saveAllLocalData();
    _scheduleBackgroundSync();

    _logger.i('Deleted mood entry for $dateKey');
  }

  // Query methods
  MoodEntry? getMoodForDate(DateTime date) {
    final dateKey = _generateDateKey(date);
    // Check pending updates first, then main storage
    return pendingUpdates[dateKey] ?? moodEntryMap[dateKey];
  }

  List<MoodEntry> getMoodEntriesForDateRange(DateTime start, DateTime end) {
    final entries =
        moodEntryMap.values
            .where(
              (entry) =>
                  !entry.date.isBefore(start) && !entry.date.isAfter(end),
            )
            .toList();

    entries.sort((a, b) => a.date.compareTo(b.date));
    return entries;
  }

  List<MoodEntry> getRecentMoodEntries({int days = 30}) {
    final cutoffDate = DateTime.now().subtract(Duration(days: days));
    return getMoodEntriesForDateRange(cutoffDate, DateTime.now());
  }

  // Analytics methods
  Map<String, double> getMoodStatistics({
    DateTime? startDate,
    DateTime? endDate,
  }) {
    final entries =
        startDate != null && endDate != null
            ? getMoodEntriesForDateRange(startDate, endDate)
            : moodEntryMap.values.toList();

    if (entries.isEmpty) {
      return {'happy': 0.0, 'neutral': 0.0, 'sad': 0.0};
    }

    final moodCounts = <int, int>{};
    for (final entry in entries) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] ?? 0) + 1;
    }

    final total = entries.length;
    final happyCount = moodCounts[3] ?? 0; // Assuming 3 = happy
    final neutralCount = moodCounts[2] ?? 0; // Assuming 2 = neutral
    final sadCount = moodCounts[1] ?? 0; // Assuming 1 = sad

    return {
      'happy': (happyCount / total) * 100,
      'neutral': (neutralCount / total) * 100,
      'sad': (sadCount / total) * 100,
    };
  }

  double getAverageMood({DateTime? startDate, DateTime? endDate}) {
    final entries =
        startDate != null && endDate != null
            ? getMoodEntriesForDateRange(startDate, endDate)
            : moodEntryMap.values.toList();

    if (entries.isEmpty) return 0.0;

    final sum = entries.fold<double>(0, (sum, entry) => sum + entry.mood);
    return sum / entries.length;
  }

  Map<String, int> getMoodStreak() {
    final sortedEntries =
        moodEntryMap.values.toList()..sort((a, b) => a.date.compareTo(b.date));

    int currentStreak = 0;
    int longestStreak = 0;
    int? lastMood;

    final today = DateTime.now();
    DateTime? lastEntryDate;

    for (final entry in sortedEntries.reversed) {
      if (lastEntryDate == null) {
        lastEntryDate = entry.date;
        currentStreak = 1;
        lastMood = entry.mood;
      } else {
        final daysDiff = lastEntryDate.difference(entry.date).inDays;

        if (daysDiff == 1 && entry.mood == lastMood) {
          currentStreak++;
        } else if (daysDiff > 1) {
          break; // Gap in entries
        } else {
          currentStreak = 1;
          lastMood = entry.mood;
        }

        lastEntryDate = entry.date;
      }

      longestStreak = math.max(longestStreak, currentStreak);
    }

    // Reset current streak if last entry is not recent
    if (lastEntryDate != null && today.difference(lastEntryDate).inDays > 1) {
      currentStreak = 0;
    }

    return {'current': currentStreak, 'longest': longestStreak};
  }

  // UI helper methods
  void setFocusedDay(DateTime day) {
    focusedDay.value = day;
  }

  void changeMonth(String monthName) {
    final newMonthIndex = months.indexOf(monthName) + 1;
    focusedDay.value = DateTime(focusedDay.value.year, newMonthIndex);
  }

  void changeYear(int year) {
    focusedDay.value = DateTime(year, focusedDay.value.month);
  }

  int getMoodForDateString(String dateString) {
    return moodData[dateString] ?? 0;
  }

  // Sync methods
  Future<void> forceSync() async {
    if (_syncCompleter != null && !_syncCompleter!.isCompleted) {
      return _syncCompleter!.future;
    }

    _syncCompleter = Completer<void>();

    try {
      await _performBackgroundSync();
      _syncCompleter!.complete();
    } catch (e) {
      if (!_syncCompleter!.isCompleted) {
        _syncCompleter!.completeError(e);
      }
      rethrow;
    } finally {
      _syncCompleter = null;
    }
  }

  Future<void> refreshData() async {
    if (!_isInitialized.value) return;

    try {
      await _loadUserData();
      await forceSync();
      _generateMoodData();
      await _saveAllLocalData();
    } catch (e, s) {
      _logger.e('Failed to refresh mood data', error: e, stackTrace: s);
    }
  }

  // Diagnostic methods
  Map<String, dynamic> getDiagnosticInfo() {
    return {
      'isInitialized': _isInitialized.value,
      'isSyncing': _isSyncing.value,
      'totalEntries': moodEntryMap.length,
      'pendingUpdates': pendingUpdates.length,
      'pendingDeletes': pendingDeletes.length,
      'failedSyncs': failedSyncIds.length,
      'lastSuccessfulSync': _lastSuccessfulSync.value?.toIso8601String(),
      'lastSyncError': _lastSyncError.value,
    };
  }

  void clear() {
    moodEntryMap.clear();
    pendingUpdates.clear();
    pendingDeletes.clear();
    failedSyncIds.clear();
    moodData.clear();
    _isInitialized.value = false;
    _isSyncing.value = false;
    _lastSyncError.value = '';
    _lastSuccessfulSync.value = null;

    _syncTimer?.cancel();
    _cleanupTimer?.cancel();
    _retryTimer?.cancel();

    _syncTimer = null;
    _cleanupTimer = null;
    _retryTimer = null;

    _logger.d('MoodController data cleared.');
  }

  // Private methods
  Future<void> initialize() async {
    if (_isInitialized.value) return;
    _logger.i("Starting MoodController initialization...");

    clear();

    try {
      await _loadUserData();
      await _loadAllLocalData();

      // Perform initial sync
      try {
        await _performInitialSync();
      } catch (e) {
        _logger.w("Initial sync failed, continuing with local data: $e");
      }

      await _cleanupOldEntries();
      _generateMoodData();
      await _saveAllLocalData();

      _startBackgroundOperations();
      _isInitialized.value = true;

      _logger.i(
        "MoodController initialized successfully with ${moodEntryMap.length} entries.",
      );
    } catch (e, stackTrace) {
      _logger.e(
        "Error during MoodController initialization",
        error: e,
        stackTrace: stackTrace,
      );
      rethrow;
    }
  }

  Future<void> _loadUserData() async {
    final storage = LocalStorage.instance();
    final userData = storage.readData('User');
    if (userData != null) {
      userModel.value = UserModel.fromJson(userData);
      _logger.d("User model loaded from local storage for mood tracking.");
    } else {
      _logger.w("User data not found in local storage.");
      throw Exception("User data is required for mood initialization.");
    }
  }

  Future<void> _loadAllLocalData() async {
    await Future.wait([
      _loadMoodEntriesFromLocal(),
      _loadPendingUpdatesFromLocal(),
      _loadFailedSyncIds(),
      _loadPendingDeletes(),
      _loadSyncMetadata(),
    ]);
  }

  Future<void> _loadMoodEntriesFromLocal() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('MoodEntries');

    if (storedData != null && storedData is List) {
      try {
        final entries = <String, MoodEntry>{};

        for (final item in storedData) {
          if (item is Map<String, dynamic>) {
            final entry = MoodEntry.fromJson(item);
            if (entry.userId.isNotEmpty) {
              final dateKey = _generateDateKey(entry.date);
              entries[dateKey] = entry;
            }
          }
        }

        moodEntryMap.assignAll(entries);
        _logger.i(
          'Loaded ${moodEntryMap.length} mood entries from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing local mood entries: $e");
        moodEntryMap.clear();
      }
    }
  }

  Future<void> _loadPendingUpdatesFromLocal() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('MoodPendingUpdates');

    if (storedData != null && storedData is List) {
      try {
        final updates = <String, MoodEntry>{};

        for (final item in storedData) {
          if (item is Map<String, dynamic>) {
            final entry = MoodEntry.fromJson(item);
            final dateKey = _generateDateKey(entry.date);
            updates[dateKey] = entry;
          }
        }

        pendingUpdates.assignAll(updates);
        _logger.i(
          'Loaded ${pendingUpdates.length} pending mood updates from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing pending mood updates: $e");
        pendingUpdates.clear();
      }
    }
  }

  Future<void> _loadFailedSyncIds() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('MoodFailedSyncIds');

    if (storedData != null && storedData is List) {
      try {
        failedSyncIds.assignAll(storedData.cast<String>());
        _logger.i(
          'Loaded ${failedSyncIds.length} failed mood sync IDs from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing failed mood sync IDs: $e");
        failedSyncIds.clear();
      }
    }
  }

  Future<void> _loadPendingDeletes() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('MoodPendingDeletes');

    if (storedData != null && storedData is List) {
      try {
        pendingDeletes.assignAll(storedData.cast<String>());
        _logger.i(
          'Loaded ${pendingDeletes.length} pending mood deletes from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing pending mood deletes: $e");
        pendingDeletes.clear();
      }
    }
  }

  Future<void> _loadSyncMetadata() async {
    final storage = LocalStorage.instance();
    final metadata = storage.readData('MoodSyncMetadata');

    if (metadata != null && metadata is Map<String, dynamic>) {
      try {
        if (metadata['lastSuccessfulSync'] != null) {
          _lastSuccessfulSync.value = DateTime.parse(
            metadata['lastSuccessfulSync'],
          );
        }
        _lastSyncError.value = metadata['lastSyncError'] ?? '';
      } catch (e) {
        _logger.e("Error parsing mood sync metadata: $e");
      }
    }
  }

  Future<void> _performInitialSync() async {
    if (_isSyncing.value) return;

    _isSyncing.value = true;
    _lastSyncError.value = '';

    try {
      await _syncPendingDeletesToRemote();
      await _syncPendingUpdatesToRemote();
      await _syncWithRemote();

      _lastSuccessfulSync.value = DateTime.now();
      _logger.i('Initial mood sync completed successfully.');
    } catch (e, s) {
      _lastSyncError.value = e.toString();
      _logger.e("Initial mood sync failed", error: e, stackTrace: s);
      rethrow;
    } finally {
      _isSyncing.value = false;
    }
  }

  Future<void> _performBackgroundSync() async {
    if (_isSyncing.value) return;

    _isSyncing.value = true;
    _lastSyncError.value = '';

    try {
      await _syncPendingDeletesToRemote();
      await _syncPendingUpdatesToRemote();
      await _syncWithRemote();

      _generateMoodData();
      await _saveAllLocalData();

      _lastSuccessfulSync.value = DateTime.now();
      _logger.i('Background mood sync completed successfully.');
    } catch (e, s) {
      _lastSyncError.value = e.toString();
      _logger.e("Background mood sync failed", error: e, stackTrace: s);
    } finally {
      _isSyncing.value = false;
      await _saveSyncMetadata();
    }
  }

  Future<void> _syncPendingDeletesToRemote() async {
    if (pendingDeletes.isEmpty) return;

    _logger.d(
      "Syncing ${pendingDeletes.length} pending mood deletes to remote...",
    );
    final successfulDeletes = <String>[];

    for (final dateKey in pendingDeletes.toList()) {
      try {
        await _moodRepository.deleteMoodEntry(userModel.value.id, dateKey);
        successfulDeletes.add(dateKey);
      } catch (e) {
        _logger.w('Failed to delete mood entry $dateKey: $e');
      }
    }

    for (final dateKey in successfulDeletes) {
      pendingDeletes.remove(dateKey);
    }

    if (successfulDeletes.isNotEmpty) {
      _logger.i(
        'Successfully deleted ${successfulDeletes.length} mood entries from remote.',
      );
    }
  }

  Future<void> _syncPendingUpdatesToRemote() async {
    if (pendingUpdates.isEmpty && failedSyncIds.isEmpty) return;

    _logger.d("Syncing pending mood updates to remote...");
    final entriesToSync = <MoodEntry>[];

    // Add pending updates
    entriesToSync.addAll(pendingUpdates.values);

    // Add failed sync entries (if they still exist locally)
    for (final failedDateKey in failedSyncIds.toList()) {
      final entry = moodEntryMap[failedDateKey];
      if (entry != null && !pendingUpdates.containsKey(failedDateKey)) {
        entriesToSync.add(entry);
      }
    }

    if (entriesToSync.isEmpty) return;

    final syncedDateKeys = <String>[];
    final newFailedDateKeys = <String>[];

    for (final entry in entriesToSync) {
      try {
        await _moodRepository.updateMoodEntry(userModel.value.id, entry);
        final dateKey = _generateDateKey(entry.date);
        syncedDateKeys.add(dateKey);
      } catch (e) {
        final dateKey = _generateDateKey(entry.date);
        _logger.w('Failed to sync mood entry $dateKey: $e');
        newFailedDateKeys.add(dateKey);
      }
    }

    // Update pending updates and failed sync tracking
    for (final dateKey in syncedDateKeys) {
      pendingUpdates.remove(dateKey);
      failedSyncIds.remove(dateKey);
    }

    failedSyncIds.addAll(newFailedDateKeys);

    _logger.i(
      'Mood sync to remote: ${syncedDateKeys.length} successful, ${newFailedDateKeys.length} failed.',
    );
  }

  Future<void> _syncWithRemote() async {
    _logger.i("Starting mood sync with remote");
    try {
      DateTime? lastUpdateTime = _lastSuccessfulSync.value;

      final remoteEntries =
          lastUpdateTime == null
              ? await _moodRepository.fetchAllMoodEntries(userModel.value.id)
              : await _moodRepository.fetchMoodEntriesSince(
                lastUpdateTime,
                userModel.value.id,
              );

      _logger.i("Fetched ${remoteEntries.length} mood entries from remote");

      int updatedCount = 0;
      int addedCount = 0;
      int skippedCount = 0;

      for (final remoteEntry in remoteEntries) {
        final dateKey = _generateDateKey(remoteEntry.date);
        final localEntry = moodEntryMap[dateKey];
        final hasPendingUpdate = pendingUpdates.containsKey(dateKey);

        if (localEntry != null) {
          if (hasPendingUpdate) {
            skippedCount++;
          } else if (remoteEntry.updatedAt.isAfter(localEntry.updatedAt) ||
              remoteEntry.updatedAt.isAtSameMomentAs(localEntry.updatedAt)) {
            moodEntryMap[dateKey] = remoteEntry;
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          moodEntryMap[dateKey] = remoteEntry;
          addedCount++;
        }
      }

      _logger.i(
        "Mood sync complete: $addedCount added, $updatedCount updated, $skippedCount skipped",
      );
    } catch (e, s) {
      _logger.e("Error syncing mood data with remote", error: e, stackTrace: s);
      rethrow;
    }
  }

  Future<void> _cleanupOldEntries() async {
    final cutoffDate = DateTime.now().subtract(
      const Duration(days: 365 * 2),
    ); // Keep 2 years
    final entriesToRemove = <String>[];

    for (final entry in moodEntryMap.entries) {
      if (entry.value.date.isBefore(cutoffDate)) {
        entriesToRemove.add(entry.key);
      }
    }

    for (final dateKey in entriesToRemove) {
      moodEntryMap.remove(dateKey);
      pendingUpdates.remove(dateKey);
      failedSyncIds.remove(dateKey);
      pendingDeletes.add(dateKey);
    }

    if (entriesToRemove.isNotEmpty) {
      _logger.i("Cleaned up ${entriesToRemove.length} old mood entries.");
    }
  }

  void _generateMoodData() {
    final newMoodData = <String, int>{};

    for (final entry in moodEntryMap.values) {
      final dateString = MyFormatter.formatDate(entry.date);
      newMoodData[dateString] = entry.mood;
    }

    // Override with pending updates
    for (final entry in pendingUpdates.values) {
      final dateString = MyFormatter.formatDate(entry.date);
      newMoodData[dateString] = entry.mood;
    }

    moodData.assignAll(newMoodData);
  }

  void _scheduleBackgroundSync() {
    _syncDebounceTimer?.cancel();
    _syncDebounceTimer = Timer(const Duration(seconds: 2), () async {
      if (!_isSyncing.value) {
        await _performBackgroundSync();
      }
    });
  }

  Future<void> _saveAllLocalData() async {
    if (_saveInProgress) return;
    _saveInProgress = true;

    try {
      final dataToSave = _prepareDataForSave();
      await _saveDataInIsolate(dataToSave);
      _logger.d('Saved all mood local data successfully');
    } catch (e, s) {
      _logger.e('Error saving mood local data', error: e, stackTrace: s);
    } finally {
      _saveInProgress = false;
    }
  }

  static Future<void> _saveDataInIsolate(Map<String, dynamic> data) async {
    try {
      final storage = LocalStorage.instance();

      await Future.wait([
        storage.writeData('MoodEntries', data['moodEntries']),
        storage.writeData('MoodPendingUpdates', data['pendingUpdates']),
        storage.writeData('MoodFailedSyncIds', data['failedSyncIds']),
        storage.writeData('MoodPendingDeletes', data['pendingDeletes']),
        storage.writeData('MoodSyncMetadata', data['syncMetadata']),
      ]);
    } catch (e) {
      throw Exception('Failed to save mood data in isolate: $e');
    }
  }

  Map<String, dynamic> _prepareDataForSave() {
    return {
      'moodEntries': moodEntryMap.values.map((e) => e.toJson()).toList(),
      'pendingUpdates': pendingUpdates.values.map((e) => e.toJson()).toList(),
      'failedSyncIds': failedSyncIds.toList(),
      'pendingDeletes': pendingDeletes.toList(),
      'syncMetadata': {
        'lastSuccessfulSync': _lastSuccessfulSync.value?.toIso8601String(),
        'lastSyncError': _lastSyncError.value,
      },
    };
  }

  Future<void> _saveSyncMetadata() async {
    final storage = LocalStorage.instance();
    try {
      await storage.writeData('MoodSyncMetadata', {
        'lastSuccessfulSync': _lastSuccessfulSync.value?.toIso8601String(),
        'lastSyncError': _lastSyncError.value,
      });
    } catch (e, s) {
      _logger.e('Error saving mood sync metadata', error: e, stackTrace: s);
    }
  }

  void _startBackgroundOperations() {
    // Periodic sync timer
    _syncTimer = Timer.periodic(_syncInterval, (timer) async {
      if (!_isSyncing.value && hasPendingUpdates) {
        _performBackgroundSync();
      }
    });

    // Periodic cleanup timer
    _cleanupTimer = Timer.periodic(_cleanupInterval, (timer) async {
      try {
        await _cleanupOldEntries();
        await _saveAllLocalData();
      } catch (e) {
        _logger.e('Periodic mood cleanup failed: $e');
      }
    });

    // Retry failed syncs periodically
    _retryTimer = Timer.periodic(_retryInterval, (timer) async {
      if (!_isSyncing.value &&
          hasFailedSyncs &&
          failedSyncIds.length <= _maxRetryAttempts) {
        _performBackgroundSync();
      }
    });
  }

  String _generateDateKey(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}
