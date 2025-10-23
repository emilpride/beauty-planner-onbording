import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';
import '../widgets/time_picker.dart';

class EndDayStep extends StatelessWidget {
  const EndDayStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return OnboardingStep(
      key: const ValueKey('EndDay'),
      title: 'What Time Do You Usually End Your Day?',
      subtitle:
          'Let us know when you typically end your day to optimize your Activity tracking.',
      child: Column(
        children: [
          // padding aboove for bigger screens
          const SizedBox(height: 16),
          SizedBox(
            height: 140,
            child: TimePicker(
              initialTime: controller.endDayTime.value,
              onTimeChanged: (newTime) {
                controller.endDayTime.value = newTime;
              },
            ),
          ),
        ],
      ),
    );
  }
}
