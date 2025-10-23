import 'package:flutter/material.dart';

import '../constants/enums.dart';

class NotificationHelper {
  /// Parse "notify before" string and return duration in minutes
  static int parseNotifyBeforeToMinutes(String notifyBefore) {
    if (notifyBefore.isEmpty) return 0;

    // Handle different formats like "15 minutes", "1 hour", "2 days"
    final normalizedString = notifyBefore.toLowerCase().trim();
    final parts = normalizedString.split(' ');

    if (parts.length < 2) return 0;

    final number = int.tryParse(parts[0]) ?? 0;
    final unit = parts[1];

    switch (unit) {
      case 'minute':
      case 'minutes':
      case 'min':
      case 'mins':
        return number;
      case 'hour':
      case 'hours':
      case 'hr':
      case 'hrs':
        return number * 60;
      case 'day':
      case 'days':
        return number * 24 * 60;
      case 'week':
      case 'weeks':
        return number * 7 * 24 * 60;
      default:
        return 0;
    }
  }

  /// Format minutes back to readable string
  static String formatMinutesToReadable(int minutes) {
    if (minutes < 60) {
      return '$minutes minute${minutes == 1 ? '' : 's'}';
    } else if (minutes < 1440) {
      // Less than 24 hours
      final hours = minutes ~/ 60;
      final remainingMinutes = minutes % 60;
      if (remainingMinutes == 0) {
        return '$hours hour${hours == 1 ? '' : 's'}';
      } else {
        return '$hours hour${hours == 1 ? '' : 's'} $remainingMinutes minute${remainingMinutes == 1 ? '' : 's'}';
      }
    } else {
      final days = minutes ~/ 1440;
      final remainingHours = (minutes % 1440) ~/ 60;
      if (remainingHours == 0) {
        return '$days day${days == 1 ? '' : 's'}';
      } else {
        return '$days day${days == 1 ? '' : 's'} $remainingHours hour${remainingHours == 1 ? '' : 's'}';
      }
    }
  }

  /// Calculate reminder time based on task time and notify before duration
  static DateTime calculateReminderTime(
    DateTime taskDate,
    TimeOfDay taskTime,
    int notifyBeforeMinutes,
  ) {
    final taskDateTime = DateTime(
      taskDate.year,
      taskDate.month,
      taskDate.day,
      taskTime.hour,
      taskTime.minute,
    );

    return taskDateTime.subtract(Duration(minutes: notifyBeforeMinutes));
  }

  /// Check if a notification time is in the future
  static bool isNotificationTimeValid(DateTime notificationTime) {
    return notificationTime.isAfter(DateTime.now());
  }

  /// Generate unique notification ID based on activity and type
  static int generateNotificationId(
    String activityId,
    DateTime date,
    NotificationType type, {
    TimeOfDay? time,
  }) {
    // Use different base IDs for different types
    int baseId;
    switch (type) {
      case NotificationType.dailySummary:
        baseId = 1000;
        break;
      case NotificationType.taskReminder:
        baseId = 2000;
        break;
      case NotificationType.advanceReminder:
        baseId = 3000;
        break;
    }

    // Create a unique hash combining activity, date, and optionally time
    final dateString =
        '${date.year}${date.month.toString().padLeft(2, '0')}${date.day.toString().padLeft(2, '0')}';
    final timeString =
        time != null
            ? '${time.hour.toString().padLeft(2, '0')}${time.minute.toString().padLeft(2, '0')}'
            : '';

    final combinedString = '$activityId$dateString$timeString';
    final hash = combinedString.hashCode.abs() % 100000;

    return baseId + hash;
  }

  /// Get notification channel info based on type
  static NotificationChannelInfo getChannelInfo(NotificationType type) {
    switch (type) {
      case NotificationType.dailySummary:
        return NotificationChannelInfo(
          id: 'daily_summary_channel',
          name: 'Daily Summary',
          description: 'Daily task summary notifications',
        );
      case NotificationType.taskReminder:
        return NotificationChannelInfo(
          id: 'task_reminder_channel',
          name: 'Task Reminders',
          description: 'Notifications when it\'s time for a task',
        );
      case NotificationType.advanceReminder:
        return NotificationChannelInfo(
          id: 'advance_reminder_channel',
          name: 'Advance Reminders',
          description: 'Advance notifications before tasks',
        );
    }
  }

  /// Get appropriate notification content based on type and context
  static NotificationContent getNotificationContent({
    required NotificationType type,
    required String activityName,
    int? tasksCount,
    int? reminderMinutes,
  }) {
    switch (type) {
      case NotificationType.dailySummary:
        return _getDailySummaryContent(tasksCount ?? 0);
      case NotificationType.taskReminder:
        return _getTaskReminderContent(activityName);
      case NotificationType.advanceReminder:
        return _getAdvanceReminderContent(activityName, reminderMinutes ?? 0);
    }
  }

  static NotificationContent _getDailySummaryContent(int tasksCount) {
    if (tasksCount == 0) {
      return NotificationContent(
        title: 'Good morning! 🌅',
        body: 'You have a free day today! Enjoy your time. 🌟',
      );
    } else if (tasksCount == 1) {
      return NotificationContent(
        title: 'Good morning! 🌅',
        body: 'You have 1 task scheduled for today. Let\'s make it count! 💪',
      );
    } else {
      return NotificationContent(
        title: 'Good morning! 🌅',
        body:
            'You have $tasksCount tasks scheduled for today. You\'ve got this! 🚀',
      );
    }
  }

  static NotificationContent _getTaskReminderContent(String activityName) {
    final encouragements = [
      'Time to build your habit! 💪',
      'Let\'s do this! 🔥',
      'Your future self will thank you! ⭐',
      'Small steps, big results! 🎯',
      'You\'re building something amazing! 🌟',
      'Consistency is key! 🗝️',
      'Make today count! 📈',
      'Progress over perfection! 🎪',
    ];

    final randomEncouragement =
        encouragements[DateTime.now().millisecond % encouragements.length];

    return NotificationContent(
      title: '⏰ $activityName Time!',
      body: randomEncouragement,
    );
  }

  static NotificationContent _getAdvanceReminderContent(
    String activityName,
    int reminderMinutes,
  ) {
    final timeText = formatMinutesToReadable(reminderMinutes);

    return NotificationContent(
      title: '🔔 Upcoming: $activityName',
      body: 'Starting in $timeText. Get ready! ⏰',
    );
  }

  /// Convert TimeOfDay to minutes since midnight
  static int timeOfDayToMinutes(TimeOfDay time) {
    return time.hour * 60 + time.minute;
  }

  /// Convert minutes since midnight to TimeOfDay
  static TimeOfDay minutesToTimeOfDay(int minutes) {
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    return TimeOfDay(hour: hours % 24, minute: mins);
  }

  /// Check if current time is within notification quiet hours
  static bool isWithinQuietHours({
    TimeOfDay quietStart = const TimeOfDay(hour: 22, minute: 0),
    TimeOfDay quietEnd = const TimeOfDay(hour: 7, minute: 0),
  }) {
    final now = TimeOfDay.now();
    final nowMinutes = timeOfDayToMinutes(now);
    final startMinutes = timeOfDayToMinutes(quietStart);
    final endMinutes = timeOfDayToMinutes(quietEnd);

    if (startMinutes > endMinutes) {
      // Quiet hours span midnight (e.g., 22:00 to 07:00)
      return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    } else {
      // Quiet hours within same day (e.g., 13:00 to 14:00)
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }
  }

  /// Adjust notification time to avoid quiet hours
  static DateTime adjustForQuietHours(
    DateTime originalTime, {
    TimeOfDay quietStart = const TimeOfDay(hour: 22, minute: 0),
    TimeOfDay quietEnd = const TimeOfDay(hour: 7, minute: 0),
  }) {
    final originalTimeOfDay = TimeOfDay(
      hour: originalTime.hour,
      minute: originalTime.minute,
    );

    if (!isWithinQuietHours(quietStart: quietStart, quietEnd: quietEnd)) {
      return originalTime; // No adjustment needed
    }

    // Move to end of quiet hours
    return DateTime(
      originalTime.year,
      originalTime.month,
      originalTime.day,
      quietEnd.hour,
      quietEnd.minute,
    );
  }
}

class NotificationChannelInfo {
  final String id;
  final String name;
  final String description;

  NotificationChannelInfo({
    required this.id,
    required this.name,
    required this.description,
  });
}

class NotificationContent {
  final String title;
  final String body;

  NotificationContent({required this.title, required this.body});
}
