import 'package:flutter/material.dart';

import '../widgets/onboarding_step.dart';

class ExcitedStep extends StatelessWidget {
  const ExcitedStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "We’re excited to create something just for you!",
      subtitle:
          "Your personalized plan is in the making, designed to help you shine and feel your best every day. Let's dive deeper into understanding you better to ensure the perfect fit.",
      condition: true,
      child: const SizedBox.shrink(),
    );
  }
}
