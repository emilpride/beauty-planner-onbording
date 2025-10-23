import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class PhysicalActivitiesStep extends StatelessWidget {
  const PhysicalActivitiesStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('PhysicalActivities'),
        title: 'Do You Already Practice Any Physical Activities?',
        condition:
            controller.userModel.value.physicalActivities
                    .map((activity) => activity.isActive)
                    .toList()
                    .contains(true)
                ? true
                : false,
        skip: true,
        skipText: 'I don\'t exercise',
        onSkip: () {
          for (var activity in controller.userModel.value.physicalActivities) {
            activity.isActive = false;
          }

          controller.jumpToPage(20);
        },
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              controller.userModel.value.physicalActivities.map((activity) {
                return GestureDetector(
                  onTap: () {
                    controller.userModel.update((user) {
                      activity.isActive = !activity.isActive;
                    });
                  },
                  child: _activity(
                    activity.title,
                    isSelected: activity.isActive,
                  ),
                );
              }).toList(),
        ),
      ),
    );
  }

  Widget _activity(String title, {bool isSelected = false}) {
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
