import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class SkinTypeStep extends StatelessWidget {
  const SkinTypeStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('SkinType'),
        title: 'What Is Your Skin Type?',
        condition: controller.userModel.value.skinType != 0,
        skip: true,
        onSkip: () {
          controller.userModel.value.skinType = 0; // Reset skin type
          controller.userModel.refresh();
          controller.nextPage();
        },
        child: Column(
          children: [
            OnboardingOption(
              text: 'Dry Skin',
              isSelected: controller.userModel.value.skinType == 1,
              onTap: () {
                controller.userModel.value.skinType = 1;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Normal Skin',
              isSelected: controller.userModel.value.skinType == 2,
              onTap: () {
                controller.userModel.value.skinType = 2;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Oily Skin',
              isSelected: controller.userModel.value.skinType == 3,
              onTap: () {
                controller.userModel.value.skinType = 3;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Combination Skin',
              isSelected: controller.userModel.value.skinType == 4,
              onTap: () {
                controller.userModel.value.skinType = 4;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Let AI analyze',
              isSelected: controller.userModel.value.skinType == 5,
              onTap: () {
                controller.userModel.value.skinType = 5;
                controller.userModel.refresh();
              },
            ),
            const SizedBox(height: AppSizes.md),
          ],
        ),
      ),
    );
  }
}
