import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';

import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../common/widgets/loaders/progress_dialog.dart';
import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../utils/network/network_manager.dart';
import '../../../personalization/controllers/user_controller.dart';

class LoginController extends GetxController {
  static LoginController get instance => Get.find();

  //variables
  final rememberMe = false.obs;
  final hidePassword = true.obs;
  final localStorage = GetStorage();
  final email = TextEditingController();
  final password = TextEditingController();
  GlobalKey<FormState> loginFormKey = GlobalKey<FormState>();

  final userController = UserController.instance;

  // @override
  // void onInit() {
  //   super.onInit();
  // }

  Future<void> emailSignIn() async {
    try {
      Get.dialog(
        const ProgressDialog(title: 'Signing In...'),
        barrierDismissible: false,
      );
      await emailAndPasswordSignIn();

      Get.back(); // Close the progress dialog

      log('Sign in process completed');
    } catch (e) {
      Get.back(); // Close the progress dialog
      Loaders.customToast(message: 'An error occurred, please try again.');
      log('Sign in failed: $e');
    }
  }

  //SignUp
  Future<void> emailAndPasswordSignIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      throw Exception('No internet connection');
    }

    //form validation
    if (!loginFormKey.currentState!.validate()) {
      throw Exception('Please fill in all required fields correctly');
    }

    // final userCredential =
    await AuthenticationRepository.instance.loginWithEmailAndPassword(
      email.text.trim(),
      password.text.trim(),
    );

    AuthenticationRepository.instance.screenRedirect();
  }

  Future<void> googleLogIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) return;

    try {
      // 1) Sign in with Google (establish Firebase Auth session)
      final userCredentials =
          await AuthenticationRepository.instance.signInWithGoogle();

      if (userCredentials == null) {
        // User cancelled
        return;
      }

      // 2) Check if user exists in Firestore (Users collection)
      final email = userCredentials.user?.email;
      if (email == null) {
        // If somehow no email, send to onboarding
        await _openQuizOnboarding();
        return;
      }

      final exists =
          await AuthenticationRepository.instance.checkIfUserExists(email);
      if (!exists) {
        // 3) Redirect to quiz onboarding in same tab (web) or external browser (mobile)
        await _openQuizOnboarding();
        return;
      }

      // 4) Proceed to app
      AuthenticationRepository.instance.screenRedirect();
    } catch (e) {
      Loaders.customToast(message: 'Google sign-in failed. Please try again.');
    }
  }

  Future<void> _openQuizOnboarding() async {
    const urlStr = 'https://quiz.beautymirror.app';
    final uri = Uri.parse(urlStr);
    // Prefer same-tab on web
    if (!GetPlatform.isWeb) {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        return;
      }
    }
    // Web or fallback
    await launchUrlString(
      urlStr,
      webOnlyWindowName: '_self',
    );
  }

  // facebook login
  Future<void> facebookLogIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      return;
    }

    final userCredentials =
        await AuthenticationRepository.instance.loginWithFacebook();
    if (userCredentials == null) {
      Loaders.warningSnackBar(title: 'Oh Snap!', message: 'Account not found!');
      return;
    }

    AuthenticationRepository.instance.screenRedirect();
  }

  // apple login
  Future<void> appleLogIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      return;
    }

    final userCredentials =
        await AuthenticationRepository.instance.loginInWithApple();
    if (userCredentials == null) {
      Loaders.warningSnackBar(title: 'Oh Snap!', message: 'Account not found!');
      return;
    }

    AuthenticationRepository.instance.screenRedirect();
  }
}
