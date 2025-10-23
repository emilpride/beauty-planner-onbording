import 'package:beautymirror/features/personalization/controllers/user_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/backgrounds/soft_eclipse_blur_background.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../controllers/onboarding/onboarding_controller.dart';
import 'screens/contract_screen.dart';
import 'screens/progress_step.dart';
import 'screens/reminders_step.dart';

class OnboardingScreen2 extends StatelessWidget {
  const OnboardingScreen2({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.put(OnboardingController());
    final size = MediaQuery.of(context).size;

    return PopScope(
      canPop: false, // Prevent default pop behavior
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return; // If already popped, don't handle again
        _handleBackNavigation(controller);
      },
      child: Scaffold(
        appBar:
            controller.currentPage2.value > 0
                ? BMAppbar(
                  title: '',
                  onBackPressed: () {
                    if (controller.currentPage2.value > 0) {
                      controller.currentPage2.value--;
                    } else {
                      Get.back();
                    }
                  },
                )
                : null,
        backgroundColor: const Color(0xFFF0F4FF), // A light background color
        body: Obx(() {
          Text(controller.currentPage2.value.toString());
          return Stack(
            children: [
              // AppBar positioned at the top
              if (controller.currentPage2.value == 1)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: SizedBox(
                    height:
                        MediaQuery.of(context).size.height *
                        0.45, // 45% of screen height
                    child: CustomPaint(painter: SoftEllipsePainter()),
                  ),
                ),

              // TOP IMAGE (Avatar)
              AnimatedPositioned(
                duration: const Duration(milliseconds: 500),
                curve: Curves.fastOutSlowIn,
                top: size.height * 0.11,
                left: 0,
                right: 0,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 400),
                  opacity: controller.isReady.value ? 1.0 : 0.0,
                  child: showImageOrLottieAnimation(size),
                ),
              ),

              // BOTTOM CARD
              AnimatedPositioned(
                duration: const Duration(milliseconds: 400),
                curve: Curves.fastOutSlowIn,
                bottom: controller.isReady.value ? 10 : -size.height,
                left: 0,
                right: 0,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.fastOutSlowIn,
                  height:
                      controller.currentPage2.value == 0
                          ? size.height * 0.85
                          : controller.currentPage2.value == 1
                          ? size.height * 0.55
                          : size.height * 0.85,
                  padding: const EdgeInsets.only(
                    top: 24.0,
                    right: 16.0,
                    left: 16.0,
                    bottom: 12.0,
                  ),
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(16)),
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
                    child: _buildOnboardingStep(controller.currentPage2.value),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // Centralized back navigation logic
  void _handleBackNavigation(OnboardingController controller) {
    if (controller.currentPage2.value > 0) {
      controller.currentPage2.value--;
    } else {
      Get.back();
    }
  }

  String _getImageForPage(int page) {
    switch (page) {
      case 0:
        return ''; // Welcome
      case 1:
        return UserController.instance.user.value.assistant == 2
            ? AppImages.onboarding2Image2Ellie
            : AppImages.onboarding2Image2Max;
      case 2:
        return ''; // Goal

      default:
        return AppImages.onboardingImage1Ellie; // Default image
    }
  }

  Widget showImageOrLottieAnimation(Size size) {
    final controller = Get.find<OnboardingController>();
    final img = _getImageForPage(controller.currentPage2.value);
    if (img.isEmpty) {
      return const SizedBox.shrink(); // Return an empty widget if no image is set
    } else {
      return Image.asset(img, height: size.height * ((1 - 0.55) - 0.12));
    }
  }

  // Widget builder that returns the correct content for the current page
  Widget _buildOnboardingStep(int pageIndex) {
    switch (pageIndex) {
      case 0:
        return const ProgressScreen(key: ValueKey('Progress'));
      case 1:
        return const RemindersScreen(key: ValueKey('Reminders'));
      case 2:
        return const ContractScreen(key: ValueKey('Contract'));
      default:
        return const SizedBox.shrink();
    }
  }
}
