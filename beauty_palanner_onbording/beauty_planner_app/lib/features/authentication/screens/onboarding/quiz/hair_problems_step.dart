import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class HairProblemsStep extends StatelessWidget {
  const HairProblemsStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('HairProblems'),
        title: 'Hair Problems',
        skip: true,
        onSkip: () {
          // Reset all hair problems to inactive
          for (var problem in controller.userModel.value.hairProblems) {
            problem.isActive = false;
          }
          controller.nextPage();
        },
        condition:
            controller.userModel.value.hairProblems
                    .map((problem) => problem.isActive)
                    .toList()
                    .contains(true)
                ? true
                : false,
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              controller.userModel.value.hairProblems.map((problem) {
                return GestureDetector(
                  onTap: () {
                    controller.userModel.update((user) {
                      problem.isActive = !problem.isActive;
                    });
                  },
                  child: _hairProblem(
                    problem.title,
                    isSelected: problem.isActive,
                  ),
                );
              }).toList(),
        ),
      ),
    );
  }

  Widget _hairProblem(String title, {bool isSelected = false}) {
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
