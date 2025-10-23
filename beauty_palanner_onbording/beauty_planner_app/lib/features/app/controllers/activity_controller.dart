import 'dart:async';
import 'dart:developer';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tzdata;
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:logger/logger.dart';
import 'package:flutter/material.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/task/task_instance_repository.dart';
import '../../../utils/constants/enums.dart';
import '../../../utils/helpers/date_time_helper.dart';
import '../../../utils/helpers/helper_functions.dart';
import '../../../utils/local_storage/storage_utility.dart';
import '../../../data/models/activity_model.dart';
import '../../personalization/controllers/notifications_controller.dart';
import '../models/task_model.dart';
import 'calendar_controller.dart';
import 'home_controller.dart';

final logger = Logger();

class ActivityController extends GetxController {
  static const int MAX_TASK_INSTANCES = 10000; // Prevent unlimited growth

  final RxSet<String> failedSyncIds = <String>{}.obs;
  final RxList<Task> oneTimeTasks = <Task>[].obs;
  final RxSet<String> pendingDeletes =
      <String>{}.obs; // Track instances to delete

  // Offline-first data structures
  final RxMap<String, TaskInstance> pendingUpdates =
      <String, TaskInstance>{}.obs;

  final profileLoading = false.obs;
  final RxList<Task> regularTasks = <Task>[].obs;
  final RxInt selectedTab = 0.obs; // 0 for Regular, 1 for One-Time
  // Core data structures - Enhanced for activity type separation
  final RxMap<String, TaskInstance> taskInstanceMap =
      <String, TaskInstance>{}.obs;

  Rx<UserModel> userModel = UserModel.empty().obs;

  static const Duration _activityChangeDebounce = Duration(milliseconds: 500);
  static const Duration _cleanupInterval = Duration(hours: 6);
  // Configuration constants
  static const int _maxPastInstancesPerActivity = 90; // 3 months

  static const int _maxRetryAttempts = 5;
  static const Duration _retryInterval = Duration(minutes: 1);
  static const int _syncBatchSize = 25;
  static const Duration _syncInterval = Duration(minutes: 3);

  Timer? _activityChangeTimer;
  Timer? _cleanupTimer;
  final RxSet<String> _deletedActivityIds = <String>{}.obs;
  Completer<void>? _initCompleter;
  // State management
  final RxBool _isInitialized = false.obs;

  final RxBool _isSyncing = false.obs;
  // Activity tracking for dynamic updates
  final RxMap<String, ActivityModel> _lastKnownActivities =
      <String, ActivityModel>{}.obs;

  final Rx<DateTime?> _lastSuccessfulSync = Rx<DateTime?>(null);
  final RxString _lastSyncError = ''.obs;
  final Logger _logger = logger;
  late final NotificationsController _notificationsController;
  // Notification scheduling flag
  final RxBool _notificationsEnabled = true.obs;

  Timer? _retryTimer;
  bool _saveInProgress = false;
  Completer<void>? _syncCompleter;
  Timer? _syncDebounceTimer;
  final RxSet<String> _syncRequested = <String>{}.obs;
  Timer? _syncTimer;
  // Dependencies
  late final TaskInstanceRepository _taskInstanceRepository;

  Timer? _uiUpdateTimer;

  @override
  void onClose() {
    _syncTimer?.cancel();
    _cleanupTimer?.cancel();
    _retryTimer?.cancel();
    _activityChangeTimer?.cancel();
    _logger.d('ActivityController disposed.');
    super.onClose();
  }

  @override
  void onInit() {
    super.onInit();
    _taskInstanceRepository = Get.put(TaskInstanceRepository());
    _initializeTimezone();
    _setupActivityWatcher();
  }

  static ActivityController get instance => Get.find();

  // Computed getter for current tab's tasks
  List<Task> get uiTasks =>
      selectedTab.value == 0 ? regularTasks : oneTimeTasks;

  bool get notificationsEnabled => _notificationsEnabled.value;

  // Getters for reactive state
  RxBool get isInitialized => _isInitialized;

  bool get isSyncing => _isSyncing.value;

  String get lastSyncError => _lastSyncError.value;

  DateTime? get lastSuccessfulSync => _lastSuccessfulSync.value;

  bool get hasPendingUpdates =>
      pendingUpdates.isNotEmpty || pendingDeletes.isNotEmpty;

  bool get hasFailedSyncs => failedSyncIds.isNotEmpty;

  Future<void> ensureInitialized() async {
    if (_isInitialized.value) return;

    if (_initCompleter != null && !_initCompleter!.isCompleted) {
      return _initCompleter!.future;
    }

    _initCompleter = Completer<void>();

    try {
      await _initialize();
      _initCompleter!.complete();
    } catch (e) {
      if (!_initCompleter!.isCompleted) {
        _initCompleter!.completeError(e);
      }
      rethrow;
    }
  }

  Future<void> markTaskAsDone(Task task) async {
    await _updateTaskStatus(task, TaskStatus.completed);
  }

  Future<void> markTaskAsSkipped(Task task) async {
    await _updateTaskStatus(task, TaskStatus.skipped);
  }

  Future<void> markTaskAsPending(Task task) async {
    await _updateTaskStatus(task, TaskStatus.pending);
  }

  // Public methods for activity management
  Future<void> onActivityAdded(ActivityModel activity) async {
    if (!_isInitialized.value) return;

    _logger.i("Activity added: ${activity.name} (${activity.type})");

    // Update user model if not already updated
    if (!userModel.value.activities.any((a) => a.id == activity.id)) {
      final updatedActivities = List<ActivityModel>.from(
        userModel.value.activities,
      );
      updatedActivities.add(activity);
      userModel.update((user) {
        user?.activities = updatedActivities;
      });
    }

    // This will trigger the activity watcher
  }

  Future<void> onActivityUpdated(ActivityModel activity) async {
    if (!_isInitialized.value) return;

    _logger.i("Activity updated: ${activity.name} (${activity.type})");

    // Update user model if not already updated
    final activityIndex = userModel.value.activities.indexWhere(
      (a) => a.id == activity.id,
    );
    if (activityIndex != -1) {
      final updatedActivities = List<ActivityModel>.from(
        userModel.value.activities,
      );
      updatedActivities[activityIndex] = activity;
      userModel.update((user) {
        user?.activities = updatedActivities;
      });
    }

    // This will trigger the activity watcher
  }

  Future<void> onActivityDeleted(
    String activityId, {
    bool keepHistorY = false,
  }) async {
    if (!_isInitialized.value) return;

    _logger.i("Activity deleted: $activityId (keepHistory: $keepHistorY)");

    // Update user model first
    userModel.update((user) {
      user?.keepActivityHistory[activityId] = keepHistorY;
      user?.activities.removeWhere((a) => a.id == activityId);
    });

    // The activity watcher will handle the cleanup automatically
  }

  // Enhanced public API methods
  List<TaskInstance> getTaskInstancesForDateRange(
    DateTime start,
    DateTime end, {
    String? activityType,
  }) {
    var instances = taskInstanceMap.values.where(
      (instance) =>
          !instance.date.isBefore(start) && !instance.date.isAfter(end),
    );

    // Filter by activity type if specified
    if (activityType != null) {
      final relevantActivityIds =
          userModel.value.activities
              .where((a) => a.type == activityType)
              .map((a) => a.id)
              .toSet();
      instances = instances.where(
        (i) => relevantActivityIds.contains(i.activityId),
      );
    }

    return instances.toList()..sort((a, b) => a.date.compareTo(b.date));
  }

  TaskInstance? getTaskInstanceForActivityAndDate(
    String activityId,
    DateTime date,
  ) {
    final id = TaskInstance.generateId(activityId, date);
    // Check pending updates first, then main storage
    return pendingUpdates[id] ?? taskInstanceMap[id];
  }

  Map<TaskStatus, int> getTaskStatusCounts(
    DateTime? startDate,
    DateTime? endDate, {
    String? activityType,
  }) {
    final instances =
        startDate != null && endDate != null
            ? getTaskInstancesForDateRange(
              startDate,
              endDate,
              activityType: activityType,
            )
            : taskInstanceMap.values.toList();

    final counts = <TaskStatus, int>{
      TaskStatus.pending: 0,
      TaskStatus.completed: 0,
      TaskStatus.skipped: 0,
      TaskStatus.missed: 0,
    };

    for (final instance in instances) {
      counts[instance.status] = (counts[instance.status] ?? 0) + 1;
    }

    return counts;
  }

  // Analytics methods
  double getCompletionRate({
    DateTime? startDate,
    DateTime? endDate,
    String? activityType,
  }) {
    final counts = getTaskStatusCounts(
      startDate,
      endDate,
      activityType: activityType,
    );
    final total = counts.values.fold(0, (sum, count) => sum + count);
    if (total == 0) return 0.0;

    final completed = counts[TaskStatus.completed] ?? 0;
    return completed / total;
  }

  Map<String, int> getStreakInfo(String activityId) {
    final instances =
        taskInstanceMap.values.where((i) => i.activityId == activityId).toList()
          ..sort((a, b) => a.date.compareTo(b.date));

    int currentStreak = 0;
    int longestStreak = 0;
    int tempStreak = 0;

    final today = DateTime.now();

    // Calculate current streak (from today backwards)
    for (int i = instances.length - 1; i >= 0; i--) {
      final instance = instances[i];
      final daysDiff = today.difference(instance.date).inDays;

      if (daysDiff == currentStreak &&
          instance.status == TaskStatus.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (final instance in instances) {
      if (instance.status == TaskStatus.completed) {
        tempStreak++;
        longestStreak = math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {'current': currentStreak, 'longest': longestStreak};
  }

  // Tab switching
  void switchTab(int tabIndex) {
    selectedTab.value = tabIndex;
  }

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
      await _generateMissingTaskInstances();
      _generateUiTasks();
      await _saveAllLocalData();
    } catch (e, s) {
      _logger.e('Failed to refresh data', error: e, stackTrace: s);
    }
  }

  // Bulk operations for efficiency
  Future<void> markMultipleTasksAsDone(List<Task> tasks) async {
    final updates = <String, TaskInstance>{};

    for (final task in tasks) {
      final instanceId = TaskInstance.generateId(task.activityId, task.date);
      final instance = taskInstanceMap[instanceId];

      if (instance != null && instance.status != TaskStatus.completed) {
        final updatedInstance = instance.copyWith(
          status: TaskStatus.completed,
          updatedAt: DateTime.now(),
        );
        updates[instanceId] = updatedInstance;
      }
    }

    if (updates.isNotEmpty) {
      // Update local storage
      taskInstanceMap.addAll(updates);
      pendingUpdates.addAll(updates);

      // Update UI
      _generateUiTasks();

      // Save and sync
      await _saveAllLocalData();
      _scheduleBackgroundSync();

      _logger.i('Marked ${updates.length} tasks as completed in bulk.');
    }
  }

  // --- One-Time Task Management ---
  /// Adds a single one-time task for the given activity and date.
  Future<void> addOneTimeTask(
    ActivityModel activity,
    DateTime date,
    TimeOfDay time,
  ) async {
    if (!_isInitialized.value) return;
    // if (activity.type != 'one_time') return;

    // Generate ID with time component for one-time tasks
    final instanceId = TaskInstance.generateId(activity.id, date, time);
    // Check in all possible locations
    if (taskInstanceMap.containsKey(instanceId) ||
        pendingUpdates.containsKey(instanceId)) {
      _logger.w('One-time task already exists: $instanceId');
      return;
    }

    // Also check if there's a non-deleted instance with same ID
    final existing = taskInstanceMap[instanceId];
    if (existing != null && existing.status != TaskStatus.deleted) {
      _logger.w('Active one-time task already exists: $instanceId');
      return;
    }

    final TaskStatus status;
    final now = tz.TZDateTime.now(tz.local);
    final today = DateTime(now.year, now.month, now.day);
    final taskDateTime = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );

    if (taskDateTime.isBefore(now) && date.isBefore(today)) {
      status = TaskStatus.missed;
    } else {
      status = TaskStatus.pending;
    }

    final newInstance = TaskInstance(
      activityId: activity.id,
      date: date,
      status: status,
      updatedAt: DateTime.now(),
      time: time, // Include time for one-time tasks
    );

    taskInstanceMap[newInstance.id] = newInstance;
    pendingUpdates[newInstance.id] = newInstance;
    _generateUiTasks();
    await _saveAllLocalData();
    _scheduleBackgroundSync();

    await _scheduleNotificationsForOneTimeTask(activity, date, time);

    _logger.i(
      'Added one-time task for activity ${activity.id} on $date at ${time.format(Get.context!)}',
    );
  }

  // 6. Update updateTask method
  Future<void> updateTask(
    String activityId,
    DateTime date, {
    TaskStatus? status,
    TimeOfDay? time, // Time parameter to identify which specific task to update
  }) async {
    if (!_isInitialized.value) return;

    // Generate the correct instance ID
    final instanceId =
        time != null
            ? TaskInstance.generateId(activityId, date, time)
            : TaskInstance.generateId(activityId, date);

    final instance = taskInstanceMap[instanceId];
    if (instance == null) {
      _logger.w('Task instance not found for update: $instanceId');
      return;
    }

    final updatedInstance = instance.copyWith(
      status: status ?? instance.status,
      updatedAt: DateTime.now(),
    );

    taskInstanceMap[instanceId] = updatedInstance;
    pendingUpdates[instanceId] = updatedInstance;
    _generateUiTasks();
    await _saveAllLocalData();
    _scheduleBackgroundSync();

    final timeStr = time != null ? ' at ${time.format(Get.context!)}' : '';
    _logger.i('Updated task for activity $activityId on $date$timeStr');
  }

  Future<void> rescheduleTask(
    TaskInstance task,
    DateTime newDate,
    TimeOfDay? newTime,
  ) async {
    final activity = userModel.value.activities.firstWhere(
      (a) => a.id == task.activityId,
      orElse: () => ActivityModel.empty(),
    );

    if (activity.id.isEmpty) {
      _logger.w('Activity not found for rescheduling task: ${task.activityId}');
      return;
    }

    final oldInstanceId =
        task.time != null
            ? TaskInstance.generateId(task.activityId, task.date, task.time)
            : TaskInstance.generateId(task.activityId, task.date);

    // Remove from local storage
    taskInstanceMap.remove(oldInstanceId);
    pendingUpdates.remove(oldInstanceId);

    //change the status of the old task to deleted
    final deletedInstance = task.copyWith(
      status: TaskStatus.deleted,
      updatedAt: DateTime.now(),
    );

    //push update to firebase
    taskInstanceMap[oldInstanceId] = deletedInstance;
    pendingUpdates[oldInstanceId] = deletedInstance;

    // Create new instance
    newTime = newTime ?? task.time ?? activity.time!.value;
    final newInstanceId = TaskInstance.generateId(
      activity.id,
      newDate,
      newTime,
    );

    final newInstance = TaskInstance(
      activityId: activity.id,
      date: newDate,
      status: TaskStatus.pending,
      updatedAt: DateTime.now(),
      time: newTime,
    );

    // Add the new instance
    taskInstanceMap[newInstanceId] = newInstance;
    pendingUpdates[newInstanceId] = newInstance;

    // Update UI and save
    _generateUiTasks();
    await _saveAllLocalData();
    _scheduleBackgroundSync();

    _logger.i('Rescheduled task from ${task.date} to $newDate');
  }

  // Helper method to get all one-time tasks for a specific date
  List<TaskInstance> getOneTimeTasksForDate(DateTime date) {
    final targetDate = DateTime(date.year, date.month, date.day);

    return taskInstanceMap.values
        .where(
          (instance) =>
              instance.time != null && // Has time component (one-time task)
              instance.date.year == targetDate.year &&
              instance.date.month == targetDate.month &&
              instance.date.day == targetDate.day,
        )
        .toList()
      ..sort((a, b) {
        final timeA = a.time!.hour * 60 + a.time!.minute;
        final timeB = b.time!.hour * 60 + b.time!.minute;
        return timeA.compareTo(timeB);
      });
  }

  // Helper method to check if a one-time task exists
  bool oneTimeTaskExists(String activityId, DateTime date, TimeOfDay time) {
    final instanceId = TaskInstance.generateId(activityId, date, time);
    return taskInstanceMap.containsKey(instanceId);
  }

  /// Enable/disable notifications
  Future<void> setNotificationsEnabled(bool enabled) async {
    _notificationsEnabled.value = enabled;

    if (enabled) {
      await _notificationsController.refreshNotifications();
    } else {
      await _notificationsController.cancelAllNotifications();
    }

    // Save preference to local storage
    final storage = LocalStorage.instance();
    await storage.writeData('NotificationsEnabled', enabled);
  }

  /// Refresh all notifications when user changes notification preferences
  Future<void> refreshNotifications() async {
    if (_notificationsEnabled.value && _isInitialized.value) {
      await _notificationsController.refreshNotifications();
    }
  }

  // Replace direct calls to _generateUiTasks() with _scheduleUiUpdate()

  // Diagnostic methods
  Map<String, dynamic> getDiagnosticInfo() {
    return {
      'isInitialized': _isInitialized.value,
      'isSyncing': _isSyncing.value,
      'totalInstances': taskInstanceMap.length,
      'pendingUpdates': pendingUpdates.length,
      'pendingDeletes': pendingDeletes.length,
      'failedSyncs': failedSyncIds.length,
      'regularTasks': regularTasks.length,
      'oneTimeTasks': oneTimeTasks.length,
      'deletedActivities': _deletedActivityIds.length,
      'lastSuccessfulSync': _lastSuccessfulSync.value?.toIso8601String(),
      'lastSyncError': _lastSyncError.value,
    };
  }

  void clear() {
    regularTasks.clear();
    oneTimeTasks.clear();
    taskInstanceMap.clear();
    pendingUpdates.clear();
    pendingDeletes.clear();
    failedSyncIds.clear();
    _lastKnownActivities.clear();
    _deletedActivityIds.clear();
    _isInitialized.value = false;
    _isSyncing.value = false;
    _lastSyncError.value = '';
    _lastSuccessfulSync.value = null;

    _syncTimer?.cancel();
    _cleanupTimer?.cancel();
    _retryTimer?.cancel();
    _activityChangeTimer?.cancel();

    _syncTimer = null;
    _cleanupTimer = null;
    _retryTimer = null;
    _activityChangeTimer = null;

    _notificationsController.cancelAllNotifications();

    _logger.d('ActivityController data cleared.');
  }

  Future<void> _initializeTimezone() async {
    try {
      tzdata.initializeTimeZones();
      final String localTimezone = await FlutterTimezone.getLocalTimezone();
      tz.setLocalLocation(tz.getLocation(localTimezone));
    } catch (e) {
      _logger.e("Error initializing timezone: $e");
    }
  }

  void _setupActivityWatcher() {
    ever(userModel, (UserModel user) {
      if (_isInitialized.value) {
        _scheduleActivitySync();
      }
    });
  }

  void _scheduleActivitySync() {
    _activityChangeTimer?.cancel();
    _activityChangeTimer = Timer(_activityChangeDebounce, () {
      _handleActivityChangesSync(); // Renamed method
    });
  }

  Future<void> _handleActivityChangesSync() async {
    if (!_isInitialized.value) {
      return; // Add this check
    }

    _logger.i("Handling activity changes...");

    try {
      final currentActivities = {
        for (var a in userModel.value.activities) a.id: a,
      };

      final added = <String, ActivityModel>{};
      final updated = <String, ActivityModel>{};
      final removed = <String>[];

      // Find added and updated activities
      for (final entry in currentActivities.entries) {
        final id = entry.key;
        final activity = entry.value;

        if (!_lastKnownActivities.containsKey(id)) {
          added[id] = activity;
        } else {
          final previous = _lastKnownActivities[id]!;
          if (_hasActivityChanged(previous, activity)) {
            updated[id] = activity;
          }
        }
      }

      // Find removed activities
      for (final id in _lastKnownActivities.keys) {
        if (!currentActivities.containsKey(id)) {
          removed.add(id);
        }
      }

      // Apply changes
      if (added.isNotEmpty) {
        await _handleAddedActivities(added);
      }

      if (updated.isNotEmpty) {
        await _handleUpdatedActivities(updated);
      }

      if (removed.isNotEmpty) {
        await _handleRemovedActivities(removed);
      }

      // Update tracking
      _lastKnownActivities.assignAll(currentActivities);

      // Regenerate UI if changes occurred
      if (added.isNotEmpty || updated.isNotEmpty || removed.isNotEmpty) {
        _scheduleUiUpdate();
        await _saveAllLocalData();
        _scheduleBackgroundSync();
      }

      _logger.i(
        "Applied activity changes: ${added.length} added, ${updated.length} updated, ${removed.length} removed",
      );
    } catch (e, s) {
      _logger.e("Error handling activity changes", error: e, stackTrace: s);
    }
  }

  bool _hasActivityChanged(ActivityModel previous, ActivityModel current) {
    // Check if lastModifiedAt is different (this covers all changes)
    // Handle potential null cases if lastModifiedAt isn't always set initially
    if ((previous.lastModifiedAt != null || current.lastModifiedAt != null) &&
        (previous.lastModifiedAt == null ||
            current.lastModifiedAt == null ||
            !previous.lastModifiedAt!.isAtSameMomentAs(
              current.lastModifiedAt!,
            ))) {
      return true; // Timestamp changed, activity definition changed
    }

    // Fallback to field-by-field comparison (useful if lastModifiedAt isn't available)
    // Consider if this is still needed or if lastModifiedAt is sufficient.
    // You might simplify this part or keep it as a secondary check.
    return previous.name != current.name ||
        previous.activeStatus != current.activeStatus ||
        previous.frequency != current.frequency ||
        previous.type != current.type ||
        previous.enabledAt != current.enabledAt ||
        previous.selectedDays != current.selectedDays ||
        previous.time?.value != current.time?.value ||
        previous.weeksInterval != current.weeksInterval ||
        previous.selectedMonthDays != current.selectedMonthDays ||
        previous.selectedEndBeforeDate != current.selectedEndBeforeDate ||
        previous.endBeforeActive.value != current.endBeforeActive.value ||
        previous.notifyBefore != current.notifyBefore ||
        previous.selectedNotifyBeforeUnit != current.selectedNotifyBeforeUnit ||
        previous.selectedNotifyBeforeFrequency !=
            current.selectedNotifyBeforeFrequency ||
        previous.endBeforeType != current.endBeforeType ||
        previous.endBeforeUnit != current.endBeforeUnit ||
        previous.weeksInterval != current.weeksInterval ||
        !_listsEqual(previous.selectedDays, current.selectedDays) ||
        !_listsEqual(previous.selectedMonthDays, current.selectedMonthDays) ||
        (previous.time?.value != current.time?.value);
  }

  bool _listsEqual<T>(List<T> a, List<T> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  Future<void> _handleAddedActivities(Map<String, ActivityModel> added) async {
    _logger.i("Processing ${added.length} added activities");

    for (final activity in added.values) {
      if (_isActivityValid(activity)) {
        await _removeFutureInstancesForActivity(activity.id);
        await _generateTaskInstancesForActivity(activity);
        await _notificationsController.onActivityAdded(activity);
      }
    }
    CalendarController.instance.refreshCalendar();
  }

  Future<void> _handleUpdatedActivities(
    Map<String, ActivityModel> updated,
  ) async {
    _logger.i("Processing ${updated.length} updated activities");

    for (final activity in updated.values) {
      // Remove future instances for this activity
      await _removeFutureInstancesForActivity(activity.id);

      // Regenerate if activity is still valid
      if (_isActivityValid(activity)) {
        await _generateTaskInstancesForActivity(activity);
      }
    }
    CalendarController.instance.refreshCalendar();
  }

  Future<void> _handleRemovedActivities(List<String> removed) async {
    _logger.i("Processing ${removed.length} removed activities");

    for (final activityId in removed) {
      final shouldKeepHistory =
          userModel.value.keepActivityHistory[activityId] ?? false;
      _logger.i(
        "Deleting activity $activityId, keepHistory preference: $shouldKeepHistory",
      );

      // Simply remove instances locally - don't sync to Firebase
      final instancesToRemove =
          taskInstanceMap.values
              .where((instance) => instance.activityId == activityId)
              .map((instance) => instance.id)
              .toList();

      if (shouldKeepHistory) {
        _removeFutureInstancesForActivity(activityId);
      } else {
        for (final instanceId in instancesToRemove) {
          taskInstanceMap.remove(instanceId);
          pendingUpdates.remove(instanceId);
          // Don't add to pendingDeletes - we don't want to sync these deletions
        }
      }

      _deletedActivityIds.add(activityId);
      await _notificationsController.onActivityDeleted(activityId);

      _logger.i(
        "Removed ${instancesToRemove.length} instances for deleted activity $activityId locally",
      );
    }
    CalendarController.instance.refreshCalendar();
  }

  Future<void> _cleanupOrphanedInstances() async {
    final activeActivityIds =
        userModel.value.activities.map((a) => a.id).toSet();
    final orphanedInstances =
        taskInstanceMap.values
            .where(
              (instance) => !activeActivityIds.contains(instance.activityId),
            )
            .map((instance) => instance)
            .toList();

    if (orphanedInstances.isNotEmpty) {
      for (final instance in orphanedInstances) {
        if (userModel.value.keepActivityHistory[instance.activityId] != null &&
            userModel.value.keepActivityHistory[instance.activityId] == true &&
            instance.date.isBefore(
              userModel.value.deletedActivities
                  .firstWhere((act) => act.id == instance.activityId)
                  .lastModifiedAt!,
            )) {
          continue; // Skip deletion if we are keeping history
        }
        taskInstanceMap.remove(instance.id);
        pendingUpdates.remove(instance.id);
      }
      _logger.i("Cleaned up orphaned instances");
    }
  }

  Future<void> _generateTaskInstancesForActivity(ActivityModel activity) async {
    const int batchSize = 50; // Process dates in batches

    // Generate dates in compute isolate
    final scheduledDates = await compute(
      _generateTaskDatesInIsolate,
      activity.toJson(),
    );

    final now = tz.TZDateTime.now(tz.local);
    final today = DateTime(now.year, now.month, now.day);

    // Process in batches to avoid blocking UI
    for (int i = 0; i < scheduledDates.length; i += batchSize) {
      final batch = scheduledDates.skip(i).take(batchSize);

      for (final date in batch) {
        final instanceId = TaskInstance.generateId(activity.id, date);

        if (taskInstanceMap.containsKey(instanceId)) continue;

        final TaskStatus status = _determineTaskStatus(date, now, today);

        final newInstance = TaskInstance(
          activityId: activity.id,
          date: date,
          status: status,
          updatedAt: DateTime.now(),
        );

        taskInstanceMap[newInstance.id] = newInstance;
      }

      // Yield control back to UI thread periodically
      if (i + batchSize < scheduledDates.length) {
        await Future.delayed(Duration.zero);
      }
    }
  }

  TaskStatus _determineTaskStatus(
    DateTime date,
    tz.TZDateTime now,
    DateTime today,
  ) {
    final taskDateTime = DateTime(date.year, date.month, date.day, 23, 59);

    // If the task date is before today, it's missed
    if (date.isBefore(today)) {
      return TaskStatus.missed;
    }

    // If it's today but the deadline has passed, it's missed
    if (date.isAtSameMomentAs(today) && taskDateTime.isBefore(now)) {
      return TaskStatus.missed;
    }

    // Otherwise it's pending
    return TaskStatus.pending;
  }

  /// Iterates through all task instances in [taskInstanceMap] and updates
  /// the status of pending tasks that should now be 'missed' based on
  /// the current time.
  /// This ensures one-time tasks (and any pending regular tasks loaded
  /// from storage or sync) are correctly marked if their time has passed.
  Future<void> _markOverdueTasksAsMissed() async {
    _logger.d("Checking for overdue tasks to mark as missed...");
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    final DateTime today = DateTime(now.year, now.month, now.day);
    final Map<String, TaskInstance> updatesToApply = {};

    for (final entry in taskInstanceMap.entries) {
      final TaskInstance instance = entry.value;

      // Only check instances that are currently pending
      if (instance.status == TaskStatus.pending) {
        // Determine the effective date/time for the task's "deadline"
        // For one-time tasks, use the specific time.
        // For regular tasks (assuming end-of-day deadline), use end of the instance date.
        late final DateTime taskDeadline;

        if (instance.time != null) {
          // One-time task: deadline is the specific date/time
          taskDeadline = DateTime(
            instance.date.year,
            instance.date.month,
            instance.date.day,
            instance.time!.hour,
            instance.time!.minute,
          );
        } else {
          // Regular task: typically deadline is end of the day (as in _determineTaskStatus)
          taskDeadline = DateTime(
            instance.date.year,
            instance.date.month,
            instance.date.day,
            23, // End of day - hour
            59, // End of day - minute
          );
        }

        // If the deadline has passed, mark as missed
        if (taskDeadline.isBefore(today)) {
          final TaskInstance missedInstance = instance.copyWith(
            status: TaskStatus.missed,
            updatedAt: DateTime.now(), // Update timestamp
          );
          updatesToApply[missedInstance.id] = missedInstance;
          _logger.d(
            "Marking overdue task instance ${missedInstance.id} as missed.",
          );
        }
      }
    }

    if (updatesToApply.isNotEmpty) {
      // Apply updates to the main map
      taskInstanceMap.addAll(updatesToApply);
      _logger.i(
        "Marked ${updatesToApply.length} overdue task instances as missed.",
      );
      // Important: Save the changes locally and schedule a sync
      await _saveAllLocalData();
    } else {
      _logger.d("No overdue tasks found to mark as missed.");
    }
  }

  static List<DateTime> _generateTaskDatesInIsolate(
    Map<String, dynamic> activityJson,
  ) {
    final activity = ActivityModel.fromJson(activityJson);
    return DateTimeHelper.generateAllTaskDatesForActivity(activity);
  }

  Future<void> _removeFutureInstancesForActivity(String activityId) async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final instancesToRemove =
        taskInstanceMap.values
            .where(
              (instance) =>
                  instance.activityId == activityId &&
                  instance.date.isAfter(today) &&
                  // instance.time == null &&
                  instance.status == TaskStatus.pending,
            )
            .map((instance) => instance.id)
            .toList();

    for (final id in instancesToRemove) {
      taskInstanceMap.remove(id);
      pendingUpdates.remove(id);
    }

    if (instancesToRemove.isNotEmpty) {
      _logger.i(
        "Removed ${instancesToRemove.length} future instances for activity $activityId",
      );
    }
  }

  Future<void> _initialize() async {
    if (_isInitialized.value) return;
    _logger.i("Starting ActivityController initialization...");
    _notificationsController = Get.put(NotificationsController());
    clear();

    try {
      await _loadUserData();
      await _loadNotificationPreferences();

      _lastKnownActivities.assignAll({
        for (var a in userModel.value.activities) a.id: a,
      });

      await _loadAllLocalData();
      await _cleanupOrphanedInstances();

      await _markOverdueTasksAsMissed();

      // CHANGED: Perform sync BEFORE generating UI and setting initialized flag
      try {
        await _performInitialSync();
      } catch (e) {
        _logger.w("Initial sync failed, continuing with local data: $e");
        // Don't throw - continue with local data
      }

      await _generateMissingTaskInstances();
      await _cleanupOldInstances();
      _generateUiTasks(); // Now generates with synced data
      await _saveAllLocalData();

      _startBackgroundOperations();

      if (_notificationsEnabled.value) {
        await _notificationsController.initialize();
      }

      _isInitialized.value = true;
      _logger.i(
        "ActivityController initialized successfully with ${taskInstanceMap.length} instances.",
      );
    } catch (e, stackTrace) {
      _logger.e(
        "Error during ActivityController initialization",
        error: e,
        stackTrace: stackTrace,
      );
      rethrow;
    }
  }

  Future<void> _performInitialSync() async {
    if (_isSyncing.value) return;

    _isSyncing.value = true;
    _lastSyncError.value = '';

    try {
      // First handle deletions
      await _syncPendingDeletesToRemote();

      // Then sync pending updates
      await _syncPendingUpdatesToRemote();

      // Finally fetch and apply remote updates
      await _syncWithRemote();

      _lastSuccessfulSync.value = DateTime.now();
      _logger.i('Initial sync completed successfully.');
    } catch (e, s) {
      _lastSyncError.value = e.toString();
      _logger.e("Initial sync failed", error: e, stackTrace: s);
      rethrow;
    } finally {
      _isSyncing.value = false;
    }
  }

  Future<void> _loadUserData() async {
    final storage = LocalStorage.instance();
    final userData = storage.readData('User');
    if (userData != null) {
      userModel.value = UserModel.fromJson(userData);
      _logger.d("User model loaded from local storage.");
    } else {
      _logger.w("User data not found in local storage.");
      throw Exception("User data is required for initialization.");
    }
  }

  Future<void> _loadAllLocalData() async {
    await Future.wait([
      _loadTaskInstancesFromLocal(),
      _loadPendingUpdatesFromLocal(),
      _loadFailedSyncIds(),
      _loadPendingDeletes(),
      _loadSyncMetadata(),
      _loadDeletedActivityIds(),
    ]);
  }

  Future<void> _loadTaskInstancesFromLocal() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('TaskInstances');

    if (storedData != null && storedData is List) {
      try {
        final instances = <String, TaskInstance>{};

        for (final item in storedData) {
          if (item is Map<String, dynamic>) {
            final instance = TaskInstance.fromJson(item);
            if (instance.activityId.isNotEmpty) {
              instances[instance.id] = instance;
            }
          }
        }

        taskInstanceMap.assignAll(instances);
        _logger.i(
          'Loaded ${taskInstanceMap.length} task instances from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing local task instances: $e");
        taskInstanceMap.clear();
      }
    }
  }

  Future<void> _loadPendingUpdatesFromLocal() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('PendingUpdates');

    if (storedData != null && storedData is List) {
      try {
        final updates = <String, TaskInstance>{};

        for (final item in storedData) {
          if (item is Map<String, dynamic>) {
            final instance = TaskInstance.fromJson(item);
            updates[instance.id] = instance;
          }
        }

        pendingUpdates.assignAll(updates);
        _logger.i(
          'Loaded ${pendingUpdates.length} pending updates from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing pending updates: $e");
        pendingUpdates.clear();
      }
    }
  }

  Future<void> _loadFailedSyncIds() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('FailedSyncIds');

    if (storedData != null && storedData is List) {
      try {
        failedSyncIds.assignAll(storedData.cast<String>());
        _logger.i(
          'Loaded ${failedSyncIds.length} failed sync IDs from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing failed sync IDs: $e");
        failedSyncIds.clear();
      }
    }
  }

  Future<void> _loadPendingDeletes() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('PendingDeletes');

    if (storedData != null && storedData is List) {
      try {
        pendingDeletes.assignAll(storedData.cast<String>());
        _logger.i(
          'Loaded ${pendingDeletes.length} pending deletes from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing pending deletes: $e");
        pendingDeletes.clear();
      }
    }
  }

  Future<void> _loadDeletedActivityIds() async {
    final storage = LocalStorage.instance();
    final storedData = storage.readData('DeletedActivityIds');

    if (storedData != null && storedData is List) {
      try {
        _deletedActivityIds.assignAll(storedData.cast<String>());
        _logger.i(
          'Loaded ${_deletedActivityIds.length} deleted activity IDs from local storage.',
        );
      } catch (e) {
        _logger.e("Error parsing deleted activity IDs: $e");
        _deletedActivityIds.clear();
      }
    }
  }

  Future<void> _loadSyncMetadata() async {
    final storage = LocalStorage.instance();
    final metadata = storage.readData('SyncMetadata');

    if (metadata != null && metadata is Map<String, dynamic>) {
      try {
        if (metadata['lastSuccessfulSync'] != null) {
          _lastSuccessfulSync.value = DateTime.parse(
            metadata['lastSuccessfulSync'],
          );
        }
        _lastSyncError.value = metadata['lastSyncError'] ?? '';
      } catch (e) {
        _logger.e("Error parsing sync metadata: $e");
      }
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

      await _markOverdueTasksAsMissed();

      // ADDED: Regenerate UI after background sync to reflect remote changes
      _generateUiTasks();
      await _saveAllLocalData();

      _lastSuccessfulSync.value = DateTime.now();
      _logger.i('Background sync completed successfully.');
    } catch (e, s) {
      _lastSyncError.value = e.toString();
      _logger.e("Background sync failed", error: e, stackTrace: s);
    } finally {
      _isSyncing.value = false;
      await _saveSyncMetadata();
    }
  }

  Future<void> _syncPendingDeletesToRemote() async {
    if (pendingDeletes.isEmpty) return;

    _logger.d("Syncing ${pendingDeletes.length} pending deletes to remote...");

    // Group deletions into batches for better performance
    const int batchSize = 500; // Firestore batch limit
    final deletesToSync = List<String>.from(pendingDeletes);
    final batches = _createBatches(deletesToSync, batchSize);

    final successfulDeletes = <String>[];

    for (final batch in batches) {
      try {
        // Use the new bulk delete method if available
        await _taskInstanceRepository.deleteBulkTaskInstances(
          userModel.value.id,
          batch,
        );
        successfulDeletes.addAll(batch);
        log(
          'Successfully deleted batch of ${batch.length} instances from remote. ${successfulDeletes.toString()}',
        );
      } catch (e) {
        _logger.w('Failed to delete batch of ${batch.length} instances: $e');
        // Fall back to individual deletions for this batch
        for (final instanceId in batch) {
          try {
            await _taskInstanceRepository.deleteTaskInstance(
              userModel.value.id,
              instanceId,
            );
            successfulDeletes.add(instanceId);
          } catch (e) {
            _logger.w('Failed to delete instance $instanceId: $e');
          }
        }
      }
    }

    // Remove successfully deleted instances from pending
    for (final id in successfulDeletes) {
      pendingDeletes.remove(id);
    }

    if (successfulDeletes.isNotEmpty) {
      _logger.i(
        'Successfully deleted ${successfulDeletes.length} instances from remote.',
      );
    }
  }

  Future<void> _syncPendingUpdatesToRemote() async {
    if (pendingUpdates.isEmpty && failedSyncIds.isEmpty) return;

    _logger.d("Syncing pending updates to remote...");

    // Combine pending updates and retry failed ones
    final instancesToSync = <TaskInstance>[];

    // Add pending updates
    instancesToSync.addAll(pendingUpdates.values);

    // Add failed sync instances (if they still exist locally)
    for (final failedId in failedSyncIds.toList()) {
      final instance = taskInstanceMap[failedId];
      if (instance != null && !pendingUpdates.containsKey(failedId)) {
        instancesToSync.add(instance);
      }
    }

    if (instancesToSync.isEmpty) return;

    // Process in batches to avoid overwhelming Firebase
    final batches = _createBatches(instancesToSync, _syncBatchSize);
    final syncedIds = <String>[];
    final newFailedIds = <String>[];

    for (final batch in batches) {
      final batchResults = await Future.wait(
        batch.map((instance) async {
          try {
            await _taskInstanceRepository.updateTaskInstance(
              userModel.value.id,
              instance,
            );
            return SyncResult(instance.id, success: true);
          } catch (e) {
            _logger.w('Failed to sync instance ${instance.id}: $e');
            return SyncResult(instance.id, success: false, error: e.toString());
          }
        }),
      );

      for (final result in batchResults) {
        if (result.success) {
          syncedIds.add(result.instanceId);
        } else {
          newFailedIds.add(result.instanceId);
        }
      }
    }

    // Update pending updates and failed sync tracking
    for (final syncedId in syncedIds) {
      pendingUpdates.remove(syncedId);
      failedSyncIds.remove(syncedId);
    }

    failedSyncIds.addAll(newFailedIds);

    _logger.i(
      'Sync to remote: ${syncedIds.length} successful, ${newFailedIds.length} failed.',
    );
  }

  Future<void> _syncWithRemote() async {
    _logger.i("=== Starting sync with remote ===");
    try {
      DateTime? lastUpdateTime = _lastSuccessfulSync.value;
      _logger.i("Last successful sync: $lastUpdateTime");

      if (lastUpdateTime == null && taskInstanceMap.isNotEmpty) {
        final instances =
            taskInstanceMap.values.toList()
              ..sort((a, b) => a.updatedAt.compareTo(b.updatedAt));
        lastUpdateTime = instances.last.updatedAt;
        _logger.i("Using latest local timestamp: $lastUpdateTime");
      }

      final remoteInstances =
          lastUpdateTime == null
              ? await _taskInstanceRepository.fetchAllTaskInstances(
                userModel.value,
              )
              : await _taskInstanceRepository.fetchTaskInstancesSince(
                lastUpdateTime,
                userModel.value.id,
              );

      _logger.i("Fetched ${remoteInstances.length} instances from remote");

      if (remoteInstances.isEmpty) {
        _logger.w('No new instances from remote');
        return;
      }

      int updatedCount = 0;
      int addedCount = 0;
      int skippedCount = 0;

      for (final remoteInstance in remoteInstances) {
        if (_deletedActivityIds.contains(remoteInstance.activityId)) {
          _logger.d(
            "Skipping instance for deleted activity: ${remoteInstance.activityId}",
          );
          continue;
        }

        final localInstance = taskInstanceMap[remoteInstance.id];
        final hasPendingUpdate = pendingUpdates.containsKey(remoteInstance.id);

        _logger.i("Processing ${remoteInstance.id}:");
        _logger.i("  - Local exists: ${localInstance != null}");
        _logger.i("  - Has pending: $hasPendingUpdate");

        if (localInstance != null) {
          _logger.i(
            "  - Local status: ${localInstance.status}, updated: ${localInstance.updatedAt}",
          );
          _logger.i(
            "  - Remote status: ${remoteInstance.status}, updated: ${remoteInstance.updatedAt}",
          );

          // CRITICAL FIX: Always accept deleted status from remote
          if (remoteInstance.status == TaskStatus.deleted) {
            taskInstanceMap[remoteInstance.id] = remoteInstance;
            // Remove from pending updates since remote deletion takes precedence
            pendingUpdates.remove(remoteInstance.id);
            updatedCount++;
            _logger.i(
              "  -> Updated to deleted (remote deletion takes precedence)",
            );
          }
          // If local has pending update, skip remote (local changes take precedence)
          else if (hasPendingUpdate) {
            skippedCount++;
            _logger.i("  -> Skipped (local has pending update)");
          }
          // Accept remote if it's newer
          else if (remoteInstance.updatedAt.isAfter(localInstance.updatedAt)) {
            taskInstanceMap[remoteInstance.id] = remoteInstance;
            updatedCount++;
            _logger.i("  -> Updated from remote (newer)");
          }
          // Accept remote if timestamps are equal (handles fresh install case)
          else if (remoteInstance.updatedAt.isAtSameMomentAs(
            localInstance.updatedAt,
          )) {
            taskInstanceMap[remoteInstance.id] = remoteInstance;
            updatedCount++;
            _logger.i(
              "  -> Updated from remote (equal timestamp, accepting remote state)",
            );
          } else {
            skippedCount++;
            _logger.i("  -> Skipped (local is newer)");
          }
        } else {
          // No local instance exists, add the remote one
          taskInstanceMap[remoteInstance.id] = remoteInstance;
          addedCount++;
          _logger.i("  → Added new");
        }
      }

      _logger.i(
        "=== Sync complete: $addedCount added, $updatedCount updated, $skippedCount skipped ===",
      );
    } catch (e, s) {
      _logger.e("Error syncing with remote", error: e, stackTrace: s);
      throw e;
    }
  }

  Future<void> _generateMissingTaskInstances() async {
    _logger.d("Generating missing task instances...");
    final newInstances = <TaskInstance>[];
    final now = tz.TZDateTime.now(tz.local);
    final today = DateTime(now.year, now.month, now.day);

    for (final activity in userModel.value.activities) {
      if (!_isActivityValid(activity)) continue;

      final scheduledDates = DateTimeHelper.generateAllTaskDatesForActivity(
        activity,
      );

      // already taken dates
      final takenDates =
          taskInstanceMap.values
              .where(
                (instance) =>
                    instance.activityId == activity.id &&
                    instance.status == TaskStatus.pending &&
                    instance.time == null &&
                    instance.date.isAfter(today),
              )
              .map((instance) => instance.date)
              .toList();

      final invalidDates = takenDates.where(
        (date) =>
            !scheduledDates.any(
              (d) =>
                  d.year == date.year &&
                  d.month == date.month &&
                  d.day == date.day,
            ),
      );
      if (invalidDates.isNotEmpty) {
        _logger.w(
          "Found ${invalidDates.length} invalid future instances for activity ${activity.id}, removing them.",
        );
        for (final date in invalidDates) {
          final instanceId = TaskInstance.generateId(activity.id, date);
          taskInstanceMap.remove(instanceId);
          pendingUpdates.remove(instanceId);
        }
      }

      for (final date in scheduledDates) {
        final instanceId = TaskInstance.generateId(activity.id, date);

        if (taskInstanceMap.containsKey(instanceId)) {
          continue;
        }

        final TaskStatus status;
        final taskDateTime = DateTime(date.year, date.month, date.day, 23, 59);
        if (taskDateTime.isBefore(now) && date.isBefore(today)) {
          status = TaskStatus.missed;
        } else {
          status = TaskStatus.pending;
        }

        final newInstance = TaskInstance(
          activityId: activity.id,
          date: date,
          status: status,
          updatedAt: DateTime.now(),
        );

        newInstances.add(newInstance);
        taskInstanceMap[newInstance.id] = newInstance;
      }
    }

    if (newInstances.isNotEmpty) {
      _logger.i("Generated ${newInstances.length} new task instances locally.");
    }
  }

  bool _isActivityValid(ActivityModel activity) {
    return activity.activeStatus == true &&
        activity.enabledAt != null &&
        activity.id.isNotEmpty &&
        // activity.frequency.isNotEmpty &&
        !_deletedActivityIds.contains(activity.id);
  }

  Future<void> _cleanupOldInstances() async {
    final now = DateTime.now();
    final cutoffDate = now.subtract(
      const Duration(days: _maxPastInstancesPerActivity),
    );

    final instancesByActivity = <String, List<TaskInstance>>{};

    // Group instances by activity
    for (final instance in taskInstanceMap.values) {
      instancesByActivity
          .putIfAbsent(instance.activityId, () => [])
          .add(instance);
    }

    final instancesToRemove = <String>[];

    for (final entry in instancesByActivity.entries) {
      final activityInstances =
          entry.value..sort((a, b) => b.date.compareTo(a.date));

      final oldInstances =
          activityInstances
              .where(
                (instance) =>
                    instance.date.isBefore(cutoffDate) &&
                    instance.status == TaskStatus.pending,
              )
              .skip(_maxPastInstancesPerActivity)
              .toList();

      for (final instance in oldInstances) {
        instancesToRemove.add(instance.id);
      }
    }

    if (instancesToRemove.isNotEmpty) {
      for (final id in instancesToRemove) {
        taskInstanceMap.remove(id);
        pendingUpdates.remove(id);
        failedSyncIds.remove(id);
        pendingDeletes.add(id); // Mark for deletion
      }
      _logger.i("Cleaned up ${instancesToRemove.length} old task instances.");
    }
  }

  void _generateUiTasks() {
    _logger.i("=== Generating UI tasks ===");
    final regularTasksList = <Task>[];
    final oneTimeTasksList = <Task>[];
    final now = tz.TZDateTime.now(tz.local);
    final today = DateTime(now.year, now.month, now.day);

    _logger.i("Today's date: $today");

    // Debug: Log all instances for today
    final todayInstances =
        taskInstanceMap.values.where((instance) {
          final instanceDate = DateTime(
            instance.date.year,
            instance.date.month,
            instance.date.day,
          );
          return instanceDate.isAtSameMomentAs(today);
        }).toList();

    _logger.i("Found ${todayInstances.length} instances for today:");
    for (final instance in todayInstances) {
      _logger.i(
        "  - ${instance.id}: ${instance.status} (updated: ${instance.updatedAt})",
      );
    }

    final todayRegularInstanceMap = <String, TaskInstance>{};
    final todayOneTimeInstances = <TaskInstance>[];

    final activeActivities =
        userModel.value.activities
            .where((activity) => _isActivityValid(activity))
            .toList();

    // Separate regular and one-time instances for today
    for (final instance in todayInstances) {
      if (instance.status == TaskStatus.deleted) continue;

      if (instance.time != null ||
          activeActivities
                  .firstWhere(
                    (a) => a.id == instance.activityId,
                    orElse: () => ActivityModel.empty(),
                  )
                  .type ==
              'one_time') {
        todayOneTimeInstances.add(instance);
      } else {
        todayRegularInstanceMap[instance.activityId] = instance;
      }
    }

    // Override with pending updates for today - BUT ONLY if they're actually newer
    for (final pendingInstance in pendingUpdates.values) {
      final pendingDate = DateTime(
        pendingInstance.date.year,
        pendingInstance.date.month,
        pendingInstance.date.day,
      );
      if (pendingDate.isAtSameMomentAs(today)) {
        if (pendingInstance.time != null) {
          todayOneTimeInstances.removeWhere((i) => i.id == pendingInstance.id);
          todayOneTimeInstances.add(pendingInstance);
        } else {
          final existing = todayRegularInstanceMap[pendingInstance.activityId];
          // Only use pending if it's actually newer than what we have from remote
          if (existing == null ||
              pendingInstance.updatedAt.isAfter(existing.updatedAt)) {
            todayRegularInstanceMap[pendingInstance.activityId] =
                pendingInstance;
          }
        }
      }
    }

    // Generate regular tasks
    for (final activity in activeActivities.where(
      (a) => a.type != 'one_time',
    )) {
      final instance = todayRegularInstanceMap[activity.id];

      if (instance != null) {
        _logger.i(
          "Creating regular task: ${activity.name} - ${instance.status}",
        );
        final task = Task(
          activityId: activity.id,
          categoryId: activity.categoryId ?? '',
          name: activity.name ?? 'Unknown Activity',
          color: activity.color ?? MyHelperFunctions.getRandomColor(),
          time: activity.time?.value ?? const TimeOfDay(hour: 12, minute: 0),
          date: instance.date,
          status: instance.status,
          isOneTime: false,
        );
        regularTasksList.add(task);
      }
    }

    // Generate one-time tasks
    for (final instance in todayOneTimeInstances) {
      final activity = activeActivities.firstWhere(
        (a) => a.id == instance.activityId,
        orElse: () => ActivityModel.empty(),
      );
      if (activity.name!.isNotEmpty) {
        _logger.i(
          "Creating one-time task: ${activity.name} - ${instance.status}",
        );
        final task = Task(
          activityId: activity.id,
          categoryId: activity.categoryId ?? '',
          name: activity.name ?? 'Unknown Activity',
          color: activity.color ?? MyHelperFunctions.getRandomColor(),
          time: instance.time ?? const TimeOfDay(hour: 12, minute: 0),
          date: instance.date,
          status: instance.status,
          isOneTime: true,
        );
        oneTimeTasksList.add(task);
      }
    }

    // Sort by time
    regularTasksList.sort((a, b) {
      final timeA = a.time.hour * 60 + a.time.minute;
      final timeB = b.time.hour * 60 + b.time.minute;
      return timeA.compareTo(timeB);
    });

    oneTimeTasksList.sort((a, b) {
      final timeA = a.time.hour * 60 + a.time.minute;
      final timeB = b.time.hour * 60 + b.time.minute;
      return timeA.compareTo(timeB);
    });

    regularTasks.assignAll(regularTasksList);
    oneTimeTasks.assignAll(oneTimeTasksList);

    _logger.i(
      "=== UI tasks generated: ${regularTasks.length} regular, ${oneTimeTasks.length} one-time ===",
    );
    HomeScreenController.instance.loadTasksForToday(
      regularTasks: regularTasks,
      oneTimeTasks: oneTimeTasks,
      user: userModel.value,
    );
    CalendarController.instance.refreshCalendar();
  }

  Future<void> _updateTaskStatus(Task task, TaskStatus newStatus) async {
    // Generate the correct instance ID based on whether it's a one-time task
    final instanceId =
        task.isOneTime
            ? TaskInstance.generateId(task.activityId, task.date, task.time)
            : TaskInstance.generateId(task.activityId, task.date);

    final instance = taskInstanceMap[instanceId];

    if (instance == null) {
      _logger.e(
        "Could not find task instance to update for task ${task.activityId}",
      );
      return;
    }

    if (instance.status == newStatus) {
      _logger.d("Task ${task.activityId} already has status $newStatus.");
      return;
    }

    final updatedInstance = instance.copyWith(
      status: newStatus,
      updatedAt: DateTime.now(),
    );

    // Update local storage immediately (offline-first)
    taskInstanceMap[instanceId] = updatedInstance;
    pendingUpdates[instanceId] = updatedInstance;

    // Update UI task immediately in the appropriate list
    final targetList = task.isOneTime ? oneTimeTasks : regularTasks;
    final uiTaskIndex = targetList.indexWhere(
      (t) =>
          task.isOneTime
              ? (t.activityId == task.activityId &&
                  t.date == task.date &&
                  t.time == task.time)
              : t.activityId == task.activityId,
    );

    if (uiTaskIndex != -1) {
      targetList[uiTaskIndex] = targetList[uiTaskIndex].copyWith(
        status: newStatus,
      );
    }

    // Save to local storage immediately
    await _saveAllLocalData();

    _logger.i('Updated task ${task.activityId} to $newStatus locally.');

    // Schedule background sync
    _scheduleBackgroundSync();
  }

  void _scheduleBackgroundSync() {
    _syncRequested.add('sync');

    _syncDebounceTimer?.cancel();
    _syncDebounceTimer = Timer(const Duration(seconds: 1), () async {
      if (_syncRequested.isNotEmpty && !_isSyncing.value) {
        _syncRequested.clear();
        await _performBackgroundSync();
      }
    });
  }

  Future<void> _saveAllLocalData() async {
    if (_saveInProgress) return;
    _saveInProgress = true;

    try {
      final dataToSave = _prepareDataForSave();

      // Save in background thread to avoid blocking UI
      await _saveDataInIsolate(dataToSave);

      _logger.d('Saved all local data successfully');
    } catch (e, s) {
      _logger.e('Error saving local data', error: e, stackTrace: s);
    } finally {
      _saveInProgress = false;
    }
  }

  static Future<void> _saveDataInIsolate(Map<String, dynamic> data) async {
    try {
      final storage = LocalStorage.instance();

      // Save all data types in parallel
      await Future.wait([
        storage.writeData('TaskInstances', data['taskInstances']),
        storage.writeData('PendingUpdates', data['pendingUpdates']),
        storage.writeData('FailedSyncIds', data['failedSyncIds']),
        storage.writeData('PendingDeletes', data['pendingDeletes']),
        storage.writeData('DeletedActivityIds', data['deletedActivityIds']),
        storage.writeData('SyncMetadata', data['syncMetadata']),
      ]);
    } catch (e) {
      throw Exception('Failed to save data in isolate: $e');
    }
  }

  Map<String, dynamic> _prepareDataForSave() {
    return {
      'taskInstances':
          taskInstanceMap.values
              .map(
                (e) => e.toJson(forFirebase: false),
              ) // Use forFirebase: false for local storage
              .toList(),
      'pendingUpdates':
          pendingUpdates.values
              .map(
                (e) => e.toJson(forFirebase: false),
              ) // Use forFirebase: false for local storage
              .toList(),
      'failedSyncIds': failedSyncIds.toList(),
      'pendingDeletes': pendingDeletes.toList(),
      'deletedActivityIds': _deletedActivityIds.toList(),
      'syncMetadata': {
        'lastSuccessfulSync': _lastSuccessfulSync.value?.toIso8601String(),
        'lastSyncError': _lastSyncError.value,
      },
    };
  }

  void _enforceMemoryLimits() {
    if (taskInstanceMap.length > MAX_TASK_INSTANCES) {
      // Remove oldest completed/skipped tasks
      final sortedInstances =
          taskInstanceMap.values.toList()
            ..sort((a, b) => a.date.compareTo(b.date));

      final toRemove =
          sortedInstances
              .where(
                (i) =>
                    i.status == TaskStatus.completed ||
                    i.status == TaskStatus.skipped,
              )
              .take(taskInstanceMap.length - MAX_TASK_INSTANCES)
              .map((i) => i.id)
              .toList();

      for (final id in toRemove) {
        taskInstanceMap.remove(id);
      }
    }
  }

  Future<void> _saveSyncMetadata() async {
    final storage = LocalStorage.instance();
    try {
      await storage.writeData('SyncMetadata', {
        'lastSuccessfulSync': _lastSuccessfulSync.value?.toIso8601String(),
        'lastSyncError': _lastSyncError.value,
      });
    } catch (e, s) {
      _logger.e('Error saving sync metadata', error: e, stackTrace: s);
    }
  }

  void _startBackgroundOperations() {
    // Periodic sync timer
    _syncTimer = Timer.periodic(_syncInterval, (timer) async {
      if (!_isSyncing.value && (hasPendingUpdates || hasFailedSyncs)) {
        _performBackgroundSync();
      }
    });

    // Periodic cleanup timer
    _cleanupTimer = Timer.periodic(_cleanupInterval, (timer) async {
      try {
        await _cleanupOldInstances();
        await _saveAllLocalData();
      } catch (e) {
        _logger.e('Periodic cleanup failed: $e');
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

  // Helper methods
  List<List<T>> _createBatches<T>(List<T> items, int batchSize) {
    final batches = <List<T>>[];
    for (int i = 0; i < items.length; i += batchSize) {
      final end = (i + batchSize < items.length) ? i + batchSize : items.length;
      batches.add(items.sublist(i, end));
    }
    return batches;
  }

  /// Schedule notifications for newly added one-time tasks
  Future<void> _scheduleNotificationsForOneTimeTask(
    ActivityModel activity,
    DateTime date,
    TimeOfDay time,
  ) async {
    if (_notificationsEnabled.value) {
      // This will be handled automatically by the NotificationsController
      // when it detects new task instances, but you can add explicit scheduling here if needed
      await _notificationsController.refreshNotifications();
    }
  }

  Future<void> _loadNotificationPreferences() async {
    final enabled = userModel.value.dailyReminder;
    _notificationsEnabled.value = enabled; // Default to enabled
  }

  void _scheduleUiUpdate() {
    _uiUpdateTimer?.cancel();
    _uiUpdateTimer = Timer(const Duration(milliseconds: 100), () {
      _generateUiTasks();
    });
  }
}

// Helper class for sync results
class SyncResult {
  SyncResult(this.instanceId, {required this.success, this.error});

  final String? error;
  final String instanceId;
  final bool success;
}

// Extension for null-safe firstWhere
extension ListExtensions<T> on List<T> {
  T? firstWhereOrNull(bool Function(T) test) {
    for (final element in this) {
      if (test(element)) return element;
    }
    return null;
  }
}
