import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:timezone/timezone.dart' as tz;

import '../../../data/models/activity_model.dart';
import '../../../data/models/notifications_model.dart';
import '../../../data/repositories/notifications/notifications_repository.dart';
import '../../app/controllers/activity_controller.dart';
import '../../app/models/task_model.dart';

class NotificationsController extends GetxController {
  static NotificationsController get instance => Get.find();

  RxList<NotificationsModel> notifications = <NotificationsModel>[].obs;
  late final NotificationsRepository notificationsRepository;

  // Configuration constants
  static const int _dailySummaryNotificationId = 1000;
  static const int _taskNotificationIdBase = 2000;
  static const int _reminderNotificationIdBase = 3000;

  TimeOfDay _dailySummaryTime = const TimeOfDay(hour: 8, minute: 0);

  @override
  void onInit() {
    super.onInit();
    notificationsRepository = NotificationsRepository.instance;

    // Listen to activity controller initialization
    // Use a callback that checks for the controller when the state changes
    ever(ActivityController.instance.isInitialized, (bool isInitialized) {
      if (isInitialized) {
        _dailySummaryTime =
            ActivityController.instance.userModel.value.reminderTime;
        _scheduleAllNotifications();
      }
    });
  }

  Future<void> initialize() async {
    await notificationsRepository.initNotification();
    notifications.value =
        await notificationsRepository.getNotificationHistory();

    final activityControllerInstance = Get.find<ActivityController>();
    // Schedule notifications if activity controller is already initialized
    if (activityControllerInstance.isInitialized.value) {
      _dailySummaryTime =
          activityControllerInstance.userModel.value.reminderTime;
      await _scheduleAllNotifications();
    }
  }

  /// Schedule all types of notifications
  Future<void> _scheduleAllNotifications() async {
    try {
      // Cancel existing notifications first
      await cancelAllNotifications();

      // Schedule daily summary notification
      await _scheduleDailySummaryNotification();

      // Schedule task and reminder notifications for the next 30 days
      await _scheduleTaskNotifications();

      log('All notifications scheduled successfully');
    } catch (e) {
      log('Error scheduling notifications: $e');
    }
  }

  /// Schedule daily summary notification at 8:00 AM
  Future<void> _scheduleDailySummaryNotification() async {
    final activityControllerInstance = Get.find<ActivityController>();

    if (!activityControllerInstance.isInitialized.value) {
      return;
    }

    final now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      _dailySummaryTime.hour,
      _dailySummaryTime.minute,
    );

    // If today's 8 AM has passed, schedule for tomorrow
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    final tasksCount = _getTasksCountForDate(
      DateTime(scheduledDate.year, scheduledDate.month, scheduledDate.day),
      activityControllerInstance,
    );

    final notification = NotificationsModel(
      id: _dailySummaryNotificationId,
      title: 'Good morning! 🌅',
      body: _getDailySummaryBody(tasksCount),
      image: '',
      date: scheduledDate.toLocal(),
      hour: _dailySummaryTime.hour,
      minute: _dailySummaryTime.minute,
    );

    await notificationsRepository.scheduleRepeatingNotification(
      notification,
      RepeatInterval.daily,
    );

    notifications.add(notification);
  }

  /// Schedule task and reminder notifications for the next 30 days
  Future<void> _scheduleTaskNotifications() async {
    final now = tz.TZDateTime.now(tz.local);
    final endDate = now.add(const Duration(days: 30));
    final activityControllerInstance = Get.find<ActivityController>();

    if (!activityControllerInstance.isInitialized.value) {
      return;
    }

    // Get all task instances for the next 30 days
    final taskInstances = activityControllerInstance
        .getTaskInstancesForDateRange(now.toLocal(), endDate.toLocal());

    final activities = activityControllerInstance.userModel.value.activities;
    final scheduledNotifications = <NotificationsModel>[];

    for (final instance in taskInstances) {
      final activity = activities.firstWhere(
        (a) => a.id == instance.activityId,
        orElse: () => ActivityModel.empty(),
      );

      if (activity.name?.isEmpty ?? true) continue;

      // Schedule task notification
      await _scheduleTaskNotification(
        instance,
        activity,
        scheduledNotifications,
      );

      // Schedule reminder notification if enabled
      if (activity.selectedNotifyBeforeFrequency!.isNotEmpty &&
          activity.selectedNotifyBeforeUnit!.isNotEmpty) {
        await _scheduleReminderNotification(
          instance,
          activity,
          scheduledNotifications,
        );
      }
    }

    notifications.addAll(scheduledNotifications);
  }

  /// Schedule notification for when task time arrives
  Future<void> _scheduleTaskNotification(
    TaskInstance instance,
    ActivityModel activity,
    List<NotificationsModel> scheduledNotifications,
  ) async {
    final taskTime =
        activity.time?.value ?? const TimeOfDay(hour: 12, minute: 0);
    final scheduledDate = tz.TZDateTime(
      tz.local,
      instance.date.year,
      instance.date.month,
      instance.date.day,
      instance.time?.hour ?? taskTime.hour,
      instance.time?.minute ?? taskTime.minute,
    );

    // Only schedule future notifications
    if (scheduledDate.isBefore(tz.TZDateTime.now(tz.local))) return;

    final notificationId = _generateTaskNotificationId(instance);
    final notification = NotificationsModel(
      id: notificationId,
      title: '⏰ ${activity.name} Time!',
      body: _getTaskNotificationBody(activity),
      image: '',
      date: scheduledDate.toLocal(),
      hour: scheduledDate.hour,
      minute: scheduledDate.minute,
    );

    await notificationsRepository.scheduleLocalNotification(notification);
    scheduledNotifications.add(notification);
  }

  /// Schedule reminder notification before task time
  Future<void> _scheduleReminderNotification(
    TaskInstance instance,
    ActivityModel activity,
    List<NotificationsModel> scheduledNotifications,
  ) async {
    final reminderSeconds = _parseNotifyBefore(
      activity.selectedNotifyBeforeUnit!,
      activity.selectedNotifyBeforeFrequency!,
    );
    if (reminderSeconds <= 0) return;

    final taskTime =
        activity.time?.value ?? const TimeOfDay(hour: 12, minute: 0);
    final taskDateTime = tz.TZDateTime(
      tz.local,
      instance.date.year,
      instance.date.month,
      instance.date.day,
      instance.time?.hour ?? taskTime.hour,
      instance.time?.minute ?? taskTime.minute,
    );

    final reminderDateTime = taskDateTime.subtract(
      Duration(seconds: reminderSeconds),
    );

    // Only schedule future notifications
    if (reminderDateTime.isBefore(tz.TZDateTime.now(tz.local))) return;

    final notificationId = _generateReminderNotificationId(instance);
    final notification = NotificationsModel(
      id: notificationId,
      title: '🔔 Upcoming: ${activity.name}',
      body: _getReminderNotificationBody(activity, reminderSeconds),
      image: '',
      date: reminderDateTime.toLocal(),
      hour: reminderDateTime.hour,
      minute: reminderDateTime.minute,
    );

    await notificationsRepository.scheduleLocalNotification(notification);
    scheduledNotifications.add(notification);
  }

  int _getTasksCountForDate(
    DateTime date,
    ActivityController activityControllerInstance,
  ) {
    final allInstances = activityControllerInstance.taskInstanceMap.values;

    int instancesForDay = 0;

    for (var instance in allInstances) {
      final instanceDay = DateTime(
        instance.date.year,
        instance.date.month,
        instance.date.day,
      );
      if (instanceDay.isAtSameMomentAs(date)) {
        instancesForDay++;
      }
    }

    return instancesForDay;
  }

  /// Parse notify before string to seconds
  int _parseNotifyBefore(String unitString, String frequency) {
    if (frequency.isEmpty || unitString.isEmpty) return 0;

    final number = int.tryParse(unitString) ?? 0;

    switch (frequency) {
      case 'Seconds':
        return number;
      case 'Minutes':
        return number * 60;
      case 'Hours':
        return number * 60 * 60;
      case 'Days':
        return number * 24 * 60 * 60;
      case 'Weeks':
        return number * 7 * 24 * 60 * 60;
      case 'Months':
        return number * 30 * 24 * 60 * 60;
      case 'Years':
        return number * 365 * 24 * 60 * 60;
      default:
        return 0;
    }
  }

  /// Generate unique notification ID for task notifications
  int _generateTaskNotificationId(TaskInstance instance) {
    return _taskNotificationIdBase + instance.id.hashCode.abs() % 100000;
  }

  /// Generate unique notification ID for reminder notifications
  int _generateReminderNotificationId(TaskInstance instance) {
    return _reminderNotificationIdBase + instance.id.hashCode.abs() % 100000;
  }

  /// Get daily summary notification body
  String _getDailySummaryBody(int tasksCount) {
    if (tasksCount == 0) {
      return 'You have a free day today! Enjoy your time. 🌟';
    } else if (tasksCount == 1) {
      return 'You have 1 task scheduled for today. Let\'s make it count! 💪';
    } else {
      return 'You have $tasksCount tasks scheduled for today. You\'ve got this! 🚀';
    }
  }

  /// Get task notification body
  String _getTaskNotificationBody(ActivityModel activity) {
    final encouragements = [
      'Time to build your habit! 💪',
      'Let\'s do this! 🔥',
      'Your future self will thank you! ⭐',
      'Small steps, big results! 🎯',
      'You\'re building something amazing! 🌟',
    ];
    return encouragements[DateTime.now().millisecond % encouragements.length];
  }

  String _formatDuration(int totalSeconds) {
    if (totalSeconds < 60) {
      return '$totalSeconds second${totalSeconds == 1 ? '' : 's'}';
    } else if (totalSeconds < 3600) {
      final minutes = totalSeconds ~/ 60;
      return '$minutes minute${minutes == 1 ? '' : 's'}';
    } else if (totalSeconds < 86400) {
      final hours = totalSeconds ~/ 3600;
      return '$hours hour${hours == 1 ? '' : 's'}';
    } else if (totalSeconds < 604800) {
      final days = totalSeconds ~/ 86400;
      return '$days day${days == 1 ? '' : 's'}';
    } else if (totalSeconds < 2592000) {
      final weeks = totalSeconds ~/ 604800;
      return '$weeks week${weeks == 1 ? '' : 's'}';
    } else if (totalSeconds < 31536000) {
      final months = totalSeconds ~/ 2592000;
      return '$months month${months == 1 ? '' : 's'}';
    } else {
      final years = totalSeconds ~/ 31536000;
      return '$years year${years == 1 ? '' : 's'}';
    }
  }

  /// Get reminder notification body
  String _getReminderNotificationBody(
    ActivityModel activity,
    int reminderSeconds,
  ) {
    // Format reminder time text, e.g., "30 seconds", "10 minutes", "1 hour", "2 days", "1 week" , "1 month", "1 year"
    final timeText = _formatDuration(reminderSeconds);

    return 'Starting in $timeText. Get ready! ⏰';
  }

  /// Public method to refresh notifications when activities change
  Future<void> refreshNotifications() async {
    await _scheduleAllNotifications();
    await notificationsRepository.replaceNotificationHistory(notifications);
  }

  /// Handle activity added
  Future<void> onActivityAdded(ActivityModel activity) async {
    await refreshNotifications();
  }

  /// Handle activity updated
  Future<void> onActivityUpdated(ActivityModel activity) async {
    await refreshNotifications();
  }

  /// Handle activity deleted
  Future<void> onActivityDeleted(String activityId) async {
    // Cancel notifications for this activity
    final notificationsToCancel =
        notifications
            .where(
              (n) =>
                  n.title.contains(activityId) || n.body.contains(activityId),
            )
            .toList();

    for (final notification in notificationsToCancel) {
      await cancelNotification(notification.id);
    }

    await refreshNotifications();
  }

  /// Cancel specific notification
  Future<void> cancelNotification(int id) async {
    await notificationsRepository.cancelNotification(id);
    notifications.removeWhere((noti) => noti.id == id);
    await notificationsRepository.replaceNotificationHistory(notifications);
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await notificationsRepository.cancelAllNotifications();
    notifications.clear();
  }

  /// Add custom notification
  Future<void> addNotification(NotificationsModel notification) async {
    await notificationsRepository.scheduleLocalNotification(notification);
    notifications.add(notification);
    await notificationsRepository.replaceNotificationHistory(notifications);
  }

  /// Update existing notification
  Future<void> updateNotification(NotificationsModel notification) async {
    await notificationsRepository.updateScheduledNotification(notification);
    notifications.removeWhere((noti) => noti.id == notification.id);
    notifications.add(notification);
    await notificationsRepository.replaceNotificationHistory(notifications);
  }

  /// Show test notification
  Future<void> showDummyNotification() async {
    await notificationsRepository.showLocalNotification();
  }
}
