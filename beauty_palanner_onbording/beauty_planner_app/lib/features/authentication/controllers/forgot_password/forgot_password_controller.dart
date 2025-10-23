import 'dart:developer';

import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../common/widgets/loaders/progress_dialog.dart';
import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../utils/network/network_manager.dart';
import '../../screens/password_config/reset_password.dart';

class ForgotPasswordController extends GetxController {
  static ForgotPasswordController get instance => Get.find();

  //variables
  final email = TextEditingController();
  GlobalKey<FormState> forgotPasswordFormKey = GlobalKey<FormState>();

  Future<void> sendPasswordResetEmail() async {
    Get.dialog(
      const ProgressDialog(title: 'Sending Email...'),
      barrierDismissible: false,
    );
    await _sendPasswordResetEmail();

    Get.back();

    log('Password reset email sent to: ${email.text.trim()}');
  }

  //send reset password email
  _sendPasswordResetEmail() async {
    try {
      final isConnected = await NetworkManager.instance.isConnected();
      if (!isConnected) {
        return;
      }

      //form validation
      if (!forgotPasswordFormKey.currentState!.validate()) {
        return;
      }

      await AuthenticationRepository.instance.sendPasswordResetEmail(
        email.text.trim(),
      );

      Loaders.customToast(
        message: 'Email Link to Reset your password has been sent',
      );

      Get.to(() => ResetPassword(email: email.text.trim()));
    } catch (e) {
      Loaders.customToast(message: e.toString());
    }
  }

  Future<void> resendPasswordResetEmail() async {
    Get.dialog(
      const ProgressDialog(title: 'Sending Email...'),
      barrierDismissible: false,
    );
    await _resendPasswordResetEmail(email.text.trim());

    Get.back();

    log('Password reset email resent to: ${email.text.trim()}');
  }

  _resendPasswordResetEmail(String email) async {
    try {
      final isConnected = await NetworkManager.instance.isConnected();
      if (!isConnected) {
        return;
      }

      await AuthenticationRepository.instance.sendPasswordResetEmail(email);

      Loaders.customToast(
        message: 'Email Link to Reset your password has been sent',
      );
    } catch (e) {
      Loaders.customToast(message: e.toString());
    }
  }
}
