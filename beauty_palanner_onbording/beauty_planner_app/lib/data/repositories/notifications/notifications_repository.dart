import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz;
import 'package:flutter_timezone/flutter_timezone.dart';

import '../../../utils/local_storage/storage_utility.dart';
import '../../models/notifications_model.dart';

enum RepeatInterval { daily, weekly, monthly }

class NotificationsRepository extends GetxController {
  static NotificationsRepository get instance => Get.find();

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  /// Storage key for notification history
  static const String _notificationHistoryKey = 'sent_notifications_history';

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  /// Helper to save notification to history
  Future<void> saveToNotificationHistory(
    NotificationsModel notification,
  ) async {
    try {
      final storage = LocalStorage.instance();
      final notificationMap = notification.toJson();

      final existingList =
          storage.readData<List<dynamic>>(_notificationHistoryKey) ?? [];
      final history = List<Map<String, dynamic>>.from(
        existingList.map((item) => item as Map<String, dynamic>),
      );

      history.add(notificationMap);
      await storage.writeData(_notificationHistoryKey, history);
    } catch (e) {
      print('Error saving notification to history: $e');
    }
  }

  /// Replace existing notification history with new one
  Future<void> replaceNotificationHistory(
    List<NotificationsModel> notifications,
  ) async {
    try {
      final storage = LocalStorage.instance();
      final notificationMapList = notifications.map((e) => e.toJson()).toList();

      await storage.writeData(_notificationHistoryKey, notificationMapList);
    } catch (e) {
      print('Error replacing notification history: $e');
    }
  }

  /// Retrieves the list of sent notifications from storage
  /// Sorted by sentTimestamp in descending order (newest first)
  Future<List<NotificationsModel>> getNotificationHistory() async {
    try {
      final storage = LocalStorage.instance();
      final historyData = storage.readData<List<dynamic>>(
        _notificationHistoryKey,
      );

      if (historyData == null) return [];

      // Convert stored maps to NotificationsModel objects
      final history =
          historyData
              .map(
                (item) =>
                    NotificationsModel.fromJson(item as Map<String, dynamic>),
              )
              .toList();

      // Sort by sentTimestamp (newest first)
      history.sort((a, b) {
        final aTime = DateTime.parse(a.toJson()['date']);
        final bTime = DateTime.parse(b.toJson()['date']);
        return bTime.compareTo(aTime);
      });

      return history;
    } catch (e) {
      print('Error retrieving notification history: $e');
      return [];
    }
  }

  /// Request notification permissions
  Future<void> requestPermission() async {
    // Request iOS permissions first
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin
        >()
        ?.requestPermissions(alert: true, badge: true, sound: true);

    // Then request Android permissions (for Android 13+)
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.requestNotificationsPermission();
  }

  /// Initialize the local notifications plugin.
  Future<void> initNotification() async {
    if (_isInitialized) return;

    /// Initialize timezone handling
    tz.initializeTimeZones();
    final String localTimezone = await FlutterTimezone.getLocalTimezone();
    tz.setLocalLocation(tz.getLocation(localTimezone));

    // Request permissions first
    await requestPermission();

    // Android initialization
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('ic_launcher_foreground');

    // iOS initialization
    final DarwinInitializationSettings initializationSettingsIOS =
        const DarwinInitializationSettings(
          requestAlertPermission: false,
          requestBadgePermission: false,
          requestSoundPermission: false,
        );

    // Combine platform initializations
    final InitializationSettings initializationSettings =
        InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsIOS,
        );

    // Initialize the plugin
    await flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (details) async {
        await _handleNotificationTap(details.payload);
      },
    );

    _isInitialized = true;
  }

  /// Handle notification tap
  Future<void> _handleNotificationTap(String? payload) async {
    if (payload == null) return;

    try {
      // Parse payload and handle navigation
      switch (payload) {
        case 'daily_summary':
          // Navigate to main screen or show today's tasks
          break;
        case 'task_reminder':
          // Navigate to task list or specific task
          break;
        default:
          // Handle activity-specific payloads
          break;
      }
    } catch (e) {
      print('Error handling notification tap: $e');
    }
  }

  /// Show immediate notification for testing
  Future<void> showLocalNotification() async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'beauty_mirror_channel',
          'Beauty Mirror Notifications',
          channelDescription: 'Notifications for Beauty Mirror app',
          importance: Importance.high,
          priority: Priority.high,
          ticker: 'ticker',
          icon: 'ic_launcher_foreground',
        );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await flutterLocalNotificationsPlugin.show(
      0,
      '🎯 Testing',
      'Notification system is working perfectly!',
      platformChannelSpecifics,
      payload: 'test',
    );
  }

  /// Schedule a one-time notification
  Future<void> scheduleLocalNotification(
    NotificationsModel notification,
  ) async {
    final scheduledDate = tz.TZDateTime(
      tz.local,
      notification.date.year,
      notification.date.month,
      notification.date.day,
      notification.hour,
      notification.minute,
    );

    // Don't schedule past notifications
    if (scheduledDate.isBefore(tz.TZDateTime.now(tz.local))) {
      return;
    }

    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'beauty_mirror_channel',
          'Beauty Mirror Notifications',
          channelDescription: 'Notifications for Beauty Mirror app',
          importance: Importance.high,
          priority: Priority.high,
          icon: 'ic_launcher_foreground',
          enableVibration: true,
          playSound: true,
        );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    await flutterLocalNotificationsPlugin.zonedSchedule(
      notification.id,
      notification.title,
      notification.body,
      scheduledDate,
      platformChannelSpecifics,
      payload: _generatePayload(notification),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      // uiLocalNotificationDateInterpretation:
      //     UILocalNotificationDateInterpretation.absoluteTime,
    );
  }

  /// Schedule a repeating notification
  Future<void> scheduleRepeatingNotification(
    NotificationsModel notification,
    RepeatInterval interval,
  ) async {
    final scheduledDate = tz.TZDateTime(
      tz.local,
      notification.date.year,
      notification.date.month,
      notification.date.day,
      notification.hour,
      notification.minute,
    );

    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'beauty_mirror_daily_channel',
          'Daily Beauty Mirror Reminders',
          channelDescription: 'Daily summary and recurring notifications',
          importance: Importance.high,
          priority: Priority.high,
          icon: 'ic_launcher_foreground',
          enableVibration: true,
          playSound: true,
        );

    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    DateTimeComponents? matchDateTimeComponents;

    switch (interval) {
      case RepeatInterval.daily:
        matchDateTimeComponents = DateTimeComponents.time;
        break;
      case RepeatInterval.weekly:
        matchDateTimeComponents = DateTimeComponents.dayOfWeekAndTime;
        break;
      case RepeatInterval.monthly:
        matchDateTimeComponents = DateTimeComponents.dayOfMonthAndTime;
        break;
    }

    await flutterLocalNotificationsPlugin.zonedSchedule(
      notification.id,
      notification.title,
      notification.body,
      scheduledDate,
      platformChannelSpecifics,
      payload: _generatePayload(notification),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      // uiLocalNotificationDateInterpretation:
      //     UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: matchDateTimeComponents,
    );
  }

  /// Generate payload for notification
  String _generatePayload(NotificationsModel notification) {
    if (notification.id == 1000) {
      // Daily summary notification
      return 'daily_summary';
    } else if (notification.id >= 2000 && notification.id < 3000) {
      return 'task_notification';
    } else if (notification.id >= 3000) {
      return 'task_reminder';
    }
    return 'general';
  }

  /// Update an existing scheduled notification
  Future<void> updateScheduledNotification(
    NotificationsModel notification,
  ) async {
    await cancelNotification(notification.id);
    await scheduleLocalNotification(notification);
  }

  /// Cancel a specific notification
  Future<void> cancelNotification(int id) async {
    await flutterLocalNotificationsPlugin.cancel(id);
  }

  /// Cancel all notifications
  Future<void> cancelAllNotifications() async {
    await flutterLocalNotificationsPlugin.cancelAll();
  }

  /// Get pending notifications (for debugging)
  Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await flutterLocalNotificationsPlugin.pendingNotificationRequests();
  }

  /// Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    if (GetPlatform.isAndroid) {
      final androidImplementation =
          flutterLocalNotificationsPlugin
              .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin
              >();
      return await androidImplementation?.areNotificationsEnabled() ?? false;
    }
    return true; // iOS handles this through system settings
  }
}
