import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../utils/constants/activities.dart';
import '../../../personalization/controllers/ai_analysis_controller.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../../../data/models/activity_model.dart';

class ChooseActivitiesController extends GetxController {
  static ChooseActivitiesController get instance =>
      Get.find<ChooseActivitiesController>();
  final TextEditingController searchController = TextEditingController();

  // Lists to hold all activities
  final RxList<ActivityModel> allActivities = <ActivityModel>[].obs;

  // NEW: List to hold the categorized items for the UI.
  // It can contain Strings (for category headers) and ActivityModels.
  final RxList<dynamic> displayList = <dynamic>[].obs;

  final RxBool _isExpanded = false.obs;
  bool get isExpanded => _isExpanded.value;

  late final FocusNode focusNode;

  RxInt x = 0.obs;

  RxString activityType = 'regular'.obs;

  final userModel = UserController.instance.user;
  final aiAnalysisModel = AIAnalysisController.instance.aiAnalysis;

  @override
  void onInit() {
    super.onInit();
    loadActivities();
    // The listener now calls _updateDisplayList to regroup on every search query change
    searchController.addListener(_updateDisplayList);
    focusNode = FocusNode();
    focusNode.addListener(_onFocusChange);
  }

  @override
  void onClose() {
    searchController.removeListener(_onSearchTextChanged);
    focusNode.removeListener(_onFocusChange);
    focusNode.dispose();
    super.onClose();
  }

  //reinitialize the controller
  void reinitialize() {
    allActivities.clear();
    displayList.clear();
    searchController.clear();
    _isExpanded.value = false;
    focusNode.unfocus();
    loadActivities();
  }

  void loadActivities() {
    List<ActivityModel> activities = [];
    if (activityType.value == 'calendar') {
      activities =
          userModel.value.activities
              .where((activity) => activity.activeStatus)
              .map(
                (activity) => ActivityModel.fromJson(activity.toJson()),
              ) // Create copy
              .toList();
      for (var activity in activities) {
        activity.activeStatus = false;
      }
    } else {
      activities = removeExistingActivities(
        userModel.value.activities
            .where((activity) => activity.activeStatus)
            .map(
              (activity) => ActivityModel.fromJson(activity.toJson()),
            ) // Create copy
            .toList(),
      );
    }

    for (ActivityModel activity in activities) {
      if (aiAnalysisModel.value.recommendedActivities.contains(activity.name)) {
        activity.isRecommended = true;
      }
    }
    allActivities.assignAll(activities);
    // Initially, build the categorized and filtered list
    _updateDisplayList();
  }

  List<ActivityModel> removeExistingActivities(
    List<ActivityModel> existingActivities,
  ) {
    try {
      final currentActivities =
          userModel.value.gender == 1
              ? Activities.getManActivities()
              : Activities.getWomanActivities();

      // Create a map for quick lookup: name -> ActivityModel
      final currentActivityMap = {
        for (var activity in currentActivities) activity.name: activity,
      };

      for (var activity in existingActivities) {
        final existingActivity = currentActivityMap[activity.name];

        if (existingActivity != null) {
          if (_areActivitiesEqual(existingActivity, activity)) {
            currentActivityMap.remove(existingActivity.name);
          }
        }
      }
      return currentActivityMap.values.toList();
    } catch (e) {
      print(e.toString());
      return [];
    }
  }

  bool _areActivitiesEqual(ActivityModel a, ActivityModel b) {
    return a.name == b.name && a.category == b.category;
  }

  // UPDATED: This method now groups activities and prepares the list for the UI.
  void _updateDisplayList() {
    final query = searchController.text.toLowerCase();
    List<ActivityModel> filteredActivities;

    // First, filter the activities based on the search query
    if (query.isEmpty) {
      filteredActivities = allActivities;
    } else {
      filteredActivities =
          allActivities
              .where((activity) => activity.name!.toLowerCase().contains(query))
              .toList();
    }

    // Next, group the filtered activities by category
    final Map<String, List<ActivityModel>> groupedActivities = {};
    for (var activity in filteredActivities) {
      // Use 'Uncategorized' if category is null or empty
      final category =
          (activity.category != null && activity.category!.isNotEmpty)
              ? activity.category!
              : 'Uncategorized';
      if (groupedActivities[category] == null) {
        groupedActivities[category] = [];
      }
      groupedActivities[category]!.add(activity);
    }

    // Finally, create the flattened list for the UI
    final List<dynamic> newDisplayList = [];
    groupedActivities.forEach((category, activities) {
      newDisplayList.add(category); // Add category header (String)
      newDisplayList.addAll(activities); // Add all activities for that category
    });

    displayList.assignAll(newDisplayList);
  }

  void toggleActivitySelection(ActivityModel activity) {
    activity.activeStatus = !activity.activeStatus;
    x.value++;
  }

  // --- Other methods remain the same ---

  void _onSearchTextChanged() {
    update();
  }

  void _onFocusChange() {
    if (focusNode.hasFocus && !_isExpanded.value) {
      toggleExpansion();
    } else if (!focusNode.hasFocus &&
        _isExpanded.value &&
        searchController.text.isEmpty) {
      toggleExpansion();
    }
    update();
  }

  void toggleExpansion() {
    _isExpanded.value = !_isExpanded.value;
    if (!_isExpanded.value) {
      searchController.clear();
      focusNode.unfocus();
    } else {
      focusNode.requestFocus();
    }
    update();
  }

  void onCreateCustomProcedure() {
    debugPrint('Create Custom Procedure tapped!');
  }

  void clearSearchText() {
    searchController.clear();
    update();
  }
}
