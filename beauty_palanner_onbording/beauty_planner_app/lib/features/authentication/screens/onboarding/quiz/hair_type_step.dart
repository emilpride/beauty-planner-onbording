import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class HairTypeStep extends StatelessWidget {
  const HairTypeStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('HairType'),
        title: 'What Is Your Hair Type?',
        skip: true,
        onSkip: () {
          controller.userModel.value.hairType = 0; // Reset hair type
          controller.userModel.refresh();
          controller.nextPage();
        },
        condition: controller.userModel.value.hairType != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'Straight',
              isSelected: controller.userModel.value.hairType == 1,

              onTap: () {
                controller.userModel.value.hairType = 1;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Slight Waves',
              isSelected: controller.userModel.value.hairType == 2,

              onTap: () {
                controller.userModel.value.hairType = 2;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Soft Waves',
              isSelected: controller.userModel.value.hairType == 3,
              onTap: () {
                controller.userModel.value.hairType = 3;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Defined Waves',
              isSelected: controller.userModel.value.hairType == 4,
              onTap: () {
                controller.userModel.value.hairType = 4;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Classic Curls',
              isSelected: controller.userModel.value.hairType == 5,
              onTap: () {
                controller.userModel.value.hairType = 5;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Soft Spiral Curls',
              isSelected: controller.userModel.value.hairType == 6,
              onTap: () {
                controller.userModel.value.hairType = 6;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Corkscrew Curls',
              isSelected: controller.userModel.value.hairType == 7,
              onTap: () {
                controller.userModel.value.hairType = 7;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Slightly Coiled',
              isSelected: controller.userModel.value.hairType == 8,
              onTap: () {
                controller.userModel.value.hairType = 8;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Kinky',
              isSelected: controller.userModel.value.hairType == 9,
              onTap: () {
                controller.userModel.value.hairType = 9;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Super Kinky',
              isSelected: controller.userModel.value.hairType == 10,
              onTap: () {
                controller.userModel.value.hairType = 10;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Let AI analyze',
              isSelected: controller.userModel.value.hairType == 11,
              onTap: () {
                controller.userModel.value.hairType = 11;
                controller.userModel.refresh();
              },
            ),
            const SizedBox(height: 16.0),
          ],
        ),
      ),
    );
  }
}
