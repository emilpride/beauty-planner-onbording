import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class SkinProblemsStep extends StatelessWidget {
  const SkinProblemsStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('SkinProblems'),
        title: 'Skin Problems',
        skip: true,
        onSkip: () {
          // Reset all skin problems to inactive
          for (var problem in controller.userModel.value.skinProblems) {
            problem.isActive = false;
          }
          controller.nextPage();
        },
        condition:
            controller.userModel.value.skinProblems
                    .map((problem) => problem.isActive)
                    .toList()
                    .contains(true)
                ? true
                : false,
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              controller.userModel.value.skinProblems.map((problem) {
                return GestureDetector(
                  onTap: () {
                    controller.userModel.update((user) {
                      problem.isActive = !problem.isActive;
                    });
                  },
                  child: _skinProblem(
                    problem.title,
                    isSelected: problem.isActive,
                  ),
                );
              }).toList(),
        ),
      ),
    );
  }

  Widget _skinProblem(String title, {bool isSelected = false}) {
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
