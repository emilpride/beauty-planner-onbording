import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/home_controller.dart';

class AnimatedSegmentControl extends StatelessWidget {
  final List<String> segments;
  final ValueChanged<int> onSegmentSelected;
  final Color backgroundColor;
  final Color selectedColor;
  final Color unselectedTextColor;
  final Color selectedTextColor;
  final double height;
  final double borderRadius;
  final Duration animationDuration;

  const AnimatedSegmentControl({
    super.key,
    required this.segments,
    required this.onSegmentSelected,
    this.backgroundColor = AppColors.white,
    this.selectedColor = AppColors.primary, // Purple from the image
    this.unselectedTextColor = AppColors.textSecondary,
    this.selectedTextColor = Colors.white,
    this.height = 50.0,
    this.borderRadius = 12.0,
    this.animationDuration = const Duration(milliseconds: 300),
  }) : assert(segments.length > 1, 'Segments must contain at least two items');

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<HomeScreenController>();
    return Obx(() {
      Text(controller.selectedTab.value.toString());
      return LayoutBuilder(
        builder: (context, constraints) {
          // Account for the container's padding when calculating available width
          final double totalPadding = 8.0; // 4.0 padding on each side
          final double availableWidth = constraints.maxWidth - totalPadding;
          final double segmentWidth = availableWidth / segments.length;

          // Calculate indicator dimensions to match the available space exactly
          final double indicatorWidth =
              segmentWidth - 8.0; // Account for indicator margins
          final double indicatorLeft =
              4.0 +
              (controller.selectedTab.value * segmentWidth) +
              4.0; // Container padding + segment offset + indicator margin

          return Container(
            height: height,
            padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 1),
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            child: Stack(
              children: [
                // 1. The Animated Selector Indicator (The moving purple pill)
                AnimatedPositioned(
                  duration: animationDuration,
                  curve: Curves.easeInOut, // Smooth and soothing curve
                  left: indicatorLeft,
                  top: 4.0,
                  bottom: 4.0,
                  width: indicatorWidth,
                  child: Container(
                    decoration: BoxDecoration(
                      color: selectedColor,
                      borderRadius: BorderRadius.circular(
                        borderRadius - 4.0,
                      ), // Slightly smaller radius
                    ),
                  ),
                ),

                // 2. The Text Segments (Always visible) - Using absolute positioning for perfect alignment
                ...List.generate(segments.length, (index) {
                  final isSelected = controller.selectedTab.value == index;
                  final textLeft =
                      4.0 +
                      (index * segmentWidth); // Same calculation as indicator

                  return Positioned(
                    left: textLeft,
                    top: 0,
                    bottom: 0,
                    width: segmentWidth,
                    child: GestureDetector(
                      behavior: HitTestBehavior.translucent,
                      onTap: () {
                        onSegmentSelected(index);
                      },
                      child: Center(
                        child: AnimatedDefaultTextStyle(
                          duration: animationDuration,
                          curve: Curves.easeInOut,
                          style: TextStyle(
                            color:
                                isSelected
                                    ? selectedTextColor
                                    : unselectedTextColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 14.0,
                          ),
                          child: Text(segments[index]),
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          );
        },
      );
    });
  }
}
