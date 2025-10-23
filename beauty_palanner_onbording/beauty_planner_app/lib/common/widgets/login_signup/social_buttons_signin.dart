import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../features/authentication/controllers/signup/signup_controller.dart';
import '../../../utils/constants/image_strings.dart';
import '../../../utils/constants/sizes.dart';

class SocialButtonsSignIn extends StatelessWidget {
  const SocialButtonsSignIn({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SignupController());
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children:
          Theme.of(context).platform == TargetPlatform.iOS
              ? appleSignIn(context, controller)
              : androidSignIn(context, controller),
    );
  }

  List<Widget> androidSignIn(
    BuildContext context,
    SignupController controller,
  ) {
    return [
      OutlinedButton(
        onPressed: () => controller.googleSignIn(),
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
      const SizedBox(height: AppSizes.spaceBtnItems / 2),
      OutlinedButton(
        onPressed: () => controller.facebookSignIn(),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Image(
              width: AppSizes.iconMd,
              height: AppSizes.iconMd,
              image: AssetImage(AppImages.facebook),
            ),
            Text(
              'Continue with Facebook',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(width: AppSizes.iconMd),
          ],
        ),
      ),
      const SizedBox(height: AppSizes.spaceBtnItems / 2),
      OutlinedButton(
        onPressed: () => controller.appleSignIn(),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Image(
              width: AppSizes.iconMd,
              height: AppSizes.iconMd,
              image: AssetImage(AppImages.apple),
            ),
            Text(
              'Continue with Apple',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(width: AppSizes.iconMd),
          ],
        ),
      ),
      const SizedBox(height: AppSizes.spaceBtnItems / 2),
    ];
  }

  List<Widget> appleSignIn(BuildContext context, SignupController controller) {
    return [
      OutlinedButton(
        onPressed: () => controller.appleSignIn(),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Image(
              width: AppSizes.iconMd,
              height: AppSizes.iconMd,
              image: AssetImage(AppImages.apple),
            ),
            Text(
              'Continue with Apple',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(width: AppSizes.iconMd),
          ],
        ),
      ),
      const SizedBox(height: AppSizes.spaceBtnItems / 2),
      OutlinedButton(
        onPressed: () => controller.googleSignIn(),
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
      const SizedBox(height: AppSizes.spaceBtnItems / 2),
      OutlinedButton(
        onPressed: () => controller.facebookSignIn(),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Image(
              width: AppSizes.iconMd,
              height: AppSizes.iconMd,
              image: AssetImage(AppImages.facebook),
            ),
            Text(
              'Continue with Facebook',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(width: AppSizes.iconMd),
          ],
        ),
      ),
      const SizedBox(height: AppSizes.spaceBtnItems),
    ];
  }
}
