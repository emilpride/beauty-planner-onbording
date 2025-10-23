import 'package:flutter/services.dart' show rootBundle;
import 'package:get/get.dart';

class TermsAndConditionsController extends GetxController {
  static TermsAndConditionsController get instance => Get.find();

  @override
  void onInit() {
    loadMarkdown();
    super.onInit();
  }

  RxString termsAndConditionsString = ''.obs;
  RxString privacyPolicyString = ''.obs;
  Future<void> loadMarkdown() async {
    final terms = await rootBundle.loadString('assets/terms_and_conditions.md');
    final policy = await rootBundle.loadString('assets/privacy_policy.md');
    termsAndConditionsString.value = terms;
    privacyPolicyString.value = policy;
  }
}
