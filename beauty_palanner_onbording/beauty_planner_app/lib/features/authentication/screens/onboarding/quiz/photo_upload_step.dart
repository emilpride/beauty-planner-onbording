import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../controllers/camera/camera_controller.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../camera_screen.dart';
import '../widgets/camera_overlay_painter.dart';
import '../widgets/photo_upload_item.dart';

class PhotoUploadStep extends StatefulWidget {
  const PhotoUploadStep({super.key});

  @override
  State<PhotoUploadStep> createState() => _PhotoUploadStepState();
}

class _PhotoUploadStepState extends State<PhotoUploadStep>
    with WidgetsBindingObserver {
  late MyCameraController cameraController;

  @override
  void initState() {
    super.initState();
    // Use Get.put with permanent: true to ensure it persists across navigation
    cameraController = Get.put(MyCameraController(), permanent: true);
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (Get.isRegistered<MyCameraController>()) {
      cameraController.onAppLifecycleStateChanged(state);
    }
  }

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    final size = MediaQuery.of(context).size;

    return AnimatedPositioned(
      duration: const Duration(milliseconds: 800),
      curve: Curves.fastOutSlowIn,
      bottom: controller.isReady.value ? 30 : -size.height,
      left: 0,
      right: 0,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 600),
        curve: Curves.fastOutSlowIn,
        height: size.height * controller.currentCardHeight,
        padding: const EdgeInsets.only(
          top: 0,
          right: 16.0,
          left: 16.0,
          bottom: 12.0,
        ),
        margin: const EdgeInsets.symmetric(horizontal: 16),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(16.0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 30,
              offset: Offset(0, -10),
            ),
          ],
        ),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 400),
          transitionBuilder: (child, animation) {
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.0, 0.3),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            );
          },
          child: Obx(() {
            bool condition =
                cameraController.faceImage.value != null &&
                cameraController.hairImage.value != null &&
                cameraController.bodyImage.value != null;
            return SingleChildScrollView(
              child: SizedBox(
                height: 650,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: AppSizes.lg),
                    // Title
                    const Text(
                      'Upload Clear Photos Of Your Face, Hair, And Full Body',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),

                    const Spacer(),
                    PhotoUploadItem(
                      label: 'Face',
                      image:
                          controller.userModel.value.gender == 1
                              ? AppImages.faceMale
                              : AppImages.faceFemale,
                      selectedImage: cameraController.faceImage,
                      onTap:
                          () => _navigateToCamera(
                            instructions:
                                'Make sure your face is within the frame and clearly visible.',
                            shape: OverlayShape.oval,
                            selectedImage: cameraController.faceImage,
                          ),
                    ),
                    const Spacer(),
                    PhotoUploadItem(
                      label: 'Hair',
                      image:
                          controller.userModel.value.gender == 1
                              ? AppImages.hairMale
                              : AppImages.hairFemale,
                      selectedImage: cameraController.hairImage,
                      onTap:
                          () => _navigateToCamera(
                            instructions:
                                'Keep your hair uncovered and in the frame.',
                            shape: OverlayShape.rectangle,
                            selectedImage: cameraController.hairImage,
                          ),
                    ),
                    const Spacer(),
                    PhotoUploadItem(
                      label: 'Body',
                      image:
                          controller.userModel.value.gender == 1
                              ? AppImages.bodyMale
                              : AppImages.bodyFemale,
                      selectedImage: cameraController.bodyImage,
                      onTap:
                          () => _navigateToCamera(
                            instructions:
                                'Ensure your full body is visible within the square frame.',
                            shape: OverlayShape.rectangle,
                            selectedImage: cameraController.bodyImage,
                            bulletPointText: Column(
                              children: [
                                _buildBulletPoint(
                                  'Please stand straight in front of a plain background.',
                                ),
                                _buildBulletPoint(
                                  'Ensure your full body is visible within the square frame.',
                                ),
                                _buildBulletPoint(
                                  'Wear form-fitting clothes and use even, natural lighting.',
                                ),
                              ],
                            ),
                          ),
                    ),
                    const Spacer(),
                    SizedBox(
                      height: 50,
                      width: double.infinity,
                      child: Opacity(
                        opacity: condition ? 1.0 : 0.6,
                        child: ElevatedButton(
                          onPressed: () {
                            if (condition) {
                              controller.startAnalysisProcess(
                                images: [
                                  cameraController.faceImage.value!,
                                  cameraController.hairImage.value!,
                                  cameraController.bodyImage.value!,
                                ],
                              );
                              // Properly dispose the controller
                              _disposeCameraController();
                            }
                            controller.x.value++;
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            minimumSize: const Size(double.infinity, 45),
                            maximumSize: const Size(double.infinity, 45),
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            "Next",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  void _navigateToCamera({
    required String instructions,
    required OverlayShape shape,
    required Rx<File?> selectedImage,
    Widget? bulletPointText,
  }) async {
    // No need to dispose - let the camera screen handle initialization
    // Just pause current preview if running
    if (cameraController.isCameraInitialized.value) {
      await cameraController.pauseCamera();
    }

    await Get.to(
      () => CameraScreen(
        instructions: instructions,
        shape: shape,
        selectedImage: selectedImage,
        bulletPointText: bulletPointText,
      ),
    );

    // No need to reinitialize here - the controller should maintain state
  }

  void _disposeCameraController() async {
    try {
      await cameraController.disposeController();
      // Force delete the controller
      if (Get.isRegistered<MyCameraController>()) {
        await Get.delete<MyCameraController>(force: true);
      }
    } catch (e) {
      print('Error disposing camera controller: $e');
    }
  }

  Widget _buildBulletPoint(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Text(
          '• ',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w400),
        ),
        Expanded(
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}
