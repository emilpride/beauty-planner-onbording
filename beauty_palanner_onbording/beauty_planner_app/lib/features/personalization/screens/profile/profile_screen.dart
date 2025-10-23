import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controllers/achiements_controller.dart';
import '../../controllers/upload_dummy_data_controller.dart';
import 'achievements.dart';
import 'app_appearance.dart';
import 'help_and_support.dart';
import 'linked_accounts.dart';
import 'widgets/profile_option_tile.dart';
import 'widgets/profile_options.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final achievementController = Get.find<AchievementController>();
    final dummyDataController = Get.put(UploadDummyDataController());
    return Scaffold(
      appBar: const BMAppbar(title: 'Account', showBackButton: false),
      backgroundColor: AppColors.light,
      extendBodyBehindAppBar: true,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
          child: Column(
            children: [
              const SizedBox(height: 130),
              // --- ACHIEVEMENTS BANNER ---
              GestureDetector(
                onTap: () => Get.to(() => const AchievementsScreen()),
                child: RoundedContainer(
                  padding: const EdgeInsets.all(AppSizes.md),
                  backgroundColor: AppColors.white,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Row(
                          children: [
                            Image.asset(
                              "assets/images/achievements/level_${achievementController.progress.value.currentLevel}.png",
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Level ${achievementController.progress.value.currentLevel}',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'You are a rising star! Keep going!',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Iconsax.arrow_right_3,
                        size: 18,
                        weight: 2,
                        color: Color(0xFF907FB1),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSizes.defaultSpace),
              const ProfileOptions(),
              const SizedBox(height: AppSizes.defaultSpace),
              RoundedContainer(
                padding: const EdgeInsets.all(AppSizes.md),
                backgroundColor: AppColors.white,
                child: Column(
                  children: [
                    ProfileOptionTile(
                      title: 'Linked Accounts',
                      icon: AppImages.linkedAccounts,
                      onTap: () => Get.to(() => const LinkedAccounts()),
                    ),
                    ProfileOptionTile(
                      title: 'App Appearance',
                      icon: AppImages.appearance,
                      onTap: () => Get.to(() => const AppAppearance()),
                    ),
                    ProfileOptionTile(
                      title: 'Help & Support',
                      icon: AppImages.support,
                      onTap: () => Get.to(() => const HelpAndSupport()),
                    ),
                    GestureDetector(
                      behavior: HitTestBehavior.translucent,
                      onTap: () => showLogoutDialog(),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 4,
                        ),
                        child: Row(
                          children: [
                            SvgPicture.asset(AppImages.logout, width: 24),
                            const SizedBox(width: 8),
                            const Text(
                              'Logout',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.error,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSizes.defaultSpace),
              RoundedContainer(
                padding: const EdgeInsets.all(AppSizes.md),
                backgroundColor: AppColors.white,
                child: Column(
                  children: [
                    ProfileOptionTile(
                      title: 'Upload Dummy Data',
                      icon: AppImages.support,
                      onTap: () {
                        dummyDataController.uploadDummyData();
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 64),
            ],
          ),
        ),
      ),
    );
  }

  void showLogoutDialog() {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          width: Get.width,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // --- DIALOG HEADER ---
              const Text(
                'Please Confirm',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                textAlign: TextAlign.center,
                'Are you sure you want to log out?',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppColors.black,
                ),
              ),
              const SizedBox(height: 32),
              // --- DIALOG BUTTONS ---
              SizedBox(
                height: 45,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    AuthenticationRepository.instance.logout();
                    Get.back();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size(double.infinity, 45),
                    maximumSize: const Size(double.infinity, 45),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Logout',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 45,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Get.back();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEDEAFF),
                    minimumSize: const Size(double.infinity, 45),
                    maximumSize: const Size(double.infinity, 45),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
