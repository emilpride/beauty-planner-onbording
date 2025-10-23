import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controllers/login/login_controller.dart';
import 'widgets/login_form.dart';
import 'widgets/login_header.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(LoginController());
    return Scaffold(
      appBar: const BMAppbar(
        title: "Sign In",
      ),
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.md),
          child: Column(
            children: [
              const LoginHeader(),

              // Form
              const LoginForm(),

              const SizedBox(height: AppSizes.spaceBtnSections),

              // CTA: Don't have an account? Start onboarding
              TextButton.icon(
                onPressed: () async {
                  final uri = Uri.parse('https://quiz.beautymirror.app');
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  } else {
                    // Fallback: try in-app webview
                    await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
                  }
                },
                icon: const Icon(Icons.open_in_new, size: 18),
                label: const Text(
                  "Don't have an account? Start onboarding",
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
