import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class GoalStep extends StatelessWidget {
  const GoalStep({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<OnboardingController>();
    return Obx(() {
      return OnboardingStep(
        title: "What do you want to achieve with Beauty Mirror?",
        subtitle:
            "Your aspirations guide our efforts to support and empower you on your journey. Select all that apply.",
        condition:
            controller.userModel.value.goals
                    .map((goal) => goal.isActive)
                    .toList()
                    .contains(true)
                ? true
                : false,
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              controller.userModel.value.goals.map((goal) {
                return GestureDetector(
                  onTap: () {
                    controller.userModel.update((user) {
                      goal.isActive = !goal.isActive;
                    });
                  },
                  child: _goalOption(
                    "assets/icons/misc/goal_img_${goal.id}.png",
                    goal.title,
                    isSelected: goal.isActive,
                  ),
                );
              }).toList(),
        ),
      );
    });
  }

  Widget _goalOption(String icon, String title, {bool isSelected = false}) {
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
            Image.asset(icon, width: 32, height: 32),
            const SizedBox(width: 16),
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
