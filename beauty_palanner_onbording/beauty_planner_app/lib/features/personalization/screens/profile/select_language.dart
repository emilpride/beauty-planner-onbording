import 'package:beautymirror/utils/constants/image_strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controllers/user_controller.dart';

class SelectLanguage extends StatelessWidget {
  const SelectLanguage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = UserController.instance;
    return Scaffold(
      appBar: BMAppbar(
        title: 'Select Language',
        onBackPressed: () {
          controller.selectedLanguageCode.value =
              controller.user.value.languageCode;
          Get.back();
        },
      ),
      backgroundColor: AppColors.light,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Obx(
          () => RoundedContainer(
            width: double.infinity,
            backgroundColor: AppColors.white,
            margin: const EdgeInsets.symmetric(vertical: 24),
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  languageTile('en'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('es'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('de'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('zh'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('ua'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),

                  languageTile('ja'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('ru'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('ar'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('hi'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('pt'),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Divider(
                      height: 0.4,
                      thickness: 1,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  languageTile('bn'),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String getLanguageName(String code) {
    switch (code) {
      case 'en':
        return 'English';
      case 'es':
        return 'Spanish';
      case 'fr':
        return 'French';
      case 'de':
        return 'German';
      case 'zh':
        return 'Mandarin Chinese';
      case 'ja':
        return 'Japanese';
      case 'ru':
        return 'Russian';
      case 'ar':
        return 'Arabic';
      case 'hi':
        return 'Hindi';
      case 'pt':
        return 'Portuguese';
      case 'bn':
        return 'Bengali';
      case 'ua':
        return 'Ukrainian';
      default:
        return 'Unknown';
    }
  }

  Widget languageTile(String languageCode) {
    final UserController userController = UserController.instance;
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: () {
        userController.selectedLanguageCode.value = languageCode;
        userController.updateUserLanguage(languageCode);
      },
      child: Row(
        children: [
          const SizedBox(width: AppSizes.sm),
          Text(
            getLanguageName(languageCode),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          userController.selectedLanguageCode.value == languageCode
              ? SvgPicture.asset(
                AppImages.tick,
                height: 16,
                width: 16,
                color: AppColors.primary,
              )
              : const SizedBox.shrink(),
          const SizedBox(width: AppSizes.sm),
        ],
      ),
    );
  }
}
