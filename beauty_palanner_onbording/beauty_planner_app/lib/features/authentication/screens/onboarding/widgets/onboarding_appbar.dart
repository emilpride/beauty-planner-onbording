import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class OnboardingAppbar extends StatelessWidget {
  const OnboardingAppbar({super.key, this.onBackPressed});

  final VoidCallback? onBackPressed;

  @override
  Widget build(BuildContext context) {
    const double iconSize = 20.0;
    // Get the controller instance.
    // Using Obx to make the widget reactive to changes in currentPage.
    return Obx(() {
      final controller = Get.find<OnboardingController>();
      final currentPage = controller.currentPage.value;

      // Define checkpoints with their starting page number.
      // This makes the logic for progress calculation much cleaner.
      final checkpoints = [
        {'text': 'General', 'svg': AppImages.generalSvg, 'startPage': 0},
        {'text': 'Lifestyle', 'svg': AppImages.lifestyleSvg, 'startPage': 8},
        {'text': 'Skin', 'svg': AppImages.skinSvg, 'startPage': 14},
        {'text': 'Hair', 'svg': AppImages.hairSvg, 'startPage': 16},
        {'text': 'Physic', 'svg': AppImages.physicSvg, 'startPage': 18},
        {'text': 'AI', 'svg': AppImages.aISvg, 'startPage': 26},
      ];

      // You need to define the total number of pages for the last checkpoint's calculation.
      // Adjust this value to match the actual total pages in your onboarding flow.
      const int totalOnboardingPages = 30;

      final List<Widget> progressWidgets = [];
      for (int i = 0; i < checkpoints.length; i++) {
        final item = checkpoints[i];
        final int startPage = item['startPage'] as int;

        // A checkpoint is considered active if the user has reached or passed its start page.
        final bool isCheckpointActive = currentPage >= startPage;

        final stackChildren = <Widget>[
          _CheckPoint(
            text: item['text'] as String,
            svg: item['svg'] as String,
            isActive: isCheckpointActive,
            iconSize: iconSize,
          ),
        ];

        // Add progress dots between checkpoints.
        if (i < checkpoints.length - 1) {
          // The end page for the current section is the start page of the next checkpoint.
          final int endPage = checkpoints[i + 1]['startPage'] as int;

          stackChildren.add(
            Positioned(
              right: -10, // Adjust as needed for spacing
              // Position from the top to vertically center with the icon.
              // Calculation: (iconSize / 2) - (dotSize / 2)
              top: 10, // Adjust as needed for vertical alignment
              // The width should be the space between checkpoint centers.
              // We subtract the icon's radius from each side.
              width: 30,
              child: _ProgressDots(
                currentPage: currentPage,
                sectionStartPage: startPage,
                sectionEndPage: endPage,
              ),
            ),
          );
        }

        progressWidgets.add(
          Expanded(
            child: Stack(
              clipBehavior: Clip.none,
              // alignment: Alignment.center,
              children: stackChildren,
            ),
          ),
        );
      }

      return SizedBox(
        height: kToolbarHeight, //+ 20, // Increased height for text
        width: MediaQuery.of(context).size.width,
        child: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(width: AppSizes.xs),
              GestureDetector(
                onTap: onBackPressed ?? () => Get.back(),
                child: const Icon(
                  Iconsax.arrow_left_2,
                  color: AppColors.primary,
                  size: AppSizes.xl,
                ),
              ),
              ...progressWidgets,
            ],
          ),
        ),
      );
    });
  }
}

/// A single checkpoint in the progress bar (icon and text).
class _CheckPoint extends StatelessWidget {
  const _CheckPoint({
    required this.text,
    required this.svg,
    required this.isActive,
    required this.iconSize,
  });

  final String text;
  final String svg;
  final bool isActive;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final Color color = isActive ? AppColors.primary : AppColors.textSecondary;

    return SizedBox(
      width: 45,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Container(
            height: iconSize,
            width: iconSize,
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              // In a real app, you'd handle SVG loading errors.
              // For this example, we assume paths are correct.
              child: SvgPicture.asset(
                svg,
                colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
                placeholderBuilder:
                    (context) => Icon(Icons.error, color: color, size: 12),
              ),
            ),
          ),
          const SizedBox(height: AppSizes.xs),
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

/// Renders the 4 progress dots between checkpoints and calculates
/// how many should be active based on the user's progress.
class _ProgressDots extends StatelessWidget {
  const _ProgressDots({
    required this.currentPage,
    required this.sectionStartPage,
    required this.sectionEndPage,
  });

  final int currentPage;
  final int sectionStartPage;
  final int sectionEndPage;

  @override
  Widget build(BuildContext context) {
    int numberOfActiveDots = 0;
    final int totalPagesInSection = sectionEndPage - sectionStartPage;

    // If the user is past this entire section, all dots are active.
    if (currentPage >= sectionEndPage) {
      numberOfActiveDots = 4;
    }
    // If the user is within this section, calculate the progress percentage.
    else if (currentPage > sectionStartPage && totalPagesInSection > 0) {
      final int pagesCompletedInSection = currentPage - sectionStartPage;
      final double progress = pagesCompletedInSection / totalPagesInSection;
      // Multiply progress by 4 to determine how many dots to light up.
      // .floor() ensures a dot is only active once its "portion" is fully passed.
      numberOfActiveDots = (progress * 4).floor();
    }

    // Generate the 4 dots, coloring them based on the calculated active count.
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(4, (index) {
        final bool isActive = index < numberOfActiveDots;
        final Color color =
            isActive ? AppColors.primary : AppColors.textSecondary;
        return Container(
          width: 3.5,
          height: 3.5,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        );
      }),
    );
  }
}
