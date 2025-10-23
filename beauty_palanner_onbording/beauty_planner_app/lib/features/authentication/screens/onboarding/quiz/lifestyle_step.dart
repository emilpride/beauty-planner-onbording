import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class LifestyleStep extends StatelessWidget {
  const LifestyleStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Lifestyle'),
        title:
            'Hi ${controller.userModel.value.name} What\'s The Rhythm Of Your Life?',
        condition: controller.userModel.value.lifeStyle != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'Sedentary lifestyle',
              isSelected: controller.userModel.value.lifeStyle == 1,
              onTap: () {
                controller.userModel.value.lifeStyle = 1;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Active Lifestyle',
              isSelected: controller.userModel.value.lifeStyle == 2,
              onTap: () {
                controller.userModel.value.lifeStyle = 2;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Sports Lifestyle',
              isSelected: controller.userModel.value.lifeStyle == 3,
              onTap: () {
                controller.userModel.value.lifeStyle = 3;
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
