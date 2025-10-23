import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/activity_frequency_item.dart';
import '../widgets/onboarding_step.dart';

class ActivityFrequencyStep extends StatelessWidget {
  const ActivityFrequencyStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('ActivityFrequency'),
        title: 'How Often Do You Engage In These Activities?',
        condition: controller.userModel.value.physicalActivities
            .where((activity) => activity.isActive)
            .any((activity) => activity.frequency.isNotEmpty),
        child: Column(
          children:
              controller.userModel.value.physicalActivities
                  .where((activity) => activity.isActive)
                  .map(
                    (activity) => ActivityFrequencyItem(
                      activity: activity.title,
                      frequency:
                          activity.frequency.isEmpty
                              ? 'Set Frequency'
                              : activity.frequency,
                      onTap:
                          () =>
                              controller.showFrequencyPicker(context, activity),
                    ),
                  )
                  .toList(),
        ),
      ),
    );
  }
}
