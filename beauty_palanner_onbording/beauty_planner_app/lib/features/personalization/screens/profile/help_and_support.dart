import 'package:flutter/foundation.dart' show kIsWeb;

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../utils/constants/colors.dart';
import '../../../authentication/screens/signup/widgets/privacy_policy_screen.dart';
import '../../../authentication/screens/signup/widgets/term_conditions_screen.dart';
import 'faq.dart';
import 'resources_and_citations.dart';

class HelpAndSupport extends StatelessWidget {
  const HelpAndSupport({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BMAppbar(title: 'Help & Support'),
      backgroundColor: AppColors.light,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 24.0),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    tile(
                      title: 'FAQ',
                      onTap: () => Get.to(() => const FaqScreen()),
                    ),
                    tile(
                      title: 'Contact Support',
                      onTap: () async {
                        final Uri emailUri = Uri(
                          scheme: 'mailto',
                          path: 'support@beautymirror.com',
                        );
                        if (!await launchUrl(emailUri)) {
                          Loaders.customToast(
                            message: 'Could not open Email client',
                          );
                        }
                      },
                    ),
                    tile(
                      title: 'Privacy Policy',
                      onTap: (!kIsWeb && GetPlatform.isAndroid)
                          ? () => Get.to(() => const PrivacyPolicyScreen())
                          : () async {
                              final url = Uri.parse(
                                "https://beautymirror.app/privacy",
                              );
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              }
                            },
                    ),
                    tile(
                      title: 'Terms of Service',
                      onTap: (!kIsWeb && GetPlatform.isAndroid)
                          ? () => Get.to(() => const TermConditionsScreen())
                          : () async {
                              final url = Uri.parse(
                                "https://beautymirror.app/terms",
                              );
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              }
                            },
                    ),
                    tile(
                      title: 'Resources & Citations',
                      onTap:
                          () => Get.to(() => const ResourcesCitationsScreen()),
                    ),
                    tile(
                      title: 'Partner',
                      onTap: () async {
                        final url = Uri.parse(
                          "https://beautymirror.app/contact",
                        );
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        }
                      },
                    ),
                    tile(
                      title: 'Feedback',
                      onTap: () async {
                        final Uri emailUri = Uri(
                          scheme: 'mailto',
                          path: 'support@beautymirror.com',
                        );
                        if (!await launchUrl(emailUri)) {
                          Loaders.customToast(
                            message: 'Could not open Email client',
                          );
                        }
                      },
                    ),
                    tile(
                      title: 'About Us',
                      onTap: () async {
                        final url = Uri.parse("https://beautymirror.app/about");
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        }
                      },
                    ),
                    tile(
                      title: 'Rate Us',
                      onTap: () async {
                        final Uri url;
                        if (!kIsWeb && GetPlatform.isAndroid) {
                          url = Uri.parse(
                            "https://play.google.com/store/apps/details?id=com.beautymirror.app",
                          );
                        } else if (!kIsWeb && GetPlatform.isIOS) {
                          url = Uri.parse("https://apps.apple.com/app/id6447067600");
                        } else {
                          // Web or other platforms: open website
                          url = Uri.parse("https://beautymirror.app/");
                        }
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        }
                      },
                    ),
                    tile(
                      title: 'Visit Our Website',
                      onTap: () async {
                        final url = Uri.parse("https://beautymirror.app/");
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget tile({required String title, required VoidCallback onTap}) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
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
    );
  }
}
