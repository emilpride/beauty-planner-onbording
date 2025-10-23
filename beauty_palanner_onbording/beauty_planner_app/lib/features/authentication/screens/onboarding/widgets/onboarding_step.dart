import 'package:flutter/material.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import 'onboarding_button.dart';
import 'onboarding_skip_button.dart';

class OnboardingStep extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;
  VoidCallback? onNext;
  VoidCallback? onDisabledTap;
  final bool condition; // Default condition for enabling the button
  final String text; // Default text for the button, can be customized later
  final bool skip;
  final String skipText;
  VoidCallback? onSkip;

  OnboardingStep({
    super.key,
    required this.title,
    this.subtitle,
    required this.child,
    // required this.condition,
    this.condition = true, // Default to true, can be overridden
    this.onNext,
    this.onDisabledTap,
    this.text = 'Next',
    this.skip = false,
    this.onSkip,
    this.skipText = 'Skip',
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppSizes.lg),
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (subtitle != null) const SizedBox(height: 12),

                // Subtitle (if provided)
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                const SizedBox(height: 24),

                child,
              ],
            ),
          ),
        ),
        // const Spacer(),
        OnboardingButton(
          text: text,
          condition: condition,
          ontap: onNext,
          onDisabledTap: onDisabledTap,
        ),

        if (skip) ...[
          const SizedBox(height: AppSizes.sm),
          OnboardingSkipButton(text: skipText, ontap: onSkip),
        ],
      ],
    );
  }
}
