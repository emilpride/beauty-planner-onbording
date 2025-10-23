import 'dart:io';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:collection/collection.dart';

import '../../../data/models/mood_model.dart';
import '../../../data/models/user_model.dart';
import '../../../utils/constants/enums.dart';
import '../../personalization/controllers/user_controller.dart';
import '../models/task_model.dart';
import '../screens/report/take_photo.dart';
import 'activity_controller.dart';
import 'mood_controller.dart';

class ReportController extends GetxController {
  static ReportController get instance => Get.find();

  // --- DEPENDENCIES ---
  final ActivityController activityController = Get.find();
  final MoodController moodController = Get.find();
  final UserController userController = Get.find();

  final userModel = UserModel.empty().obs;

  // --- OBSERVABLES ---
  final RxString activityChartPeriod = 'This Week'.obs;
  final RxString completionRateChartPeriod = 'Last 6 Months'.obs;
  final RxString moodChartPeriod = 'This Week'.obs;
  final Rx<DateTime> calendarDisplayMonth = DateTime.now().obs;
  final Rx<File?> faceImage = Rx<File?>(null);

  // --- COMPUTED METRICS ---
  RxInt currentStreak = 0.obs;
  RxDouble overallCompletionRate = 0.0.obs;
  RxInt totalActivitiesCompleted = 0.obs;
  RxInt totalActivitiesTracked = 0.obs;
  RxInt totalPerfectDays = 0.obs;

  // Chart-specific data
  RxList<BarChartGroupData> activitiesChartData = <BarChartGroupData>[].obs;
  RxList<FlSpot> completionRateChartData = <FlSpot>[].obs;
  RxMap<DateTime, double> calendarStatsData = <DateTime, double>{}.obs;
  RxList<FlSpot> moodChartData = <FlSpot>[].obs;

  // Report state
  final updateReportFormKey = GlobalKey<FormState>();
  final height = TextEditingController();
  final inches = TextEditingController();
  final weight = TextEditingController();

  final RxString selectedHeightUnit = 'ft&in'.obs;
  final RxString selectedWeightUnit = 'lbs'.obs;
  final RxString selectedSleepDuration = ''.obs;
  final Rx<TimeOfDay> wakeUpTime = const TimeOfDay(hour: 7, minute: 0).obs;
  final Rx<TimeOfDay> endDayTime = const TimeOfDay(hour: 22, minute: 30).obs;

  final List<String> heightUnits = ['ft&in', 'cm'];
  final List<String> weightUnits = ['lbs', 'kg'];
  final List<String> sleepDurationOptions = [
    'Less than 6 hours',
    '6-7 hours',
    '7-8 hours',
    '8-9 hours',
    'More than 9 hours',
  ];

  final RxString selectedStressFrequency = ''.obs;
  final List<String> stressFrequencyOptions = [
    'Rarely',
    'Sometimes',
    'Often',
    'Always',
  ];

  final RxString selectedWorkEnvironment = ''.obs;
  final List<String> workEnvironmentOptions = [
    'In Office',
    'Remote',
    'Part-Time',
    'Jobless',
  ];

  final RxString selectedSkinType = ''.obs;
  final List<String> skinTypeOptions = [
    'Dry skin',
    'Normal skin',
    'Oily skin',
    'Combination skin',
  ];

  final RxString selectedSkinProblems = ''.obs;
  final List<String> skinProblemsOptions = [
    'Dark circle',
    'Blackheads',
    'Pigmented spot',
    'Сouperose',
    'Acne',
    'Wrinkles',
    'No Problems',
  ];

  final RxString selectedHairType = ''.obs;
  final List<String> hairTypeOptions = [
    'Slight Waves',
    'Soft Waves',
    'Defined Waves',
    'Classic Curls',
    'Soft Spiral Curls',
    'Corkscrews',
    'Slightly Coiled',
    'Kinky',
    'Super Kinky',
  ];

  final RxString selectedHairProblems = ''.obs;
  final List<String> hairProblemsOptions = [
    'Baldness',
    'Dandruff',
    'Hair Loss',
    'Oily Hair',
    'Dry Hair',
    'Split Hair',
    'No Problems',
  ];

  final RxString selectedEnergyLevel = ''.obs;
  final List<String> energyLevelOptions = ['1', '2', '3', '4', '5'];

  final RxString selectedProcrastinationFrequency = ''.obs;
  final List<String> procrastinationFrequencyOptions = [
    'Always',
    'Sometimes',
    'Rarely',
    'Never',
  ];

  final RxString selectedFocusLevel = ''.obs;
  final List<String> focusLevelOptions = [
    'Always',
    'Sometimes',
    'Rarely',
    'Never',
  ];

  @override
  void onInit() {
    super.onInit();
    userModel.value = userController.user.value;

    // Listen for data changes
    ever(activityController.taskInstanceMap, (_) => _updateAllStats());
    ever(moodController.moodEntryMap, (_) => _updateAllStats());

    // Listen for period changes
    ever(activityChartPeriod, (_) => _updateActivitiesCompletedChart());
    ever(completionRateChartPeriod, (_) => _updateCompletionRateChart());
    ever(moodChartPeriod, (_) => _updateMoodChart());
    ever(calendarDisplayMonth, (_) => _updateCalendarStats());

    // Initial calculation
    _updateAllStats();
  }

  void _updateAllStats() {
    _updateGeneralStats();
    _updateActivitiesCompletedChart();
    _updateCompletionRateChart();
    _updateCalendarStats();
    _updateMoodChart();
  }

  void changeCalendarMonth(int monthIncrement) {
    calendarDisplayMonth.value = DateTime(
      calendarDisplayMonth.value.year,
      calendarDisplayMonth.value.month + monthIncrement,
      1,
    );
  }

  // --- CORE METRICS CALCULATIONS ---

  void _updateGeneralStats() {
    final allInstances = activityController.taskInstanceMap.values.toList();
    if (allInstances.isEmpty) {
      currentStreak.value = 0;
      overallCompletionRate.value = 0.0;
      totalActivitiesCompleted.value = 0;
      totalActivitiesTracked.value = 0;
      totalPerfectDays.value = 0;
      return;
    }

    // 1. Overall Completion Rate
    final relevantTasks =
        allInstances
            .where(
              (t) =>
                  t.status == TaskStatus.completed ||
                  t.status == TaskStatus.missed ||
                  t.status == TaskStatus.skipped,
            )
            .toList();

    totalActivitiesCompleted.value =
        allInstances.where((t) => t.status == TaskStatus.completed).length;
    totalActivitiesTracked.value = relevantTasks.length;

    overallCompletionRate.value =
        totalActivitiesTracked.value > 0
            ? totalActivitiesCompleted.value / totalActivitiesTracked.value
            : 0.0;

    // 2. Current Streak (consecutive days with all tasks completed)
    currentStreak.value = _calculateStreak(allInstances);

    // 3. Total Perfect Days (days where ALL tasks were completed)
    totalPerfectDays.value = _calculatePerfectDays(allInstances);
  }

  int _calculateStreak(List<TaskInstance> instances) {
    var streak = 0;
    var dateToCheck = DateTime(
      DateTime.now().year,
      DateTime.now().month,
      DateTime.now().day,
    );

    while (true) {
      final tasksForDay =
          instances.where((t) => t.normalizedDate == dateToCheck).toList();

      // Skip days with no tasks (they don't break the streak)
      if (tasksForDay.isEmpty) {
        // For today, if no tasks exist, start from yesterday
        if (dateToCheck.isAtSameMomentAs(
          DateTime(
            DateTime.now().year,
            DateTime.now().month,
            DateTime.now().day,
          ),
        )) {
          dateToCheck = dateToCheck.subtract(const Duration(days: 1));
          continue;
        } else {
          // For past days, no tasks means we continue checking
          dateToCheck = dateToCheck.subtract(const Duration(days: 1));
          continue;
        }
      }

      // Check if all tasks for the day are completed
      final allCompleted = tasksForDay.every(
        (t) => t.status == TaskStatus.completed,
      );

      if (allCompleted) {
        streak++;
        dateToCheck = dateToCheck.subtract(const Duration(days: 1));
      } else {
        break; // Streak broken
      }

      // Safety check: don't go back more than 1000 days
      if (streak > 1000) break;
    }

    return streak;
  }

  int _calculatePerfectDays(List<TaskInstance> instances) {
    final groupedByDay = groupBy(
      instances,
      (TaskInstance i) => i.normalizedDate,
    );
    int perfectDays = 0;

    groupedByDay.forEach((date, tasks) {
      if (tasks.isNotEmpty &&
          tasks.every((t) => t.status == TaskStatus.completed)) {
        perfectDays++;
      }
    });

    return perfectDays;
  }

  // --- CHART DATA UPDATES ---

  void _updateActivitiesCompletedChart() {
    final instances = activityController.taskInstanceMap.values;
    final startDate = getStartDate(activityChartPeriod.value);
    final now = DateTime.now();

    final filtered =
        instances
            .where(
              (i) =>
                  i.status == TaskStatus.completed &&
                  !i.date.isBefore(startDate) &&
                  i.date.isBefore(now.add(const Duration(days: 1))),
            )
            .toList();

    if (activityChartPeriod.value == 'Today') {
      // Show hourly breakdown for today
      activitiesChartData.value = _generateHourlyData(filtered);
    } else if (activityChartPeriod.value.contains('Week')) {
      activitiesChartData.value = _generateWeeklyData(filtered);
    } else if (activityChartPeriod.value == 'This Month' ||
        activityChartPeriod.value == 'Last Month') {
      // Show daily breakdown for the specific month only.
      // For 'This Month' we only display up to today's date.
      final monthStart = DateTime(startDate.year, startDate.month, 1);
      final monthEnd =
          activityChartPeriod.value == 'This Month'
              ? DateTime.now()
              : DateTime(startDate.year, startDate.month + 1, 0);
      activitiesChartData.value = _generateDateBasedData(
        filtered,
        monthStart,
        monthEnd,
      );
    } else if (activityChartPeriod.value == 'Last 6 Months') {
      // Show monthly breakdown for the last 6 months (including current)
      final startMonth = DateTime(now.year, now.month - 5, 1);
      activitiesChartData.value = _generateMonthlyRangeData(
        filtered,
        startMonth,
        6,
      );
    } else {
      // Year or longer: show monthly data. For 'This Year' show up to current month.
      if (activityChartPeriod.value == 'This Year') {
        final startMonth = DateTime(now.year, 1, 1);
        final monthsCount = now.month; // up to current month
        activitiesChartData.value = _generateMonthlyRangeData(
          filtered,
          startMonth,
          monthsCount,
        );
      } else {
        // Fallback: show last 12 months
        activitiesChartData.value = _generateMonthlyRangeData(
          filtered,
          DateTime(now.year, now.month - 11, 1),
          12,
        );
      }
    }
  }

  List<BarChartGroupData> _generateMonthlyRangeData(
    List<TaskInstance> filtered,
    DateTime startMonth,
    int monthsCount,
  ) {
    // Count completed instances per month for the specified range
    final List<BarChartGroupData> groups = [];

    for (int i = 0; i < monthsCount; i++) {
      final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
      final count =
          filtered
              .where(
                (inst) =>
                    inst.date.year == monthDate.year &&
                    inst.date.month == monthDate.month,
              )
              .length
              .toDouble();

      groups.add(
        BarChartGroupData(
          x: i,
          barRods: [
            BarChartRodData(
              toY: count,
              color: const Color(0xffA688FA),
              width: 28,
              borderRadius: BorderRadius.circular(4),
            ),
          ],
        ),
      );
    }

    return groups;
  }

  List<BarChartGroupData> _generateWeeklyData(List<TaskInstance> filtered) {
    final data = List.generate(7, (i) => 0.0);
    for (var instance in filtered) {
      final weekdayIndex = instance.date.weekday % 7; // Sunday = 0
      data[weekdayIndex]++;
    }
    return List.generate(7, (i) {
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: data[i],
            color: const Color(0xffA688FA),
            width: 16,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      );
    });
  }

  // Note: monthly / daily range data generation moved to
  // _generateMonthlyRangeData and _generateDateBasedData respectively.

  List<BarChartGroupData> _generateHourlyData(List<TaskInstance> filtered) {
    final Map<int, double> hourlyCounts = {};
    for (final instance in filtered) {
      final hour = instance.time?.hour ?? 12; // Default to noon if no time
      hourlyCounts.update(hour, (value) => value + 1, ifAbsent: () => 1);
    }

    return List.generate(24, (i) {
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: hourlyCounts[i] ?? 0,
            color: const Color(0xffA688FA),
            width: 16,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      );
    });
  }

  void _updateCompletionRateChart() {
    final instances = activityController.taskInstanceMap.values;
    final period = completionRateChartPeriod.value;
    final startDate = getStartDate(period);
    final now = DateTime.now();

    final filtered =
        instances
            .where(
              (i) =>
                  (i.status == TaskStatus.completed ||
                      i.status == TaskStatus.missed ||
                      i.status == TaskStatus.skipped) &&
                  !i.date.isBefore(startDate) &&
                  i.date.isBefore(now.add(const Duration(days: 1))),
            )
            .toList();

    final List<FlSpot> spots = [];

    if (period == 'Today') {
      // Hourly completion rate for today (0..23)
      final Map<int, List<TaskInstance>> groupedByHour = groupBy(
        filtered,
        (TaskInstance i) => i.time?.hour ?? 0,
      );

      for (int h = 0; h < 24; h++) {
        final tasks = groupedByHour[h] ?? [];
        if (tasks.isEmpty) {
          spots.add(FlSpot(h.toDouble(), 0.0));
        } else {
          final completed =
              tasks.where((t) => t.status == TaskStatus.completed).length;
          spots.add(FlSpot(h.toDouble(), (completed / tasks.length) * 100));
        }
      }
    } else if (period.contains('Week')) {
      // Weekly completion rate. If 'This Week', include only up to today.
      final startWeek = getStartDate(period);
      final endWeek =
          period == 'This Week'
              ? DateTime(now.year, now.month, now.day)
              : startWeek.add(const Duration(days: 6));
      final daysCount = endWeek.difference(startWeek).inDays + 1;

      for (int i = 0; i < daysCount; i++) {
        final dayDate = DateTime(
          startWeek.year,
          startWeek.month,
          startWeek.day + i,
        );
        final tasks =
            filtered
                .where(
                  (t) =>
                      t.date.year == dayDate.year &&
                      t.date.month == dayDate.month &&
                      t.date.day == dayDate.day,
                )
                .toList();

        if (tasks.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0.0));
        } else {
          final completed =
              tasks.where((t) => t.status == TaskStatus.completed).length;
          spots.add(FlSpot(i.toDouble(), (completed / tasks.length) * 100));
        }
      }
    } else if (period == 'This Month' || period == 'Last Month') {
      final monthStart = DateTime(startDate.year, startDate.month, 1);
      final monthLastDay =
          period == 'This Month'
              ? DateTime(now.year, now.month, now.day)
              : DateTime(monthStart.year, monthStart.month + 1, 0);
      final daysInRange = monthLastDay.difference(monthStart).inDays + 1;

      // initialize each day within the range (start..today for This Month)
      for (int i = 0; i < daysInRange; i++) {
        final dayDate = monthStart.add(Duration(days: i));
        final tasks =
            filtered
                .where(
                  (t) =>
                      t.date.year == dayDate.year &&
                      t.date.month == dayDate.month &&
                      t.date.day == dayDate.day,
                )
                .toList();

        if (tasks.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0.0));
        } else {
          final completed =
              tasks.where((t) => t.status == TaskStatus.completed).length;
          spots.add(FlSpot(i.toDouble(), (completed / tasks.length) * 100));
        }
      }
    } else if (period == 'Last 6 Months') {
      final startMonth = DateTime(now.year, now.month - 5, 1);
      for (int i = 0; i < 6; i++) {
        final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
        final tasks =
            filtered
                .where(
                  (t) =>
                      t.date.year == monthDate.year &&
                      t.date.month == monthDate.month,
                )
                .toList();

        if (tasks.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0.0));
        } else {
          final completed =
              tasks.where((t) => t.status == TaskStatus.completed).length;
          spots.add(FlSpot(i.toDouble(), (completed / tasks.length) * 100));
        }
      }
    } else if (period == 'This Year') {
      final startMonth = DateTime(now.year, 1, 1);
      final monthsCount = now.month;
      for (int i = 0; i < monthsCount; i++) {
        final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
        final tasks =
            filtered
                .where(
                  (t) =>
                      t.date.year == monthDate.year &&
                      t.date.month == monthDate.month,
                )
                .toList();

        if (tasks.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0.0));
        } else {
          final completed =
              tasks.where((t) => t.status == TaskStatus.completed).length;
          spots.add(FlSpot(i.toDouble(), (completed / tasks.length) * 100));
        }
      }
    } else {
      // Fallback: last 12 months
      final startMonth = DateTime(now.year, now.month - 11, 1);
      for (int i = 0; i < 12; i++) {
        final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
        final tasks =
            filtered
                .where(
                  (t) =>
                      t.date.year == monthDate.year &&
                      t.date.month == monthDate.month,
                )
                .toList();

        if (tasks.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0.0));
        } else {
          final completed =
              tasks.where((t) => t.status == TaskStatus.completed).length;
          spots.add(FlSpot(i.toDouble(), (completed / tasks.length) * 100));
        }
      }
    }

    completionRateChartData.value = spots;
  }

  void _updateCalendarStats() {
    final instances = activityController.taskInstanceMap.values;
    final Map<DateTime, double> dailyRates = {};

    final instancesInMonth = instances.where(
      (i) =>
          i.date.year == calendarDisplayMonth.value.year &&
          i.date.month == calendarDisplayMonth.value.month,
    );

    final groupedByDay = groupBy(
      instancesInMonth,
      (TaskInstance i) => i.normalizedDate,
    );

    groupedByDay.forEach((date, tasks) {
      final relevantTasks =
          tasks
              .where(
                (t) =>
                    t.status == TaskStatus.completed ||
                    t.status == TaskStatus.missed ||
                    t.status == TaskStatus.skipped,
              )
              .toList();

      if (relevantTasks.isEmpty) {
        dailyRates[date] = -1; // No trackable tasks
      } else {
        final completed =
            relevantTasks.where((t) => t.status == TaskStatus.completed).length;
        dailyRates[date] = completed / relevantTasks.length;
      }
    });

    calendarStatsData.value = dailyRates;
  }

  void _updateMoodChart() {
    final entries = moodController.moodEntryMap.values;
    final startDate = getStartDate(moodChartPeriod.value);
    final now = DateTime.now();
    final filtered =
        entries
            .where(
              (e) =>
                  !e.date.isBefore(startDate) &&
                  e.date.isBefore(now.add(const Duration(days: 1))),
            )
            .toList();

    final String period = moodChartPeriod.value;
    final List<FlSpot> spots = [];

    if (period == 'Today') {
      // Hourly mood for today (0..23)
      final Map<int, List<MoodEntry>> groupedByHour = groupBy(
        filtered,
        (MoodEntry e) => e.date.hour,
      );

      for (int h = 0; h < 24; h++) {
        final entriesForHour = groupedByHour[h] ?? [];
        if (entriesForHour.isEmpty) {
          spots.add(FlSpot(h.toDouble(), 0)); // 0 indicates no data
        } else {
          final avgMood =
              entriesForHour.map((e) => e.mood).reduce((a, b) => a + b) /
              entriesForHour.length;
          spots.add(FlSpot(h.toDouble(), avgMood.toDouble()));
        }
      }
    } else if (period.contains('Week')) {
      // Weekly: use startWeek and produce spots for each day index 0..daysCount-1
      final startWeek = getStartDate(period);
      final endWeek =
          period == 'This Week'
              ? DateTime(now.year, now.month, now.day)
              : startWeek.add(const Duration(days: 6));
      final daysCount = endWeek.difference(startWeek).inDays + 1;

      for (int i = 0; i < daysCount; i++) {
        final dayDate = DateTime(
          startWeek.year,
          startWeek.month,
          startWeek.day + i,
        );
        final entriesForDay =
            filtered
                .where(
                  (e) =>
                      e.date.year == dayDate.year &&
                      e.date.month == dayDate.month &&
                      e.date.day == dayDate.day,
                )
                .toList();
        // For weekly view we do not add empty points — leave gaps where no entries exist
        if (entriesForDay.isNotEmpty) {
          final avgMood =
              entriesForDay.map((e) => e.mood).reduce((a, b) => a + b) /
              entriesForDay.length;
          spots.add(FlSpot(i.toDouble(), avgMood.toDouble()));
        }
      }
    } else if (period == 'This Month' || period == 'Last Month') {
      final monthStart = DateTime(startDate.year, startDate.month, 1);
      final monthLastDay =
          period == 'This Month'
              ? DateTime(now.year, now.month, now.day)
              : DateTime(monthStart.year, monthStart.month + 1, 0);
      final daysInRange = monthLastDay.difference(monthStart).inDays + 1;

      for (int i = 0; i < daysInRange; i++) {
        final dayDate = monthStart.add(Duration(days: i));
        final entriesForDay =
            filtered
                .where(
                  (e) =>
                      e.date.year == dayDate.year &&
                      e.date.month == dayDate.month &&
                      e.date.day == dayDate.day,
                )
                .toList();
        // For monthly views we do not add empty points — leave gaps where no entries exist
        if (entriesForDay.isNotEmpty) {
          final avgMood =
              entriesForDay.map((e) => e.mood).reduce((a, b) => a + b) /
              entriesForDay.length;
          spots.add(FlSpot(i.toDouble(), avgMood.toDouble()));
        }
      }
    } else if (period == 'Last 6 Months') {
      final startMonth = DateTime(now.year, now.month - 5, 1);
      for (int i = 0; i < 6; i++) {
        final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
        final entriesForMonth =
            filtered
                .where(
                  (e) =>
                      e.date.year == monthDate.year &&
                      e.date.month == monthDate.month,
                )
                .toList();
        if (entriesForMonth.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0));
        } else {
          final avgMood =
              entriesForMonth.map((e) => e.mood).reduce((a, b) => a + b) /
              entriesForMonth.length;
          spots.add(FlSpot(i.toDouble(), avgMood.toDouble()));
        }
      }
    } else if (period == 'This Year') {
      final startMonth = DateTime(now.year, 1, 1);
      final monthsCount = now.month;
      for (int i = 0; i < monthsCount; i++) {
        final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
        final entriesForMonth =
            filtered
                .where(
                  (e) =>
                      e.date.year == monthDate.year &&
                      e.date.month == monthDate.month,
                )
                .toList();
        if (entriesForMonth.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0));
        } else {
          final avgMood =
              entriesForMonth.map((e) => e.mood).reduce((a, b) => a + b) /
              entriesForMonth.length;
          spots.add(FlSpot(i.toDouble(), avgMood.toDouble()));
        }
      }
    } else {
      // Fallback: last 12 months
      final startMonth = DateTime(now.year, now.month - 11, 1);
      for (int i = 0; i < 12; i++) {
        final monthDate = DateTime(startMonth.year, startMonth.month + i, 1);
        final entriesForMonth =
            filtered
                .where(
                  (e) =>
                      e.date.year == monthDate.year &&
                      e.date.month == monthDate.month,
                )
                .toList();
        if (entriesForMonth.isEmpty) {
          spots.add(FlSpot(i.toDouble(), 0));
        } else {
          final avgMood =
              entriesForMonth.map((e) => e.mood).reduce((a, b) => a + b) /
              entriesForMonth.length;
          spots.add(FlSpot(i.toDouble(), avgMood.toDouble()));
        }
      }
    }

    moodChartData.value = spots;
  }

  // --- HELPER METHODS ---

  /// Calculates weekly completion statistics. completionRate, bestActivity, strugglingActivity
  Map<String, dynamic> calculateWeeklyCompletion() {
    final activityIds =
        userModel.value.activities
            .where((a) => a.activeStatus == true)
            .map((a) => a.id)
            .toList();
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));
    final instances = activityController.taskInstanceMap.values.where(
      (i) =>
          activityIds.contains(i.activityId) &&
          !i.date.isBefore(weekAgo) &&
          i.date.isBefore(now.add(const Duration(days: 1))),
    );

    if (instances.isEmpty) {
      return {
        'completionRate': 0.0,
        'bestHabit': null,
        'strugglingHabit': null,
      };
    }

    final Map<String, List<TaskInstance>> groupedByActivity = groupBy(
      instances,
      (TaskInstance i) => i.activityId,
    );

    String? bestHabit;
    String? strugglingHabit;
    double highestRate = -1.0;
    double lowestRate = 101.0;
    int totalCompleted = 0;
    int totalRelevant = 0;

    groupedByActivity.forEach((activityId, tasks) {
      final relevantTasks =
          tasks
              .where(
                (t) =>
                    t.status == TaskStatus.completed ||
                    t.status == TaskStatus.missed ||
                    t.status == TaskStatus.skipped,
              )
              .toList();

      if (relevantTasks.isEmpty) return;

      final completed =
          relevantTasks.where((t) => t.status == TaskStatus.completed).length;
      final rate = (completed / relevantTasks.length) * 100;

      totalCompleted += completed;
      totalRelevant += relevantTasks.length;

      if (rate > highestRate) {
        highestRate = rate;
        bestHabit =
            userModel.value.activities
                .where((a) => a.id == activityId)
                .firstOrNull
                ?.name ??
            'Unknown';
      }
      if (rate < lowestRate) {
        lowestRate = rate;
        strugglingHabit =
            userModel.value.activities
                .where((a) => a.id == activityId)
                .firstOrNull
                ?.name ??
            'Unknown';
      }
    });

    final overallRate =
        totalRelevant > 0 ? (totalCompleted / totalRelevant) * 100 : 0.0;

    return {
      'completionRate': overallRate,
      'bestHabit': bestHabit,
      'strugglingHabit': strugglingHabit,
    };
  }

  /// Calculate metrics for a specific activity
  Map<String, dynamic> getActivityMetrics(String activityId) {
    final instances =
        activityController.taskInstanceMap.values
            .where((i) => i.activityId == activityId)
            .toList();

    if (instances.isEmpty) {
      return {
        'completionRate': 0.0,
        'tasksCompleted': 0,
        'perfectDays': 0,
        'currentStreak': 0,
      };
    }

    final relevantTasks =
        instances
            .where(
              (t) =>
                  t.status == TaskStatus.completed ||
                  t.status == TaskStatus.missed ||
                  t.status == TaskStatus.skipped,
            )
            .toList();

    final completed =
        instances.where((t) => t.status == TaskStatus.completed).length;
    final completionRate =
        relevantTasks.isNotEmpty ? completed / relevantTasks.length : 0.0;

    final perfectDays = _calculatePerfectDays(instances);
    final streak = _calculateStreak(instances);

    return {
      'completionRate': completionRate,
      'tasksCompleted': completed,
      'perfectDays': perfectDays,
      'currentStreak': streak,
    };
  }

  void updateReport() {
    if (updateReportFormKey.currentState!.validate()) {
      Get.to(() => const TakePhoto());
    }
  }

  DateTime getStartDate(String period) {
    final now = DateTime.now();
    switch (period) {
      case 'Today':
        return DateTime(now.year, now.month, now.day);
      case 'This Week':
        return now.subtract(Duration(days: now.weekday % 7));
      case 'This Month':
        return DateTime(now.year, now.month, 1);
      case 'Last Month':
        return DateTime(now.year, now.month - 1, 1);
      case 'Last 6 Months':
        return DateTime(now.year, now.month - 6, now.day);
      case 'This Year':
        return DateTime(now.year, 1, 1);
      case 'Last Year':
        return DateTime(now.year - 1, 1, 1);
      case 'All Time':
        return DateTime(2000);
      default:
        return DateTime(now.year, now.month, now.day);
    }
  }

  List<BarChartGroupData> _generateDateBasedData(
    List<TaskInstance> filtered,
    DateTime startDate,
    DateTime endDate,
  ) {
    final Map<DateTime, double> dailyCounts = {};

    // Initialize all dates in range with 0
    for (
      var date = startDate;
      date.isBefore(endDate) || date.isAtSameMomentAs(endDate);
      date = date.add(Duration(days: 1))
    ) {
      dailyCounts[DateTime(date.year, date.month, date.day)] = 0;
    }

    // Count activities per day
    for (final instance in filtered) {
      final normalizedDate = DateTime(
        instance.date.year,
        instance.date.month,
        instance.date.day,
      );
      dailyCounts.update(
        normalizedDate,
        (value) => value + 1,
        ifAbsent: () => 1,
      );
    }

    // Generate bar chart data
    final sortedDates = dailyCounts.keys.toList()..sort();
    return List.generate(sortedDates.length, (i) {
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: dailyCounts[sortedDates[i]]!,
            color: const Color(0xffA688FA),
            width: 28, // Wider bars
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      );
    });
  }

  @override
  void onClose() {
    height.dispose();
    inches.dispose();
    weight.dispose();
    super.onClose();
  }
}
