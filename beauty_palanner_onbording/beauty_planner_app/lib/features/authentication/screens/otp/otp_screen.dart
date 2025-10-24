import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pinput/pinput.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../utils/constants/colors.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../controllers/otp/otp_controller.dart';
import '../schedule_screen/create_schedule_screen.dart';

class OtpScreen extends GetView<OtpController> {
  // The email should be passed from the previous screen, e.g., using Get.toNamed

  const OtpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 75,
      height: 70,
      textStyle: const TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
      ),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.transparent),
      ),
    );

    return Scaffold(
      appBar: const BMAppbar(title: 'Activation code', showBackButton: false),
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 32),
            AnimatedContainer(
              duration: const Duration(milliseconds: 600),
              curve: Curves.fastOutSlowIn,
              // height: size.height * controller.currentCardHeight,
              padding: const EdgeInsets.only(
                top: 24.0,
                right: 16.0,
                left: 16.0,
                bottom: 24.0,
              ),
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(16.0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 30,
                    offset: Offset(0, -10),
                  ),
                ],
              ),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 400),
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.0, 0.3),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Enter Activation code',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 15),
                    const Text(
                      'We have sent the activation code to the email address you provided. Enter this code to continue.',
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Pinput(
                      length: 4,
                      defaultPinTheme: defaultPinTheme,
                      focusedPinTheme: defaultPinTheme.copyWith(
                        decoration: defaultPinTheme.decoration!.copyWith(
                          border: Border.all(color: AppColors.primary),
                        ),
                      ),
                      onCompleted: (pin) => controller.otp.value = pin,
                    ),
                    const SizedBox(height: 24),
                    Obx(
                      () => Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              textAlign: TextAlign.center,
                              controller.countdown.value > 0
                                  ? 'You can resend the code in ${controller.countdown.value} seconds'
                                  : 'You can now resend the code',
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Obx(
                      () => SizedBox(
                        width: double.infinity,
                        child: Opacity(
                          opacity: controller.otp.value.length == 4 ? 1.0 : 0.6,
                          child: ElevatedButton(
                            onPressed: () {
                              log(controller.otp.value);
                              if (controller.otp.value.length == 4) {
                                controller.verifyEmailOtp(
                                  UserController.instance.user.value.email,
                                );
                                Get.offAll(
                                  () => const CreateScheduleScreen(),
                                  transition: Transition.rightToLeft,
                                  duration: const Duration(milliseconds: 300),
                                );
                              } else {
                                Get.snackbar(
                                  'Error',
                                  'Please enter a valid 4-digit OTP code.',
                                  snackPosition: SnackPosition.BOTTOM,
                                  backgroundColor: Colors.red.withOpacity(0.8),
                                  colorText: Colors.white,
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              minimumSize: const Size(double.infinity, 45),
                              maximumSize: const Size(double.infinity, 45),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              "Enter",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: () {
                            controller.resendOtp(
                              UserController.instance.user.value.email,
                            );
                          },
                          child: const Text(
                            'Resend code',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
