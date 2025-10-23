import 'package:beautymirror/data/repositories/authentication/biometric_repository.dart';
import 'package:get/get.dart';

import '../../../common/widgets/loaders/loaders.dart';
import 'user_controller.dart';
// Import your services
// import 'biometric_service.dart';
// import 'user_controller.dart';

class BiometricController extends GetxController {
  static BiometricController get instance => Get.find();

  final biometricService = Get.put(BiometricRepository());
  final userController = UserController.instance;

  // Observable for switch states
  final RxBool biometricEnabled = false.obs;
  final RxBool faceIdEnabled = false.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    initializeBiometricSettings();
  }

  /// Initialize biometric settings from user data
  void initializeBiometricSettings() {
    biometricEnabled.value = userController.user.value.biometricEnabled;
    faceIdEnabled.value = userController.user.value.faceIdEnabled;
  }

  /// Toggle Biometric ID (Fingerprint/Generic Biometric)
  Future<void> toggleBiometricId(bool value) async {
    // Check if biometric is available
    if (!biometricService.isBiometricAvailable.value) {
      Loaders.customToast(
        message: 'Biometric authentication is not available on this device',
      );
      return;
    }

    // If user is trying to enable biometric
    if (value) {
      final authenticated = await biometricService.authenticateUser(
        reason: 'Please authenticate to enable biometric login',
      );

      if (authenticated) {
        await _updateBiometricSetting('biometric', true);
        biometricEnabled.value = true;
        Loaders.customToast(message: 'Biometric authentication enabled');
      }
    } else {
      // Disable biometric - require authentication first
      final authenticated = await biometricService.authenticateUser(
        reason: 'Please authenticate to disable biometric login',
      );

      if (authenticated) {
        await _updateBiometricSetting('biometric', false);
        biometricEnabled.value = false;
        Loaders.customToast(message: 'Biometric authentication disabled');
      }
    }
  }

  /// Toggle Face ID
  Future<void> toggleFaceId(bool value) async {
    // Check if Face ID is available
    if (!biometricService.isFaceIdAvailable) {
      Loaders.customToast(message: 'Face ID is not available on this device');
      return;
    }

    // If user is trying to enable Face ID
    if (value) {
      final authenticated = await biometricService.authenticateUser(
        reason: 'Please authenticate to enable Face ID',
      );

      if (authenticated) {
        await _updateBiometricSetting('faceId', true);
        faceIdEnabled.value = true;
        Loaders.customToast(message: 'Face ID enabled');
      }
    } else {
      // Disable Face ID - require authentication first
      final authenticated = await biometricService.authenticateUser(
        reason: 'Please authenticate to disable Face ID',
      );

      if (authenticated) {
        await _updateBiometricSetting('faceId', false);
        faceIdEnabled.value = false;
        Loaders.customToast(message: 'Face ID disabled');
      }
    }
  }

  /// Update biometric setting in Firestore and local state
  Future<void> _updateBiometricSetting(String type, bool value) async {
    try {
      isLoading.value = true;

      if (type == 'biometric') {
        userController.user.value.biometricEnabled = value;
        userController.updateSingleField({'biometricEnabled': value});
      } else if (type == 'faceId') {
        userController.user.value.faceIdEnabled = value;
        userController.updateSingleField({'FaceIdEnabled': value});
      }
    } catch (e) {
      print('Error updating biometric setting: $e');
      Loaders.customToast(
        message: 'Failed to update settings. Please try again.',
      );
    } finally {
      isLoading.value = false;
    }
  }

  /// Check if any biometric method is enabled
  bool get isAnyBiometricEnabled {
    return biometricEnabled.value || faceIdEnabled.value;
  }

  /// Authenticate on app launch if biometric is enabled
  Future<bool> authenticateOnAppLaunch() async {
    if (!isAnyBiometricEnabled) {
      return true; // No biometric required, allow access
    }

    final authenticated = await biometricService.authenticateUser(
      reason: 'Please authenticate to access your account',
      useErrorDialogs: true,
      stickyAuth: true,
    );

    return authenticated;
  }
}
