// import 'package:flutter/material.dart';
// import '../../../../l10n/app_localizations.dart';
// import '../../controllers/notifications_controller.dart';
// import '../../../../common/widgets/appbar/appbar.dart';

// import '../../../../utils/constants/sizes.dart';
// import 'widgets/notification_widget.dart';

// class NotificationsScreen extends StatelessWidget {
//   const NotificationsScreen({super.key});

//   @override
//   Widget build(BuildContext context) {
//     final controller = NotificationsController.instance;
//     return Scaffold(
//       body: SingleChildScrollView(
//         child: Padding(
//           padding: const EdgeInsets.all(AppSizes.md),
//           child: Column(
//             children: [
//               const SizedBox(height: AppSizes.spaceBtnSections),
//               PetCareAppbar(title: AppLocalizations.of(context)!.notifications),
//               const SizedBox(height: AppSizes.spaceBtnSections),
//               controller.notifications.isEmpty
//                   ? SizedBox(
//                     height: MediaQuery.of(context).size.height * 0.7,
//                     child: Center(
//                       child: Text(
//                         AppLocalizations.of(context)!.noNotificationsYet,
//                         style: TextStyle(
//                           fontSize: 16,
//                           fontWeight: FontWeight.w400,
//                           color: Colors.black.withOpacity(0.6),
//                         ),
//                       ),
//                     ),
//                   )
//                   : ListView.separated(
//                     physics: const NeverScrollableScrollPhysics(),
//                     itemBuilder:
//                         (context, index) => NotificationWidget(
//                           notification: controller.notifications[index],
//                         ),
//                     separatorBuilder:
//                         (context, index) =>
//                             const SizedBox(height: AppSizes.spaceBtnItems),
//                     itemCount: controller.notifications.length,
//                     shrinkWrap: true,
//                   ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }
