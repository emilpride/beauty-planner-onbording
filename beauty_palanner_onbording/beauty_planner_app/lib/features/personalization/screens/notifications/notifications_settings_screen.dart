// import 'package:flutter/material.dart';
// import 'package:get/get.dart';
// import '../../../../common/widgets/appbar/appbar.dart';
// import '../../../../l10n/app_localizations.dart';
// import '../../controllers/user_controller.dart';
// import '../../../../utils/constants/sizes.dart';
// import 'widgets/notifications_switch_widget.dart';

// class NotificationsSettingsScreen extends StatelessWidget {
//   const NotificationsSettingsScreen({super.key});

//   @override
//   Widget build(BuildContext context) {
//     final controller = UserController.instance;
//     return Scaffold(
//       body: SingleChildScrollView(
//         child: Padding(
//           padding: const EdgeInsets.all(AppSizes.md),
//           child: Column(
//             children: [
//               const SizedBox(height: AppSizes.spaceBtnSections),
//               PetCareAppbar(
//                   title: AppLocalizations.of(context)!.notifications,
//                   onBackPressed: () {
//                     Get.back();
//                     controller.dailyNotification.value =
//                         controller.user.value.dailyNotification;
//                     controller.monthlyReminder.value =
//                         controller.user.value.monthlyReminder;
//                     controller.birthdayReminder.value =
//                         controller.user.value.birthdayReminder;
//                     controller.x.value++;
//                   }),
//               const SizedBox(height: AppSizes.spaceBtnSections * 2),
//               const NotificationsSwitchWidget(),
//               const SizedBox(height: AppSizes.spaceBtnSections),
//               SizedBox(
//                 width: double.infinity,
//                 child: ElevatedButton(
//                     onPressed: () =>
//                         controller.updateUserNotificationSettings(),
//                     child: Text(
//                       AppLocalizations.of(context)!.saveChanges,
//                       style: const TextStyle(
//                           fontSize: 18, fontWeight: FontWeight.w400),
//                     )),
//               )
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
