import 'package:flutter/foundation.dart' show kIsWeb;

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../common/widgets/login_signup/form_divider.dart';
import '../../../../../common/widgets/login_signup/social_buttons_login.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../../../utils/validators/validation.dart';
import '../../../controllers/login/login_controller.dart';
import '../../password_config/forgot_password.dart';
import '../../signup/widgets/privacy_policy_screen.dart';
import '../../signup/widgets/term_conditions_screen.dart';

class LoginForm extends StatelessWidget {
  const LoginForm({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = LoginController.instance;
    return RoundedContainer(
      padding: const EdgeInsets.all(AppSizes.md),
      backgroundColor: Colors.white,
      child: Form(
        key: controller.loginFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Welcome Back!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(height: AppSizes.xs),
            Text(
              'Sign in to access your personalized Activity tracking experience.',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.black.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: AppSizes.spaceBtnItems),
            //email field
            Text(
              ' Email',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(height: AppSizes.xs),
            TextFormField(
              controller: controller.email,
              validator: (value) => MyValidator.validateEmail(value),
              decoration: InputDecoration(
                hintText: 'Email',
                hintStyle: const TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w400,
                ),
                prefixIcon: Padding(
                  padding: const EdgeInsets.all(14),
                  child: SvgPicture.asset(
                    AppImages.email,
                    height: 18,
                    width: 18,
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSizes.spaceBtnInputFields),

            Text(
              ' Password',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(height: AppSizes.xs),
            //password field
            Obx(
              () => TextFormField(
                controller: controller.password,
                validator:
                    (value) => MyValidator.validateEmptyText('Password', value),
                obscureText: controller.hidePassword.value,
                decoration: InputDecoration(
                  hintText: 'Password',
                  hintStyle: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w400,
                  ),
                  prefixIcon: Padding(
                    padding: const EdgeInsets.all(13),
                    child: SvgPicture.asset(
                      AppImages.lock,
                      height: 18,
                      width: 18,
                    ),
                  ),
                  suffixIcon: SizedBox(
                    child: GestureDetector(
                      onTap:
                          () =>
                              controller.hidePassword.value =
                                  !controller.hidePassword.value,
                      child: Icon(
                        size: 20,
                        color: AppColors.textSecondary,
                        controller.hidePassword.value
                            ? Iconsax.eye
                            : Iconsax.eye_slash,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: AppSizes.spaceBtnSections),

            //Sign In
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  FocusScope.of(context).unfocus();
                  controller.emailSignIn();
                },
                child: const Text('Sign In'),
              ),
            ),
            const SizedBox(height: AppSizes.spaceBtnItems),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () => Get.to(() => const ForgotPassword()),
                  child: Text(
                    'Forgot Password',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.spaceBtnItems),

            //Divider
            const FormDivider(dividerText: "or"),
            const SizedBox(height: AppSizes.spaceBtnItems),
            // social buttons
            const SocialButtonsLogin(),
            const SizedBox(height: AppSizes.spaceBtnItems),

            //signup
            Text.rich(
              textAlign: TextAlign.center,
              TextSpan(
                children: [
                  const TextSpan(
                    text: "By proceeding, you agree with the ",
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  TextSpan(
                    text: "Terms of Use",
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () async {
                        if (kIsWeb) {
                          final url = Uri.parse("https://beautymirror.app/terms");
                          if (await canLaunchUrl(url)) {
                            await launchUrl(url);
                          }
                        } else {
                          Get.to(() => const TermConditionsScreen());
                        }
                      },
                  ),
                  const TextSpan(
                    text: " and ",
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  TextSpan(
                    text: "Privacy Policy",
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                    recognizer: TapGestureRecognizer()
                      ..onTap = () async {
                        if (kIsWeb) {
                          final url = Uri.parse("https://beautymirror.app/privacy");
                          if (await canLaunchUrl(url)) {
                            await launchUrl(url);
                          }
                        } else {
                          Get.to(() => const PrivacyPolicyScreen());
                        }
                      },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
