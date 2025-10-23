import 'dart:async';
import 'dart:developer';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../data/models/activity_model.dart';

class DateTimeHelper {
  /// Checks if an activity is scheduled to occur on a specific date.
  static bool isScheduledFor(DateTime date, ActivityModel activity) {
    // Normalize dates to ignore time components for accurate date comparisons.
    final checkDate = DateUtils.dateOnly(date);
    final startDate = DateUtils.dateOnly(activity.enabledAt!);
    final endDate =
        activity.endBeforeActive.value
            ? activity.endBeforeType == 'date'
                ? DateUtils.dateOnly(activity.selectedEndBeforeDate!)
                : DateUtils.dateOnly(
                  DateTimeHelper.addDays(
                    startDate,
                    int.parse(activity.endBeforeUnit!),
                  ),
                )
            : null;

    // Rule 1: Must be active.
    if (!activity.activeStatus) return false;

    // Rule 2: Must be on or after the start date.
    if (checkDate.isBefore(startDate)) return false;

    // Rule 3: Must be before or on the end date, if one exists.
    if (endDate != null && checkDate.isAfter(endDate)) return false;

    // Rule 4: Check against the specific frequency rules.
    switch (activity.frequency) {
      case 'daily':
        // Check if the weekday is in the selected list of days.
        final weekDay = checkDate.weekday % 7 + 1; // Converts to Sun=1..Sat=7
        return activity.selectedDays.contains(weekDay);

      case 'weekly':
        // Check if the date is in the same weekday as the start date
        // and if the week difference is a multiple of the interval.
        if (checkDate.weekday != startDate.weekday) return false;

        final differenceInDays = checkDate.difference(startDate).inDays;
        if (differenceInDays < 0) return false;

        final differenceInWeeks = (differenceInDays / 7).floor();
        return differenceInWeeks % (activity.weeksInterval ?? 1) == 0;

      case 'monthly':
        // Check if the day of the month is in the selected list.
        return activity.selectedMonthDays.contains(checkDate.day);

      case 'one_time':
        return checkDate.isAtSameMomentAs(startDate);

      default:
        return false;
    }
  }

  static Future<List<DateTime>> generateTaskDatesAsync(
    ActivityModel activity, {
    int batchSize = 100,
    int maxDays = 730,
    int maxResults = 1000,
  }) async {
    final completer = Completer<List<DateTime>>();

    // Run in compute isolate
    try {
      final result = await compute(_generateDatesInIsolate, {
        'activity': activity.toJson(),
        'maxDays': maxDays,
        'maxResults': maxResults,
      });
      completer.complete(result);
    } catch (e) {
      completer.completeError(e);
    }

    return completer.future;
  }

  /// Static method for compute isolate
  static List<DateTime> _generateDatesInIsolate(Map<String, dynamic> data) {
    final activity = ActivityModel.fromJson(data['activity']);
    final maxDays = data['maxDays'] as int;
    final maxResults = data['maxResults'] as int;

    return generateAllTaskDatesForActivity(
      activity,
      maxDays: maxDays,
      maxResults: maxResults,
    );
  }

  /// Optimized method that generates dates more efficiently
  static List<DateTime> generateAllTaskDatesForActivity(
    ActivityModel activity, {
    int maxDays = 730, // Default 2 years, but configurable
    int maxResults = 1000, // Safety limit
  }) {
    if (!activity.activeStatus || activity.enabledAt == null) {
      return [];
    }

    final startDate = DateUtils.dateOnly(activity.enabledAt!);
    final now = DateTime.now();
    final eventDates = <DateTime>[];

    // Handle one-time activities
    if (activity.type == 'one_time' || activity.frequency == 'one_time') {
      if (startDate.isAfter(now.subtract(const Duration(days: 1)))) {
        return activity.selectedEndBeforeDate != null
            ? [activity.selectedEndBeforeDate!]
            : [];
      }
      return [];
    }

    final maxFutureDate = now.add(Duration(days: maxDays));
    DateTime? endDate = _calculateActivityEndDate(activity, startDate);

    final effectiveEndDate =
        endDate != null && endDate.isBefore(maxFutureDate)
            ? endDate
            : maxFutureDate;

    // Use optimized generation based on frequency
    switch (activity.frequency) {
      case 'daily':
        return _generateDailyDates(
          activity,
          startDate,
          effectiveEndDate,
          maxResults,
        );
      case 'weekly':
        return _generateWeeklyDates(
          activity,
          startDate,
          effectiveEndDate,
          maxResults,
        );
      case 'monthly':
        return _generateMonthlyDates(
          activity,
          startDate,
          effectiveEndDate,
          maxResults,
        );
      default:
        return [];
    }
  }

  /// Calculate activity end date (helper method)
  static DateTime? _calculateActivityEndDate(
    ActivityModel activity,
    DateTime startDate,
  ) {
    if (activity.endBeforeType.isEmpty) return null;

    if (activity.endBeforeType == 'date' &&
        activity.selectedEndBeforeDate != null) {
      return activity.selectedEndBeforeDate;
    } else if (activity.endBeforeType == 'days' &&
        activity.endBeforeUnit != null) {
      return startDate.add(Duration(days: int.parse(activity.endBeforeUnit!)));
    }
    return null;
  }

  /// Optimized daily date generation
  static List<DateTime> _generateDailyDates(
    ActivityModel activity,
    DateTime startDate,
    DateTime endDate,
    int maxResults,
  ) {
    final eventDates = <DateTime>[];

    DateTime currentDate = startDate;
    while (currentDate.isBefore(endDate) && eventDates.length < maxResults) {
      eventDates.add(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return eventDates;
  }

  /// Optimized weekly date generation
  static List<DateTime> _generateWeeklyDates(
    ActivityModel activity,
    DateTime startDate,
    DateTime endDate,
    int maxResults,
  ) {
    final eventDates = <DateTime>[];
    final interval = activity.weeksInterval ?? 1;
    final selectedWeekdays = Set<int>.from(activity.selectedDays);

    DateTime currentDate = startDate;
    int weekCounter = 0;

    while (currentDate.isBefore(endDate) && eventDates.length < maxResults) {
      // Check each day in the week
      for (int i = 0; i < 7; i++) {
        final checkDate = addDays(currentDate, i);
        if (checkDate.isBefore(endDate)) {
          final weekDay = checkDate.weekday % 7 + 1;
          if (selectedWeekdays.contains(weekDay)) {
            eventDates.add(checkDate);
          }
        }
      }

      // Move to the next interval week
      currentDate = addWeeks(currentDate, interval);
      weekCounter += interval;
    }

    return eventDates..sort();
  }

  /// Optimized monthly date generation
  static List<DateTime> _generateMonthlyDates(
    ActivityModel activity,
    DateTime startDate,
    DateTime endDate,
    int maxResults,
  ) {
    final eventDates = <DateTime>[];
    final selectedDays = Set<int>.from(activity.selectedMonthDays);

    DateTime currentMonth = DateTime(startDate.year, startDate.month, 1);

    while (currentMonth.isBefore(endDate) && eventDates.length < maxResults) {
      // Add all selected days in this month
      for (final day in selectedDays) {
        final candidate = DateTime(currentMonth.year, currentMonth.month, day);

        // Validate the date exists and is within range
        if (candidate.month == currentMonth.month &&
            !candidate.isBefore(startDate) &&
            candidate.isBefore(endDate)) {
          eventDates.add(candidate);
        }
      }

      currentMonth = addMonths(currentMonth, 1);
    }

    return eventDates..sort();
  }

  /// Generate task dates for a specific date range
  /// Useful for calendar views and analytics
  static List<DateTime> generateTaskDatesInRange(
    ActivityModel activity,
    DateTime startRange,
    DateTime endRange,
  ) {
    if (!activity.activeStatus || activity.enabledAt == null) {
      return [];
    }

    final activityStart = DateUtils.dateOnly(activity.enabledAt!);
    final rangeStart = DateUtils.dateOnly(startRange);
    final rangeEnd = DateUtils.dateOnly(endRange);

    // For one-time activities
    if (activity.type == 'one_time' || activity.frequency == 'one_time') {
      if (!activityStart.isBefore(rangeStart) &&
          !activityStart.isAfter(rangeEnd)) {
        return [activityStart];
      }
      return [];
    }

    // Calculate effective start date
    DateTime currentDate =
        rangeStart.isBefore(activityStart) ? activityStart : rangeStart;

    // Calculate activity end date
    DateTime? activityEndDate = _calculateActivityEndDate(
      activity,
      activityStart,
    );
    final effectiveEndDate =
        activityEndDate != null && activityEndDate.isBefore(rangeEnd)
            ? activityEndDate
            : rangeEnd;

    // Use optimized generation for the range
    switch (activity.frequency) {
      case 'daily':
        return _generateDailyDatesInRange(
          activity,
          currentDate,
          effectiveEndDate,
        );
      case 'weekly':
        return _generateWeeklyDatesInRange(
          activity,
          activityStart,
          currentDate,
          effectiveEndDate,
        );
      case 'monthly':
        return _generateMonthlyDatesInRange(
          activity,
          currentDate,
          effectiveEndDate,
        );
      default:
        return [];
    }
  }

  /// Generate task dates for a specific date range
  /// Useful for calendar views and analytics
  static List<DateTime> generateTaskDatesInRangeDummy(
    ActivityModel activity,
    DateTime startRange,
    DateTime endRange,
  ) {
    final activityStart = DateUtils.dateOnly(startRange);
    final rangeStart = DateUtils.dateOnly(startRange);
    final rangeEnd = DateUtils.dateOnly(endRange);

    // Calculate effective start date
    DateTime currentDate = rangeStart;

    final effectiveEndDate = rangeEnd;

    // Use optimized generation for the range
    switch (activity.frequency) {
      case 'daily':
        log("Generating daily dates in range for activity: ${activity.name}");
        return _generateDailyDatesInRange(
          activity,
          currentDate,
          effectiveEndDate,
        );
      case 'weekly':
        log("Generating weekly dates in range for activity: ${activity.name}");
        return _generateWeeklyDatesInRange(
          activity,
          activityStart,
          currentDate,
          effectiveEndDate,
        );
      case 'monthly':
        return _generateMonthlyDatesInRange(
          activity,
          currentDate,
          effectiveEndDate,
        );
      default:
        return [];
    }
  }

  // static List<DateTime> _generateDailyDatesInRange(
  //   ActivityModel activity,
  //   DateTime startDate,
  //   DateTime endDate,
  // ) {
  //   final eventDates = <DateTime>[];
  //   final selectedWeekdays = Set<int>.from(activity.selectedDays);

  //   DateTime currentDate = startDate;
  //   while (!currentDate.isAfter(endDate)) {
  //     final weekDay = currentDate.weekday % 7 + 1;
  //     if (selectedWeekdays.contains(weekDay)) {
  //       eventDates.add(currentDate);
  //     }
  //     currentDate = addDays(currentDate, 1);
  //   }

  //   return eventDates;
  // }

  static List<DateTime> _generateDailyDatesInRange(
    ActivityModel activity,
    DateTime startDate,
    DateTime endDate,
  ) {
    final eventDates = <DateTime>[];
    // final selectedWeekdays = Set<int>.from(activity.selectedDays);

    DateTime currentDate = startDate;
    while (!currentDate.isAfter(endDate)) {
      // final weekDay = currentDate.weekday % 7 + 1;
      // if (selectedWeekdays.contains(weekDay)) {
      eventDates.add(currentDate);
      // }
      currentDate = addDays(currentDate, 1);
    }

    return eventDates;
  }

  // static List<DateTime> _generateWeeklyDatesInRange(
  //   ActivityModel activity,
  //   DateTime activityStart,
  //   DateTime rangeStart,
  //   DateTime rangeEnd,
  // ) {
  //   final eventDates = <DateTime>[];
  //   final interval = activity.weeksInterval;

  //   // Find the first occurrence in the range
  //   DateTime currentDate = activityStart;

  //   // Fast-forward to range start if necessary
  //   if (currentDate.isBefore(rangeStart)) {
  //     final weeksDiff = (rangeStart.difference(currentDate).inDays / 7).floor();
  //     final weeksToSkip = (weeksDiff ~/ interval) * interval;
  //     currentDate = addWeeks(currentDate, weeksToSkip);

  //     while (currentDate.isBefore(rangeStart)) {
  //       currentDate = addWeeks(currentDate, interval);
  //     }
  //   }

  //   // Generate dates in range
  //   while (!currentDate.isAfter(rangeEnd)) {
  //     eventDates.add(currentDate);
  //     currentDate = addWeeks(currentDate, interval);
  //   }

  //   return eventDates;
  // }

  static List<DateTime> _generateWeeklyDatesInRange(
    ActivityModel activity,
    DateTime activityStart,
    DateTime rangeStart,
    DateTime rangeEnd,
  ) {
    final eventDates = <DateTime>[];
    final interval = activity.weeksInterval;
    final selectedWeekdays = Set<int>.from(activity.selectedDays);

    // Find the first week to start checking from
    DateTime currentWeekStart = activityStart;

    // Fast-forward to the first relevant week in the range
    if (currentWeekStart.isBefore(rangeStart)) {
      final weeksDiff =
          (rangeStart.difference(currentWeekStart).inDays / 7).floor();
      final weeksToSkip = (weeksDiff ~/ interval) * interval;
      currentWeekStart = addWeeks(currentWeekStart, weeksToSkip);
    }

    // Generate dates in range
    while (!currentWeekStart.isAfter(rangeEnd)) {
      // Check each day in the current week
      for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
        final checkDate = addDays(currentWeekStart, dayOffset);

        // Only add if date is within range
        if (!checkDate.isBefore(rangeStart) && !checkDate.isAfter(rangeEnd)) {
          // Check if this weekday is in the selected days
          final weekDay = checkDate.weekday % 7 + 1; // Convert to Sun=1..Sat=7
          if (selectedWeekdays.contains(weekDay)) {
            eventDates.add(checkDate);
          }
        }
      }

      // Move to next interval week
      currentWeekStart = addWeeks(currentWeekStart, interval);
    }

    return eventDates..sort();
  }

  static List<DateTime> _generateMonthlyDatesInRange(
    ActivityModel activity,
    DateTime startDate,
    DateTime endDate,
  ) {
    final eventDates = <DateTime>[];
    final selectedDays = Set<int>.from(activity.selectedMonthDays);

    DateTime currentMonth = DateTime(startDate.year, startDate.month, 1);
    final endMonth = DateTime(endDate.year, endDate.month, 1);

    while (!currentMonth.isAfter(endMonth)) {
      for (final day in selectedDays) {
        final candidate = DateTime(currentMonth.year, currentMonth.month, day);

        if (candidate.month == currentMonth.month &&
            !candidate.isBefore(startDate) &&
            !candidate.isAfter(endDate)) {
          eventDates.add(candidate);
        }
      }

      currentMonth = addMonths(currentMonth, 1);
    }

    return eventDates..sort();
  }

  /// Get the next scheduled date for an activity after a given date
  static DateTime? getNextScheduledDate(
    ActivityModel activity,
    DateTime afterDate,
  ) {
    if (!activity.activeStatus || activity.enabledAt == null) {
      return null;
    }

    final startDate = DateUtils.dateOnly(activity.enabledAt!);
    final checkAfter = DateUtils.dateOnly(afterDate);

    // For one-time activities
    if (activity.type == 'one_time' || activity.frequency == 'one_time') {
      return startDate.isAfter(checkAfter) ? startDate : null;
    }

    // For regular activities, find the next occurrence
    DateTime currentDate =
        checkAfter.isAfter(startDate) ? addDays(checkAfter, 1) : startDate;

    final maxCheckDate = checkAfter.add(
      const Duration(days: 365),
    ); // Check up to 1 year ahead

    // Calculate activity end date
    DateTime? activityEndDate;
    if (activity.endBeforeActive.value) {
      if (activity.endBeforeType == 'date') {
        activityEndDate = activity.selectedEndBeforeDate;
      } else if (activity.endBeforeType == 'days') {
        activityEndDate = startDate.add(
          Duration(days: int.parse(activity.endBeforeUnit!)),
        );
      }
    }

    while (!currentDate.isAfter(maxCheckDate) &&
        (activityEndDate == null || !currentDate.isAfter(activityEndDate))) {
      if (isScheduledFor(currentDate, activity)) {
        return currentDate;
      }

      // Advance based on frequency
      switch (activity.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, activity.weeksInterval ?? 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        default:
          currentDate = addDays(currentDate, 1);
      }
    }

    return null;
  }

  /// Check if an activity has ended (useful for cleanup)
  static bool hasActivityEnded(ActivityModel activity) {
    if (!activity.endBeforeActive.value) return false;

    final now = DateTime.now();
    DateTime? endDate;

    if (activity.endBeforeType == 'date') {
      endDate = activity.selectedEndBeforeDate;
    } else if (activity.endBeforeType == 'days' && activity.enabledAt != null) {
      endDate = activity.enabledAt!.add(
        Duration(days: int.parse(activity.endBeforeUnit!)),
      );
    }

    return endDate != null && now.isAfter(endDate);
  }

  /// Get activity statistics for a date range
  static Map<String, int> getActivityStatsInRange(
    ActivityModel activity,
    DateTime startDate,
    DateTime endDate,
  ) {
    final scheduledDates = generateTaskDatesInRange(
      activity,
      startDate,
      endDate,
    );
    final now = DateTime.now();

    int totalScheduled = scheduledDates.length;
    int overdue = scheduledDates.where((date) => date.isBefore(now)).length;
    int upcoming = scheduledDates.where((date) => date.isAfter(now)).length;
    int today =
        scheduledDates
            .where(
              (date) =>
                  date.year == now.year &&
                  date.month == now.month &&
                  date.day == now.day,
            )
            .length;

    return {
      'totalScheduled': totalScheduled,
      'overdue': overdue,
      'upcoming': upcoming,
      'today': today,
    };
  }

  /// Adds days to a given DateTime
  static DateTime addDays(DateTime date, int days) =>
      date.add(Duration(days: days));

  /// Subtracts days from a given DateTime
  static DateTime subtractDays(DateTime date, int days) =>
      date.subtract(Duration(days: days));

  /// Adds weeks (7 days per week) to a given DateTime
  static DateTime addWeeks(DateTime date, int weeks) =>
      date.add(Duration(days: weeks * 7));

  /// Subtracts weeks from a given DateTime
  static DateTime subtractWeeks(DateTime date, int weeks) =>
      date.subtract(Duration(days: weeks * 7));

  /// Adds months while handling month overflow
  static DateTime addMonths(DateTime date, int months) {
    int newYear = date.year;
    int newMonth = date.month + months;

    // Handle year overflow
    while (newMonth > 12) {
      newYear++;
      newMonth -= 12;
    }
    while (newMonth < 1) {
      newYear--;
      newMonth += 12;
    }

    // Handle day overflow (e.g., Feb 30 → Feb 28/29)
    int newDay = date.day;
    int lastDayOfNewMonth = DateTime(newYear, newMonth + 1, 0).day;
    if (newDay > lastDayOfNewMonth) {
      newDay = lastDayOfNewMonth;
    }

    return DateTime(
      newYear,
      newMonth,
      newDay,
      date.hour,
      date.minute,
      date.second,
      date.millisecond,
      date.microsecond,
    );
  }

  /// Subtracts months while handling month underflow
  static DateTime subtractMonths(DateTime date, int months) {
    return addMonths(date, -months);
  }

  /// Adds years while handling leap year cases
  static DateTime addYears(DateTime date, int years) {
    int newYear = date.year + years;

    // Handle leap year edge case (Feb 29 → Mar 1 in non-leap year)
    if (date.month == 2 && date.day == 29) {
      bool isLeapYear =
          (newYear % 4 == 0 && newYear % 100 != 0) || (newYear % 400 == 0);
      if (!isLeapYear) {
        return DateTime(
          newYear,
          3,
          1,
          date.hour,
          date.minute,
          date.second,
          date.millisecond,
          date.microsecond,
        );
      }
    }

    return DateTime(
      newYear,
      date.month,
      date.day,
      date.hour,
      date.minute,
      date.second,
      date.millisecond,
      date.microsecond,
    );
  }

  /// Subtracts years while handling leap year cases
  static DateTime subtractYears(DateTime date, int years) {
    return addYears(date, -years);
  }

  /// Calculate age from birth date
  static int calculateAge(DateTime birthDate) {
    final today = DateTime.now();
    int age = today.year - birthDate.year;
    if (today.month < birthDate.month ||
        (today.month == birthDate.month && today.day < birthDate.day)) {
      age--;
    }
    return age;
  }

  /// Get the start of the week for a given date
  static DateTime getStartOfWeek(
    DateTime date, {
    String firstDayOfWeek = 'Monday',
  }) {
    final weekday = date.weekday;
    int daysToSubtract;

    if (firstDayOfWeek == 'Sunday') {
      // Sunday = 0, Monday = 1, ..., Saturday = 6
      final sundayWeekday = weekday == 7 ? 0 : weekday;
      daysToSubtract = sundayWeekday;
    } else {
      // Monday = 1, Tuesday = 2, ..., Sunday = 7
      daysToSubtract = weekday - 1;
    }

    return DateUtils.dateOnly(date.subtract(Duration(days: daysToSubtract)));
  }

  /// Get the end of the week for a given date
  static DateTime getEndOfWeek(
    DateTime date, {
    String firstDayOfWeek = 'Monday',
  }) {
    final startOfWeek = getStartOfWeek(date, firstDayOfWeek: firstDayOfWeek);
    return startOfWeek.add(const Duration(days: 6));
  }

  /// Get the start of the month for a given date
  static DateTime getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1);
  }

  /// Get the end of the month for a given date
  static DateTime getEndOfMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 0);
  }

  /// Get the start of the year for a given date
  static DateTime getStartOfYear(DateTime date) {
    return DateTime(date.year, 1, 1);
  }

  /// Get the end of the year for a given date
  static DateTime getEndOfYear(DateTime date) {
    return DateTime(date.year, 12, 31);
  }

  /// Check if two dates are on the same day
  static bool isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
        date1.month == date2.month &&
        date1.day == date2.day;
  }

  /// Check if a date is today
  static bool isToday(DateTime date) {
    return isSameDay(date, DateTime.now());
  }

  /// Check if a date is yesterday
  static bool isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return isSameDay(date, yesterday);
  }

  /// Check if a date is tomorrow
  static bool isTomorrow(DateTime date) {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return isSameDay(date, tomorrow);
  }

  /// Get a human-readable relative date string
  static String getRelativeDateString(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;

    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference == -1) {
      return 'Tomorrow';
    } else if (difference > 1 && difference <= 7) {
      return '$difference days ago';
    } else if (difference < -1 && difference >= -7) {
      return 'In ${-difference} days';
    } else if (difference > 7 && difference <= 30) {
      final weeks = (difference / 7).floor();
      return weeks == 1 ? '1 week ago' : '$weeks weeks ago';
    } else if (difference < -7 && difference >= -30) {
      final weeks = (-difference / 7).floor();
      return weeks == 1 ? 'In 1 week' : 'In $weeks weeks';
    } else {
      // Use standard date format for dates further away
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  /// Get the number of days between two dates
  static int daysBetween(DateTime startDate, DateTime endDate) {
    final start = DateUtils.dateOnly(startDate);
    final end = DateUtils.dateOnly(endDate);
    return end.difference(start).inDays;
  }

  /// Get all dates between two dates (inclusive)
  static List<DateTime> getDatesBetween(DateTime startDate, DateTime endDate) {
    final dates = <DateTime>[];
    final start = DateUtils.dateOnly(startDate);
    final end = DateUtils.dateOnly(endDate);

    DateTime current = start;
    while (!current.isAfter(end)) {
      dates.add(current);
      current = addDays(current, 1);
    }

    return dates;
  }

  /// Convert a weekday number to string
  static String weekdayToString(int weekday, {bool short = false}) {
    const fullNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (weekday < 1 || weekday > 7) return '';

    final names = short ? shortNames : fullNames;
    return names[weekday - 1];
  }

  /// Convert a month number to string
  static String monthToString(int month, {bool short = false}) {
    const fullNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const shortNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    if (month < 1 || month > 12) return '';

    final names = short ? shortNames : fullNames;
    return names[month - 1];
  }

  /// Get time period string (morning, afternoon, evening, night)
  static String getTimePeriod(
    TimeOfDay time, {
    TimeOfDay morningStart = const TimeOfDay(hour: 6, minute: 0),
    TimeOfDay afternoonStart = const TimeOfDay(hour: 12, minute: 0),
    TimeOfDay eveningStart = const TimeOfDay(hour: 18, minute: 0),
  }) {
    final timeInMinutes = time.hour * 60 + time.minute;
    final morningInMinutes = morningStart.hour * 60 + morningStart.minute;
    final afternoonInMinutes = afternoonStart.hour * 60 + afternoonStart.minute;
    final eveningInMinutes = eveningStart.hour * 60 + eveningStart.minute;

    if (timeInMinutes >= morningInMinutes &&
        timeInMinutes < afternoonInMinutes) {
      return 'Morning';
    } else if (timeInMinutes >= afternoonInMinutes &&
        timeInMinutes < eveningInMinutes) {
      return 'Afternoon';
    } else if (timeInMinutes >= eveningInMinutes ||
        timeInMinutes < morningInMinutes) {
      if (timeInMinutes >= eveningInMinutes) {
        return 'Evening';
      } else {
        return 'Night';
      }
    }

    return 'Unknown';
  }

  /// Format time duration in human readable format
  static String formatDuration(Duration duration) {
    if (duration.inDays > 0) {
      return '${duration.inDays}d ${duration.inHours % 24}h';
    } else if (duration.inHours > 0) {
      return '${duration.inHours}h ${duration.inMinutes % 60}m';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes}m';
    } else {
      return '${duration.inSeconds}s';
    }
  }

  /// Check if a year is a leap year
  static bool isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
  }

  /// Get the number of days in a specific month/year
  static int getDaysInMonth(int year, int month) {
    if (month < 1 || month > 12) return 0;

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (month == 2 && isLeapYear(year)) {
      return 29;
    }

    return daysInMonth[month - 1];
  }
}
