// import 'package:flutter/material.dart';
// import 'package:flutter_svg/svg.dart';
// import 'package:get/get.dart';

// import '../../../../../utils/constants/image_strings.dart';
// import '../../../../../utils/constants/sizes.dart';
// import '../../../../../utils/validators/validation.dart';
// import '../../../../personalization/controllers/user_controller.dart';
// import '../../../controllers/login/login_controller.dart';
// import 'package:flutter_gen/gen_l10n/app_localizations.dart';

// class ReauthForm extends StatelessWidget {
//   const ReauthForm({
//     super.key,
//   });

//   @override
//   Widget build(BuildContext context) {
//     final controller = Get.put(LoginController());
//     final userController = UserController.instance;
//     return Form(
//         key: controller.LoginFormKey,
//         child: Column(
//           children: [
//             //email field
//             TextFormField(
//               readOnly: true,
//               controller: userController.userEmail,
//               validator: (value) => MyValidator.validateEmail(value),
//               decoration: InputDecoration(
//                 labelText: AppLocalizations.of(context)!.email,
//               ),
//             ),
//             const SizedBox(
//               height: AppSizes.spaceBtnInputFields,
//             ),
//             //password field
//             Obx(
//               () => TextFormField(
//                 controller: controller.password,
//                 validator: (value) =>
//                     MyValidator.validateEmptyText('Password', value),
//                 obscureText: controller.hidePassword.value,
//                 decoration: InputDecoration(
//                     labelText: AppLocalizations.of(context)!.password,
//                     suffixIcon: SizedBox(
//                       child: GestureDetector(
//                         onTap: () => controller.hidePassword.value =
//                             !controller.hidePassword.value,
//                         child: Padding(
//                           padding: const EdgeInsets.only(
//                               top: 12.0, bottom: 10, left: 10, right: 10),
//                           child: SvgPicture.asset(
//                               height: 2,
//                               width: 2,
//                               controller.hidePassword.value
//                                   ? AppImages.eye
//                                   : AppImages.eyeClosed),
//                         ),
//                       ),
//                     )),
//               ),
//             ),

//             const SizedBox(
//               height: AppSizes.spaceBtnItems,
//             ),

//             //Sign In
//             SizedBox(
//               width: double.infinity,
//               child: ElevatedButton(
//                 onPressed: () => controller.emailAndPasswordSignIn(),
//                 child: Text(AppLocalizations.of(context)!.signIn),
//               ),
//             ),
//             const SizedBox(
//               height: AppSizes.xs,
//             ),
//           ],
//         ));
//   }
// }
