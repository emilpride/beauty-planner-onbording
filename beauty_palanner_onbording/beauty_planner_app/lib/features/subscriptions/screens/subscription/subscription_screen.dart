import 'dart:io';
import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import '../../../../data/repositories/subscriptions/subscriptions_repository.dart';
import '../../../authentication/screens/signup/widgets/privacy_policy_screen.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../navigation_menu.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../authentication/screens/signup/widgets/term_conditions_screen.dart';
import '../congratulations/congratulations_screen.dart';
import 'widgets/feature_card.dart';
import 'widgets/price_plans_card.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key, this.showAppbar = false});

  final bool showAppbar;
  @override
  Widget build(BuildContext context) {
    final controller = SubscriptionsRepository.instance;
    return Scaffold(
      appBar: showAppbar ? const BMAppbar(title: '') : null,
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.only(
            left: AppSizes.md,
            right: AppSizes.md,
            top: showAppbar ? 8 : AppSizes.xl * 2,
            bottom: AppSizes.md,
          ),
          child: RoundedContainer(
            padding: const EdgeInsets.all(AppSizes.md),
            child: Column(
              children: [
                const SizedBox(height: 8),
                const Text(
                  'Choose your plan',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSizes.lg),
                Obx(() {
                  Text(controller.selectedIndex.value.toString());
                  if (controller.packages.isEmpty) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      controller.fetchOfferings();
                    });
                    return Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Theme.of(context).primaryColor,
                        ),
                      ),
                    );
                  }
                  return controller.packages.isEmpty
                      ? const SizedBox()
                      : ListView.separated(
                        shrinkWrap: true,
                        padding: EdgeInsets.zero,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: controller.packages.length,
                        separatorBuilder:
                            (context, index) =>
                                const SizedBox(height: AppSizes.spaceBtnItems),
                        itemBuilder: (context, index) {
                          final package = controller.packages[index];
                          return PricePlanCard(
                            package: package,
                            isSelected: controller.selectedIndex.value == index,
                            idx: index,
                            onTap: () => controller.changeIndex(index),
                          );
                        },
                      );
                }),
                const SizedBox(height: AppSizes.spaceBtnSections),
                // text rich “Auto‑renewed every year. Cancel anytime in your Google Play subscriptions.”, with link to Google Play subscriptions
                Obx(() {
                  Text(controller.selectedIndex.value.toString());
                  return controller.packages.isNotEmpty
                      ? Text.rich(
                        textAlign: TextAlign.center,
                        TextSpan(
                          children: [
                            TextSpan(
                              text:
                                  ' Auto‑renewed every ${controller.durationLabelFromIsoFormal(controller.packages[controller.selectedIndex.value].storeProduct.subscriptionPeriod!)}. ',
                              style: const TextStyle(
                                fontSize: 16,
                                color: AppColors.darkGrey,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Platform.isAndroid
                                ? const TextSpan(
                                  text: 'Cancel anytime in your ',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: AppColors.darkGrey,
                                    fontWeight: FontWeight.w700,
                                  ),
                                )
                                : const TextSpan(text: ''),
                            Platform.isAndroid
                                ? TextSpan(
                                  recognizer:
                                      TapGestureRecognizer()
                                        ..onTap = () async {
                                          final url = Uri.parse(
                                            "https://play.google.com/store/account/subscriptions",
                                          );
                                          if (await canLaunchUrl(url)) {
                                            await launchUrl(
                                              url,
                                              mode:
                                                  LaunchMode
                                                      .externalApplication,
                                            );
                                          } else {
                                            Loaders.customToast(
                                              message:
                                                  'Error opening subscriptions page',
                                            );
                                          }
                                        },
                                  text: 'Google Play subscriptions.',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                )
                                : const TextSpan(text: ''),
                          ],
                        ),
                      )
                      : const SizedBox.shrink();
                }),
                const SizedBox(height: AppSizes.spaceBtnSections),
                const Row(
                  children: [
                    Text(
                      'Here’s what you’ll receive:',
                      textAlign: TextAlign.start,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                const FeaturesCard(
                  image: AppImages.assistant,
                  title: 'Personal AI assistant',
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                const FeaturesCard(
                  image: AppImages.tracking,
                  title: 'Unlimited Activity tracking',
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                const FeaturesCard(
                  image: AppImages.clock,
                  title: 'Smart routine planning and Reminders',
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                const FeaturesCard(
                  image: AppImages.progress,
                  title: 'Advanced progress tracking and reports',
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                const FeaturesCard(
                  image: AppImages.analysis,
                  title: 'AI Beauty Analysis',
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                const FeaturesCard(
                  image: AppImages.calendar,
                  title: 'Personalized calendar to manage treatments',
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                const FeaturesCard(
                  image: AppImages.achievement,
                  title: 'Achievements & Motivation',
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                const FeaturesCard(
                  image: AppImages.adFree,
                  title: 'Ad-free experience',
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                const FeaturesCard(
                  image: AppImages.moodStat,
                  title: 'Advanced mood stat options',
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                const FeaturesCard(
                  image: AppImages.customization,
                  title: 'Customization options (themes, notifications)',
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                Row(
                  children: [
                    Expanded(
                      child: RoundedContainer(
                        shadow: true,
                        height: 125,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Flexible(
                              child: Text.rich(
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.ellipsis,
                                TextSpan(
                                  children: [
                                    TextSpan(
                                      text: '4.9',
                                      style: TextStyle(
                                        fontSize: 44,
                                        color: Theme.of(context).primaryColor,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const TextSpan(
                                      text: '/5',
                                      style: TextStyle(
                                        fontSize: 22,
                                        color: Colors.black,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            SvgPicture.asset(AppImages.reviewStars, height: 15),
                            const SizedBox(height: AppSizes.sm),
                            const Text(
                              '1k+ reviews',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSizes.spaceBtnItems),
                    Expanded(
                      child: RoundedContainer(
                        height: 125,
                        shadow: true,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Flexible(
                              child: Text(
                                textAlign: TextAlign.center,
                                '10k+ users',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(height: AppSizes.sm),
                            Image.asset(AppImages.users, height: 40, width: 80),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                Text(
                  Platform.isAndroid
                      ? 'This is a subscription-based service. Payment will be charged to your Google Play account at confirmation of purchase. Your subscription will automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage your subscriptions and turn off auto-renewal in your Google Play account settings.'
                      : 'This is a subscription-based service. Payment will be charged to your Apple ID account at confirmation of purchase. Your subscription will automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage your subscriptions and turn off auto-renewal in your Apple ID account settings.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.darkGrey,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppSizes.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap:
                          Platform.isAndroid
                              ? () => Get.to(() => const TermConditionsScreen())
                              : () async {
                                final url = Uri.parse(
                                  "https://beautymirror.app/terms",
                                );
                                if (await canLaunchUrl(url)) {
                                  await launchUrl(url);
                                }
                              },
                      child: const Text(
                        'Terms of Use',
                        textAlign: TextAlign.start,
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.darkGrey,
                          fontWeight: FontWeight.w700,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSizes.md),
                    GestureDetector(
                      onTap:
                          Platform.isAndroid
                              ? () => Get.to(() => const PrivacyPolicyScreen())
                              : () async {
                                final url = Uri.parse(
                                  "https://beautymirror.app/privacy",
                                );
                                if (await canLaunchUrl(url)) {
                                  await launchUrl(url);
                                }
                              },
                      child: const Text(
                        'Privacy Policy',
                        style: TextStyle(
                          fontSize: 16,
                          decoration: TextDecoration.underline,
                          color: AppColors.darkGrey,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSizes.spaceBtnSections),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Special Offer',
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFFF29900),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSizes.spaceBtnItems),
                Obx(() {
                  Text(controller.selectedIndex.value.toString());
                  return GestureDetector(
                    onTap: () async {
                      if (controller.packages.isNotEmpty) {
                        final bool success =
                            await controller.purchaseSelectedPlan();
                        if (success) {
                          Get.offAll(() => const CongratulationsScreen());
                        } else {
                          Loaders.customToast(
                            message:
                                'Something went wrong while purchasing the subscription',
                          );
                        }
                      }
                    },
                    child: const RoundedContainer(
                      height: 50,
                      width: double.infinity,
                      backgroundColor: AppColors.success,
                      padding: EdgeInsets.symmetric(vertical: AppSizes.sm),
                      child: Center(
                        child: Text(
                          textAlign: TextAlign.center,
                          'Try for Free',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: AppSizes.spaceBtnItems),
                controller.packages.isNotEmpty
                    ? Obx(
                      () => Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              'Enjoy ${controller.daysToWeeks(controller.packages[controller.selectedIndex.value].storeProduct)} free, then ${controller.pricePlan(package: controller.packages[controller.selectedIndex.value])}/${controller.durationLabelFromIsoFormal(controller.packages[controller.selectedIndex.value].storeProduct.subscriptionPeriod ?? '')} after!',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                    : const SizedBox.shrink(),
                const SizedBox(height: AppSizes.spaceBtnSections),
                // PromoCodeField(
                //   onApply: () async {
                //     if (controller.promoCodeFormKey.currentState!.validate()) {
                //       Loaders.customToast(message: 'Promo code not found');
                //     }
                //     // if (controller.promoCodeFormKey.currentState!.validate()) {
                //     //   final bool success =
                //     //       await controller.purchaseSelectedPlan();
                //     //   if (success) {
                //     //     Get.offAll(() => const CongratulationsScreen());
                //     //   } else {
                //     //     Loaders.customToast(
                //     //       message:
                //     //           'Something went wrong while applying the promo code',
                //     //     );
                //     //   }
                //     // }
                //   },
                // ),
                // const SizedBox(height: AppSizes.spaceBtnSections),
                GestureDetector(
                  onTap: () async {
                    await controller.restorePurchases();
                    if (controller.isSubscribed.value == true) {
                      Get.offAll(() => const NavigationMenu());
                      Loaders.customToast(message: 'Purchases Restored');
                    } else {
                      Loaders.customToast(
                        message:
                            'Couldn\'t acknowledge purchase after restoring it',
                      );
                    }
                  },
                  child: const Text(
                    'Restore Purchase',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.darkGrey,
                      fontWeight: FontWeight.w700,
                      decoration: TextDecoration.underline,
                    ),
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
