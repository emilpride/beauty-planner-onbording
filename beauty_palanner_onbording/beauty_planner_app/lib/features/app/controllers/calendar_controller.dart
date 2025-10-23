import 'dart:developer';
import 'package:beautymirror/utils/constants/enums.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../authentication/controllers/activity_selection/choose_activity_controller.dart';
import '../../authentication/screens/activity_selection/choose_activity.dart';
import '../../personalization/controllers/user_controller.dart';
import '../models/calendar_model.dart';
import '../models/task_model.dart';
import '../screens/calendar/edit_task.dart';
import 'activity_controller.dart';

class CalendarController extends GetxController {
  final RxList<String> activityNames = <String>['All'].obs;
  final List<String> categories = [
    'All',
    ...UserController.instance.user.value.categories.map((cat) => cat.name),
  ];

  final RxSet<DateTime> datesWithTasks = <DateTime>{}.obs;
  final Rx<DateTime> displayDate = DateTime.now().obs;
  final List<String> months = DateFormat.MMMM().dateSymbols.MONTHS;
  // --- FILTER STATE ---
  final RxString nameFilter = 'All'.obs;

  final selectedCategory = 'All'.obs;
  // --- UI STATE ---
  final Rx<DateTime> selectedDate = DateTime.now().obs;

  // --- DATA FOR UI ---
  final RxList<CalendarTaskDisplay> tasksForSelectedDay =
      <CalendarTaskDisplay>[].obs;

  List<int> years = [];

  final ActivityController _activityController = Get.find<ActivityController>();

  @override
  void onInit() {
    super.onInit();
    _activityController.taskInstanceMap.isNotEmpty
        ? years = List.generate(
          _activityController.taskInstanceMap.values.last.date.year -
              _activityController.taskInstanceMap.values.first.date.year,
          (index) =>
              _activityController.taskInstanceMap.values.first.date.year +
              index,
        )
        : years = [DateTime.now().year, DateTime.now().year + 1];

    // Initial population of data
    _populateDatesWithTasks();
    _populateFilterOptions();
    _updateTasksForSelectedDay();

    // --- LISTENERS ---
    // Update task list whenever the selected date changes
    ever(selectedDate, (_) => _updateTasksForSelectedDay());

    // Update task list and dates whenever the filter changes
    ever(nameFilter, (_) => refreshCalendar());

    // Update task list and dates whenever the filter changes
    ever(selectedCategory, (_) => refreshCalendar());

    // React to changes in the underlying data from ActivityController
    // ever(_activityController.taskInstanceMap, (_) => refreshCalendar());
  }

  static CalendarController get instance => Get.find();

  void refreshCalendar() {
    _activityController.taskInstanceMap.isNotEmpty
        ? years = List.generate(
          _activityController.taskInstanceMap.values.last.date.year -
              _activityController.taskInstanceMap.values.first.date.year,
          (index) =>
              _activityController.taskInstanceMap.values.first.date.year +
              index,
        )
        : years = [DateTime.now().year, DateTime.now().year + 1];
    _populateDatesWithTasks();
    _populateFilterOptions();
    _updateTasksForSelectedDay();
    log('Calendar refreshed');
  }

  // --- UI ACTIONS ---

  void selectDay(DateTime day) {
    final isCurrentMonth = day.month == displayDate.value.month;
    if (isCurrentMonth) selectedDate.value = day;
  }

  void changeMonth(String monthName) {
    final newMonthIndex = months.indexOf(monthName) + 1;
    displayDate.value = DateTime(displayDate.value.year, newMonthIndex);
  }

  void changeYear(int year) {
    displayDate.value = DateTime(year, displayDate.value.month);
  }

  void goToToday() {
    selectedDate.value = DateTime.now();
    displayDate.value = DateTime.now();
  }

  void addActivity() {
    ChooseActivitiesController.instance.activityType.value = 'calendar';
    ChooseActivitiesController.instance.loadActivities();
    for (var activity in ChooseActivitiesController.instance.allActivities) {
      activity.selectedEndBeforeDate = selectedDate.value;
    }
    Get.to(() => ChooseActivitiesScreen(onBack: Get.back));
  }

  // --- TASK ACTIONS (Delegating to ActivityController) ---

  void markTaskAsDone(CalendarTaskDisplay taskDisplay) {
    // This requires creating a `Task` object as expected by your controller method.
    final taskToMark = Task(
      activityId: taskDisplay.activity.id,
      categoryId: taskDisplay.activity.categoryId!,
      name: taskDisplay.activity.name!,
      color: taskDisplay.activity.color!,
      time: taskDisplay.instance.time ?? taskDisplay.activity.time!.value,
      date: taskDisplay.instance.date,
      status: taskDisplay.instance.status,
      isOneTime: taskDisplay.instance.time != null,
    );
    _activityController.markTaskAsDone(taskToMark);
  }

  void markTaskAsSkipped(CalendarTaskDisplay taskDisplay) {
    final taskToMark = Task(
      activityId: taskDisplay.activity.id,
      categoryId: taskDisplay.activity.categoryId!,
      name: taskDisplay.activity.name!,
      color: taskDisplay.activity.color!,
      time: taskDisplay.instance.time ?? taskDisplay.activity.time!.value,
      date: taskDisplay.instance.date,
      status: taskDisplay.instance.status,
      isOneTime: taskDisplay.instance.time != null,
    );
    _activityController.markTaskAsSkipped(taskToMark);
  }

  void editTask(CalendarTaskDisplay taskDisplay) {
    Get.to(() => EditTask(task: taskDisplay.instance));
  }

  /// Populates the set of dates that have tasks to show indicators on the calendar.
  void _populateDatesWithTasks() {
    datesWithTasks.clear();
    final Set<DateTime> taskDates = {};
    final allInstances = _activityController.taskInstanceMap.values;

    final activityMap = {
      for (var act in _activityController.userModel.value.activities)
        act.id: act,
    };

    for (var instance in allInstances) {
      if (instance.status != TaskStatus.deleted) {
        // Normalize to midnight to ensure date comparison works correctly
        if ((nameFilter.value == 'All' && selectedCategory.value == 'All')) {
          taskDates.add(
            DateTime(
              instance.date.year,
              instance.date.month,
              instance.date.day,
            ),
          );
        } else {
          final activity = activityMap[instance.activityId];
          taskDates.addIf(
            (activity!.name == nameFilter.value ||
                activity.category == selectedCategory.value),
            DateTime(
              instance.date.year,
              instance.date.month,
              instance.date.day,
            ),
          );
        }
      }
    }
    datesWithTasks.assignAll(taskDates);
  }

  /// Populates the list of names for the filter dropdown.
  void _populateFilterOptions() {
    final names =
        _activityController.userModel.value.activities
            .map((act) => act.name ?? 'Unnamed')
            .toSet()
            .toList();
    names.sort();
    activityNames.assignAll(['All', ...names]);
    if (!activityNames.contains(nameFilter.value)) {
      nameFilter.value = 'All';
    }
  }

  /// Fetches and filters tasks for the currently selected date.
  void _updateTasksForSelectedDay() {
    final selected = selectedDate.value;
    final dayOnly = DateTime(selected.year, selected.month, selected.day);

    final allInstances = _activityController.taskInstanceMap.values;

    final Set<String> instanceIdsForDay = {};
    final List<TaskInstance> instancesForDay = [];

    for (var instance in allInstances) {
      final instanceDay = DateTime(
        instance.date.year,
        instance.date.month,
        instance.date.day,
      );
      if (instanceDay.isAtSameMomentAs(dayOnly) &&
          instance.status != TaskStatus.deleted) {
        // Use a set to prevent duplicates if an instance is in multiple lists
        if (instanceIdsForDay.add(instance.id)) {
          instancesForDay.add(instance);
        }
      }
    }

    final activityMap = {
      for (var act in _activityController.userModel.value.activities)
        act.id: act,
    };

    final deletedActivityMap = {
      for (var act in _activityController.userModel.value.deletedActivities)
        act.id: act,
    };
    List<CalendarTaskDisplay> displayTasks = [];

    for (var instance in instancesForDay) {
      final activity = activityMap[instance.activityId];
      if (activity != null) {
        // Apply name filter
        if (nameFilter.value == 'All' ||
            activity.name == nameFilter.value ||
            activity.category == selectedCategory.value) {
          displayTasks.add(
            CalendarTaskDisplay(instance: instance, activity: activity),
          );
        }
      } else {
        final deletedActivity = deletedActivityMap[instance.activityId];
        if (deletedActivity != null) {
          // Apply name filter
          if (nameFilter.value == 'All' ||
              deletedActivity.name == nameFilter.value ||
              deletedActivity.category == selectedCategory.value) {
            displayTasks.add(
              CalendarTaskDisplay(
                instance: instance,
                activity: deletedActivity,
              ),
            );
          }
        } else {
          log(
            'Warning: No activity found for instance ${instance.id} with activityId ${instance.activityId}',
          );
        }
      }
    }

    // Sort tasks by their scheduled time
    displayTasks.sort((a, b) {
      final timeA =
          a.activity.time?.value ?? const TimeOfDay(hour: 0, minute: 0);
      final timeB =
          b.activity.time?.value ?? const TimeOfDay(hour: 0, minute: 0);
      return (timeA.hour * 60 + timeA.minute).compareTo(
        timeB.hour * 60 + timeB.minute,
      );
    });

    tasksForSelectedDay.assignAll(displayTasks);
  }
}
