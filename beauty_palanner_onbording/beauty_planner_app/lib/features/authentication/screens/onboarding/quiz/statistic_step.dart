import 'package:flutter/material.dart';

import '../widgets/onboarding_step.dart';

class StatisticStep extends StatelessWidget {
  const StatisticStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "87% of our users see results within the first week!",
      subtitle:
          "You’re on the right path — and your transformation could start even faster than you think. Let’s continue building your personalized plan to achieve amazing results!",
      condition: true,
      child: const SizedBox.shrink(),
    );
  }
}
