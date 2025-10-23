import 'package:flutter/material.dart';

import '../../../utils/constants/colors.dart';

class SectionHeading extends StatelessWidget {
  const SectionHeading({
    super.key,
    this.textColor,
    required this.title,
    this.buttonTitle = 'See all',
    this.showActionButton = true,
    this.onPressed,
  });

  final Color? textColor;
  final String title, buttonTitle;
  final bool showActionButton;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(title,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: textColor,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
        ),
        if (showActionButton)
          TextButton(
              onPressed: onPressed,
              child: Text(buttonTitle,
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                      decorationColor: AppColors.primary,
                      decoration: TextDecoration.underline)))
      ],
    );
  }
}
