import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class DietStep extends StatelessWidget {
  const DietStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Diet'),
        title: 'What\'s Your Diet?',
        condition:
            controller.userModel.value.diet
                    .map((d) => d.isActive)
                    .toList()
                    .contains(true)
                ? true
                : false,
        skip: true,
        skipText: 'No diet',
        onSkip: () {
          for (var d in controller.userModel.value.diet) {
            d.isActive = false;
          }
          controller.nextPage();
        },
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              controller.userModel.value.diet.map((d) {
                return GestureDetector(
                  onTap: () {
                    controller.userModel.update((user) {
                      d.isActive = !d.isActive;
                    });
                  },
                  child: _diet(d.title, isSelected: d.isActive),
                );
              }).toList(),
        ),
      ),
    );
  }

  Widget _diet(String title, {bool isSelected = false}) {
    return Container(
      margin: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        border: Border.all(
          color: isSelected ? AppColors.primary : Colors.transparent,
          width: 1.5,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: RoundedContainer(
        radius: 10,
        margin: const EdgeInsets.all(2),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        backgroundColor: AppColors.lightContainer,
        child: Row(
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
