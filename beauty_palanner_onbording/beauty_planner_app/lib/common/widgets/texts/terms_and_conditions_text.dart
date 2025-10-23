import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../utils/constants/colors.dart';
import '../loaders/loaders.dart';

class TermsAndConditionsText extends StatelessWidget {
  const TermsAndConditionsText({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Introduction',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const Text(
          'Effective Date: December 20, 2024',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Beauty Mirror, Inc. ("Beauty Mirror," "we," "us," or "our") provides the Beauty Mirror mobile application (the "App") subject to the following terms and conditions ("Terms"). By accessing or using the App, you agree to be bound by these Terms.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 24),
        const Text(
          'Restrictions on Use:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'You may not use the App for any illegal or unauthorized purpose.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'You may not interfere with or disrupt the App or any servers or networks connected to the App.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'You may not modify, adapt, or reverse engineer the App.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'You may not access the App in order to build a competing product or service.',
        ),

        const SizedBox(height: 24),

        const Text(
          'Intellectual Property:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'The App and all content and materials therein are protected by intellectual property rights.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'You may not use any content or materials from the App without our prior written permission.',
        ),
        const SizedBox(height: 24),

        const Text(
          'Disclaimer:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'THE APP IS PROVIDED "AS IS" AND WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'WE DO NOT WARRANT THAT THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE APP WILL BE ACCURATE OR RELIABLE.',
        ),
        const SizedBox(height: 24),

        const Text(
          'Limitation of Liability:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'WE WILL NOT BE LIABLE FOR ANY DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE USE OF THE APP.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'THIS INCLUDES, BUT IS NOT LIMITED TO, DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, AND PUNITIVE DAMAGES.',
        ),
        const SizedBox(height: 24),

        const Text(
          'Term and Termination:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'These Terms are effective until terminated by you or us.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'You may terminate these Terms by discontinuing your use of the App.',
        ),
        const SizedBox(height: 8),
        _buildBulletPoint(
          'We may terminate these Terms at any time, with or without cause, and without notice.',
        ),
        const SizedBox(height: 24),
        const Text(
          'Entire Agreement:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),

        const SizedBox(height: 8),
        const Text(
          'These Terms constitute the entire agreement between you and us with respect to the App.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 24),
        const Text(
          'Governing Law:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),

        const SizedBox(height: 8),
        const Text(
          'These Terms shall be governed by and construed in accordance with the laws of the State of United Kingdom.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 24),
        const Text(
          'Severability:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),

        const SizedBox(height: 8),
        const Text(
          'If any provision of these Terms is held to be invalid or unenforceable',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 24),
        const Text(
          'Contact Us:',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),

        const SizedBox(height: 8),
        RichText(
          text: TextSpan(
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w400,
              color: Colors.black,
            ),
            children: [
              const TextSpan(
                text:
                    'If you have any questions about this Terms of Service, please contact us at ',
              ),
              WidgetSpan(
                alignment: PlaceholderAlignment.middle,
                child: GestureDetector(
                  onTap: () async {
                    final Uri emailUri = Uri(
                      scheme: 'mailto',
                      path: 'support@beautymirror.com',
                    );
                    if (!await launchUrl(emailUri)) {
                      Loaders.customToast(
                        message: 'Could not launch email client',
                      );
                    }
                  },
                  child: const Text(
                    'support@beautymirror.com',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const TextSpan(text: '.'),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildBulletPoint(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Text(
          '• ',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
          ),
        ),
      ],
    );
  }
}
