import 'dart:io';

import 'package:dotted_border/dotted_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';

//... (Keep all the existing widgets like OnboardingStep, MoodOption, etc. here)

/// A widget for the photo upload step, showing a placeholder or the selected image.
class PhotoUploadItem extends StatelessWidget {
  final String label;
  final String image;
  final Rx<File?>? selectedImage;
  final VoidCallback onTap;

  const PhotoUploadItem({
    super.key,
    required this.label,
    required this.image,
    required this.selectedImage,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Label and example image
        Column(
          children: [
            Image.asset(image, width: 100, height: 100),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),

        // Upload area
        Obx(
          () => GestureDetector(
            onTap: onTap,
            child: DottedBorder(
              options: const RoundedRectDottedBorderOptions(
                radius: Radius.circular(20),
                dashPattern: [10, 9],
                strokeWidth: 2,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primary, AppColors.textPrimary],
                ),
              ),
              child: SizedBox(
                width: 120,
                height: 120,
                child: Center(
                  child:
                      selectedImage!.value != null
                          ? const Icon(
                            Icons.check,
                            size: 40,
                            color: Colors.green,
                          )
                          : SvgPicture.asset(
                            AppImages.cameraSvg,
                            width: 40,
                            height: 40,
                          ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
