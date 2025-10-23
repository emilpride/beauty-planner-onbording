import 'package:flutter/material.dart';

import '../../../features/authentication/controllers/login/login_controller.dart';
import '../../../utils/constants/image_strings.dart';
import '../../../utils/constants/sizes.dart';

class SocialButtonsLogin extends StatelessWidget {
  const SocialButtonsLogin({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = LoginController.instance;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        OutlinedButton(
          onPressed: () => controller.googleLogIn(),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Image(
                width: AppSizes.iconMd,
                height: AppSizes.iconMd,
                image: AssetImage(AppImages.google),
              ),
              Text(
                'Continue with Google',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(width: AppSizes.iconMd),
            ],
          ),
        ),
      ],
    );
  }
}
