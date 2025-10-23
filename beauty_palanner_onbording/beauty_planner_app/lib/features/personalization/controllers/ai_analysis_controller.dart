import 'package:get/get.dart';

import '../../../data/models/ai_analysis_model.dart';
import '../../../data/repositories/ai_analysis/ai_analysis_repository.dart';
import 'user_controller.dart';

class AIAnalysisController extends GetxController {
  static AIAnalysisController get instance => Get.find();

  final profileLoading = false.obs;
  Rx<AIAnalysisModel> aiAnalysis = AIAnalysisModel.empty().obs;
  final aiAnalysisRepository = Get.put(AIAnalysisRepository());
  final userController = UserController.instance;

  RxInt x = 0.obs;

  Future<void> initialize() async {
    await fecthAIAnalysis();
  }

  Future<void> fecthAIAnalysis() async {
    try {
      profileLoading.value = true;
      final analysis = await aiAnalysisRepository.fetchAnalysis(
        userController.user.value.id,
      );
      aiAnalysis(analysis);
    } catch (e) {
      aiAnalysis(AIAnalysisModel.empty());
    } finally {
      profileLoading.value = false;
    }
  }

  // uploadAiAnalysisPictures() async {
  //   try {
  //     final image = await ImagePicker().pickImage(
  //       source: ImageSource.gallery,
  //       imageQuality: 70,
  //       maxHeight: 512,
  //       maxWidth: 512,
  //     );

  //     if (image != null) {
  //       imageUploading.value = true;
  //       final imageUrl = await userRepository.uploadImage(
  //         'Users/Images/Profile/',
  //         image,
  //       );

  //       //update user img record
  //       Map<String, dynamic> json = {'ProfilePicture': imageUrl};
  //       await userRepository.updateSingleField(json);

  //       user.value.profilePicture = imageUrl;

  //       user.refresh();

  //       imageUploading.value = false;

  //       Loaders.successSnackBar(
  //         title: 'Congratulations',
  //         message: 'Your Profile Image has been updated!',
  //       );
  //     }
  //   } catch (e) {
  //     imageUploading.value = false;
  //     Loaders.warningSnackBar(title: 'Oh Snap', message: e.toString());
  //   }
  // }
}
