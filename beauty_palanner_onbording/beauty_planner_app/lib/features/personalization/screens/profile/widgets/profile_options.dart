import 'package:flutter/foundation.dart' show kIsWeb;

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../../subscriptions/screens/subscription/subscription_screen.dart';
import '../../../controllers/user_controller.dart';
import '../account_and_security.dart';
import '../billing_and_subscriptions.dart';
import '../personal_info.dart';
import '../preferences.dart';
import 'profile_option_tile.dart';

class ProfileOptions extends StatelessWidget {
  const ProfileOptions({super.key});

  @override
  Widget build(BuildContext context) {
    final userController = UserController.instance;
    return RoundedContainer(
      padding: const EdgeInsets.all(AppSizes.md),
      backgroundColor: AppColors.white,
      child: Column(
        children: [
          ProfileOptionTile(
            title: 'Personal Info',
            icon: AppImages.profile,
            onTap: () => Get.to(() => const PersonalInfo()),
          ),
          ProfileOptionTile(
            title: 'Preferences',
            icon: AppImages.preferences,
            onTap: () => Get.to(() => const PreferencesScreen()),
          ),
          (!kIsWeb && GetPlatform.isAndroid &&
                  userController.user.value.id ==
                      '6eSHNDECwNgJH8iFqqsF8kAzJxI2')
              ? const SizedBox.shrink()
              : ProfileOptionTile(
                title: 'Billing & Subscriptions',
                icon: AppImages.star,
                onTap: () => Get.to(() => const BillingAndSubscriptions()),
              ),
          ProfileOptionTile(
            title: 'Account and Security',
            icon: AppImages.security,
            onTap: () => Get.to(() => const AccountAndSecurity()),
          ),
          if (!kIsWeb && GetPlatform.isAndroid &&
              userController.user.value.id == '6eSHNDECwNgJH8iFqqsF8kAzJxI2')
            ProfileOptionTile(
              title: 'Subscription Plans',
              icon: AppImages.security,
              onTap:
                  () =>
                      Get.to(() => const SubscriptionScreen(showAppbar: true)),
            ),
        ],
      ),
    );
  }
}
