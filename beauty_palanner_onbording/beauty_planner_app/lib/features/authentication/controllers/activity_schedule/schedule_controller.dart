import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../data/models/activity_model.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../screens/activity_selection/widgets/create_activity_bottom_sheet.dart';
import '../../screens/onboarding/widgets/time_picker.dart';
import '../../screens/schedule_screen/widgets/calendar_grid.dart';

class ScheduleController extends GetxController {
  static ScheduleController get instance => Get.find<ScheduleController>();

  @override
  void onReady() {
    super.onReady();
    // Trigger the initial "enter" animation after a short delay
    Future.delayed(const Duration(milliseconds: 500), () {
      isReady.value = true;
    });
  }

  TextEditingController searchColorController = TextEditingController();
  TextEditingController searchIconController = TextEditingController();

  GlobalKey<FormState> createActivityFormKey = GlobalKey<FormState>();

  final isReady = false.obs;
  Rx<int> x = 0.obs;

  // --- Activity State Variables ---
  final newActivity = ActivityModel.empty().obs;
  final selectedCategory = ''.obs;
  List<String> categoryNamesForDropdown = [
    'Create New Category',
    ...UserController.instance.user.value.categories.map((c) => c.name),
  ];

  /// Sets the selected category based on the dropdown's string value
  void selectCategory(String? categoryName) {
    if (categoryName == null) return;

    if (categoryName == 'Create New Category') {
      showCreateCategoryBottomSheet();
    } else {
      final category = categoryNamesForDropdown.firstWhere(
        (c) => c == categoryName,
      );
      selectedCategory.value = category;
      newActivity.value.category = category;
      x.value++;
    }
  }

  /// Shows the bottom sheet to create a new category
  void showCreateCategoryBottomSheet() {
    Get.bottomSheet(
      const CreateCategoryBottomSheet(),
      isScrollControlled: true, // Important for keyboard handling
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
    );
  }

  void showCustomMultipleDatePicker(ActivityModel activity) {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(0),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          width: Get.width * 0.9,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              const Text(
                "Choose Days Of Month",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),
              const Divider(thickness: 0.5),
              // const SizedBox(height: 4),
              CalendarGrid(
                selectedDays: activity.selectedMonthDays,
                onDaySelected: (day) {
                  if (activity.selectedMonthDays.contains(day)) {
                    activity.selectedMonthDays.remove(day);
                    x.value++;
                  } else {
                    activity.selectedMonthDays.add(day);
                    // Reset other selections
                    activity.selectedDays = [];
                    activity.weeksInterval = 1;
                    x.value++;
                  }
                },
              ),
              const Divider(thickness: 0.5),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        "Cancel",
                        style: TextStyle(color: AppColors.black),
                      ),
                      onPressed: () => Get.back(),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        "OK",
                        style: TextStyle(color: Colors.white),
                      ),
                      onPressed: () {
                        // Handle selected dates
                        activity.selectedMonthDays.sort(
                          (a, b) => a.compareTo(b),
                        );
                        x.value++;
                        Get.back();
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void showCustomTimePicker(ActivityModel activity) {
    activityTime.value = activity.time?.value ?? TimeOfDay.now();
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(0),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: RoundedContainer(
          radius: 12,
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          width: Get.width * 0.9,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Time",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSizes.spaceBtnSections),

              SizedBox(
                height: 140,
                child: TimePicker(
                  initialTime: activityTime.value,
                  onTimeChanged: (time) {
                    activityTime.value = time;
                    x.value++;
                  },
                ),
              ),

              const SizedBox(height: AppSizes.spaceBtnSections),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        "Cancel",
                        style: TextStyle(color: AppColors.black),
                      ),
                      onPressed: () => Get.back(),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        "OK",
                        style: TextStyle(color: Colors.white),
                      ),
                      onPressed: () {
                        activity.time = activityTime;
                        x.value++;
                        Get.back();
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Rx<TimeOfDay> activityTime = TimeOfDay.now().obs;

  //create new activity
  void createActivity() {
    newActivity.value.name = newActivity.value.taskNameController.text;
    newActivity.value.note = newActivity.value.noteController.text;
    newActivity.value.category = selectedCategory.value;
    newActivity.value.categoryId =
        UserController.instance.user.value.categories
            .firstWhere((c) => c.name == selectedCategory.value)
            .id;
    newActivity.value.taskNameController.clear();
    newActivity.value.noteController.clear();
    UserController.instance.user.value.activities.add(newActivity.value);
    Loaders.customToast(
      message: 'Activity "${newActivity.value.name}" created successfully',
    );
    // Reset the newActivity state
    newActivity.value = ActivityModel.empty();
    selectedCategory.value = '';
    searchColorController.clear();
    searchIconController.clear();
    x.value++;
  }
}
