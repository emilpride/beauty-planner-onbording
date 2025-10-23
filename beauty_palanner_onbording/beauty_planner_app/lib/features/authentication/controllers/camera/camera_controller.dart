import 'dart:developer';
import 'dart:io';
import 'dart:ui';
import 'dart:async';
import 'package:beautymirror/common/widgets/loaders/loaders.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';

class MyCameraController extends GetxController {
  final RxBool isCameraInitialized = false.obs;
  final RxBool isFrontCamera = false.obs;
  final RxBool isLoading = false.obs;
  final RxBool isTakingPicture = false.obs;

  CameraController? _cameraController;
  CameraController? get cameraController => _cameraController;
  List<CameraDescription>? cameras; // Changed to nullable

  final Rx<File?> faceImage = Rx<File?>(null);
  final Rx<File?> hairImage = Rx<File?>(null);
  final Rx<File?> bodyImage = Rx<File?>(null);

  @override
  void onInit() {
    super.onInit();
    initializeCamera();
  }

  @override
  void onClose() {
    disposeController();
    super.onClose();
  }

  // Add this method for when the app goes to background
  void onAppLifecycleStateChanged(AppLifecycleState state) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      // App is inactive, pause camera
      pauseCamera();
    } else if (state == AppLifecycleState.resumed) {
      // App is resumed, reinitialize camera if needed
      if (!isCameraInitialized.value) {
        initializeCamera();
      }
    } else if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached) {
      // App is going to background, dispose camera
      disposeController();
    }
  }

  Future<void> pauseCamera() async {
    if (_cameraController != null && _cameraController!.value.isInitialized) {
      try {
        await _cameraController!.pausePreview();
        log("Camera paused for app lifecycle.");
      } catch (e) {
        log("Error pausing camera: $e");
      }
    }
  }

  Future<void> resumeCamera() async {
    if (_cameraController != null && _cameraController!.value.isInitialized) {
      try {
        await _cameraController!.resumePreview();
        log("Camera resumed for app lifecycle.");
      } catch (e) {
        log("Error resuming camera: $e");
        // If resume fails, try reinitializing
        await initializeCamera();
      }
    }
  }

  // Future<bool> _checkCameraPermission() async {
  //   final permission = await Permission.camera.status;
  //   if (permission.isDenied) {
  //     final result = await Permission.camera.request();
  //     return result.isGranted;
  //   }
  //   return permission.isGranted;
  // }
  Future<bool> _checkCameraPermission() async {
    try {
      // For iOS, try a more direct approach
      if (Platform.isIOS) {
        final permission = await Permission.camera.status;
        log("Current camera permission status: $permission");

        if (permission.isDenied || permission.isRestricted) {
          log("Requesting camera permission...");
          final result = await Permission.camera.request();
          log("Permission request result: $result");

          if (result.isPermanentlyDenied) {
            // Show dialog to go to settings
            Get.dialog(
              AlertDialog(
                title: const Text('Camera Permission Required'),
                content: const Text(
                  'Camera access is required to take pictures. Please enable camera permission in Settings.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () {
                      Get.back();
                      openAppSettings();
                    },
                    child: const Text('Settings'),
                  ),
                ],
              ),
            );
            return false;
          }

          return result.isGranted;
        }

        return permission.isGranted;
      } else {
        // Android permission handling
        final permission = await Permission.camera.status;
        if (permission.isDenied) {
          final result = await Permission.camera.request();
          return result.isGranted;
        }
        return permission.isGranted;
      }
    } catch (e) {
      log("Error checking camera permission: $e");

      // Fallback: try to initialize camera directly and catch the error
      try {
        final cameras = await availableCameras();
        return cameras.isNotEmpty;
      } catch (cameraError) {
        log("Camera availability check failed: $cameraError");
        return false;
      }
    }
  }

  Future<void> initializeCamera() async {
    log("Initializing camera...");
    isLoading.value = true;

    try {
      // Check permissions first
      if (!await _checkCameraPermission()) {
        Get.snackbar("Error", "Camera permission denied");
        isCameraInitialized.value = false;
        isLoading.value = false;
        return;
      }

      if (cameras == null) {
        cameras = await availableCameras();
      }

      if (cameras!.isEmpty) {
        Get.snackbar("Error", "No cameras found on this device.");
        isCameraInitialized.value = false;
        isLoading.value = false;
        return;
      }

      // Select camera based on isFrontCamera.value
      CameraDescription selectedCamera;
      if (isFrontCamera.value) {
        selectedCamera = cameras!.firstWhere(
          (camera) => camera.lensDirection == CameraLensDirection.front,
          orElse: () => cameras!.first,
        );
        log("Selected Front Camera: ${selectedCamera.name}");
      } else {
        selectedCamera = cameras!.firstWhere(
          (camera) => camera.lensDirection == CameraLensDirection.back,
          orElse: () => cameras!.first,
        );
        log("Selected Back Camera: ${selectedCamera.name}");
      }

      // Dispose of any existing controller before creating a new one
      await disposeController();

      _cameraController = CameraController(
        selectedCamera,
        ResolutionPreset
            .medium, // Changed from high to medium for better stability
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );

      log("Initializing CameraController...");

      // Add timeout to prevent indefinite hanging
      await _cameraController!.initialize().timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException(
            'Camera initialization timed out',
            const Duration(seconds: 10),
          );
        },
      );

      log("CameraController initialized successfully.");
      isCameraInitialized.value = true;
    } catch (e, s) {
      log("Error initializing camera: $e\nStack: $s");
      isCameraInitialized.value = false;
      _cameraController = null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> disposeController() async {
    log("Disposing camera controller...");
    if (_cameraController != null) {
      try {
        if (_cameraController!.value.isInitialized) {
          if (_cameraController!.value.isStreamingImages) {
            await _cameraController!.stopImageStream();
            log("Image stream stopped.");
          }
        }
        await _cameraController!.dispose();
        log("Camera controller disposed.");
      } catch (e) {
        log("Error disposing camera controller: $e");
      }
    }
    _cameraController = null;
    isCameraInitialized.value = false;
    isTakingPicture.value = false;
  }

  Future<void> switchCamera() async {
    log("Switching camera...");
    if (cameras == null || cameras!.length <= 1) {
      Get.snackbar("Info", "This device has only one camera.");
      return;
    }

    isCameraInitialized.value = false;
    bool targetIsFront = !isFrontCamera.value;

    try {
      await disposeController();
      isFrontCamera.value = targetIsFront;
      await initializeCamera();
      log("Camera switched successfully.");
    } catch (e, s) {
      log("Error switching camera: $e\nStack: $s");
      Loaders.customToast(message: "Failed to switch camera");
    }
  }

  Future<void> takePicture(Rx<File?> imageFile) async {
    if (!isCameraInitialized.value ||
        _cameraController == null ||
        !_cameraController!.value.isInitialized ||
        _cameraController!.value.isTakingPicture ||
        isTakingPicture.value) {
      log("Camera not ready or already taking a picture.");
      return;
    }

    // Set taking picture flag to prevent concurrent captures
    isTakingPicture.value = true;

    try {
      log("Taking picture...");

      // Pause preview briefly to prevent buffer conflicts
      await _cameraController!.pausePreview();

      // Add small delay to ensure preview is fully paused
      await Future.delayed(const Duration(milliseconds: 100));

      final XFile pickedFile = await _cameraController!.takePicture();
      imageFile.value = File(pickedFile.path);
      log("Picture taken successfully.");

      // Resume preview after capture
      await _cameraController!.resumePreview();

      Get.back();
    } catch (e, s) {
      log("Error taking picture: $e\nStack: $s");
      Loaders.customToast(message: "Failed to take picture");

      // Ensure preview is resumed even on error
      try {
        await _cameraController!.resumePreview();
      } catch (resumeError) {
        log("Error resuming preview: $resumeError");
      }
    } finally {
      // Always reset the taking picture flag
      isTakingPicture.value = false;
    }
  }
}
