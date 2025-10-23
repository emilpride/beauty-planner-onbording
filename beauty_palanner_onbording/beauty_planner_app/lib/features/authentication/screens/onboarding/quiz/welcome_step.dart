import 'package:beautymirror/features/authentication/controllers/onboarding/onboarding_controller.dart';
import 'package:flutter/material.dart';

import '../widgets/onboarding_step.dart';

class WelcomeStep extends StatelessWidget {
  const WelcomeStep({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = OnboardingController.instance;
    return OnboardingStep(
      title:
          "Hi! I’m ${controller.userModel.value.assistant == 2 ? 'Ellie' : 'Max'}, your personal AI assistant.",
      subtitle:
          "I'm here to help you find your true beauty through the perfect balance of self-care, mental well-being, and physical health. \n\nThe information and recommendations provided by the Beauty Mirror app are for informational and educational purposes only. This app is not intended to be a substitute for professional medical advice, diagnosis, or treatment.",
      text: "Let's Go",
      child: const SizedBox.shrink(),
    );
  }
}
