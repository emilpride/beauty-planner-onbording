import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

import '../../../../common/widgets/backgrounds/soft_eclipse_blur_background.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../controllers/onboarding/onboarding_controller.dart';
import 'quiz/activity_frequency_step.dart';
import 'ai_results.dart';
import 'quiz/analysis_info_step.dart';
import 'quiz/congratulations_step.dart';
import 'quiz/diet_step.dart';
import 'quiz/end_day_step.dart';
import 'quiz/energy_level_step.dart';
import 'quiz/excited_step.dart';
import 'quiz/focus_step.dart';
import 'quiz/gender_step.dart';
import 'quiz/general_step.dart';
import 'quiz/goal_step.dart';
import 'quiz/hair_problems_step.dart';
import 'quiz/hair_type_step.dart';
import 'quiz/influence_step.dart';
import 'quiz/lifestyle_step.dart';
import 'quiz/mood_step.dart';
import 'quiz/photo_upload_step.dart';
import 'quiz/physical_activity_step.dart';
import 'quiz/privacy_step.dart';
import 'quiz/procrastination_step.dart';
import 'quiz/skin_problems_steps.dart';
import 'quiz/skin_type_step.dart';
import 'quiz/sleep_step.dart';
import 'quiz/statistic_step.dart';
import 'quiz/stress_step.dart';
import 'quiz/wake_up_step.dart';
import 'quiz/welcome_step.dart';
import 'quiz/work_environment_step.dart';
import 'widgets/onboarding_appbar.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = OnboardingController.instance;
    final size = MediaQuery.of(context).size;

    return PopScope(
      canPop: false, // Prevent default pop behavior
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return; // If already popped, don't handle again
        _handleBackNavigation(controller);
      },
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        backgroundColor: const Color(0xFFF0F4FF), // A light background color
        body: Obx(() {
          Text(controller.x.value.toString());
          return Stack(
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
              // Content area (bottom card or full screen step)
              if (controller.currentPage.value < 26) ...[
                // TOP IMAGE (Avatar)
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.fastOutSlowIn,
                  top: size.height * 0.13,
                  left: 0,
                  right: 0,
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 300),
                    opacity: controller.isReady.value ? 1.0 : 0.0,
                    child: showImageOrLottieAnimation(size),
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
                    height: size.height * controller.currentCardHeight,
                    padding: const EdgeInsets.only(
                      top: 0.0,
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
                      child: _buildOnboardingStep(controller.currentPage.value),
                    ),
                  ),
                ),
              ] else if (controller.currentPage.value >= 26 &&
                  controller.currentPage.value < 28) ...[
                // Full-screen step for later pages
                _buildOnboardingStep(controller.currentPage.value),
              ] else if (controller.currentPage.value == 28) ...[
                // AI Results Screen
                const ConditionAnalysisScreen(),
              ],

              // AppBar positioned at the top
              if (controller.currentPage.value <= 27)
                Positioned(
                  top: 55,
                  left: 0,
                  right: 0,
                  child: OnboardingAppbar(
                    onBackPressed: () {
                      if (controller.currentPage.value == 20 &&
                          !controller.userModel.value.physicalActivities.any(
                            (activity) => activity.isActive,
                          )) {
                        controller.currentPage.value = 18;
                      } else if (controller.currentPage.value > 0) {
                        controller.currentPage.value--;
                      } else {
                        Get.back(); // Go back to the previous screen if on the first page
                      }
                    },
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
    if (controller.currentPage.value == 20 &&
        !controller.userModel.value.physicalActivities.any(
          (activity) => activity.isActive,
        )) {
      controller.currentPage.value = 18;
    } else if (controller.currentPage.value > 0) {
      controller.currentPage.value--;
    } else {
      Get.back(); // Go back to the previous screen if on the first page
    }
  }

  String _getImageForPage(int page) {
    final int assistant =
        Get.find<OnboardingController>().userModel.value.assistant;
    switch (page) {
      case 0:
        return assistant == 2
            ? AppImages.onboardingImage1Ellie
            : AppImages.onboardingImage1Max; // Welcome
      case 1:
        return assistant == 2
            ? AppImages.onboardingImage2Ellie
            : AppImages.onboardingImage2Max; // Gender
      case 2:
        return assistant == 2
            ? AppImages.onboardingImage3Ellie
            : AppImages.onboardingImage3Max; // Goal
      case 3:
        return assistant == 2
            ? AppImages.onboardingImage4Ellie
            : AppImages.onboardingImage4Max; // Congratulations
      case 4:
        return assistant == 2
            ? AppImages.onboardingImage5Ellie
            : AppImages.chooseAssistantMax; // Excited
      case 5:
        return AppImages.onboardingImage6; // Statistic
      case 6:
        return assistant == 2
            ? AppImages.onboardingImage7Ellie
            : AppImages.onboardingImage7Max; // Privacy
      case 7: // Add this new case for the GeneralStep
        return AppImages.onboardingImage8;
      case 8:
        return assistant == 2
            ? AppImages.onboardingImage9Ellie
            : AppImages.onboardingImage9Max; // Lifestyle
      case 9:
        return assistant == 2
            ? AppImages.onboardingImage10Ellie
            : AppImages.onboardingImage10Max; // Sleep
      case 10:
        return assistant == 2
            ? AppImages.onboardingImage11Ellie
            : AppImages.onboardingImage11Max; // Wake Up
      case 11:
        return assistant == 2
            ? AppImages.onboardingImage12Ellie
            : AppImages.onboardingImage12Max; // End Day
      case 12:
        return assistant == 2
            ? AppImages.onboardingImage13Ellie
            : AppImages.onboardingImage13Max; // Stress
      case 13:
        return assistant == 2
            ? AppImages.onboardingImage14Ellie
            : AppImages.onboardingImage14Max; // Work
      case 14:
        return assistant == 2
            ? AppImages.onboardingImage15Ellie
            : AppImages.onboardingImage15Max; // Skin Type
      case 15:
        return assistant == 2
            ? AppImages.onboardingImage16Ellie
            : AppImages.onboardingImage16Max; // Skin Problems
      case 16:
        return assistant == 2
            ? AppImages.onboardingImage17Ellie
            : AppImages.onboardingImage17Max; // Hair Type
      case 17:
        return assistant == 2
            ? AppImages.onboardingImage18Ellie
            : AppImages.onboardingImage18Max; // Hair Problems
      case 18:
        return assistant == 2
            ? AppImages.onboardingImage19Ellie
            : AppImages.onboardingImage19Max; // Physical Activities
      case 19:
        return assistant == 2
            ? AppImages.onboardingImage20Ellie
            : AppImages.onboardingImage20Max; // Activity Frequency
      case 20:
        return assistant == 2
            ? AppImages.onboardingImage21Ellie
            : AppImages.onboardingImage21Max; // Diet
      case 21:
        return assistant == 2
            ? AppImages.onboardingImage22Ellie
            : AppImages.onboardingImage22Max; // Mood
      case 22:
        return assistant == 2
            ? AppImages.onboardingImage23Ellie
            : AppImages.onboardingImage23Max; // Energy Level
      case 23:
        return assistant == 2
            ? AppImages.onboardingImage24Ellie
            : AppImages.onboardingImage24Max; // Procrastination
      case 24:
        return assistant == 2
            ? AppImages.onboardingImage25Ellie
            : AppImages.onboardingImage25Max; // Focus
      case 25:
        return assistant == 2
            ? AppImages.onboardingImage26Ellie
            : AppImages.onboardingImage26Max; // Organization Influence
      case 26:
        return ''; // Analysis Intro
      case 27:
        return '';

      default:
        return AppImages.onboardingImage1Ellie; // Default image
    }
  }

  Widget showImageOrLottieAnimation(Size size) {
    final controller = Get.find<OnboardingController>();
    final img = _getImageForPage(controller.currentPage.value);
    if (img.endsWith('.json')) {
      return Lottie.asset(
        img,
        animate: true,
        repeat: false,
      ); // height: size.height * (1 - 0.2));
    } else if (img.isEmpty) {
      return const SizedBox.shrink(); // Return an empty widget if no image is set
    } else {
      return Image.asset(
        img,
        height: size.height * ((1 - controller.currentCardHeight) - 0.08),
      );
    }
  }

  // Widget builder that returns the correct content for the current page
  Widget _buildOnboardingStep(int pageIndex) {
    switch (pageIndex) {
      case 0:
        return const WelcomeStep(key: ValueKey('Welcome'));
      case 1:
        return const GenderStep(key: ValueKey('Gender'));
      case 2:
        return const GoalStep(key: ValueKey('Goal'));
      case 3:
        return const CongratulationsStep(key: ValueKey('Congratulations'));
      case 4:
        return const ExcitedStep(key: ValueKey('Excited'));
      case 5:
        return const StatisticStep(key: ValueKey('Statistic'));
      case 6:
        return const PrivacyStep(key: ValueKey('Privacy'));
      case 7: // Add this new case for the GeneralStep
        return const GeneralStep(key: ValueKey('General'));
      case 8:
        return const LifestyleStep(key: ValueKey('Lifestyle'));
      case 9:
        return const SleepStep(key: ValueKey('Sleep'));
      case 10:
        return const WakeUpStep(key: ValueKey('WakeUp'));
      case 11:
        return const EndDayStep(key: ValueKey('EndDay'));
      case 12:
        return const StressStep(key: ValueKey('Stress'));
      case 13:
        return const WorkEnvironmentStep(key: ValueKey('Work'));
      case 14:
        return const SkinTypeStep(key: ValueKey('SkinType'));
      case 15:
        return const SkinProblemsStep(key: ValueKey('SkinProblems'));
      case 16:
        return const HairTypeStep(key: ValueKey('HairType'));
      case 17:
        return const HairProblemsStep(key: ValueKey('HairProblems'));
      case 18:
        return const PhysicalActivitiesStep(
          key: ValueKey('PhysicalActivities'),
        );
      case 19:
        return const ActivityFrequencyStep(key: ValueKey('ActivityFrequency'));
      case 20:
        return const DietStep(key: ValueKey('Diet'));
      case 21:
        return const MoodStep(key: ValueKey('Mood'));
      case 22:
        return const EnergyLevelStep(key: ValueKey('EnergyLevel'));
      case 23:
        return const ProcrastinationStep(key: ValueKey('Procrastination'));
      case 24:
        return const FocusStep(key: ValueKey('Focus'));
      case 25:
        return const OrganizationInfluenceStep(
          key: ValueKey('OrganizationInfluence'),
        );
      case 26:
        return const AnalysisIntroStep(key: ValueKey('AnalysisIntro'));
      case 27:
        return const PhotoUploadStep(key: ValueKey('PhotoUpload'));
      case 28:
        return const ConditionAnalysisScreen(
          key: ValueKey('ConditionAnalysis'),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
