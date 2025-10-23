import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/common/widgets/custom_shapes/containers/rounded_container.dart';
import 'package:beautymirror/utils/constants/colors.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';

import '../../../../utils/constants/image_strings.dart';
import '../../controllers/achiements_controller.dart';
import '../../models/achievement_model.dart';

class AchievementsScreen extends GetView<AchievementController> {
  const AchievementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Sync with Firestore when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.syncWithFirestore();
      controller.checkAndShowLevelUpDialog();
    });

    return Scaffold(
      backgroundColor: AppColors.light,
      appBar: const BMAppbar(title: 'Achievements'),
      extendBodyBehindAppBar: true,
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final achievements = controller.getAchievementsWithStatus();
        final progress = controller.progress.value;

        return Stack(
          alignment: Alignment.topCenter,
          children: [
            Image.asset(AppImages.homeIllustration),
            RefreshIndicator(
              onRefresh: controller.refreshProgress,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    const SizedBox(height: 130),

                    // Current Level Badge
                    _buildCurrentLevelBadge(progress),

                    // Achievement Grid
                    RoundedContainer(
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 32,
                      ),
                      backgroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 24,
                      ),
                      child: GridView.builder(
                        padding: const EdgeInsets.all(0),
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3,
                              childAspectRatio: 0.7,
                              crossAxisSpacing: 0,
                              mainAxisSpacing: 0,
                            ),
                        itemCount: achievements.length,
                        itemBuilder: (context, index) {
                          return _buildAchievementItem(achievements[index]);
                        },
                      ),
                    ),

                    const SizedBox(height: 64),
                  ],
                ),
              ),
            ),

            // Level Up Dialog
            if (controller.showLevelUpDialog.value)
              _buildLevelUpDialog(context),
          ],
        );
      }),
    );
  }

  Widget _buildCurrentLevelBadge(AchievementProgress progress) {
    return Column(
      children: [
        Image.asset(
          height: 180,
          width: 180,
          "assets/images/achievements/level_${progress.currentLevel}.png",
        ),

        const SizedBox(height: 12),

        Text(
          'Level ${progress.currentLevel}',
          style: const TextStyle(
            fontSize: 32,
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),

        const SizedBox(height: 8),

        Text(
          'You\'ve completed ${progress.totalCompletedActivities} Activities!',
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w400,
            fontSize: 18,
          ),
        ),
      ],
    );
  }

  Widget _buildAchievementItem(AchievementLevel achievement) {
    final size = achievement.level <= 3 && achievement.isUnlocked ? 60.0 : 80.0;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Badge
        SizedBox(
          width: size,
          height: size,
          child: Center(
            child:
                achievement.isUnlocked
                    ? Image.asset(
                      "assets/images/achievements/level_${achievement.level}.png",
                      fit: BoxFit.contain,
                    )
                    : Image.asset(AppImages.levelLocked, fit: BoxFit.contain),
          ),
        ),

        const SizedBox(height: 8),

        Text(
          achievement.title,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Color(0xFF6B5CA5),
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),

        const SizedBox(height: 4),

        Text(
          controller.progress.value.currentLevel == achievement.level
              ? 'Your current level'
              : achievement.isUnlocked
              ? 'You\'ve passed this level'
              : "Pass ${achievement.requiredActivities} Activities!",
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: const Color(0xFF6B5CA5).withOpacity(0.6),
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  Widget _buildLevelUpDialog(BuildContext context) {
    final level = controller.pendingLevelUp.value;
    final achievement = AchievementLevel.getByLevel(level);

    return Container(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.only(
            left: 16,
            right: 16,
            bottom: 24,
            top: 0,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Stack(
            alignment: Alignment.topCenter,
            children: [
              LottieBuilder.asset(AppImages.congratulationsAnimation),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 48),
                  Image.asset(
                    height: 180,
                    width: 180,
                    "assets/images/achievements/level_${achievement?.level}.png",
                  ),
                  const SizedBox(height: 30),

                  Text(
                    'You\'ve Reached Level $level!',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(
                    'Congratulations! You\'ve taken a whopping ${controller.progress.value.totalCompletedActivities} Activities. Keep up the incredible effort!',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w500,
                      fontSize: 16,
                    ),
                  ),

                  const SizedBox(height: 30),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: controller.dismissLevelUpDialog,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'OK',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
