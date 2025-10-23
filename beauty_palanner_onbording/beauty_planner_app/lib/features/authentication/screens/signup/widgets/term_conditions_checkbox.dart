// import 'package:flutter/gestures.dart';
// import 'package:flutter/material.dart';
// import 'package:get/get.dart';

// import '../../../../../utils/constants/colors.dart';
// import '../../../../../utils/constants/sizes.dart';
// import '../../../../../utils/helpers/helper_functions.dart';
// import '../../../controllers/signup/signup_controller.dart';
// import 'privacy_policy_screen.dart';
// import 'term_conditions_screen.dart';
// import 'package:flutter_gen/gen_l10n/app_localizations.dart';

// class TermsAndConditionsCheckBox extends StatelessWidget {
//   const TermsAndConditionsCheckBox({
//     super.key,
//   });

//   @override
//   Widget build(BuildContext context) {
//     final controller = SignupController.instance;
//     final dark = MyHelperFunctions.isDarkMode(context);
//     return SingleChildScrollView(
//       scrollDirection: Axis.horizontal,
//       child: Row(
//         children: [
//           SizedBox(
//             width: 24,
//             height: 24,
//             child: Obx(
//               () => Checkbox(
//                 value: controller.privacyPolicy.value,
//                 onChanged: (value) => controller.privacyPolicy.value =
//                     !controller.privacyPolicy.value,
//               ),
//             ),
//           ),
//           const SizedBox(
//             width: AppSizes.spaceBtnItems,
//           ),
//           Text.rich(
//               overflow: TextOverflow.ellipsis,
//               TextSpan(
//                 children: [
//                   TextSpan(
//                       text: AppLocalizations.of(context)!.iAgreeTo,
//                       style: Theme.of(context).textTheme.bodyLarge),
//                   TextSpan(
//                       recognizer: TapGestureRecognizer()
//                         ..onTap = () =>
//                             Get.to(() => const TermsAndConditionsScreen()),
//                       text: AppLocalizations.of(context)!.termsOfUse,
//                       style: Theme.of(context).textTheme.bodyLarge!.apply(
//                           decoration: TextDecoration.underline,
//                           decorationColor: AppColors.primary,
//                           color: dark ? AppColors.white : AppColors.primary)),
//                   TextSpan(
//                       text: AppLocalizations.of(context)!.and,
//                       style: Theme.of(context).textTheme.bodyLarge),
//                   TextSpan(
//                       text: AppLocalizations.of(context)!.privacyPolicy,
//                       recognizer: TapGestureRecognizer()
//                         ..onTap =
//                             () => Get.to(() => const PrivacyPolicyScreen()),
//                       style: Theme.of(context).textTheme.bodyLarge!.apply(
//                           decoration: TextDecoration.underline,
//                           decorationColor: AppColors.primary,
//                           color: dark ? AppColors.white : AppColors.primary)),
//                 ],
//               ))
//         ],
//       ),
//     );
//   }
// }
