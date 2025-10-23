import 'dart:async';
import 'package:beautymirror/data/repositories/authentication/authentication_repository.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';

import '../../../utils/constants/enums.dart';
import '../../../utils/local_storage/storage_utility.dart';
import '../../app/controllers/activity_controller.dart';
import '../models/achievement_model.dart';

class AchievementController extends GetxController {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // State
  final Rx<AchievementProgress> progress = AchievementProgress().obs;
  final RxBool isLoading = true.obs;
  final RxBool isSyncing = false.obs;
  final RxBool showLevelUpDialog = false.obs;
  final RxInt pendingLevelUp = 0.obs;

  // Dependencies - Inject your ActivityController
  late final ActivityController _activityController;
  late final AuthenticationRepository _authController;

  Timer? _debounceTimer;
  Timer? _periodicSyncTimer;

  // Cache last synced count to avoid unnecessary writes
  int _lastSyncedCount = 0;
  DateTime? _lastSyncTime;

  @override
  void onInit() {
    super.onInit();

    // Get dependencies
    _activityController = Get.find<ActivityController>();
    _authController = Get.find<AuthenticationRepository>();

    // Load cached progress from local storage (if you have it)
    _loadLocalProgress();

    // Sync with Firestore on init
    syncWithFirestore();

    // Listen to task completions for local updates only
    _listenToTaskCompletions();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    _periodicSyncTimer?.cancel();
    super.onClose();
  }

  /// Load progress from local storage
  void _loadLocalProgress() {
    final storage = LocalStorage.instance();
    // Example with GetStorage:
    final stored = storage.readData('achievement_progress');
    if (stored != null) {
      progress.value = AchievementProgress.fromJson(stored);
    }

    // For now, calculate from local data immediately
    _calculateLocalProgress();
  }

  /// Calculate progress from local task instances
  /// This is FAST and works offline
  void _calculateLocalProgress() {
    final completedCount =
        _activityController.taskInstanceMap.values
            .where((task) => task.status == TaskStatus.completed)
            .length;

    final newLevel = AchievementLevel.calculateLevel(completedCount);

    // Update local state immediately
    progress.value = progress.value.copyWith(
      totalCompletedActivities: completedCount,
      currentLevel: newLevel,
      lastUpdated: DateTime.now(),
    );

    isLoading.value = false;
  }

  /// Listen to task completions for immediate local updates
  void _listenToTaskCompletions() {
    ever(_activityController.taskInstanceMap, (_) {
      // Update local state immediately
      _calculateLocalProgress();

      // Debounced sync to Firestore
      _syncDebounced();
    });
  }

  /// Debounced sync - only write to Firestore after user stops making changes
  void _syncDebounced() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(seconds: 5), () {
      syncWithFirestore();
    });
  }

  /// Manual sync with Firestore - call this when user opens achievements
  /// or when needed
  Future<void> syncWithFirestore({bool forceWrite = false}) async {
    final userId = _authController.authUser?.uid;
    if (userId == null) return;

    isSyncing.value = true;

    try {
      // 1. Fetch current progress from Firestore
      final doc =
          await _firestore
              .collection('Users')
              .doc(userId)
              .collection('Achievements')
              .doc('Progress')
              .get();

      AchievementProgress firestoreProgress;
      if (doc.exists) {
        firestoreProgress = AchievementProgress.fromFirestore(doc);
      } else {
        // First time user - will initialize below
        firestoreProgress = AchievementProgress();
      }

      // 2. Calculate current local progress
      final localCompletedCount =
          _activityController.taskInstanceMap.values
              .where((task) => task.status == TaskStatus.completed)
              .length;

      final localLevel = AchievementLevel.calculateLevel(localCompletedCount);

      // 3. Determine if we need to write to Firestore
      final shouldWrite =
          forceWrite ||
          localCompletedCount != _lastSyncedCount ||
          localLevel > firestoreProgress.currentLevel ||
          _lastSyncTime == null ||
          DateTime.now().difference(_lastSyncTime!) > const Duration(hours: 1);

      if (shouldWrite) {
        // Prepare update data
        final updateData = {
          'TotalCompletedActivities': localCompletedCount,
          'CurrentLevel': localLevel,
          'LastUpdated': FieldValue.serverTimestamp(),
        };

        // Add level unlock date if new level achieved
        if (localLevel > firestoreProgress.currentLevel) {
          updateData['LevelUnlockDates.$localLevel'] =
              FieldValue.serverTimestamp();
        }

        // Initialize LastSeenLevel for new users
        if (!doc.exists) {
          updateData['LastSeenLevel'] = 0;
        }

        // Write to Firestore
        await _firestore
            .collection('Users')
            .doc(userId)
            .collection('Achievements')
            .doc('Progress')
            .set(updateData, SetOptions(merge: true));

        _lastSyncedCount = localCompletedCount;
        _lastSyncTime = DateTime.now();

        print(
          '✅ Synced achievements to Firestore: $localCompletedCount activities',
        );
      }

      // 4. Fetch the updated document to get server-side data (like lastSeenLevel)
      final updatedDoc =
          await _firestore
              .collection('Users')
              .doc(userId)
              .collection('Achievements')
              .doc('Progress')
              .get();

      if (updatedDoc.exists) {
        final syncedProgress = AchievementProgress.fromFirestore(updatedDoc);

        // Update local state with server data (especially lastSeenLevel)
        progress.value = progress.value.copyWith(
          totalCompletedActivities: localCompletedCount,
          currentLevel: localLevel,
          lastSeenLevel: syncedProgress.lastSeenLevel,
          levelUnlockDates: syncedProgress.levelUnlockDates,
        );

        final storage = LocalStorage.instance();

        // Save to local storage
        storage.writeData('achievement_progress', progress.value.toJson());
      }
    } catch (e) {
      print('Error syncing achievements: $e');
      // Keep working with local data
    } finally {
      isSyncing.value = false;
      isLoading.value = false;
    }
  }

  /// Periodic background sync (optional)
  // void _startPeriodicSync() {
  //   _periodicSyncTimer = Timer.periodic(
  //     const Duration(minutes: 5),
  //     (_) => syncWithFirestore(),
  //   );
  // }

  /// Mark current level as seen by user
  Future<void> markLevelAsSeen() async {
    final userId = _authController.authUser?.uid;
    if (userId == null) return;

    final currentLevel = progress.value.currentLevel;

    try {
      await _firestore
          .collection('Users')
          .doc(userId)
          .collection('Achievements')
          .doc('Progress')
          .update({'LastSeenLevel': currentLevel});

      // Update local state
      progress.value = progress.value.copyWith(lastSeenLevel: currentLevel);

      // Save to local storage
      // TODO: Implement if you have local storage
    } catch (e) {
      print('Error marking level as seen: $e');
    }
  }

  /// Get achievements with unlock status
  List<AchievementLevel> getAchievementsWithStatus() {
    final currentLevel = progress.value.currentLevel;

    return AchievementLevel.allLevels.map((level) {
      return level.copyWith(isUnlocked: level.level <= currentLevel);
    }).toList();
  }

  /// Check and show level up dialog if needed
  void checkAndShowLevelUpDialog() {
    if (progress.value.hasUnseenLevelUp) {
      pendingLevelUp.value = progress.value.currentLevel;
      showLevelUpDialog.value = true;
    }
  }

  /// Dismiss level up dialog and mark as seen
  void dismissLevelUpDialog() {
    showLevelUpDialog.value = false;
    markLevelAsSeen();
  }

  /// Force refresh and sync
  Future<void> refreshProgress() async {
    isLoading.value = true;
    await syncWithFirestore(forceWrite: true);
    isLoading.value = false;
  }
}
