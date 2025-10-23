import 'package:flutter/material.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';

class LoginHeader extends StatelessWidget {
  const LoginHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: AppSizes.spaceBtnSections),
        Image.asset(AppImages.lightAppLogo, height: 128, width: 128),
        const SizedBox(height: AppSizes.spaceBtnSections),
      ],
    );
  }
}
