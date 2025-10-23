// Common Button used across steps
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class OnboardingButton extends StatelessWidget {
  final String text;
  final bool condition;
  VoidCallback? ontap;
  VoidCallback? onDisabledTap;
  OnboardingButton({
    super.key,
    required this.text,
    required this.condition,
    this.ontap,
    this.onDisabledTap,
  });

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<OnboardingController>();
    return SizedBox(
      height: 50,
      width: double.infinity,
      child: Opacity(
        opacity: condition ? 1.0 : 0.6, // Adjust opacity based on condition
        child: ElevatedButton(
          onPressed: () {
            if (condition) {
              if (ontap != null) {
                ontap!();
              }
              controller.nextPage();
            } else {
              if (onDisabledTap != null) {
                onDisabledTap!();
              }
            }
            controller.x.value++;
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            minimumSize: const Size(double.infinity, 45),
            maximumSize: const Size(double.infinity, 45),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
          ),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
