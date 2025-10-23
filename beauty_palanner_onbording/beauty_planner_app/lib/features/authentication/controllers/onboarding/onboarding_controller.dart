import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../data/models/ai_analysis_model.dart';
import '../../../../data/models/height_model.dart';
import '../../../../data/models/mood_model.dart';
import '../../../../data/models/physical_activities_model.dart';
import '../../../../data/models/user_model.dart';
import '../../../../data/models/weight_model.dart';
import '../../../../data/services/gemini/gemini_service.dart';
import '../../../../utils/constants/prompt.dart';
import '../../models/wellness_model.dart';
import '../../screens/onboarding/widgets/activity_frequency_picker_dialog.dart';
import '../../../../common/widgets/loaders/progress_dialog.dart';
import '../../screens/signup/signup.dart';

class OnboardingController extends GetxController {
  static OnboardingController get instance => Get.find();

  // Observables for state management
  final currentPage = 0.obs;
  final currentPage2 = 0.obs;
  final energyLevel = 1.0.obs; // Default energy level
  final energyLevelTriggered = false.obs; // To trigger initial animations

  Rx<int> x = 0.obs;
  final isReady = false.obs; // To trigger initial animations
  final RxBool isAnalyzing = false.obs;

  final userModel = UserModel.empty().obs;
  final moodModel = MoodEntry.empty().obs;
  final weightModel = WeightModel.empty().obs;
  final heightModel = HeightModel.empty().obs;
  final wellnessModel = WellnessAnalysis.empty().obs;

  // Observables for time selection
  final Rx<TimeOfDay> wakeUpTime = const TimeOfDay(hour: 7, minute: 0).obs;
  final Rx<TimeOfDay> endDayTime = const TimeOfDay(hour: 22, minute: 30).obs;

  //form keys
  final generalFormKey = GlobalKey<FormState>();

  final Rx<AIAnalysisModel> aiAnalysisModel = AIAnalysisModel.empty().obs;

  final GeminiService _geminiService = Get.put(GeminiService());

  final List<double> cardHeights = [
    0.42, // Welcome
    0.42, // Gender
    0.6, // Goal
    0.4, // Congratulations
    0.44, // Excited
    0.45, // Statistic
    0.43, // Privacy
    0.82, // General
    0.45, // Lifestyle
    0.6, // Sleep
    0.55, // Wake Up
    0.55, // End Day
    0.5, // Stress
    0.5, // Work
    0.5, // Skin Type
    0.6, // Skin Problems
    0.6, // Hair Type
    0.6, // Hair Problems
    0.6, // Physical Activities
    0.6, // Activity Frequency
    0.6, // Diet
    0.6, // Mood
    0.6, // Energy Level
    0.6, // Procrastination
    0.6, // Focus
    0.6, // Organization Influence
    .7, // Analysis Intro
    0.82,
    1.0,
  ];

  // Variables for user input
  final name = TextEditingController();
  final age = TextEditingController();
  final height = TextEditingController();
  final inches = TextEditingController();
  final weight = TextEditingController();

  // Dropdown options
  final RxString selectedHeightUnit = 'ft&in'.obs;
  final RxString selectedWeightUnit = 'lbs'.obs;
  final RxString selectedEthnicGroup = ''.obs;

  final List<String> heightUnits = ['ft&in', 'cm'];
  final List<String> weightUnits = ['lbs', 'kg'];
  final List<String> ethnicGroups = [
    'European American',
    'Asian American',
    'European',
    'Asian',
    'Hispanic / Latino',
    'Middle Eastern / North African',
    'Native American / Indigenous',
    'Pacific Islander',
    'Mixed / Other',
    'Prefer not to say',
  ];

  @override
  void onReady() {
    super.onReady();
    // Trigger the initial "enter" animation after a short delay
    Future.delayed(const Duration(milliseconds: 100), () {
      isReady.value = true;
    });
  }

  // Getter for the current card height
  double get currentCardHeight => cardHeights[currentPage.value];

  // Function to advance to the next page
  void nextPage() {
    if (currentPage.value < cardHeights.length - 1) {
      currentPage.value++;
    } else {
      Get.to(() => const SignUpScreen(), transition: Transition.rightToLeft);
    }
  }

  void jumpToPage(int page) {
    if (page >= 0 && page < cardHeights.length) {
      currentPage.value = page;
    }
  }

  void previousPage() {
    if (currentPage.value > 0) {
      currentPage.value--;
    }
  }

  // Shows the frequency picker dialog for an activity
  void showFrequencyPicker(
    BuildContext context,
    PhysicalActivitiesModel activity,
  ) {
    Get.dialog(ActivityFrequencyPickerDialog(activity: activity));
  }

  void updateEnergyLevel(double newLevel) {
    double energy = newLevel.clamp(1.0, 5.0);
    energyLevel.value = energy;
    userModel.value.energyLevel = energy.toInt();
    energyLevelTriggered.value = true;
  }

  Future<void> runAnalysis({required List<File> images}) async {
    isAnalyzing.value = true;
    try {
      final result = await _geminiService.analyzeUserHealth(
        images: images,
        prompt: Prompt.getAIReviewPrompt(
          userModel.value,
          heightModel.value,
          weightModel.value,
          moodModel.value,
        ),
        jsonSchema: Prompt.jsonSchema,
      );
      final jsonMap = json.decode(result);
      log('Analysis Result: $jsonMap');
      aiAnalysisModel.value = AIAnalysisModel.fromJson(jsonMap);
    } catch (e) {
      Get.snackbar('Error', 'Failed to analyze data: $e');
    } finally {
      isAnalyzing.value = false;
      currentPage.value++;
    }
  }

  /// Function to trigger the analysis process and show the dialog
  Future<void> startAnalysisProcess({required List<File> images}) async {
    Get.dialog(
      const ProgressDialog(title: 'Analyzing...'),
      barrierDismissible: false,
    );
    await runAnalysis(images: images);

    // Close the progress dialog
    Navigator.of(Get.overlayContext!).pop();
    log('Analysis process completed');
  }
}
