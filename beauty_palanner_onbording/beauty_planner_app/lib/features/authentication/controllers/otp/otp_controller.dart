// --- OTP CONTROLLER ---
import 'package:get/get.dart';

class OtpController extends GetxController {
  static OtpController get instance => Get.find<OtpController>();
  // final FirebaseFunctions _functions = FirebaseFunctions.instance;
  final RxBool isLoading = false.obs;
  final RxInt countdown = 60.obs;
  final RxString otp = ''.obs;

  @override
  void onInit() {
    super.onInit();
    // Start the countdown timer automatically when the screen loads
    startCountdown();
  }

  /// Starts a countdown timer from 60 seconds.
  void startCountdown() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (countdown.value > 0) {
        countdown.value--;
        return true; // continue
      } else {
        return false; // stop
      }
    });
  }

  /// Resets the countdown timer to 60 seconds and starts it again.
  void resetCountdown() {
    countdown.value = 60;
    startCountdown();
  }

  /// Sends an OTP to the user's email by calling a backend function.
  Future<void> sendEmailOtp(String email) async {
    isLoading.value = true;
    try {
      // --- BACKEND CALL ---
      // This is where you would call your Firebase Cloud Function to send the OTP.
      // final callable = _functions.httpsCallable('sendEmailOtp');
      // final response = await callable.call(<String, dynamic>{'email': email});
      //
      // if (response.data['success']) {
      //   Get.snackbar('Success', 'OTP sent to your email.');
      // } else {
      //   Get.snackbar('Error', response.data['message'] ?? 'Failed to send OTP.');
      // }

      // For demonstration purposes, we'll just simulate a success.
      await Future.delayed(
        const Duration(seconds: 2),
      ); // Simulate network delay
      Get.snackbar('Success', 'OTP sent to $email');
    } catch (e) {
      // Get.snackbar('Error', e.toString());
      Get.snackbar('Error', 'An error occurred while sending the OTP.');
    } finally {
      isLoading.value = false;
    }
  }

  /// Verifies the OTP entered by the user by calling a backend function.
  Future<void> verifyEmailOtp(String email) async {
    if (otp.value.length < 4) {
      Get.snackbar('Error', 'Please enter the 4-digit code.');
      return;
    }
    isLoading.value = true;
    try {
      // --- BACKEND CALL ---
      // This is where you would call your Firebase Cloud Function to verify the OTP.
      // final callable = _functions.httpsCallable('verifyEmailOtp');
      // final response = await callable.call(<String, dynamic>{
      //   'email': email,
      //   'otp': otp.value,
      // });
      //
      // if (response.data['success']) {
      //   Get.snackbar('Success', 'OTP verified successfully!');
      //   // Navigate to the password reset screen
      //   Get.offAndToNamed('/reset-password', arguments: email);
      // } else {
      //   Get.snackbar('Error', response.data['message'] ?? 'Invalid OTP.');
      // }

      // For demonstration purposes, we'll simulate a success.
      await Future.delayed(
        const Duration(seconds: 2),
      ); // Simulate network delay
      Get.snackbar('Success', 'OTP Verified!');
      // TODO: Navigate to your password reset screen
      // Get.offAndToNamed('/reset-password', arguments: email);
    } catch (e) {
      // Get.snackbar('Error', e.toString());
      Get.snackbar('Error', 'Invalid OTP. Please try again.');
    } finally {
      isLoading.value = false;
    }
  }

  /// Resends the OTP if the countdown is over.
  void resendOtp(String email) {
    if (countdown.value == 0) {
      resetCountdown();
      sendEmailOtp(email);
    } else {
      Get.snackbar('Info', 'Please wait for the timer to finish.');
    }
  }
}
