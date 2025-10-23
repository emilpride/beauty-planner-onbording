// import 'dart:developer';

// import 'package:get/get.dart';
// import 'package:workmanager/workmanager.dart';

// import '../../repositories/notifications/notifications_repository.dart';

// class WorkManagerService {
//   Future<void> initWorkManager() async {
//     try {
//       // Initialize Workmanager with the top-level callback.
//       await Workmanager().initialize(
//         actionTask,
//         isInDebugMode: true,
//       );
//       // Register the periodic task after initialization.
//       await registerMyTask();
//     } catch (e) {
//       log('Error initializing Workmanager: $e');
//     }
//   }

//   Future<void> registerMyTask() async {
//     try {
//       // Register a periodic task.
//       // Note: Android minimum period for periodic tasks is 15 minutes.
//       // For weekly notifications, you may need an alternative approach (e.g., one-off task that re-schedules itself).
//       await Workmanager().registerPeriodicTask(
//         'id1',
//         'show simple notification',
//         frequency: const Duration(minutes: 7),
//       );
//     } catch (e) {
//       log('Error registering task: $e');
//     }
//   }

//   void cancelTask() {
//     try {
//       Workmanager().cancelAll();
//     } catch (e) {
//       log('Error cancelling tasks: $e');
//     }
//   }
// }

// @pragma('vm:entry-point')
// void actionTask() async {
//   //show notification
//   Workmanager().executeTask((taskName, inputData) async {
//     log("Native called background task: $taskName");
//     final n = Get.put(NotificationsRepository());
//     await n.initNotification();
//     // await n.updateAllNotifications();
//     await n.showLocalNotification();
//     return Future.value(true);
//   });
// }
