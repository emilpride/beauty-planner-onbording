import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class ProcrastinationStep extends StatelessWidget {
  const ProcrastinationStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    final options = ['Always', 'Sometimes', 'Rarely', 'Never'];

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Procrastination'),
        title: 'Do You Often Procrastinate?',
        subtitle:
            'Understanding your procrastination tendencies helps us tailor strategies to overcome them.',
        condition: controller.userModel.value.procrastination != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'Always',
              isSelected: controller.userModel.value.procrastination == 1,
              onTap: () {
                controller.userModel.update((user) {
                  user!.procrastination = 1;
                });
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: Colors.grey),
            OnboardingOption(
              text: 'Sometimes',
              isSelected: controller.userModel.value.procrastination == 2,
              onTap: () {
                controller.userModel.update((user) {
                  user!.procrastination = 2;
                });
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: Colors.grey),
            OnboardingOption(
              text: 'Rarely',
              isSelected: controller.userModel.value.procrastination == 3,
              onTap: () {
                controller.userModel.update((user) {
                  user!.procrastination = 3;
                });
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: Colors.grey),
            OnboardingOption(
              text: 'Never',
              isSelected: controller.userModel.value.procrastination == 4,
              onTap: () {
                controller.userModel.update((user) {
                  user!.procrastination = 4;
                });
                controller.userModel.refresh();
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
