import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';

import '../../../utils/constants/colors.dart';

class PickerButton extends StatelessWidget {
  final String text;
  final double width;
  final VoidCallback onPressed;
  final bool isCalendar;

  const PickerButton({
    super.key,
    required this.text,
    required this.onPressed,
    required this.width,
    this.isCalendar = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      borderRadius: BorderRadius.circular(10),
      color: Colors.grey.withOpacity(0.15),
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.translucent,
        child: Container(
          width: width,
          height: 30,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Center(
                  child: Text(
                    text.isEmpty ? '-' : text,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color:
                          isCalendar ? AppColors.textPrimary : AppColors.black,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ),
              const Icon(
                Iconsax.arrow_down_1,
                size: 16,
                color: AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
