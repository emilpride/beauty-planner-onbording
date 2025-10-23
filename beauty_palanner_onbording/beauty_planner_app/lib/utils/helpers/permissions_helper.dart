import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:get/get.dart';

class PermissionHelper {
  static Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.status;

    if (status.isGranted) {
      return true;
    }

    if (status.isDenied) {
      final result = await Permission.microphone.request();
      return result.isGranted;
    }

    if (status.isPermanentlyDenied) {
      _showPermissionDeniedDialog(
        'Microphone Permission',
        'Microphone access is required to record voice messages. '
            'Please enable it in app settings.',
      );
      return false;
    }

    return false;
  }

  static Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.status;

    if (status.isGranted) {
      return true;
    }

    if (status.isDenied) {
      final result = await Permission.camera.request();
      return result.isGranted;
    }

    if (status.isPermanentlyDenied) {
      _showPermissionDeniedDialog(
        'Camera Permission',
        'Camera access is required to take photos. '
            'Please enable it in app settings.',
      );
      return false;
    }

    return false;
  }

  static Future<bool> requestPhotosPermission() async {
    final status = await Permission.photos.status;

    if (status.isGranted || status.isLimited) {
      return true;
    }

    if (status.isDenied) {
      final result = await Permission.photos.request();
      return result.isGranted || result.isLimited;
    }

    if (status.isPermanentlyDenied) {
      _showPermissionDeniedDialog(
        'Photos Permission',
        'Photo library access is required to select images. '
            'Please enable it in app settings.',
      );
      return false;
    }

    return false;
  }

  static void _showPermissionDeniedDialog(String title, String message) {
    Get.dialog(
      AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Get.back();
              openAppSettings();
            },
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }
}
