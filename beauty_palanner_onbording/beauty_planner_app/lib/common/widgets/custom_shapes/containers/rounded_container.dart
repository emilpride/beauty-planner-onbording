import 'package:flutter/material.dart';

import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';

class RoundedContainer extends StatelessWidget {
  const RoundedContainer({
    super.key,
    this.child,
    this.width,
    this.height,
    this.margin,
    this.padding,
    this.shadow = false,
    this.showBorder = false,
    this.radius = AppSizes.cardRadiusLg,
    this.backgroundColor = AppColors.white,
    this.borderColor = AppColors.borderPrimary,
  });

  final double? width;
  final double? height;
  final double radius;
  final Widget? child;
  final bool showBorder;
  final bool shadow;
  final Color borderColor;
  final Color backgroundColor;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        border: showBorder ? Border.all(color: borderColor, width: 2) : null,
        borderRadius: BorderRadius.circular(radius),

        color: backgroundColor,
        boxShadow:
            shadow
                ? [
                  BoxShadow(
                    color: AppColors.black.withOpacity(0.15),
                    offset: Offset(1, 2),
                    blurRadius: 4,
                  ),
                ]
                : [],
      ),
      child: child,
    );
  }
}
