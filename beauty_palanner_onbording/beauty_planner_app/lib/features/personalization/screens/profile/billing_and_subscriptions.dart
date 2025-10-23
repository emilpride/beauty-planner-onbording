import 'dart:developer';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
// Important: Make sure this path to your repository is correct
import '../../../../data/repositories/subscriptions/subscriptions_repository.dart';
import '../../../subscriptions/screens/congratulations/congratulations_screen.dart';

class BillingAndSubscriptions extends StatefulWidget {
  const BillingAndSubscriptions({super.key});

  @override
  State<BillingAndSubscriptions> createState() =>
      _BillingAndSubscriptionsState();
}

class _BillingAndSubscriptionsState extends State<BillingAndSubscriptions>
    with TickerProviderStateMixin {
  late AnimationController _animationController;

  // --- Instance of your SubscriptionsRepository ---
  final _subRepo = SubscriptionsRepository.instance;

  final List<List<TextSpan>> _benefits = [
    [
      const TextSpan(
        text: 'Unlimited',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: ' Activity tracking'),
    ],
    [
      const TextSpan(text: 'Advanced progress'),
      const TextSpan(
        text: ' tracking and reports',
        style: TextStyle(color: AppColors.primary),
      ),
    ],
    [
      const TextSpan(
        text: 'Customization ',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: 'options (themes, notifications)'),
    ],
    [
      const TextSpan(text: 'Customer priority'),
      const TextSpan(
        text: ' support',
        style: TextStyle(color: AppColors.primary),
      ),
    ],
    [
      const TextSpan(text: 'Advanced '),
      const TextSpan(
        text: 'mood stat ',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: 'options'),
    ],
    [
      const TextSpan(
        text: 'Ad-free',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: ' experience'),
    ],
  ];

  @override
  void initState() {
    super.initState();
    // Initialize the animation controller
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(
        milliseconds: 2000,
      ), // Total duration for all animations
    );
    // Start the animation as soon as the screen loads
    _animationController.forward();
  }

  @override
  void dispose() {
    // Dispose the controller when the widget is removed
    _animationController.dispose();
    super.dispose();
  }

  // --- NEW: Corrected method to open native subscription management ---
  Future<void> _manageSubscription() async {
    // Define the platform-specific URLs
    const String appleSubscriptionsURL =
        'itms-apps://apps.apple.com/account/subscriptions';
    const String googleSubscriptionsURL =
        'https://play.google.com/store/account/subscriptions';

    // Determine the correct URL based on the platform
  final String url = (!kIsWeb && GetPlatform.isIOS)
    ? appleSubscriptionsURL
    : googleSubscriptionsURL;
    final Uri uri = Uri.parse(url);

    try {
      // Check if the URL can be launched before attempting to launch it
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        log('Could not launch $url');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not open subscription management page.'),
            ),
          );
        }
      }
    } catch (e) {
      log("Error launching URL: $e");
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('An error occurred.')));
      }
    }
  }

  // --- NEW: Helper to get package details from product ID ---
  Package? _getPackageForProduct(String productId) {
    try {
      productId = '$productId:$productId';
      return _subRepo.packages.firstWhere((pkg) {
        return pkg.storeProduct.identifier == productId;
      });
    } catch (e) {
      // Return null if no matching package is found
      return null;
    }
  }

  // --- NEW: Helper to format package duration ---
  String _formatPackageDuration(PackageType? type) {
    switch (type) {
      case PackageType.annual:
        return '/ year';
      case PackageType.monthly:
        return '/ month';
      case PackageType.sixMonth:
        return '/ 6 months';
      case PackageType.threeMonth:
        return '/ 3 months';
      case PackageType.twoMonth:
        return '/ 2 months';
      case PackageType.weekly:
        return '/ week';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BMAppbar(title: 'Billing & Subscriptions'),
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.only(bottom: 24.0),
          child: Column(
            children: [
              const SizedBox(height: 16),
              // --- Use Obx for a reactive UI ---
              Obx(() {
                final activeEntitlement =
                    _subRepo.customerInfo.value?.entitlements.all[_subRepo
                        .entitlementId];

                // Check if the user has an active subscription
                if (activeEntitlement == null || !activeEntitlement.isActive) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32.0),
                      child: Text(
                        "No active subscription found.",
                        style: TextStyle(
                          fontSize: 20,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                }

                // Find the package corresponding to the active subscription
                final currentPackage = _getPackageForProduct(
                  activeEntitlement.productIdentifier,
                );
                // Extract currency
                final currency =
                    currentPackage?.storeProduct.currencyCode ?? '';

                final priceString =
                    currentPackage?.storeProduct.price.toStringAsFixed(1) ?? '';
                final durationString = _formatPackageDuration(
                  currentPackage?.packageType,
                );

                return Stack(
                  children: [
                    RoundedContainer(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(16),
                      backgroundColor: AppColors.white,
                      child: Column(
                        children: [
                          const SizedBox(height: 16),
                          const Text(
                            'Beauty Mirror Premium',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 24),
                          // --- DYNAMIC PRICE ---
                          Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: '$currency $priceString',
                                  style: const TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                TextSpan(
                                  text: durationString,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                            ),
                            child: Divider(color: Colors.grey[300]),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 16.0),
                            child: Column(
                              children: List.generate(_benefits.length, (
                                index,
                              ) {
                                final intervalStart = (index * 0.1);
                                final intervalEnd = intervalStart + 0.3;

                                final animation = CurvedAnimation(
                                  parent: _animationController,
                                  curve: Interval(
                                    intervalStart,
                                    intervalEnd > 1.0 ? 1.0 : intervalEnd,
                                    curve: Curves.easeOut,
                                  ),
                                );
                                return AnimatedBenefitItem(
                                  animation: animation,
                                  child: _buildBenefitRow(_benefits[index]),
                                );
                              }),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                            ),
                            child: Divider(color: Colors.grey[300]),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Your current plan',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                    // --- SAVE % TAG ---
                    Positioned(
                      top: 0,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.only(
                            topRight: Radius.circular(AppSizes.cardRadiusLg),
                            bottomLeft: Radius.circular(AppSizes.cardRadiusLg),
                          ),
                        ),
                        child: const Text(
                          'SAVE 17%',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              }),
              const SizedBox(height: 24),
              // --- DYNAMIC EXPIRATION TEXT ---
              Obx(() {
                final expirationDateStr =
                    _subRepo
                        .customerInfo
                        .value
                        ?.entitlements
                        .all[_subRepo.entitlementId]
                        ?.expirationDate;

                if (expirationDateStr == null) {
                  return const SizedBox.shrink(); // Hide if no expiration date
                }

                // Format the date string
                final expirationDate = DateFormat(
                  'MMM dd, yyyy',
                ).format(DateTime.parse(expirationDateStr));

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Text.rich(
                    textAlign: TextAlign.center,
                    TextSpan(
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                      children: [
                        const TextSpan(
                          text: 'Your subscription will expire on ',
                        ),
                        TextSpan(
                          text: expirationDate,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const TextSpan(
                          text: '. Renew or cancel your subscription ',
                        ),
                        // --- FUNCTIONAL "here" LINK ---
                        TextSpan(
                          text: 'here.',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer:
                              TapGestureRecognizer()
                                ..onTap = () {
                                  _manageSubscription();
                                },
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBenefitRow(List<TextSpan> textSpans) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SvgPicture.asset(
            AppImages.tick,
            colorFilter: const ColorFilter.mode(
              AppColors.textPrimary,
              BlendMode.srcIn,
            ),
            height: 14,
            width: 14,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: AppColors.black,
                ),
                children: textSpans,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
