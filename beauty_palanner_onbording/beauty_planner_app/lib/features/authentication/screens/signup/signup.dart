import 'dart:io';

import 'package:beautymirror/common/widgets/custom_shapes/containers/rounded_container.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controllers/signup/signup_controller.dart';
import 'widgets/privacy_policy_screen.dart';
import 'widgets/signup_form.dart';
import 'widgets/term_conditions_screen.dart';

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(SignupController());
    return Scaffold(
      appBar: const BMAppbar(title: "Sign Up"),
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: AppSizes.spaceBtnSections),
              Image.asset(AppImages.lightAppLogo, height: 128, width: 128),
              const SizedBox(height: AppSizes.spaceBtnSections),

              RoundedContainer(
                padding: const EdgeInsets.all(AppSizes.md),
                child: Column(
                  children: [
                    const SignupForm(),
                    const SizedBox(height: AppSizes.spaceBtnSections),

                    //divider
                    // const FormDivider(dividerText: 'or'),
                    // const SizedBox(height: AppSizes.spaceBtnSections),
                    // const SocialButtonsSignIn(),
                    // const SizedBox(height: AppSizes.spaceBtnSections),

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
                            recognizer:
                                TapGestureRecognizer()
                                  ..onTap =
                                      Platform.isAndroid
                                          ? () => Get.to(
                                            () => const TermConditionsScreen(),
                                          )
                                          : () async {
                                            final url = Uri.parse(
                                              "https://beautymirror.app/terms",
                                            );
                                            if (await canLaunchUrl(url)) {
                                              await launchUrl(url);
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
                            recognizer:
                                TapGestureRecognizer()
                                  ..onTap =
                                      Platform.isAndroid
                                          ? () => Get.to(
                                            () => const PrivacyPolicyScreen(),
                                          )
                                          : () async {
                                            final url = Uri.parse(
                                              "https://beautymirror.app/privacy",
                                            );
                                            if (await canLaunchUrl(url)) {
                                              await launchUrl(url);
                                            }
                                          },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              //form
            ],
          ),
        ),
      ),
    );
  }
}
