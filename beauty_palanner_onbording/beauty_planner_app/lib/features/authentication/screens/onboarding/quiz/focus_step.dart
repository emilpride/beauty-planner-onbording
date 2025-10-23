import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_option.dart';
import '../widgets/onboarding_step.dart';

class FocusStep extends StatelessWidget {
  const FocusStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Focus'),
        title: 'Do You Often Find It Hard To Focus?',
        subtitle:
            'Let us know if focus is a struggle for you so we can provide targeted support.',
        condition: controller.userModel.value.focus != 0,
        child: Column(
          children: [
            OnboardingOption(
              text: 'Always',
              isSelected: controller.userModel.value.focus == 1,
              onTap: () {
                controller.userModel.update((user) {
                  user!.focus = 1;
                });
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: Colors.grey),
            OnboardingOption(
              text: 'Sometimes',
              isSelected: controller.userModel.value.focus == 2,
              onTap: () {
                controller.userModel.update((user) {
                  user!.focus = 2;
                });
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: Colors.grey),
            OnboardingOption(
              text: 'Rarely',
              isSelected: controller.userModel.value.focus == 3,
              onTap: () {
                controller.userModel.update((user) {
                  user!.focus = 3;
                });
                controller.userModel.refresh();
              },
            ),
            const Divider(thickness: 0.5, color: Colors.grey),
            OnboardingOption(
              text: 'Never',
              isSelected: controller.userModel.value.focus == 4,
              onTap: () {
                controller.userModel.update((user) {
                  user!.focus = 4;
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
