// Common Button used across steps
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class OnboardingSkipButton extends StatelessWidget {
  final String text;
  VoidCallback? ontap;
  OnboardingSkipButton({super.key, required this.text, this.ontap});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<OnboardingController>();
    return GestureDetector(
      onTap: () {
        if (ontap != null) {
          ontap!();
        } else {
          controller.nextPage();
        }
        controller.x.value++;
      },
      child: RoundedContainer(
        radius: 16,
        width: double.infinity,
        height: 45,
        backgroundColor: const Color(0xFFEDEAFF),

        child: Center(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
