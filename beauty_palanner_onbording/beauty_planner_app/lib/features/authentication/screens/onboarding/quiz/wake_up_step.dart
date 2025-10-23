import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';
import '../widgets/time_picker.dart';

class WakeUpStep extends StatelessWidget {
  const WakeUpStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return OnboardingStep(
      key: const ValueKey('WakeUp'),
      title: 'What Time Do You Usually Wake Up?',
      subtitle:
          'Setting your wake-up time helps us create your personalized Activity schedule.',

      child: Column(
        children: [
          // padding aboove for bigger screens
          const SizedBox(height: 16),
          SizedBox(
            height: 140,
            child: TimePicker(
              initialTime: controller.wakeUpTime.value,
              onTimeChanged: (newTime) {
                controller.wakeUpTime.value = newTime;
              },
            ),
          ),
        ],
      ),
    );
  }
}
