import 'package:get/get.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:local_auth/local_auth.dart';
import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_darwin/types/auth_messages_ios.dart';

class BiometricRepository extends GetxController {
  static BiometricRepository get instance => Get.find();

  final LocalAuthentication _localAuth = LocalAuthentication();

  // Observable variables
  final RxBool isBiometricAvailable = false.obs;
  final RxBool canCheckBiometrics = false.obs;
  final RxList<BiometricType> availableBiometrics = <BiometricType>[].obs;
  final RxBool isAuthenticating = false.obs;

  @override
  void onInit() {
    super.onInit();
    // local_auth is not supported on Flutter Web. Short-circuit to disabled.
    if (kIsWeb) {
      canCheckBiometrics.value = false;
      isBiometricAvailable.value = false;
      availableBiometrics.clear();
      return;
    }

    checkBiometricAvailability();
  }

  /// Check if biometric authentication is available on the device
  Future<void> checkBiometricAvailability() async {
    if (kIsWeb) {
      canCheckBiometrics.value = false;
      isBiometricAvailable.value = false;
      availableBiometrics.clear();
      return;
    }
    try {
      canCheckBiometrics.value = await _localAuth.canCheckBiometrics;
      isBiometricAvailable.value = await _localAuth.isDeviceSupported();

      if (canCheckBiometrics.value) {
        availableBiometrics.value = await _localAuth.getAvailableBiometrics();
      }
    } catch (e) {
      print('Error checking biometric availability: $e');
      canCheckBiometrics.value = false;
      isBiometricAvailable.value = false;
    }
  }

  /// Check if Face ID is available
  bool get isFaceIdAvailable {
    return availableBiometrics.contains(BiometricType.face);
  }

  /// Check if Fingerprint is available
  bool get isFingerprintAvailable {
    return availableBiometrics.contains(BiometricType.fingerprint);
  }

  /// Check if Strong biometric is available (Android)
  bool get isStrongBiometricAvailable {
    return availableBiometrics.contains(BiometricType.strong);
  }

  /// Get the type of biometric available as a readable string
  String get biometricTypeString {
    if (isFaceIdAvailable) {
      return 'Face ID';
    } else if (isFingerprintAvailable) {
      return 'Fingerprint';
    } else if (isStrongBiometricAvailable) {
      return 'Biometric';
    } else {
      return 'None';
    }
  }

  /// Authenticate user with biometrics
  Future<bool> authenticateUser({
    String reason = 'Please authenticate to continue',
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    if (kIsWeb) {
      Get.snackbar(
        'Biometric Unavailable',
        'Biometric authentication is not supported on web. Use your password or OTP.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }
    if (!isBiometricAvailable.value || !canCheckBiometrics.value) {
      Get.snackbar(
        'Biometric Unavailable',
        'Biometric authentication is not available on this device',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }

    try {
      isAuthenticating.value = true;

      final bool authenticated = await _localAuth.authenticate(
        localizedReason: reason,
        authMessages: const <AuthMessages>[
          AndroidAuthMessages(
            signInTitle: 'Biometric Authentication',
            cancelButton: 'Cancel',
            biometricHint: 'Verify your identity',
            biometricNotRecognized: 'Not recognized. Try again.',
            biometricSuccess: 'Authentication successful',
          ),
          IOSAuthMessages(
            cancelButton: 'Cancel',
            goToSettingsButton: 'Settings',
            goToSettingsDescription: 'Please set up biometric authentication.',
            lockOut:
                'Biometric authentication is disabled. Please lock and unlock your screen to enable it.',
          ),
        ],
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );

      isAuthenticating.value = false;
      return authenticated;
    } catch (e) {
      isAuthenticating.value = false;
      print('Error during biometric authentication: $e');
      Get.snackbar(
        'Authentication Error',
        'An error occurred during authentication. Please try again.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }
  }

  /// Authenticate with specific message and callback
  Future<void> authenticateWithCallback({
    required String reason,
    required Function() onSuccess,
    Function()? onFailure,
  }) async {
    final authenticated = await authenticateUser(reason: reason);

    if (authenticated) {
      onSuccess();
    } else {
      if (onFailure != null) {
        onFailure();
      }
    }
  }

  /// Stop biometric authentication (if in progress)
  Future<void> stopAuthentication() async {
    if (kIsWeb) return;
    try {
      await _localAuth.stopAuthentication();
      isAuthenticating.value = false;
    } catch (e) {
      print('Error stopping authentication: $e');
    }
  }
}
