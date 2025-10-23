import 'dart:io';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../common/widgets/texts/privacy_policy_text.dart';
import '../../../../../utils/constants/colors.dart';
import '../widgets/onboarding_step.dart';

class PrivacyStep extends StatelessWidget {
  const PrivacyStep({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingStep(
      title: "We care about your privacy",
      subtitle:
          "All the data you provide is anonymous and used only for statistical purposes. Your responses help us tailor the app to better suit your needs.",
      condition: true,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          TextButton(
            onPressed:
                Platform.isAndroid
                    ? () => _showPrivacyPolicyBottomSheet(context)
                    : () async {
                      final url = Uri.parse("https://beautymirror.app/privacy");
                      if (await canLaunchUrl(url)) {
                        await launchUrl(url);
                      }
                    },

            child: const Text(
              'Read Privacy Policy',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
                fontSize: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showPrivacyPolicyBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled:
          true, // Allows the sheet to take up almost full height
      backgroundColor:
          Colors.transparent, // Makes the corners visible below the sheet
      showDragHandle: false,
      builder: (BuildContext context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.90, // Start at 90% of screen height
          minChildSize: 0.5, // Minimum 50%
          maxChildSize: 0.90, // Maximum 90%
          expand: false, // Do not expand to full height immediately
          builder: (_, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
              ),
              child: Column(
                children: [
                  // Draggable handle (Optional, but good UX)
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 12.0),
                    height: 4.0,
                    width: 60.0,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2.0),
                    ),
                  ),
                  Expanded(
                    // --- NEW: Wrap SingleChildScrollView with Scrollbar ---
                    child: Scrollbar(
                      thumbVisibility:
                          true, // Make the scrollbar always visible
                      controller:
                          scrollController, // Link to the same scroll controller
                      child: SingleChildScrollView(
                        controller:
                            scrollController, // Pass the controller here
                        padding: const EdgeInsets.all(20.0),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Privacy Policy',
                                  style: TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),

                            SizedBox(height: 20),
                            PrivacyPolicyText(),
                          ],
                        ),
                      ),
                    ),
                    // --- END NEW ---
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20.0,
                      vertical: 10.0,
                    ),
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context); // Close the bottom sheet
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        minimumSize: const Size(double.infinity, 52),
                        maximumSize: const Size(double.infinity, 52),
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Go Back',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: MediaQuery.of(context).padding.bottom,
                  ), // Space for safe area
                ],
              ),
            );
          },
        );
      },
    );
  }
}
