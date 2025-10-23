import 'package:flutter/material.dart';

import '../../../utils/constants/colors.dart';
import '../../../utils/helpers/helper_functions.dart';

class FormDivider extends StatelessWidget {
  const FormDivider({super.key, required this.dividerText});
  final String dividerText;
  @override
  Widget build(BuildContext context) {
    final dark = MyHelperFunctions.isDarkMode(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Flexible(
          child: Divider(
            color: AppColors.darkGrey,
            thickness: 0.5,
            indent: 20,
            endIndent: 10,
          ),
        ),
        Text(
          dividerText,
          style: const TextStyle(
            color: AppColors.darkGrey,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Flexible(
          child: Divider(
            color: AppColors.darkGrey,
            thickness: 0.5,
            indent: 10,
            endIndent: 20,
          ),
        ),
      ],
    );
  }
}
