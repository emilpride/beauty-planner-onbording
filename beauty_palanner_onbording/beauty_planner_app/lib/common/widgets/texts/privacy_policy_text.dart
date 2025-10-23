import 'dart:developer';

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../utils/constants/colors.dart';
import '../loaders/loaders.dart';

class PrivacyPolicyText extends StatelessWidget {
  const PrivacyPolicyText({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Privacy Policy',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const Text(
          'Last Updated: 20.12.2024',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 24),

        RichText(
          text: TextSpan(
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w400,
              color: Colors.black,
              fontFamily: GoogleFonts.raleway().fontFamily,
            ),
            children: [
              const TextSpan(text: 'Welcome to '),
              const TextSpan(
                text: 'Beauty Mirror: AI Planner',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const TextSpan(
                text:
                    ', a service provided by Digital Global Solutions LLP. We take your privacy seriously and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our app, website, and services. By using Beauty Mirror, you agree to the terms of this Privacy Policy.',
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          '1. Information We Collect',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const Text(
          'When you use Beauty Mirror, we may collect the following types of information:',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('1.1 Personal Information'),
        _buildSubBulletPoint('• Name'),
        _buildSubBulletPoint('• Age'),
        _buildSubBulletPoint('• Email address'),
        _buildSubBulletPoint('• Country'),
        _buildSubBulletPoint('• Profession'),
        _buildSubBulletPoint('• Photos you upload for analysis'),
        _buildSubBulletPoint(
          '• Any other information you provide while using the app.',
        ),

        const SizedBox(height: 8),
        _buildBulletPoint('1.2 Device Information'),
        _buildSubBulletPoint('• Device type (smartphone, tablet, etc.)'),
        _buildSubBulletPoint('• Operating system version'),
        _buildSubBulletPoint('• Unique device identifiers'),
        _buildSubBulletPoint('• IP address'),
        _buildSubBulletPoint('• Mobile network information'),

        const SizedBox(height: 8),
        _buildBulletPoint('1.3 Usage Information'),
        _buildSubBulletPoint(
          '• How you use the app, including features accessed and time spent in the app',
        ),
        _buildSubBulletPoint('• Interaction with customer support'),
        _buildSubBulletPoint('• Error logs and crash reports'),

        const SizedBox(height: 8),
        _buildBulletPoint('1.4 Location Information'),
        const Text(
          'We may collect and process information about your actual location if you allow us to do so.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 8),
        _buildBulletPoint('1.5 Cookies and Similar Technologies'),
        const Text(
          'Our website and app may use cookies and similar tracking technologies (such as pixels and web beacons) to enhance your experience, analyze usage, and provide personalized content and ads.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        const Text(
          'What are Cookies?',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
        const Text(
          'Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        const Text(
          'How We Use Cookies:',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
        _buildSubBulletPoint('• To remember your preferences and settings.'),
        _buildSubBulletPoint('• To keep you logged in during your session.'),
        _buildSubBulletPoint(
          '• To analyze website traffic and app performance.',
        ),
        _buildSubBulletPoint(
          '• To display relevant ads and promotional offers.',
        ),
        const SizedBox(height: 8),
        const Text(
          'Managing Cookies:',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
        const Text(
          'You can choose to block or delete cookies through your browser settings. Please note that disabling cookies may affect your experience of the app and website',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 24),

        const Text(
          '2. How We Use Your Information',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const Text(
          'We use the information we collect for the following purposes:',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('2.1 Personalization'),
        const Text(
          'To provide personalized beauty insights, treatment plans, and beauty scores based on the photos and data you provide.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('2.2 Improvement of Services'),
        const Text(
          'To analyze and improve our app\'s performance, including bug fixing and updates.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('2.3 Communication'),
        _buildSubBulletPoint(
          '• To communicate with you regarding updates, offers, and promotions.',
        ),
        _buildSubBulletPoint('• To respond to your customer service requests.'),
        const SizedBox(height: 8),
        _buildBulletPoint('2.4 Global Beauty Statistics'),
        const Text(
          'To provide anonymized global beauty statistics by aggregating non-identifiable information from users.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('2.5 Compliance with Legal Obligations'),
        const Text(
          'To comply with applicable laws, regulations, and legal processes.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '3. Data Sharing and Disclosure',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'We do not sell, rent, or trade your personal information. However, we may share your data with:',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        _buildBulletPoint('3.1 Service Providers'),
        const Text(
          'We may share your information with third-party service providers who help us provide and maintain the app (e.g., cloud storage providers, analytics providers).',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('3.2 Legal Requirements'),
        const Text(
          'We may disclose your information if required by law or if we believe that such action is necessary to comply with a legal obligation or protect our rights.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '4. Data Retention',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'We retain your personal data only as long as it is necessary to fulfill the purposes for which it was collected, or as required by law.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '5. Your Rights',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Depending on your jurisdiction, you may have the following rights under data protection laws:',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        _buildBulletPoint('5.1 Access and Rectification'),
        const Text(
          'You can request access to the personal information we hold about you and request corrections.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('5.2 Deletion'),
        RichText(
          text: TextSpan(
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w400,
              color: Colors.black,
              fontFamily: GoogleFonts.raleway().fontFamily,
            ),
            children: [
              const TextSpan(
                text:
                    'If you wish to delete your account or any personal data provided to us, you can submit a deletion request through our Account or Data Deletion Request Form (',
              ),
              TextSpan(
                text: 'https://forms.gle/YNKbFTRn7HRZcMMA6',
                style: const TextStyle(
                  color: Colors.blue,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  decoration: TextDecoration.underline,
                ),
                recognizer:
                    TapGestureRecognizer()
                      ..onTap = () async {
                        final url = Uri.parse(
                          'https://forms.gle/YNKbFTRn7HRZcMMA6',
                        );
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url);
                        } else {
                          log('Could not launch $url');
                        }
                      },
              ),
              const TextSpan(
                text:
                    '). We are committed to processing all requests promptly, and your data will be permanently deleted within 24 hours of receiving your request.',
              ),
            ],
          ),
        ),

        const SizedBox(height: 8),
        _buildBulletPoint('5.3 Objection to Processing'),
        const Text(
          'You have the right to object to our processing of your personal data.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        _buildBulletPoint('5.4 Data Portability'),
        const Text(
          'You have the right to request a copy of your data in a structured, machine-readable format.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        RichText(
          text: TextSpan(
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w400,
              color: Colors.black,
              fontFamily: GoogleFonts.raleway().fontFamily,
            ),
            children: [
              const TextSpan(text: 'To exercise these rights, contact us at '),
              WidgetSpan(
                alignment: PlaceholderAlignment.middle,
                child: GestureDetector(
                  onTap: () async {
                    final Uri emailUri = Uri(
                      scheme: 'mailto',
                      path: 'info@beauty-mirror.com',
                    );
                    if (!await launchUrl(emailUri)) {
                      Loaders.customToast(
                        message: 'Could not launch email client',
                      );
                    }
                  },
                  child: const Text(
                    'info@beauty-mirror.com',
                    style: TextStyle(
                      color: Colors.blue,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        const Text(
          '6. Data Security',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, loss, or misuse. However, no system is completely secure, and we cannot guarantee the absolute security of your data.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '7. Children\'s Privacy',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Beauty Mirror is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will delete it immediately.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '8. International Data Transfers',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'If you are located outside the country in which our servers are located, your data may be transferred internationally. We take steps to ensure that adequate protections are in place to safeguard your information.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '9. Cookies and Tracking Technologies',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Our website and app may use cookies and other tracking technologies, such as web beacons, pixels, and analytics tools, to collect information about your usage of the site. This helps us improve your experience, personalize content, and deliver targeted advertisements.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        const SizedBox(height: 8),
        const Text(
          'You can control the use of cookies through your browser settings. Please note that disabling cookies may affect the functionality of certain features of our website or app.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '10. Changes to this Privacy Policy',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a new effective date. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your data.',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),

        const SizedBox(height: 24),

        const Text(
          '11. Contact Us',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        RichText(
          text: TextSpan(
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w400,
              color: Colors.black,
              fontFamily: GoogleFonts.raleway().fontFamily,
            ),
            children: [
              const TextSpan(
                text:
                    'If you have any questions or concerns about this Privacy Policy, or if you wish to exercise your rights, please contact us at: \nEmail: ',
              ),
              WidgetSpan(
                alignment: PlaceholderAlignment.middle,
                child: GestureDetector(
                  onTap: () async {
                    final Uri emailUri = Uri(
                      scheme: 'mailto',
                      path: 'info@beauty-mirror.com',
                    );
                    if (!await launchUrl(emailUri)) {
                      Loaders.customToast(
                        message: 'Could not launch email client',
                      );
                    }
                  },
                  child: const Text(
                    'info@beauty-mirror.com',
                    style: TextStyle(
                      color: Colors.blue,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
              const TextSpan(
                text:
                    '\nAddress: Digital Global Soultions LLP, 71-75 Shelton Street, Covent Garden, London, United Kingdom',
              ),
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
        // const Text(
        //   '• ',
        //   style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        // ),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w500,
              color: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubBulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // const Text(
          //   '• ',
          //   style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
          // ),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
            ),
          ),
        ],
      ),
    );
  }
}
