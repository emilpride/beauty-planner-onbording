import 'dart:developer';
import 'package:beautymirror/features/personalization/controllers/user_controller.dart';
import 'package:get/get.dart';
import '../../../common/widgets/loaders/loaders.dart';
import '../../../common/widgets/loaders/progress_dialog.dart';
import '../../../utils/helpers/dummy_data_generator.dart';

class UploadDummyDataController extends GetxController {
  static UploadDummyDataController get instance => Get.find();

  final DummyDataGenerator _dummyDataGenerator = Get.put(DummyDataGenerator());
  final userController = UserController.instance;

  //upload dummy data
  Future<void> uploadDummyData() async {
    try {
      Get.dialog(
        const ProgressDialog(title: 'Uploading Dummy Data...'),
        barrierDismissible: false,
      );
      await uploadHistoricalTaskData();
      await generatePatternedMoodData();

      Get.back(); // Close the progress dialog

      log('Upload dummy data process completed');
    } catch (e) {
      Get.back(); // Close the progress dialog
      Loaders.customToast(message: 'An error occurred, please try again.');
      log('Upload dummy data failed: $e');
    }
  }

  Future<void> uploadHistoricalTaskData() async {
    try {
      await _dummyDataGenerator.runGeneration(
        userController.user.value,
        userController.user.value.activities,
      );
    } catch (e) {
      log("Error in uploadHistoricalTaskData: $e");
    }
  }

  Future<void> generateTestMoodData() async {
    final currentUserId = userController.user.value.id;

    try {
      // Generate mood data for the past year with balanced distribution
      await _dummyDataGenerator.generateMoodDataForPastYear(
        userId: currentUserId,
        moodDistribution: 3, // balanced
      );

      log('Test data generation completed successfully!');
    } catch (e) {
      log('Error generating test data: $e');
    }
  }

  Future<void> generatePatternedMoodData() async {
    final currentUserId = userController.user.value.id;

    // Generate data with weekly patterns (weekends are happier)
    await _dummyDataGenerator.generateMoodDataWithPatterns(
      userId: currentUserId,
      startDate: DateTime.now().subtract(
        const Duration(days: 365),
      ), // One year ago
      endDate: DateTime.now(),
      weekendMoodBias: 0.2, // 20% higher chance of happy mood on weekends
    );
  }

  Future<void> clearTestData() async {
    final currentUserId = userController.user.value.id;

    await _dummyDataGenerator.clearMoodDataForUser(currentUserId);
    log('Test data cleared successfully!');
  }
}
