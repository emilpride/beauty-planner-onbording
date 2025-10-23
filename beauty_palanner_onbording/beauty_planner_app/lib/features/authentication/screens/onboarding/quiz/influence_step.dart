import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/helpers/wellness_calculator.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class OrganizationInfluenceStep extends StatelessWidget {
  const OrganizationInfluenceStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('OrganizationInfluence'),
        title: 'What Influenced You To Become Organized?',
        subtitle:
            'Understanding your motivations helps us align Beauty Mirror with your goals. Select all that apply.',
        condition:
            controller.userModel.value.influence
                    .map((i) => i.isActive)
                    .toList()
                    .contains(true)
                ? true
                : false,
        onNext: () {
          if (Platform.isIOS) {
            controller.nextPage();
            controller.nextPage();
            controller.wellnessModel.value = WellnessCalculator.analyze(
              controller.userModel.value,
              controller.moodModel.value,
              controller.weightModel.value,
              controller.heightModel.value,
            );

            controller.aiAnalysisModel.value.bmi =
                controller
                    .wellnessModel
                    .value
                    .bmi; // Set BMI in AI Analysis Model
            controller.aiAnalysisModel.value.bmiScore =
                controller
                    .wellnessModel
                    .value
                    .bmiScore; // Set BMI Score in AI Analysis Model
            controller.aiAnalysisModel.value.bmsScore =
                controller
                    .wellnessModel
                    .value
                    .bms; // Set BMS Score in AI Analysis Model
          }
        },
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children:
              controller.userModel.value.influence.map((i) {
                return GestureDetector(
                  onTap: () {
                    controller.userModel.update((user) {
                      i.isActive = !i.isActive;
                    });
                  },
                  child: _influence(i.title, isSelected: i.isActive),
                );
              }).toList(),
        ),
      ),
    );
  }

  Widget _influence(String title, {bool isSelected = false}) {
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
