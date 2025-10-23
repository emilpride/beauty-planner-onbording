import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/features/authentication/screens/onboarding/onboarding.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../features/authentication/controllers/onboarding/onboarding_controller.dart';
import '../../../utils/constants/colors.dart';
import '../../../utils/constants/image_strings.dart';
import '../backgrounds/soft_eclipse_blur_background.dart';

class ChooseAssistant extends StatelessWidget {
  const ChooseAssistant({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.put(OnboardingController());
    final size = MediaQuery.of(context).size;
    return Scaffold(
      appBar: const BMAppbar(title: ''),
      backgroundColor: AppColors.light,
      body: Obx(
        () => Stack(
          children: [
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
            AnimatedPositioned(
              duration: const Duration(milliseconds: 500),
              curve: Curves.fastOutSlowIn,
              top: size.height * 0.005,
              left: 0,
              right: 0,
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: controller.isReady.value ? 1.0 : 0.0,
                child: Image.asset(
                  controller.userModel.value.assistant == 2
                      ? AppImages.chooseAssistantEllie
                      : AppImages.chooseAssistantMax,
                  height: size.height * 0.42,
                ),
              ),
            ),

            // BOTTOM CARD
            AnimatedPositioned(
              duration: const Duration(milliseconds: 800),
              curve: Curves.fastOutSlowIn,
              bottom: 30,
              left: 0,
              right: 0,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 500),
                curve: Curves.fastOutSlowIn,
                height: size.height * 0.42,
                padding: const EdgeInsets.only(
                  top: 8.0,
                  right: 16.0,
                  left: 16.0,
                  bottom: 12.0,
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
                    children: [
                      // Title
                      const Text(
                        'Choose your personal assistant',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),

                      const SizedBox(height: 24),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _assistantOption(
                                context,
                                AppImages.assistantMax,
                                'Max',
                                isSelected:
                                    controller.userModel.value.assistant == 1,
                              ),
                              _assistantOption(
                                context,
                                AppImages.assistantEllie,
                                'Ellie',
                                isSelected:
                                    controller.userModel.value.assistant == 2,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 50,
                        width: double.infinity,
                        child: Opacity(
                          opacity:
                              controller.userModel.value.assistant != 0
                                  ? 1.0
                                  : 0.6, // Adjust opacity based on condition
                          child: ElevatedButton(
                            onPressed: () {
                              if (controller.userModel.value.assistant != 0) {
                                Get.to(() => const OnboardingScreen());
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
                              'Next',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _assistantOption(
    BuildContext context,
    String imagePath,
    String label, {
    bool isSelected = false,
  }) {
    return GestureDetector(
      onTap: () {
        final controller = Get.find<OnboardingController>();
        controller.userModel.update((user) {
          user?.assistant = label == 'Max' ? 1 : 2;
        });
        controller.isReady.value = false;
        Future.delayed(const Duration(milliseconds: 100), () {
          controller.isReady.value = true;
        });
        controller.x.value++;
      },
      child: Container(
        // height: 110,
        // width: 110,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppColors.textPrimary : Colors.transparent,
            width: 2,
          ),
        ),

        child: Padding(
          padding: const EdgeInsets.all(2.0),
          child: Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color:
                  label == 'Max'
                      ? Colors.lightBlueAccent
                      : const Color(0xfffffc0f7),
            ),

            height: 128,
            width: 128,
            padding: const EdgeInsets.only(
              top: 4.0,
              left: 4.0,
              right: 4.0,
              bottom: 0,
            ),
            child: Stack(
              children: [
                Positioned(
                  bottom: -4,
                  child: Image.asset(
                    fit: BoxFit.cover,
                    imagePath,
                    height: 120,
                    width: 120,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
