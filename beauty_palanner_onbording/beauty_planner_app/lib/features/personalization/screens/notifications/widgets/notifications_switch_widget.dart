// import 'package:flutter/material.dart';
// import 'package:get/get.dart';

// import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
// import '../../../../../l10n/app_localizations.dart';
// import '../../../../../utils/constants/colors.dart';
// import '../../../../../utils/constants/sizes.dart';
// import '../../../../authentication/screens/onboarding/quiz/switch_notifications.dart';
// import '../../../controllers/user_controller.dart';

// class NotificationsSwitchWidget extends StatelessWidget {
//   const NotificationsSwitchWidget({super.key});

//   @override
//   Widget build(BuildContext context) {
//     final controller = UserController.instance;
//     return RoundedContainer(
//       backgroundColor: AppColors.textfieldFill,
//       child: Padding(
//         padding: const EdgeInsets.all(AppSizes.md),
//         child: Obx(() {
//           return Column(
//             children: [
//               NotificationSwitch(
//                 title: AppLocalizations.of(context)!
//                     .dailyReminderToLogYourPetSMood,
//                 value: controller.user.value.dailyNotification,
//                 onChanged: () {
//                   controller.user.value.dailyNotification =
//                       !controller.user.value.dailyNotification;
//                   controller.user.refresh();
//                   // controller.updateUserNotificationSettings();
//                 },
//               ),
//               SizedBox(height: AppSizes.spaceBtnItems),
//               NotificationSwitch(
//                 title: AppLocalizations.of(context)!
//                     .monthlyReminderToMeasureYourPetSWeight,
//                 value: controller.user.value.monthlyReminder,
//                 onChanged: () {
//                   controller.user.value.monthlyReminder =
//                       !controller.user.value.monthlyReminder;
//                   controller.user.refresh();
//                   //controller.updateUserNotificationSettings();
//                 },
//               ),
//               SizedBox(height: AppSizes.spaceBtnItems),
//               NotificationSwitch(
//                 title: AppLocalizations.of(context)!
//                     .annualReminderForYourPetSBirthday,
//                 value: controller.user.value.birthdayReminder,
//                 onChanged: () {
//                   controller.user.value.birthdayReminder =
//                       !controller.user.value.birthdayReminder;
//                   controller.user.refresh();
//                   //controller.updateUserNotificationSettings();
//                 },
//               ),
//             ],
//           );
//         }),
//       ),
//     );
//   }
// }
