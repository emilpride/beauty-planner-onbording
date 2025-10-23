import 'package:beautymirror/common/widgets/loaders/loaders.dart';
import 'package:get/get.dart';
import '../../../data/repositories/authentication/authentication_repository.dart';

class LinkedAccountsController extends GetxController {
  final _authRepo = AuthenticationRepository.instance;

  // Observable list of linked providers
  final linkedProviders = <String>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadLinkedProviders();
  }

  // Load currently linked providers
  void loadLinkedProviders() {
    linkedProviders.value = _authRepo.getLinkedProviders();
  }

  // Check if a provider is linked
  bool isProviderLinked(String providerId) {
    return _authRepo.isProviderLinked(providerId);
  }

  // Link Google Account
  Future<void> linkGoogleAccount() async {
    try {
      isLoading.value = true;
      await _authRepo.linkGoogleAccount();
      loadLinkedProviders();
      Loaders.customToast(message: 'Google account linked successfully');
    } catch (e) {
      Loaders.customToast(message: e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  // Link Apple Account
  Future<void> linkAppleAccount() async {
    try {
      isLoading.value = true;
      await _authRepo.linkAppleAccount();
      loadLinkedProviders();
      Get.snackbar(
        'Success',
        'Apple account linked successfully',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  // Link Facebook Account
  Future<void> linkFacebookAccount() async {
    try {
      isLoading.value = true;
      await _authRepo.linkFacebookAccount();
      loadLinkedProviders();
      Get.snackbar(
        'Success',
        'Facebook account linked successfully',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  // Unlink an account
  Future<void> unlinkAccount(String providerId) async {
    try {
      isLoading.value = true;
      await _authRepo.unlinkAccount(providerId);
      loadLinkedProviders();
      Get.snackbar(
        'Success',
        'Account unlinked successfully',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }
}
