import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class StressStep extends StatelessWidget {
  const StressStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Stress'),
        title: 'How Often Do You Get Stressed?',
        condition: controller.userModel.value.stress != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'Rarely',
              isSelected: controller.userModel.value.stress == 1,
              onTap: () {
                controller.userModel.value.stress = 1;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Sometimes',
              isSelected: controller.userModel.value.stress == 2,
              onTap: () {
                controller.userModel.value.stress = 2;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Often',
              isSelected: controller.userModel.value.stress == 3,
              onTap: () {
                controller.userModel.value.stress = 3;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Always',
              isSelected: controller.userModel.value.stress == 4,
              onTap: () {
                controller.userModel.value.stress = 4;
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
