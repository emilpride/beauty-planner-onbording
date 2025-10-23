import 'dart:developer';
import 'package:beautymirror/data/models/user_model.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../data/models/category_model.dart';
import '../../../utils/constants/colors.dart';
import '../../../utils/constants/enums.dart';
import '../../../data/models/activity_model.dart';
import '../../../utils/constants/image_strings.dart';
import '../../personalization/controllers/user_controller.dart';
import '../models/progress_category_model.dart';
import '../models/task_model.dart';
import '../screens/calendar/edit_task.dart';
import 'activity_controller.dart';

enum TimeFilter { All, Morning, Afternoon, Evening }

class HomeScreenController extends GetxController {
  static HomeScreenController get instance => Get.find();

  // --- STATE VARIABLES ---
  final RxString currentMonth = ''.obs;
  final Rx<TimeFilter> selectedFilter = TimeFilter.All.obs;

  var currentDate = DateTime.now().obs;
  var selectedDate = DateTime.now().obs;
  var currentMonthCalendar = DateTime.now().obs;

  // Raw list of all tasks for today from the main controller
  final allTodayTasks = <Task>[].obs;

  // UI-facing lists, separated by status and filtered by time
  final RxList<Task> pendingTasks = <Task>[].obs;
  final RxList<Task> completedTasks = <Task>[].obs;
  final RxList<Task> skippedTasks = <Task>[].obs;
  final RxInt selectedTab = 0.obs;

  // Progress data for charts and cards
  final RxList<ProgressCategory> chartData = <ProgressCategory>[].obs;

  // Track completed and total tasks for the current view
  final RxInt completedCount = 0.obs;
  final RxInt totalCount = 0.obs;

  final userController = Get.find<UserController>();

  @override
  void onInit() {
    super.onInit();
    currentMonth.value = DateFormat('MMMM').format(DateTime.now());

    // Listen to tab changes and reload data accordingly
    ever(selectedTab, (_) => _onTabChanged());
  }

  void _onTabChanged() {
    switch (selectedTab.value) {
      case 0: // Daily
        // Daily tasks are already loaded by ActivityController
        _calculateProgressForDaily();
        break;
      case 1: // Weekly
        loadTasksForWeek(user: userController.user.value);
        break;
      case 2: // Overall
        loadAllTasks(user: userController.user.value);
        break;
    }
  }

  /// Loads, sorts, and filters tasks for the current day.
  void loadTasksForToday({
    required List<Task> regularTasks,
    required List<Task> oneTimeTasks,
    required UserModel user,
  }) {
    final List<Task> instancesForDay = regularTasks + oneTimeTasks;

    final activityMap = {for (var act in user.activities) act.id: act};
    List<Task> displayTasks = [];

    for (var instance in instancesForDay) {
      final activity = activityMap[instance.activityId];
      if (activity != null) {
        displayTasks.add(instance);
      }
    }

    allTodayTasks.value = displayTasks;
    applyFilters();
    _calculateProgressForDaily();
    log('Tasks loaded for today: ${allTodayTasks.length}');
  }

  /// Loads tasks for the current week
  void loadTasksForWeek({required UserModel user}) {
    final now = DateTime.now();
    // Normalize to start of Monday (week starts on Monday)
    final startOfWeek = DateTime(
      now.year,
      now.month,
      now.day - (now.weekday - 1),
    );
    // End of Sunday
    final endOfWeek = DateTime(
      startOfWeek.year,
      startOfWeek.month,
      startOfWeek.day + 6,
      23,
      59,
      59,
    );

    log('Loading week from $startOfWeek to $endOfWeek');

    final weekInstances = ActivityController.instance
        .getTaskInstancesForDateRange(startOfWeek, endOfWeek);

    log('Tasks loaded for current week: ${weekInstances.length}');
    log(
      'Week instances details: ${weekInstances.map((e) => '${e.activityId}-${e.date}-${e.status}').join(', ')}',
    );

    _calculateProgressForWeek(weekInstances, user);
  }

  /// Loads all historical tasks
  void loadAllTasks({required UserModel user}) {
    final allInstances =
        ActivityController.instance.taskInstanceMap.values.toList();
    _calculateProgressForOverall(allInstances, user);
    log('All tasks loaded: ${allInstances.length}');
  }

  /// Calculate progress for daily view (existing logic)
  void _calculateProgressForDaily() {
    chartData.clear();

    // Update counts for daily view
    completedCount.value = completedTasks.length;
    totalCount.value =
        pendingTasks.length + completedTasks.length + skippedTasks.length;

    for (var task in allTodayTasks) {
      final category = userController.user.value.categories.firstWhere(
        (c) => c.id == task.categoryId,
        orElse: () => CategoryModel.empty(),
      );
      final tasks =
          allTodayTasks.where((t) => t.categoryId == category.id).toList();
      final completed =
          tasks.where((t) => t.status == TaskStatus.completed).length;
      final total = tasks.length;
      final progress = total > 0 ? completed / total : 0;
      if (!chartData.any((c) => c.name == category.name)) {
        chartData.add(
          ProgressCategory(
            name: category.name,
            percentage: progress.toDouble(),
            color: category.color!,
            illustration: category.illustration ?? AppImages.physics,
          ),
        );
      }
    }
  }

  /// Calculate progress for weekly view
  void _calculateProgressForWeek(
    List<TaskInstance> weekInstances,
    UserModel user,
  ) {
    chartData.clear();
    final categoryMap = <String, Map<String, int>>{};

    int weekCompleted = 0;
    int weekTotal = 0;

    log('Calculating progress for ${weekInstances.length} week instances');

    // Group instances by category
    for (var instance in weekInstances) {
      try {
        final activity = user.activities.firstWhere(
          (a) => a.id == instance.activityId,
        );
        if (instance.status == TaskStatus.deleted) continue;

        // Count for weekly totals
        weekTotal++;
        if (instance.status == TaskStatus.completed) {
          weekCompleted++;
        }

        final categoryId = activity.categoryId ?? '';
        if (!categoryMap.containsKey(categoryId)) {
          categoryMap[categoryId] = {'total': 0, 'completed': 0};
        }

        categoryMap[categoryId]!['total'] =
            categoryMap[categoryId]!['total']! + 1;
        if (instance.status == TaskStatus.completed) {
          categoryMap[categoryId]!['completed'] =
              categoryMap[categoryId]!['completed']! + 1;
        }
      } catch (e) {
        log('Error processing instance: $e');
        continue;
      }
    }

    // Update counts for weekly view
    completedCount.value = weekCompleted;
    totalCount.value = weekTotal;

    log('Weekly totals - Completed: $weekCompleted, Total: $weekTotal');
    log('Category map: $categoryMap');

    // Create progress categories
    for (var entry in categoryMap.entries) {
      try {
        final category = user.categories.firstWhere((c) => c.id == entry.key);

        final total = entry.value['total']!;
        final completed = entry.value['completed']!;
        final progress = total > 0 ? completed / total : 0;

        log(
          'Category ${category.name}: $completed/$total = ${progress * 100}%',
        );

        chartData.add(
          ProgressCategory(
            name: category.name,
            percentage: progress.toDouble(),
            color: category.color!,
            illustration: category.illustration ?? AppImages.physics,
          ),
        );
      } catch (e) {
        log('Error creating progress category: $e');
        continue;
      }
    }

    log('Final chartData length: ${chartData.length}');
  }

  /// Calculate progress for overall view
  void _calculateProgressForOverall(
    List<TaskInstance> allInstances,
    UserModel user,
  ) {
    chartData.clear();
    final categoryMap = <String, Map<String, int>>{};

    int overallCompleted = 0;
    int overallTotal = 0;

    // Group instances by category
    for (var instance in allInstances) {
      try {
        final activity = user.activities.firstWhere(
          (a) => a.id == instance.activityId,
        );
        if (instance.status == TaskStatus.deleted) continue;

        final categoryId = activity.categoryId ?? '';
        if (!categoryMap.containsKey(categoryId)) {
          categoryMap[categoryId] = {'total': 0, 'completed': 0};
        }

        // Only count completed, skipped, and missed tasks (not pending)
        if (instance.status == TaskStatus.completed ||
            instance.status == TaskStatus.skipped ||
            instance.status == TaskStatus.missed) {
          overallTotal++;
          categoryMap[categoryId]!['total'] =
              categoryMap[categoryId]!['total']! + 1;
          if (instance.status == TaskStatus.completed) {
            overallCompleted++;
            categoryMap[categoryId]!['completed'] =
                categoryMap[categoryId]!['completed']! + 1;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Update counts for overall view
    completedCount.value = overallCompleted;
    totalCount.value = overallTotal;

    // Create progress categories
    for (var entry in categoryMap.entries) {
      try {
        final category = user.categories.firstWhere((c) => c.id == entry.key);

        final total = entry.value['total']!;
        final completed = entry.value['completed']!;
        final progress = total > 0 ? completed / total : 0;

        chartData.add(
          ProgressCategory(
            name: category.name,
            percentage: progress.toDouble(),
            color: category.color!,
            illustration: category.illustration ?? AppImages.physics,
          ),
        );
      } catch (e) {
        continue;
      }
    }
  }

  /// Sets the current time filter and updates the lists.
  void setFilter(TimeFilter filter) {
    selectedFilter.value = filter;
    applyFilters();
  }

  /// Applies the selected time filter to the pending task list.
  void applyFilters() {
    // 1. Separate tasks by their status
    pendingTasks.value =
        allTodayTasks.where((t) => t.status == TaskStatus.pending).toList();
    completedTasks.value =
        allTodayTasks.where((t) => t.status == TaskStatus.completed).toList();
    skippedTasks.value =
        allTodayTasks.where((t) => t.status == TaskStatus.skipped).toList();

    // 2. Apply time filter ONLY to the pending list
    if (selectedFilter.value != TimeFilter.All) {
      pendingTasks.retainWhere((task) {
        final hour = task.time.hour;
        switch (selectedFilter.value) {
          case TimeFilter.Morning:
            return hour < 12;
          case TimeFilter.Afternoon:
            return hour >= 12 && hour < 17;
          case TimeFilter.Evening:
            return hour >= 17;
          default:
            return true;
        }
      });
      completedTasks.retainWhere((task) {
        final hour = task.time.hour;
        switch (selectedFilter.value) {
          case TimeFilter.Morning:
            return hour < 12;
          case TimeFilter.Afternoon:
            return hour >= 12 && hour < 17;
          case TimeFilter.Evening:
            return hour >= 17;
          default:
            return true;
        }
      });
      skippedTasks.retainWhere((task) {
        final hour = task.time.hour;
        switch (selectedFilter.value) {
          case TimeFilter.Morning:
            return hour < 12;
          case TimeFilter.Afternoon:
            return hour >= 12 && hour < 17;
          case TimeFilter.Evening:
            return hour >= 17;
          default:
            return true;
        }
      });
    }
  }

  /// Updates a task's status and recalculates everything.
  void _updateTaskStatus(Task task, TaskStatus newStatus) {
    newStatus == TaskStatus.completed
        ? ActivityController.instance.markTaskAsDone(task)
        : ActivityController.instance.markTaskAsSkipped(task);
    final index = allTodayTasks.indexWhere((t) => t.id == task.id);
    if (index != -1) {
      allTodayTasks[index] = task.copyWith(status: newStatus);
      applyFilters();
      _calculateProgressForDaily();
    }
  }

  void markTaskAsCompleted(Task task) =>
      _updateTaskStatus(task, TaskStatus.completed);
  void markTaskAsSkipped(Task task) =>
      _updateTaskStatus(task, TaskStatus.skipped);

  /// Finds the corresponding ActivityModel for a given task.
  ActivityModel? getActivityForTask(Task task) {
    try {
      // Assuming activityController has a list of all activities
      return ActivityController.instance.userModel.value.activities.firstWhere(
        (act) => act.id == task.activityId,
      );
    } catch (e) {
      return null;
    }
  }

  void showTaskInfo(ActivityModel activity, Task task) {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          width: Get.width,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // --- DIALOG HEADER ---
              Text(
                activity.name!,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                textAlign: TextAlign.center,
                activity.note ?? 'No description provided.',
                style: const TextStyle(fontSize: 14, color: AppColors.black),
              ),
              const SizedBox(height: 16),

              // --- ACTION BUTTONS ---
              if (task.status != TaskStatus.completed) ...[
                SizedBox(
                  height: 45,
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      markTaskAsCompleted(task);
                      Get.back();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      minimumSize: const Size(double.infinity, 45),
                      maximumSize: const Size(double.infinity, 45),
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Mark Done',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              if (task.status != TaskStatus.skipped) ...[
                SizedBox(
                  height: 45,
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      markTaskAsSkipped(task);
                      Get.back();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                      minimumSize: const Size(double.infinity, 45),
                      maximumSize: const Size(double.infinity, 45),
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Skip',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              SizedBox(
                height: 45,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Get.back();
                    final taskInstance = TaskInstance(
                      activityId: activity.id,
                      date: task.date,
                      time: task.time,
                      status: task.status,
                      updatedAt: task.date,
                    );
                    Get.to(() => EditTask(task: taskInstance));
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
                    'Edit',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 45,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Get.back(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary.withOpacity(0.6),
                    minimumSize: const Size(double.infinity, 45),
                    maximumSize: const Size(double.infinity, 45),
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    side: BorderSide.none,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide.none,
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
