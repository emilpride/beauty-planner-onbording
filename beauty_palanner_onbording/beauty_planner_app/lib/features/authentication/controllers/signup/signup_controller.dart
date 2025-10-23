import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../common/widgets/loaders/progress_dialog.dart';
import '../../../../data/repositories/ai_analysis/ai_analysis_repository.dart';
import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../data/repositories/height/height_repository.dart';
import '../../../../data/repositories/mood/mood_repository.dart';
import '../../../../data/repositories/user/user_repository.dart';
import '../../../../data/repositories/weight/weight_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/network/network_manager.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../models/password_requirement_model.dart';
import '../../screens/signup/verify_email.dart';
import '../onboarding/onboarding_controller.dart';

class SignupController extends GetxController {
  static SignupController get instance => Get.find();

  //variables
  final hidePassword = true.obs;
  final privacyPolicy = false.obs;
  final email = TextEditingController();
  final password = TextEditingController();
  final rePassword = TextEditingController();

  // Password requirements
  final passwordRequirements =
      [
        PasswordRequirement(label: '8 characters', met: false.obs),
        PasswordRequirement(label: '1 symbol', met: false.obs),
        PasswordRequirement(label: 'Capital letter', met: false.obs),
        PasswordRequirement(label: '1 number', met: false.obs),
      ].obs;

  // Show password requirements widget
  final showPasswordRequirements = false.obs;

  final userRepository = UserRepository.instance;
  final userController = UserController.instance;
  final moodRepository = Get.put(MoodRepository());
  final weightRepository = Get.put(WeightRepository());
  final heightRepository = Get.put(HeightRepository());
  final aiAnalysisRepository = AIAnalysisRepository.instance;

  GlobalKey<FormState> signUPFormKey = GlobalKey<FormState>();

  void checkPasswordRequirements(String password) {
    showPasswordRequirements.value = password.isNotEmpty;
    passwordRequirements[0].met.value = password.length >= 8;
    passwordRequirements[1].met.value = RegExp(
      r'[!@#\$%^&*(),.?":{}|<>]',
    ).hasMatch(password);
    passwordRequirements[2].met.value = RegExp(r'[A-Z]').hasMatch(password);
    passwordRequirements[3].met.value = RegExp(r'[0-9]').hasMatch(password);

    // Update background and text colors based on the status
    for (var i = 0; i < passwordRequirements.length; i++) {
      var requirement = passwordRequirements[i];
      if (requirement.met.value) {
        requirement.backgroundColor.value = Colors.green.shade100;
        requirement.color.value = Colors.green;
      } else {
        if (requirement.color.value != AppColors.error) {
          requirement.backgroundColor.value = AppColors.lightContainer;
          requirement.color.value = AppColors.textSecondary;
        }
      }
    }
  }

  void checkPasswordRequirementsSignUp(String password) {
    showPasswordRequirements.value = password.isNotEmpty;
    passwordRequirements[0].met.value = password.length >= 8;
    passwordRequirements[1].met.value = RegExp(
      r'[!@#\$%^&*(),.?":{}|<>]',
    ).hasMatch(password);
    passwordRequirements[2].met.value = RegExp(r'[A-Z]').hasMatch(password);
    passwordRequirements[3].met.value = RegExp(r'[0-9]').hasMatch(password);

    // Update background and text colors based on the status
    for (var i = 0; i < passwordRequirements.length; i++) {
      var requirement = passwordRequirements[i];
      if (requirement.met.value) {
        requirement.backgroundColor.value = Colors.green.shade100;
        requirement.color.value = Colors.green;
      } else {
        requirement.backgroundColor.value = AppColors.error.withOpacity(0.1);
        requirement.color.value = AppColors.error;
      }
    }
  }

  //SignUp
  /// Function to trigger the analysis process and show the dialog
  Future<void> emailSignUp() async {
    final isValid = signUPFormKey.currentState?.validate() ?? false;
    if (!isValid) {
      checkPasswordRequirementsSignUp(password.text.trim());
      return;
    }
    try {
      Get.dialog(
        const ProgressDialog(title: 'Signing Up...'),
        barrierDismissible: false,
      );
      await _signup();

      Get.back(); // Close the progress dialog

      Get.offAll(() => VerifyEmailScreen(email: email.text.trim()));

      log('Sign up process completed');
    } catch (e) {
      Get.back(); // Close the progress dialog
      Loaders.customToast(message: 'An error occurred, please try again.');
      log('Sign in failed: $e');
    }
  }

  Future<void> _signup() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      return;
    }

    //form validation
    if (!signUPFormKey.currentState!.validate()) {
      checkPasswordRequirementsSignUp(password.text.trim());
      return;
    }

    final userCredential = await AuthenticationRepository.instance
        .registerWithEmailAndPassword(email.text.trim(), password.text.trim());

    final newUser = OnboardingController.instance.userModel.value.copyWith(
      id: userCredential.user!.uid,
      email: email.text.trim(),
      languageCode: 'en',
    );
    if (newUser.id.isEmpty) {
      Loaders.errorSnackBar(
        title: 'Oh Snap!',
        message: 'Something went wrong. Please try again later.',
      );
      return;
    }
    await userRepository.saveUserRecord(newUser);

    await moodRepository.updateMoodEntry(
      newUser.id,
      OnboardingController.instance.moodModel.value,
    );

    await weightRepository.addWeights(
      newUser.id,
      OnboardingController.instance.weightModel.value,
    );

    await heightRepository.addHeights(
      newUser.id,
      OnboardingController.instance.heightModel.value,
    );

    await aiAnalysisRepository.saveAnalysis(
      newUser.id,
      OnboardingController.instance.aiAnalysisModel.value,
    );

    await AuthenticationRepository.instance.initialize();
  }

  Future<void> googleSignIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      return;
    }

    final userCredentials =
        await AuthenticationRepository.instance.signInWithGoogle();

    final newUser = OnboardingController.instance.userModel.value.copyWith(
      id: userCredentials!.user!.uid,
      email: email.text.trim(),
      languageCode: 'en',
    );
    if (newUser.id.isEmpty) {
      Loaders.errorSnackBar(
        title: 'Oh Snap!',
        message: 'Something went wrong. Please try again later.',
      );
      return;
    }
    await userRepository.saveUserRecord(newUser);

    await moodRepository.updateMoodEntry(
      newUser.id,
      OnboardingController.instance.moodModel.value,
    );

    await weightRepository.addWeights(
      newUser.id,
      OnboardingController.instance.weightModel.value,
    );

    await aiAnalysisRepository.saveAnalysis(
      newUser.id,
      OnboardingController.instance.aiAnalysisModel.value,
    );

    await AuthenticationRepository.instance.initialize();
  }

  //facebook signup
  Future<void> facebookSignIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      return;
    }

    final userCredentials =
        await AuthenticationRepository.instance.signUpWithFacebook();
    final newUser = OnboardingController.instance.userModel.value.copyWith(
      id: userCredentials!.user!.uid,
      email: email.text.trim(),
      languageCode: 'en',
    );
    if (newUser.id.isEmpty) {
      Loaders.errorSnackBar(
        title: 'Oh Snap!',
        message: 'Something went wrong. Please try again later.',
      );
      return;
    }
    await userRepository.saveUserRecord(newUser);

    await moodRepository.updateMoodEntry(
      newUser.id,
      OnboardingController.instance.moodModel.value,
    );

    await weightRepository.addWeights(
      newUser.id,
      OnboardingController.instance.weightModel.value,
    );

    await aiAnalysisRepository.saveAnalysis(
      newUser.id,
      OnboardingController.instance.aiAnalysisModel.value,
    );

    await AuthenticationRepository.instance.initialize();
  }

  Future<void> appleSignIn() async {
    final isConnected = await NetworkManager.instance.isConnected();
    if (!isConnected) {
      return;
    }

    final userCredentials =
        await AuthenticationRepository.instance.signInWithApple();
    final newUser = OnboardingController.instance.userModel.value.copyWith(
      id: userCredentials!.user!.uid,
      email: email.text.trim(),
      languageCode: 'en',
    );
    if (newUser.id.isEmpty) {
      Loaders.errorSnackBar(
        title: 'Oh Snap!',
        message: 'Something went wrong. Please try again later.',
      );
      return;
    }
    await userRepository.saveUserRecord(newUser);

    await moodRepository.updateMoodEntry(
      newUser.id,
      OnboardingController.instance.moodModel.value,
    );

    await weightRepository.addWeights(
      newUser.id,
      OnboardingController.instance.weightModel.value,
    );

    await aiAnalysisRepository.saveAnalysis(
      newUser.id,
      OnboardingController.instance.aiAnalysisModel.value,
    );

    await AuthenticationRepository.instance.initialize();
  }
}
