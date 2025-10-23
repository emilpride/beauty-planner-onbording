// import 'package:country_flags/country_flags.dart';
// import 'package:flutter/material.dart';
// import 'package:get/get.dart';
// import '../../../../l10n/app_localizations.dart';
// import '../../../app/controllers/home_controller.dart';
// import '../../../../common/widgets/appbar/appbar.dart';
// import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
// import '../../controllers/user_controller.dart';
// import '../../../../utils/constants/colors.dart';
// import '../../../../utils/constants/sizes.dart';

// class ChangeLanguage extends StatelessWidget {
//   const ChangeLanguage({super.key});

//   @override
//   Widget build(BuildContext context) {
//     final controller = UserController.instance;
//     return Scaffold(
//       body: SingleChildScrollView(
//         child: Padding(
//           padding: const EdgeInsets.all(20),
//           child: Obx(() {
//             Text(controller.selectedLanguageCode.value);
//             return Column(
//               children: [
//                 const SizedBox(height: AppSizes.spaceBtnSections),
//                 PetCareAppbar(
//                   title: AppLocalizations.of(context)!.changeLanguage,
//                   onBackPressed: () {
//                     Get.back();
//                     controller.selectedLanguageCode.value =
//                         controller.user.value.languageCode;
//                   },
//                 ),
//                 const SizedBox(height: AppSizes.spaceBtnSections),
//                 const SelectLanguage(
//                     language: 'English', countryCode: 'gb', languageCode: 'en'),
//                 const SizedBox(height: AppSizes.spaceBtnItems),
//                 const SelectLanguage(
//                     language: 'Español', countryCode: 'es', languageCode: 'es'),
//                 const SizedBox(height: AppSizes.spaceBtnItems),
//                 const SelectLanguage(
//                     language: 'Português',
//                     countryCode: 'pt',
//                     languageCode: 'pt'),
//                 const SizedBox(height: AppSizes.spaceBtnItems),
//                 const SelectLanguage(
//                     language: 'Korean', countryCode: 'kr', languageCode: 'ko'),
//                 const SizedBox(height: AppSizes.spaceBtnSections),
//                 const SelectLanguage(
//                     language: 'Ukrainian',
//                     countryCode: 'ua',
//                     languageCode: 'uk'),
//                 const SizedBox(height: AppSizes.spaceBtnSections),
//                 // SelectLanguage(
//                 //     language: 'Bangla', countryCode: 'bd', languageCode: 'bn'),
//                 // SizedBox(height: AppSizes.spaceBtnSections),
//                 SizedBox(
//                   width: double.infinity,
//                   child: ElevatedButton(
//                     onPressed: () {
//                       Get.updateLocale(
//                           Locale(controller.selectedLanguageCode.value));
//                       HomeController.instance.setRandomTip();
//                       controller.updateUserLanguage(
//                           controller.selectedLanguageCode.value);
//                     },
//                     child: Text(
//                       AppLocalizations.of(context)!.saveChanges,
//                       style: const TextStyle(
//                           fontSize: 18, fontWeight: FontWeight.w400),
//                     ),
//                   ),
//                 ),
//               ],
//             );
//           }),
//         ),
//       ),
//     );
//   }
// }

// class SelectLanguage extends StatelessWidget {
//   const SelectLanguage({
//     super.key,
//     required this.language,
//     required this.countryCode,
//     required this.languageCode,
//   });

//   final String language;
//   final String countryCode;
//   final String languageCode;

//   @override
//   Widget build(BuildContext context) {
//     final controller = UserController.instance;
//     return GestureDetector(
//       onTap: () => controller.selectedLanguageCode.value = languageCode,
//       child: RoundedContainer(
//         padding: const EdgeInsets.all(AppSizes.md),
//         backgroundColor: AppColors.light,
//         child: Row(
//           children: [
//             CountryFlag.fromCountryCode(
//               countryCode,
//               height: 18,
//               width: 24,
//               shape: const RoundedRectangle(4),
//             ),
//             const SizedBox(width: AppSizes.sm),
//             Text(
//               language,
//               style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
//             ),
//             const Spacer(),
//             controller.selectedLanguageCode.value == languageCode
//                 ? const RoundedContainer(
//                     radius: 100,
//                     height: 20,
//                     width: 20,
//                     backgroundColor: AppColors.black,
//                     child: Icon(
//                       Icons.check,
//                       color: AppColors.white,
//                       size: 16,
//                     ),
//                   )
//                 : const RoundedContainer(
//                     radius: 100,
//                     height: 20,
//                     width: 20,
//                     backgroundColor: AppColors.darkGrey,
//                   ),
//           ],
//         ),
//       ),
//     );
//   }
// }
