import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../authentication/screens/onboarding/widgets/animated_score_circle.dart';
import '../../../personalization/controllers/ai_analysis_controller.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../subscription/subscription_screen.dart';
import 'widgets/improvement_timeline.dart';
import 'widgets/review_carousel.dart';

class ResultScreen extends StatelessWidget {
  const ResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: Column(
        children: [
          const SizedBox(height: AppSizes.xl),
          AnimatedContainer(
            duration: const Duration(milliseconds: 600),
            curve: Curves.fastOutSlowIn,
            height: size.height * 0.93,
            padding: const EdgeInsets.only(top: 0, right: 12.0, left: 12.0),
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
              child: const ResultContent(),
            ),
          ),
        ],
      ),
    );
  }
}

class ResultContent extends StatelessWidget {
  const ResultContent({super.key});

  @override
  Widget build(BuildContext context) {
    // final controller = OnboardingController.instance;
    final gender = UserController.instance.user.value.gender;
    final controller = AIAnalysisController.instance;

    final double withApp =
        controller.aiAnalysis.value.bmsScore +
        (controller.aiAnalysis.value.bmsScore != 0
            ? controller.aiAnalysis.value.bmsScore * 0.3
            : 3);
    final double withoutApp =
        controller.aiAnalysis.value.bmsScore +
        (controller.aiAnalysis.value.bmsScore != 0
            ? controller.aiAnalysis.value.bmsScore * 0.1
            : 1);
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            'Regular Care = Better Results!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSizes.md),
          const Text(
            'On average, our users improve their well-being by 30% within the first month!',
            textAlign: TextAlign.start,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSizes.md),
          RoundedContainer(
            backgroundColor: AppColors.primary.withOpacity(0.2),
            // margin: const EdgeInsets.symmetric(horizontal: AppSizes.md),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: SizedBox(
              height: 280,
              width: 350,
              child: Stack(
                children: [
                  Image.asset(AppImages.graph),
                  Positioned(
                    bottom: 70,
                    child: AnimatedScoreCircle(
                      score: controller.aiAnalysis.value.bmsScore,
                      maxScore: 10,
                    ),
                  ),
                  Positioned(
                    bottom: 80,
                    right: 7,
                    child: AnimatedScoreCircle(
                      score: withoutApp > 10 ? 10 : withoutApp,
                      maxScore: 10,
                    ),
                  ),
                  Positioned(
                    top: 15,
                    right: 7,
                    child: AnimatedScoreCircle(
                      score: withApp > 10 ? 10 : withApp,
                      maxScore: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSizes.md),
          RoundedContainer(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Stack(
                children: [
                  Image.asset(AppImages.improvementArrow),
                  Positioned(
                    top: 30,
                    left: 10,
                    child: Image.asset(
                      _getBmiImage(
                        gender: gender,
                        bmi: controller.aiAnalysis.value.bmi,
                      ),
                      height: 250,
                    ),
                  ),
                  Positioned(
                    top: 30,
                    right: 10,
                    child: Image.asset(
                      _getBmiImage(gender: gender, bmi: 15.0),
                      height: 250,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSizes.md),
          const Text(
            'The more consistently you follow your routine, the better your beauty level becomes. See the difference for yourself!',
            textAlign: TextAlign.start,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSizes.spaceBtnSections),
          const Text(
            'Noticeable Improvements in One Month:',
            textAlign: TextAlign.start,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSizes.spaceBtnSections),
          const ImprovementTimeline(),
          const SizedBox(height: AppSizes.md * 1.5),

          const Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [Negatives(), SizedBox(width: AppSizes.sm), Positives()],
          ),
          const SizedBox(height: AppSizes.spaceBtnSections),
          const ReviewCarousel(),
          const SizedBox(height: AppSizes.spaceBtnSections),
          SizedBox(
            height: 50,
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(padding: EdgeInsets.zero),
              onPressed: () => Get.to(() => const SubscriptionScreen()),
              child: const Text(
                'Price Plans',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
              ),
            ),
          ),
          const SizedBox(height: AppSizes.md),
        ],
      ),
    );
  }
}

String _getBmiImage({required int gender, required double bmi}) {
  switch (bmi) {
    case < 16.0:
      return gender == 1 ? AppImages.bmiMale1 : AppImages.bmiFemale1;
    case < 18.5:
      return gender == 1 ? AppImages.bmiMale2 : AppImages.bmiFemale2;
    case < 25.0:
      return gender == 1 ? AppImages.bmiMale3 : AppImages.bmiFemale3;
    case < 30.0:
      return gender == 1 ? AppImages.bmiMale4 : AppImages.bmiFemale4;
    case <= 40.0 || >= 40:
      return gender == 1 ? AppImages.bmiMale5 : AppImages.bmiFemale5;
    default:
      return gender == 0 ? AppImages.bmiMale1 : AppImages.bmiFemale1;
  }
}

class Positives extends StatelessWidget {
  const Positives({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: RoundedContainer(
        backgroundColor: AppColors.primary.withOpacity(0.2),
        padding: const EdgeInsets.all(AppSizes.sm),
        child: Column(
          children: [
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: SvgPicture.asset(
                      AppImages.tick,
                      color: AppColors.white,
                    ),
                  ),
                ),
                const SizedBox(width: AppSizes.spaceBtnItems),
                const Flexible(
                  child: Text(
                    'Follow a structured beauty & wellness routine effortlessly',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.sm),
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: SvgPicture.asset(
                      AppImages.tick,
                      color: AppColors.white,
                    ),
                  ),
                ),
                const SizedBox(width: AppSizes.spaceBtnItems),
                const Flexible(
                  child: Text(
                    'Get reminders to keep up with your personalized plan',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.sm),
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: SvgPicture.asset(
                      AppImages.tick,
                      color: AppColors.white,
                    ),
                  ),
                ),
                const SizedBox(width: AppSizes.spaceBtnItems),
                const Flexible(
                  child: Text(
                    'See your completed routines and progress over time',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.sm),
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Padding(
                    padding: const EdgeInsets.all(4.0),
                    child: SvgPicture.asset(
                      AppImages.tick,
                      color: AppColors.white,
                    ),
                  ),
                ),
                const SizedBox(width: AppSizes.spaceBtnItems),
                const Flexible(
                  child: Text(
                    'Unlock achievements and stay inspired',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class Negatives extends StatelessWidget {
  const Negatives({super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: RoundedContainer(
        padding: const EdgeInsets.all(AppSizes.sm),
        backgroundColor: AppColors.primary.withOpacity(0.05),
        child: const Column(
          children: [
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Icon(Iconsax.minus, color: AppColors.white, size: 18),
                ),
                SizedBox(width: AppSizes.spaceBtnItems),
                Flexible(
                  child: Text(
                    'Struggle to stay consistent with self-care',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: AppSizes.sm),
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Icon(Iconsax.minus, color: AppColors.white, size: 18),
                ),
                SizedBox(width: AppSizes.spaceBtnItems),
                Flexible(
                  child: Text(
                    'Forget important skincare, haircare, or wellness steps',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: AppSizes.sm),
            Row(
              children: [
                RoundedContainer(
                  height: 24,
                  width: 24,
                  radius: 100,
                  backgroundColor: AppColors.primary,
                  child: Icon(Iconsax.minus, color: AppColors.white, size: 18),
                ),
                SizedBox(width: AppSizes.spaceBtnItems),
                Flexible(
                  child: Text(
                    'No clear way to track your beauty habits',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.black,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
