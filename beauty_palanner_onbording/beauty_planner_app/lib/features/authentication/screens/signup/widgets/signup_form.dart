
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../../../utils/validators/validation.dart';
import '../../../controllers/signup/signup_controller.dart';
import '../../login/login.dart';

class SignupForm extends StatelessWidget {
  const SignupForm({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = SignupController.instance;
    return Form(
      key: controller.signUPFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Join Beauty Mirror Today ',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: AppSizes.sm),
          Text(
            'Start your Activity journey with Beauty Mirror. It\'s quick, easy, and free!',
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
                child: SvgPicture.asset(AppImages.email, height: 18, width: 18),
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
              validator: (value) => MyValidator.validatePassword(value),
              obscureText: controller.hidePassword.value,
              onChanged: (value) {
                controller.checkPasswordRequirements(value);
              },
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

          Obx(
            () =>
                controller.showPasswordRequirements.value
                    ? AnimatedOpacity(
                      opacity:
                          1, //controller.showPasswordRequirements.value ? 1.0 : 0.0,
                      duration: const Duration(milliseconds: 300),
                      curve: Curves.easeInOut,
                      child: Wrap(
                        spacing: 8.0,
                        runSpacing: 4.0,
                        children:
                            controller.passwordRequirements.map((requirement) {
                              return passwordRequirementChip(
                                label: requirement.label,
                                met: requirement.met,
                                backgroundColor:
                                    requirement.backgroundColor.value,
                                color: requirement.color.value,
                              );
                            }).toList(),
                      ),
                    )
                    : const SizedBox.shrink(),
          ),

          const SizedBox(height: AppSizes.spaceBtnInputFields),

          Text(
            ' Confirm Password',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).primaryColor,
            ),
          ),
          const SizedBox(height: AppSizes.xs),

          //Confirm Password
          Obx(
            () => TextFormField(
              validator: (value) {
                //check if it matches the first password
                if (value != controller.password.text) {
                  return 'Passwords do not match';
                }
                return null; // Return null if validation passes
              },
              controller: controller.rePassword,
              obscureText: controller.hidePassword.value,
              decoration: InputDecoration(
                hintText: 'Confirm Password',
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
                suffixIcon: GestureDetector(
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

          const SizedBox(height: AppSizes.spaceBtnSections),

          //Sign In
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                FocusScope.of(context).unfocus();
                controller.emailSignUp();
              },
              child: const Text('Sign Up'),
            ),
          ),

          const SizedBox(height: AppSizes.spaceBtnItems),

          //Divider
          // const FormDivider(dividerText: "or"),
          // const SizedBox(height: AppSizes.spaceBtnItems),
          //social buttons
          // const SocialButtonsLogin(),
          // const SizedBox(height: AppSizes.spaceBtnItems),
          const SizedBox(height: AppSizes.spaceBtnItems),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text.rich(
                textAlign: TextAlign.center,
                TextSpan(
                  children: [
                    const TextSpan(
                      text: "Already have an account? ",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Colors.black,
                      ),
                    ),
                    TextSpan(
                      text: "Sign in",
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primary,
                      ),
                      recognizer:
                          TapGestureRecognizer()
                            ..onTap = () {
                              Get.to(() => const LoginScreen());
                            },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget passwordRequirementChip({
    required String label,
    required RxBool met,
    required Color backgroundColor,
    required Color color,
  }) {
    return RoundedContainer(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      margin: const EdgeInsets.only(top: AppSizes.sm),
      radius: 12,
      // height: 32,
      backgroundColor: backgroundColor,
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }
}
