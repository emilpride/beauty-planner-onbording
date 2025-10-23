import 'package:flutter/material.dart';

import '../../../../../data/repositories/subscriptions/subscriptions_repository.dart';
import '../../../../../utils/constants/colors.dart';

class PromoCodeField extends StatelessWidget {
  final VoidCallback onApply;

  const PromoCodeField({super.key, required this.onApply});

  @override
  Widget build(BuildContext context) {
    final controller = SubscriptionsRepository.instance;
    return Form(
      key: controller.promoCodeFormKey,
      child: TextFormField(
        controller: controller.promoCodeController,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter a promo code';
          }
          return null;
        },
        style: const TextStyle(color: Colors.black), // Text input color
        decoration: InputDecoration(
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(
              color: AppColors.textSecondary,
              width: 1.5,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(
              color: AppColors.textSecondary,
              width: 1.5,
            ),
          ),
          hintText: 'Type promo code',
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: Colors.yellow, width: 1.5),
          ),
          errorStyle: const TextStyle(color: AppColors.primary),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: const BorderSide(color: Colors.yellow, width: 1.5),
          ),
          suffixIcon: Padding(
            padding: const EdgeInsets.only(
              right: 12.0,
            ), // Add some padding to the right of the button
            child: TextButton(
              onPressed: () => onApply(),
              style: TextButton.styleFrom(
                // foregroundColor: Colors.deepPurpleAccent, // "Apply" text color
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(
                    8.0,
                  ), // Slightly rounded button
                ),
              ),
              child: const Text(
                'Apply',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 16.0,
                ),
              ),
            ),
          ),
        ),
        onFieldSubmitted: (value) {
          // Allow applying by pressing enter/done on the keyboard
          onApply();
        },
      ),
    );
  }
}
