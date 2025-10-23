import 'dart:developer';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/custom_shapes/curved_shapes/custom_progress_indicator.dart';
import '../../../../utils/constants/colors.dart';
import '../../controllers/camera/camera_controller.dart';
import 'widgets/camera_overlay_painter.dart';

class CameraScreen extends StatefulWidget {
  final String instructions;
  final OverlayShape shape;
  final Rx<File?> selectedImage;
  final Widget? bulletPointText;

  const CameraScreen({
    super.key,
    required this.instructions,
    required this.shape,
    required this.selectedImage,
    this.bulletPointText,
  });

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen>
    with WidgetsBindingObserver {
  late MyCameraController controller;

  @override
  void initState() {
    super.initState();
    // Get the existing controller
    controller = Get.find<MyCameraController>();
    WidgetsBinding.instance.addObserver(this);

    // Initialize camera when entering this screen
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!controller.isCameraInitialized.value ||
          controller.cameraController == null) {
        log("Initializing camera from CameraScreen");
        controller.initializeCamera();
      } else {
        log("Camera already initialized, resuming preview");
        // Camera is already initialized, just resume if needed
        controller.resumeCamera();
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // Don't dispose the controller here - let the parent manage it
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    controller.onAppLifecycleStateChanged(state);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Pause camera when going back
        await controller.pauseCamera();
        return true;
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Obx(() {
          // Show loading indicator while camera is initializing
          if (controller.isLoading.value ||
              !controller.isCameraInitialized.value ||
              controller.cameraController == null) {
            log(
              controller.cameraController == null
                  ? "Camera controller is null"
                  : "Camera not initialized or loading",
            );
            return const Center(child: CustomRoundedProgressIndicator());
          }

          // Use Stack to layer the camera preview, overlay, and UI controls
          return Stack(
            alignment: Alignment.topCenter,
            children: [
              // The live camera preview
              Positioned.fill(
                child: AspectRatio(
                  aspectRatio: controller.cameraController!.value.aspectRatio,
                  child: CameraPreview(controller.cameraController!),
                ),
              ),

              // The semi-transparent overlay with cutout shape
              Positioned.fill(
                child: CustomPaint(
                  painter: OverlayPainter(shape: widget.shape),
                ),
              ),

              // UI controls at bottom
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        // Spacer for layout balance
                        const SizedBox(width: 60),
                        // Main capture button
                        Obx(
                          () => GestureDetector(
                            onTap:
                                controller.isTakingPicture.value
                                    ? null
                                    : () async {
                                      await controller.takePicture(
                                        widget.selectedImage,
                                      );
                                    },
                            child: Opacity(
                              opacity:
                                  controller.isTakingPicture.value ? 0.5 : 1.0,
                              child: Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.transparent,
                                  border: Border.all(
                                    color: Colors.white,
                                    width: 3,
                                  ),
                                ),
                                padding: const EdgeInsets.all(4),
                                child: const RoundedContainer(
                                  radius: 100,
                                  backgroundColor: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Camera switch button
                        SizedBox(
                          width: 48,
                          height: 48,
                          child: IconButton(
                            onPressed: () => controller.switchCamera(),
                            icon: const Icon(Icons.sync, color: Colors.white),
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.black.withOpacity(0.3),
                              shape: const CircleBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.only(
                        right: 20.0,
                        left: 20.0,
                        bottom: 20.0,
                      ),
                      color: const Color(0xFF646C8A).withOpacity(0.9),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(height: 20),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              vertical: 12,
                              horizontal: 16,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child:
                                widget.bulletPointText ??
                                Text(
                                  widget.instructions,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 20,
                                  ),
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        }),
      ),
    );
  }
}
