import 'dart:developer';
import 'dart:io';
import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/common/widgets/custom_shapes/containers/rounded_container.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../utils/constants/colors.dart';
import '../../../authentication/controllers/camera/camera_controller.dart';

class UploadFacePhoto extends StatefulWidget {
  final Rx<File?> selectedImage;

  const UploadFacePhoto({super.key, required this.selectedImage});

  @override
  State<UploadFacePhoto> createState() => _UploadFacePhotoState();
}

class _UploadFacePhotoState extends State<UploadFacePhoto>
    with WidgetsBindingObserver {
  late MyCameraController controller;

  @override
  void initState() {
    super.initState();
    // Find the existing, permanent instance of MyCameraController
    controller = Get.put(MyCameraController());
    WidgetsBinding.instance.addObserver(this);

    // Ensure the camera is ready when this screen is displayed
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!controller.isCameraInitialized.value ||
          controller.cameraController == null) {
        log("Initializing camera from TakePictureScreen");
        controller.initializeCamera();
      } else {
        log("Resuming camera preview");
        controller.resumeCamera();
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Handles app lifecycle changes to pause/resume the camera
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (Get.isRegistered<MyCameraController>()) {
      controller.onAppLifecycleStateChanged(state);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.light,
      appBar: const BMAppbar(title: ''),
      body: RoundedContainer(
        backgroundColor: Colors.white,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        height: MediaQuery.of(context).size.height * 0.7,
        child: Obx(() {
          // Show a loading indicator while the camera is initializing
          if (controller.isLoading.value ||
              !controller.isCameraInitialized.value ||
              controller.cameraController == null) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.white),
            );
          }

          // Main UI Stack
          return Stack(
            fit: StackFit.expand,
            alignment: Alignment.topCenter,
            children: [
              // Layer 1: Camera Preview
              _buildCameraPreview(),

              // Layer 2: Face Mesh Overlay
              // _buildFaceMeshOverlay(context),

              // Layer 3: UI Controls (Back button and Take Photo button)
              _buildUIControls(context),
            ],
          );
        }),
      ),
    );
  }

  /// Builds the live camera feed
  Widget _buildCameraPreview() {
    return Positioned.fill(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: AspectRatio(
          aspectRatio: controller.cameraController!.value.aspectRatio,
          child: CameraPreview(controller.cameraController!),
        ),
      ),
    );
  }

  /// Builds the face mesh image overlay
  // Widget _buildFaceMeshOverlay(BuildContext context) {
  //   return Center(
  //     child: Image.asset(
  //       'assets/face_mesh.png',
  //       fit: BoxFit.contain,
  //       width: MediaQuery.of(context).size.width * 0.85,
  //       color: Colors.white.withOpacity(0.8), // Adds a slight transparency
  //     ),
  //   );
  // }

  /// Builds the interactive UI elements on top of the camera preview
  Widget _buildUIControls(BuildContext context) {
    return SafeArea(
      child: Stack(
        children: [
          // 'Take Photo' Button
          Positioned(
            bottom: 60,
            left: 24,
            right: 24,
            child: Obx(
              () => SizedBox(
                height: 50,
                width: 145,
                child: ElevatedButton(
                  onPressed:
                      controller.isTakingPicture.value
                          ? null // Disable button while picture is being taken
                          : () async {
                            await controller.takePicture(widget.selectedImage);
                            // The takePicture method in your controller already handles Get.back()
                          },
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        AppColors.primary, // Purple color from image
                    padding: const EdgeInsets.all(0),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 5,
                  ),
                  child:
                      controller.isTakingPicture.value
                          ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 3,
                            ),
                          )
                          : const Text(
                            'Take Photo',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
