import 'package:flutter/material.dart';

import '../custom_shapes/curved_shapes/custom_progress_indicator.dart';
import '../../../utils/constants/colors.dart';

class ProgressDialog extends StatelessWidget {
  const ProgressDialog({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
      elevation: 0,
      backgroundColor: Colors.transparent,
      child: Container(
        height: 170.0,
        padding: const EdgeInsets.all(24.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Circular Progress Indicator
            const SizedBox(
              width: 60,
              height: 60,

              child: CustomRoundedProgressIndicator(
                color: AppColors.textPrimary,
                strokeWidth: 6.0,
                value: 0, // Indeterminate
              ),
            ),
            const SizedBox(height: 24.0),
            // "Analysing..." Text
            Text(
              title,
              style: const TextStyle(
                fontSize: 16.0,
                fontWeight: FontWeight.w500,
                color: Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
