import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class SleepStep extends StatelessWidget {
  const SleepStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Sleep'),
        title: 'How Long Do You Usually Sleep At Night?',
        subtitle:
            'Understanding your sleep patterns helps us tailor your Activity tracking experience.',
        condition: controller.userModel.value.sleepDuration != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'Less than 6 hours',
              isSelected: controller.userModel.value.sleepDuration == 1,
              onTap: () {
                controller.userModel.value.sleepDuration = 1;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: '6-7 hours',
              isSelected: controller.userModel.value.sleepDuration == 2,
              onTap: () {
                controller.userModel.value.sleepDuration = 2;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: '7-8 hours',
              isSelected: controller.userModel.value.sleepDuration == 3,
              onTap: () {
                controller.userModel.value.sleepDuration = 3;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: '8-9 hours',
              isSelected: controller.userModel.value.sleepDuration == 4,
              onTap: () {
                controller.userModel.value.sleepDuration = 4;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'More than 9 hours',
              isSelected: controller.userModel.value.sleepDuration == 5,
              onTap: () {
                controller.userModel.value.sleepDuration = 5;
                controller.userModel.refresh();
              },
            ),
          ],
        ),
      ),
    );
  }
}
