import 'dart:developer' as dev;
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../data/models/height_model.dart';
import '../../data/models/weight_model.dart';

class MyHelperFunctions {
  // turn A Time of Day into a String like 7 AM
  static String timeOfDayToString(TimeOfDay timeOfDay) {
    final now = DateTime.now();
    final formattedTime = DateFormat.jm().format(
      DateTime(now.year, now.month, now.day, timeOfDay.hour, timeOfDay.minute),
    );
    return formattedTime;
  }

  static int generateNotificationId() {
    // Create an instance of Random
    Random random = Random();

    // Generate a random integer above 1000
    // You can adjust the range as needed
    int randomInt = 1001 + random.nextInt(99999 - 1001);

    return randomInt;
  }

  double calculateBMI(WeightModel weightModel, HeightModel heightModel) {
    // --- Weight Conversion to Kilograms ---
    double weightInKg;
    switch (weightModel.weightUnit.toLowerCase()) {
      case 'lbs':
        // Convert pounds to kilograms (1 lb = 0.453592 kg)
        weightInKg = weightModel.weight * 0.453592;
        break;
      case 'kg':
        // Weight is already in kilograms
        weightInKg = weightModel.weight;
        break;
      default:
        // Handle unsupported weight units
        throw ArgumentError(
          'Unsupported weight unit: ${weightModel.weightUnit}. Supported units are "lbs" and "kg".',
        );
    }

    // --- Height Conversion to Meters ---
    double heightInMeters;
    switch (heightModel.heightUnit.toLowerCase()) {
      case 'cm':
        // Convert centimeters to meters (1 m = 100 cm)
        heightInMeters = heightModel.height / 100.0;
        break;
      case 'ft&in':
        // Convert feet and inches to total inches first
        double totalInches = (heightModel.height * 12.0) + heightModel.inch;
        // Convert total inches to meters (1 inch = 0.0254 m)
        heightInMeters = totalInches * 0.0254;
        break;
      default:
        // Handle unsupported height units
        throw ArgumentError(
          'Unsupported height unit: ${heightModel.heightUnit}. Supported units are "cm" and "ft&in".',
        );
    }

    // --- Validate Height Before BMI Calculation ---
    // Ensure height is positive to avoid division by zero or invalid results.
    if (heightInMeters <= 0) {
      throw ArgumentError('Height must be greater than zero to calculate BMI.');
    }

    // --- BMI Calculation ---
    // BMI = weight (kg) / (height (m) * height (m))
    double bmi = weightInKg / (heightInMeters * heightInMeters);

    return bmi;
  }

  static void showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  static void showAlert(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('ok'),
            ),
          ],
        );
      },
    );
  }

  static void navigateToScreen(BuildContext context, Widget screen) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
  }

  static String truncateText(String text, int maxLength) {
    if (text.length <= maxLength) {
      return text;
    } else {
      return '${text.substring(0, maxLength)}...';
    }
  }

  static bool isDarkMode(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark;
  }

  static Size screenSize(BuildContext context) {
    return MediaQuery.of(Get.context!).size;
  }

  static double screenHeight(BuildContext context) {
    return MediaQuery.of(Get.context!).size.height;
  }

  static double screenWidth(BuildContext context) {
    return MediaQuery.of(Get.context!).size.width;
  }

  static String getFormattedDate(
    DateTime date, {
    String format = 'dd MM yyyy',
  }) {
    return DateFormat(format).format(date);
  }

  static List<T> removeDuplicates<T>(List<T> list) {
    return list.toSet().toList();
  }

  static List<Widget> wrapWidgets(List<Widget> widgets, int rowSize) {
    final wrappedList = <Widget>[];
    for (var i = 0; i < widgets.length; i += rowSize) {
      //final rowChildren = widgets.sublist(
      //    i, i + rowSize > widgets.length ? widgets.length : i + rowSize);
    }
    return wrappedList;
  }

  static Color getRandomColor() {
    final List<Color> predefinedColors = [
      const Color(0xFFFFC107), // Amber
      const Color(0xFFFF9800), // Orange
      const Color(0xFFFF5722), // Deep Orange
      const Color(0xFFE91E63), // Pink
      const Color(0xFF2196F3), // Blue
      const Color(0xFF03A9F4), // Light Blue
      const Color(0xFF00BCD4), // Cyan
      const Color(0xFF009688), // Teal
      const Color(0xFFFFEB3B), // Yellow
      const Color(0xFFCDDC39), // Lime
      const Color(0xFF8BC34A), // Light Green
      const Color(0xFFFFA726), // Orange Accent
      const Color(0xFFD4E157), // Lime Accent
      const Color(0xFFBA68C8), // Purple Accent
      const Color(0xFF64B5F6), // Blue Accent
    ];
    final Random random = Random();
    return predefinedColors[random.nextInt(predefinedColors.length)];
  }

  static Map timeOfDayToFirebase(TimeOfDay timeOfDay) {
    return {'Hour': timeOfDay.hour, 'Minute': timeOfDay.minute};
  }

  static TimeOfDay firebaseToTimeOfDay(Map time) {
    return TimeOfDay(hour: time['Hour'] ?? 0, minute: time['Minute'] ?? 0);
  }

  static Future<void> clearCachedImages() async {
    try {
      // Get the default cache manager instance for CachedNetworkImage.
      final DefaultCacheManager cacheManager = DefaultCacheManager();

      // Call the emptyCache method to clear all cached files.
      await cacheManager.emptyCache();

      dev.log('CachedNetworkImage cache cleared successfully.');
    } catch (e) {
      dev.log('Error clearing CachedNetworkImage cache: $e');
    }
  }
}
