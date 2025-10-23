import 'dart:async';
import 'package:beautymirror/features/personalization/controllers/user_controller.dart';
import 'package:flutter/material.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../common/widgets/custom_shapes/curved_shapes/custom_progress_indicator.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  final List<ProgressStep> _steps = [
    ProgressStep("Analyzing your answers"),
    ProgressStep("Analyzing your appearance"),
    ProgressStep("Your plan is almost ready"),
    ProgressStep("Done!"),
  ];

  int _currentStep = 0;

  @override
  void initState() {
    super.initState();
    _startAnimation();
  }

  void _startAnimation() {
    // Timer to animate each step one by one
    Timer.periodic(const Duration(seconds: 2), (timer) {
      if (_currentStep < _steps.length) {
        setState(() {
          _steps[_currentStep].isDone = true;
          _currentStep++;
        });
      } else {
        timer.cancel();
        // Navigate to the next screen after all steps are done
        OnboardingController.instance.currentPage2.value++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final userController = UserController.instance;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // const SizedBox(height: 40),
            // Placeholder for the main image
            Container(
              height: 220,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                image: DecorationImage(
                  // Replace with your actual image asset
                  image: AssetImage(
                    userController.user.value.assistant == 2
                        ? AppImages.onboarding2Image1Ellie
                        : AppImages.onboarding2Image1Max,
                  ),
                  // fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              "Creating Your Perfect Schedule...",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            // Displaying the list of progress steps
            ..._steps.map((step) => AnimatedStep(step: step)),
          ],
        ),
      ),
    );
  }
}

class ProgressStep {
  final String text;
  bool isDone;

  ProgressStep(this.text, {this.isDone = false});
}

class AnimatedStep extends StatelessWidget {
  final ProgressStep step;

  const AnimatedStep({super.key, required this.step});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          const SizedBox(width: 24),
          // AnimatedSwitcher for the icon transition
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 500),
            transitionBuilder: (child, animation) {
              return ScaleTransition(scale: animation, child: child);
            },
            child:
                step.isDone
                    ? Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.green[100],
                        shape: BoxShape.circle,
                      ),
                      padding: const EdgeInsets.all(4),
                      key: const ValueKey('done'),
                      child: const Icon(
                        Icons.check_circle,
                        color: Colors.green,
                        size: 24,
                        key: ValueKey('done'),
                      ),
                    )
                    : RoundedContainer(
                      width: 40,
                      height: 40,
                      radius: 100,
                      backgroundColor: Colors.grey[200]!,
                      padding: const EdgeInsets.all(12),
                      key: const ValueKey('loading'),
                      child: const CustomRoundedProgressIndicator(
                        color: AppColors.darkGrey,
                        strokeWidth: 2.0,
                        value: 0, // Indeterminate
                      ),
                    ),
          ),
          const SizedBox(width: 16),
          Text(
            step.text,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 16,
              color: step.isDone ? AppColors.textPrimary : Colors.grey[500],
              fontWeight: step.isDone ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
