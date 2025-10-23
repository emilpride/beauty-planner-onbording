import 'package:flutter/material.dart';

import '../widgets/onboarding_step.dart';

class CongratulationsStep extends StatelessWidget {
  const CongratulationsStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "Congratulations on taking the first step!",
      subtitle:
          "You’ve just made a big move towards becoming the best version of yourself. Let’s keep going — I’m here to guide you every step of the way!",
      condition: true,
      child: const SizedBox.shrink(),
    );
  }
}
