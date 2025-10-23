import 'package:flutter/material.dart';

import '../../utils/constants/enums.dart';
import '../../utils/helpers/notifications_helper.dart';

class NotificationsModel {
  final int id;
  final String title;
  final String body;
  final String image;
  final DateTime date;
  final int hour;
  final int minute;
  final String? activityId;
  final NotificationType type;
  final bool isRepeating;
  final String? payload;
  final DateTime createdAt;

  NotificationsModel({
    required this.id,
    required this.title,
    required this.body,
    this.image = '',
    required this.date,
    required this.hour,
    required this.minute,
    this.activityId,
    this.type = NotificationType.taskReminder,
    this.isRepeating = false,
    this.payload,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  /// Get the scheduled DateTime for this notification
  DateTime get scheduledDateTime =>
      DateTime(date.year, date.month, date.day, hour, minute);

  /// Check if this notification is scheduled for the future
  bool get isFuture => scheduledDateTime.isAfter(DateTime.now());

  /// Check if this notification is for today
  bool get isToday {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  /// Get time as TimeOfDay
  TimeOfDay get timeOfDay => TimeOfDay(hour: hour, minute: minute);

  /// Create from JSON
  factory NotificationsModel.fromJson(Map<String, dynamic> json) {
    return NotificationsModel(
      id: json['id'] as int,
      title: json['title'] as String,
      body: json['body'] as String,
      image: json['image'] as String? ?? '',
      date: DateTime.parse(json['date'] as String),
      hour: json['hour'] as int,
      minute: json['minute'] as int,
      activityId: json['activityId'] as String?,
      type: NotificationType.values.firstWhere(
        (e) => e.toString() == json['type'],
        orElse: () => NotificationType.taskReminder,
      ),
      isRepeating: json['isRepeating'] as bool? ?? false,
      payload: json['payload'] as String?,
      createdAt:
          json['createdAt'] != null
              ? DateTime.parse(json['createdAt'] as String)
              : DateTime.now(),
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'image': image,
      'date': date.toIso8601String(),
      'hour': hour,
      'minute': minute,
      'activityId': activityId,
      'type': type.toString(),
      'isRepeating': isRepeating,
      'payload': payload,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  /// Create a copy with modified values
  NotificationsModel copyWith({
    int? id,
    String? title,
    String? body,
    String? image,
    DateTime? date,
    int? hour,
    int? minute,
    String? activityId,
    NotificationType? type,
    bool? isRepeating,
    String? payload,
    DateTime? createdAt,
  }) {
    return NotificationsModel(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      image: image ?? this.image,
      date: date ?? this.date,
      hour: hour ?? this.hour,
      minute: minute ?? this.minute,
      activityId: activityId ?? this.activityId,
      type: type ?? this.type,
      isRepeating: isRepeating ?? this.isRepeating,
      payload: payload ?? this.payload,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  /// Factory constructor for daily summary notification
  factory NotificationsModel.dailySummary({
    required DateTime date,
    required int tasksCount,
    TimeOfDay time = const TimeOfDay(hour: 8, minute: 0),
  }) {
    final content = NotificationHelper.getNotificationContent(
      type: NotificationType.dailySummary,
      activityName: '',
      tasksCount: tasksCount,
    );

    return NotificationsModel(
      id: NotificationHelper.generateNotificationId(
        'daily_summary',
        date,
        NotificationType.dailySummary,
      ),
      title: content.title,
      body: content.body,
      date: date,
      hour: time.hour,
      minute: time.minute,
      type: NotificationType.dailySummary,
      isRepeating: true,
      payload: 'daily_summary',
    );
  }

  /// Factory constructor for task reminder notification
  factory NotificationsModel.taskReminder({
    required String activityId,
    required String activityName,
    required DateTime date,
    required TimeOfDay time,
  }) {
    final content = NotificationHelper.getNotificationContent(
      type: NotificationType.taskReminder,
      activityName: activityName,
    );

    return NotificationsModel(
      id: NotificationHelper.generateNotificationId(
        activityId,
        date,
        NotificationType.taskReminder,
        time: time,
      ),
      title: content.title,
      body: content.body,
      date: date,
      hour: time.hour,
      minute: time.minute,
      activityId: activityId,
      type: NotificationType.taskReminder,
      payload: 'task_reminder:$activityId',
    );
  }

  /// Factory constructor for advance reminder notification
  factory NotificationsModel.advanceReminder({
    required String activityId,
    required String activityName,
    required DateTime date,
    required TimeOfDay time,
    required int reminderMinutes,
  }) {
    final content = NotificationHelper.getNotificationContent(
      type: NotificationType.advanceReminder,
      activityName: activityName,
      reminderMinutes: reminderMinutes,
    );

    final reminderDateTime = NotificationHelper.calculateReminderTime(
      date,
      time,
      reminderMinutes,
    );

    return NotificationsModel(
      id: NotificationHelper.generateNotificationId(
        activityId,
        date,
        NotificationType.advanceReminder,
        time: time,
      ),
      title: content.title,
      body: content.body,
      date: reminderDateTime,
      hour: reminderDateTime.hour,
      minute: reminderDateTime.minute,
      activityId: activityId,
      type: NotificationType.advanceReminder,
      payload: 'advance_reminder:$activityId',
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NotificationsModel &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'NotificationsModel(id: $id, title: $title, date: $date, type: $type)';
  }
}
