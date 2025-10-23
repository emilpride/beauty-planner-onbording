import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class WorkEnvironmentStep extends StatelessWidget {
  const WorkEnvironmentStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Work'),
        title: 'What\'s Your Work Environment?',
        condition: controller.userModel.value.workEnv != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'In Office',
              isSelected: controller.userModel.value.workEnv == 1,
              onTap: () {
                controller.userModel.value.workEnv = 1;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Remote',
              isSelected: controller.userModel.value.workEnv == 2,
              onTap: () {
                controller.userModel.value.workEnv = 2;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Part-Time',
              isSelected: controller.userModel.value.workEnv == 3,
              onTap: () {
                controller.userModel.value.workEnv = 3;
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: AppColors.grey),
            OnboardingOption(
              text: 'Jobless',
              isSelected: controller.userModel.value.workEnv == 4,
              onTap: () {
                controller.userModel.value.workEnv = 4;
                controller.userModel.refresh();
              },
            ),
          ],
        ),
      ),
    );
  }
}
