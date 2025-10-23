import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/common/widgets/custom_shapes/containers/rounded_container.dart';
import 'package:beautymirror/features/personalization/controllers/linked_accounts_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';

class LinkedAccounts extends StatelessWidget {
  const LinkedAccounts({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(LinkedAccountsController());
    return Scaffold(
      backgroundColor: AppColors.light,
      appBar: const BMAppbar(title: 'Linked Accounts'),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 24),
            buildAccountTile(
              AppImages.google,
              'Google',
              controller.isProviderLinked('google.com'),
              onTap: () {
                controller.linkGoogleAccount();
              },
            ),
            const SizedBox(height: 16),
            buildAccountTile(
              AppImages.facebook,
              'Facebook',
              controller.isProviderLinked('facebook.com'),
              onTap: () {
                controller.linkFacebookAccount();
              },
            ),
            const SizedBox(height: 16),
            buildAccountTile(
              AppImages.apple,
              'Apple',
              controller.isProviderLinked('apple.com'),
              onTap: () {
                controller.linkAppleAccount();
              },
              size: 40,
            ),
          ],
        ),
      ),
    );
  }

  Widget buildAccountTile(
    String logo,
    String name,
    bool isConnected, {
    double size = 48,
    Function()? onTap,
  }) {
    return RoundedContainer(
      height: 80,
      backgroundColor: AppColors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          SizedBox(
            width: 48,
            child: Image.asset(logo, width: size, height: size),
          ),
          const SizedBox(width: 12),
          Text(
            name,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          isConnected
              ? const Text(
                'Connected',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              )
              : GestureDetector(
                onTap: onTap,
                child: const Text(
                  'Connect',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
        ],
      ),
    );
  }

  // void _showUnlinkDialog(
  //   BuildContext context,
  //   LinkedAccountsController controller,
  //   String providerId,
  //   String providerName,
  // ) {
  //   showDialog(
  //     context: context,
  //     builder: (context) => AlertDialog(
  //       backgroundColor: const Color(0xFF2C2C2E),
  //       title: Text(
  //         'Unlink $providerName?',
  //         style: const TextStyle(color: Colors.white),
  //       ),
  //       content: Text(
  //         'Are you sure you want to unlink your $providerName account?',
  //         style: TextStyle(color: Colors.grey.shade400),
  //       ),
  //       actions: [
  //         TextButton(
  //           onPressed: () => Navigator.pop(context),
  //           child: const Text('Cancel'),
  //         ),
  //         TextButton(
  //           onPressed: () {
  //             Navigator.pop(context);
  //             controller.unlinkAccount(providerId);
  //           },
  //           child: const Text(
  //             'Unlink',
  //             style: TextStyle(color: Colors.red),
  //           ),
  //         ),
  //       ],
  //     ),
  //   );
  // }
}
