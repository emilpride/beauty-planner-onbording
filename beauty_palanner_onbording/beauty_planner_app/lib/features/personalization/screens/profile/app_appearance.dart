import 'package:beautymirror/features/personalization/controllers/user_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../data/repositories/user/user_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/theme/theme_controller.dart';
import '../../../authentication/screens/onboarding/widgets/onboarding_option.dart';
import 'pick_assistant.dart';
import 'select_language.dart';

class AppAppearance extends StatelessWidget {
  const AppAppearance({super.key});

  @override
  Widget build(BuildContext context) {
    final UserController userController = UserController.instance;
    return Scaffold(
      appBar: const BMAppbar(title: 'App Appearance'),
      backgroundColor: AppColors.light,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Obx(
            () => RoundedContainer(
              width: double.infinity,
              backgroundColor: AppColors.white,
              margin: const EdgeInsets.symmetric(vertical: 24),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  tile(
                    title: 'Theme',
                    subTitle:
                        userController.theme.value == 0
                            ? 'System Default'
                            : userController.theme.value == 1
                            ? 'Light'
                            : 'Dark',
                    onTap: () => showPickThemeBottomSheet(),
                  ),
                  tile(
                    title: 'Accent Color',
          subTitle: '#'
            '${ThemeController.instance.accent.value.toRadixString(16).padLeft(8, '0').toUpperCase()}',
                    onTap: () => showPickAccentBottomSheet(),
                  ),
                  tile(
                    title: 'AI assistant',
                    subTitle:
                        userController.assistant.value == 2 ? 'Ellie' : 'Max',
                    onTap: () => Get.to(() => const PickAssistant()),
                  ),
                  tile(
                    title: 'App Language',
                    subTitle: getLanguageName(
                      userController.selectedLanguageCode.value,
                    ),
                    onTap: () => Get.to(() => const SelectLanguage()),
                  ),
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

  Widget tile({
    required String title,
    required String subTitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Text(
                  subTitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(width: 16),
                const Icon(
                  Iconsax.arrow_right_3,
                  size: 18,
                  weight: 2,
                  color: Color(0xFF907FB1),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void showPickThemeBottomSheet() {
    final controller = UserController.instance;
    final themeController = ThemeController.instance;
    showModalBottomSheet(
      context: Get.context!,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Obx(
          () => Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Choose App Theme",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 20),
                OnboardingOption(
                  text: "System Default",
                  isSelected: controller.theme.value == 0,
                  onTap: () {
                    controller.theme.value = 0;
                    ThemeController.instance.setThemeId(0);
                  },
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Divider(thickness: 0.5, color: AppColors.grey),
                ),
                OnboardingOption(
                  text: "Light",
                  isSelected: controller.theme.value == 1,
                  onTap: () {
                    controller.theme.value = 1;
                    ThemeController.instance.setThemeId(1);
                  },
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Divider(thickness: 0.5, color: AppColors.grey),
                ),
                OnboardingOption(
                  text: "Dark",
                  isSelected: controller.theme.value == 2,
                  onTap: () {
                    controller.theme.value = 2;
                    ThemeController.instance.setThemeId(2);
                  },
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () {
                          controller.theme.value = controller.user.value.theme;
                          Get.back();
                        },
                        child: const Text(
                          "Cancel",
                          style: TextStyle(color: AppColors.black),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () {
                          UserRepository.instance.updateSingleField({
                            'Theme': controller.theme.value,
                          });
                          // Apply immediately
                          themeController.setThemeId(controller.theme.value);
                          Get.back();
                        },
                        child: const Text(
                          "OK",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }

  void showPickAccentBottomSheet() {
    final themeController = ThemeController.instance;
    final presets = <Color>[
      const Color(0xFFA385E9), // current default
      Colors.pinkAccent,
      Colors.redAccent,
      Colors.orange,
      Colors.amber,
      Colors.green,
      Colors.teal,
      Colors.blue,
      Colors.indigo,
      Colors.deepPurple,
    ];
    showModalBottomSheet(
      context: Get.context!,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        Color selected = themeController.accent;
        return StatefulBuilder(
          builder: (context, setState) => Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Choose Accent Color",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: presets.map((c) {
                    final isSel = c.value == selected.value;
                    return GestureDetector(
                      onTap: () => setState(() => selected = c),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: c,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSel ? Colors.black : Colors.transparent,
                            width: 2,
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            )
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: Get.back,
                        child: const Text(
                          "Cancel",
                          style: TextStyle(color: AppColors.black),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor: selected,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () async {
                          themeController.setAccent(selected);
                          // Optionally sync to Firestore so it roams across devices
                          await UserRepository.instance.updateSingleField({
                            'PrimaryColor': '#'
                                '${selected.value.toRadixString(16).padLeft(8, '0')}',
                          });
                          Get.back();
                        },
                        child: const Text(
                          "Apply",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }
}
