import 'package:beautymirror/common/widgets/custom_shapes/switches/custom_switch.dart';
import 'package:beautymirror/utils/validators/validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../common/widgets/loaders/progress_dialog.dart';
import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controllers/biometric_controller.dart';
import '../../controllers/user_controller.dart';

class AccountAndSecurity extends StatelessWidget {
  const AccountAndSecurity({super.key});

  @override
  Widget build(BuildContext context) {
    final biometricController = Get.find<BiometricController>();
    return Scaffold(
      appBar: BMAppbar(
        title: 'Account & Security',
        onBackPressed: () {
          UserController.instance.reAuthPassword.clear();
          Get.back();
        },
      ),
      backgroundColor: AppColors.light,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 16.0),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    // Biometric ID Switch (Fingerprint/Strong Biometric)
                    Obx(() {
                      final isAvailable =
                          biometricController
                              .biometricService
                              .isFingerprintAvailable ||
                          biometricController
                              .biometricService
                              .isStrongBiometricAvailable;

                      return Opacity(
                        opacity: isAvailable ? 1.0 : 0.5,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 12,
                            horizontal: 4,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Biometric ID',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    if (!isAvailable)
                                      const Text(
                                        'Not available on this device',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              CustomSwitch(
                                value:
                                    biometricController.biometricEnabled.value,
                                onChanged:
                                    isAvailable
                                        ? (value) => biometricController
                                            .toggleBiometricId(value)
                                        : (value) {},
                              ),
                            ],
                          ),
                        ),
                      );
                    }),

                    // Face ID Switch
                    Obx(() {
                      final isAvailable =
                          biometricController
                              .biometricService
                              .isFaceIdAvailable;

                      return Opacity(
                        opacity: isAvailable ? 1.0 : 0.5,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 12,
                            horizontal: 4,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Face ID',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    if (!isAvailable)
                                      const Text(
                                        'Not available on this device',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              CustomSwitch(
                                value: biometricController.faceIdEnabled.value,
                                onChanged:
                                    isAvailable
                                        ? (value) => biometricController
                                            .toggleFaceId(value)
                                        : (value) {},
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    GestureDetector(
                      behavior: HitTestBehavior.translucent,
                      onTap: () => _showChangePasswordBottomSheet(context),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 4,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Change Password',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Icon(
                              Iconsax.arrow_right_3,
                              size: 18,
                              weight: 2,
                              color: Color(0xFF907FB1),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSizes.md),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildCard(
                      title: 'Deactivate Account',
                      description:
                          'Temporarily deactivate your account. Easily reactivate when you\'re ready.',
                      onTap: () => _showDeactivateConfirmationDialog(),
                    ),
                    const SizedBox(height: AppSizes.md),
                    _buildCard(
                      title: 'Delete Account',
                      description:
                          'Permanently remove your account and data.\nProceed with caution.',
                      onTap: () => _showDeleteConfirmationDialog(),
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

  // A helper method to create the UI cards
  Widget _buildCard({
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      color: const Color(0xFFF6F5FE),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 18,
                      color:
                          title == 'Deactivate Account'
                              ? AppColors.textPrimary
                              : AppColors.error,
                    ),
                  ),
                  const Icon(
                    Iconsax.arrow_right_3,
                    size: 18,
                    weight: 2,
                    color: Colors.black,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                description,
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // A method to show a confirmation dialog
  void _showDeactivateConfirmationDialog() {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
                'Are your sure you want to deactivate account?',
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
                  onPressed:
                      () => UserController.instance.deactivateUserAccount(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size(double.infinity, 45),
                    maximumSize: const Size(double.infinity, 45),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Deactivate',
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
                      borderRadius: BorderRadius.circular(12),
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

  void _showDeleteConfirmationDialog() {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
                'Are your sure you want to delete account? This action cannot be undone.',
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
                    UserController.instance.deleteUserAccount();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    minimumSize: const Size(double.infinity, 45),
                    maximumSize: const Size(double.infinity, 45),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Delete',
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
                      borderRadius: BorderRadius.circular(12),
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

  // Method to show the change password bottom sheet
  void _showChangePasswordBottomSheet(BuildContext context) {
    final authRepo = AuthenticationRepository.instance;
    final userController = UserController.instance;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 16,
            right: 16,
            top: 16,
          ),
          child: Form(
            key: userController.reAuthFormKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(
                  child: Text(
                    'Re-authenticate',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  textAlign: TextAlign.center,
                  'Please enter your current credentials to change your password.',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 20),
                Obx(
                  () => TextFormField(
                    validator:
                        (value) =>
                            MyValidator.validateEmptyText('Password', value),
                    controller: userController.reAuthPassword,
                    obscureText: userController.hidePassword.value,
                    decoration: InputDecoration(
                      hintText: 'Password',
                      hintStyle: const TextStyle(
                        fontSize: 15,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w400,
                      ),
                      prefixIcon: Padding(
                        padding: const EdgeInsets.all(13),
                        child: SvgPicture.asset(
                          AppImages.lock,
                          height: 18,
                          width: 18,
                        ),
                      ),
                      suffixIcon: GestureDetector(
                        onTap:
                            () =>
                                userController.hidePassword.value =
                                    !userController.hidePassword.value,
                        child: Icon(
                          size: 20,
                          color: AppColors.textSecondary,
                          userController.hidePassword.value
                              ? Iconsax.eye
                              : Iconsax.eye_slash,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (!userController.reAuthFormKey.currentState!
                          .validate()) {
                        return;
                      }

                      try {
                        // Show loading indicator
                        const ProgressDialog(title: 'Re-authenticating...');

                        // Re-authenticate user
                        await authRepo.reAuthWithEmailAndPassword(
                          userController.user.value.email,
                          userController.reAuthPassword.text.trim(),
                        );

                        // Close loading indicator
                        Navigator.of(
                          Get.context!,
                        ).pop(); // Close loading dialog
                        Navigator.of(context).pop(); // Close bottom sheet

                        // Send password reset email
                        await authRepo.sendPasswordResetEmail(
                          userController.user.value.email,
                        );

                        userController.reAuthPassword.clear();

                        // Show success message
                        Loaders.customToast(
                          message:
                              'Password reset email sent! Check your inbox.',
                        );
                      } catch (e) {
                        // Close loading indicator
                        Navigator.of(
                          Get.context!,
                        ).pop(); // Close loading dialog

                        // Show error message
                        Loaders.errorSnackBar(
                          title: 'Authentication Failed',
                          message: e.toString(),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Send Password Reset Email',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }
}
