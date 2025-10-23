import 'package:beautymirror/utils/constants/image_strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../../../data/models/activity_model.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/enums.dart';
import '../../../controllers/activity_controller.dart';
import '../../../models/task_model.dart';

class CurrentWeekActivityStatus extends StatelessWidget {
  final ActivityModel activity;

  CurrentWeekActivityStatus({super.key, required this.activity});

  // Fetches the controller instance using GetX
  final ActivityController _activityController = Get.find<ActivityController>();

  /// Builds the header section with the icon, name, and frequency text.
  Widget _buildHeader() {
    final width = MediaQuery.of(Get.context!).size.width;
    return SizedBox(
      width: width - 64,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              SvgPicture.asset(
                activity.illustration ?? AppImages.sunny,
                width: 24,
                height: 24,
                color: activity.color ?? Colors.blue,
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: width * 0.38,
                child: Text(
                  overflow: TextOverflow.ellipsis,
                  activity.name ?? 'Unnamed Activity',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w400,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),

          SizedBox(
            width: 110,
            child: Text(
              _getFrequencyText(activity),
              textAlign: TextAlign.right,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds a single status dot, which is either filled with a checkmark or an empty circle.
  Widget _buildStatusDot(bool isCompleted, BuildContext context) {
    final Color activeColor = activity.color ?? Theme.of(context).primaryColor;
    const double dotSize = 36.0;

    if (isCompleted) {
      return Container(
        width: dotSize,
        height: dotSize,
        decoration: BoxDecoration(color: activeColor, shape: BoxShape.circle),
        child: const Icon(Icons.check, color: Colors.black, size: 20),
      );
    } else {
      return Container(
        width: dotSize,
        height: dotSize,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.grey.shade300, width: 1.5),
        ),
      );
    }
  }

  /// Builds a column for a single day, including its label and status dot.
  Widget _buildDayColumn(int dayOfWeek, BuildContext context) {
    const List<String> dayLabels = [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ];
    // dayOfWeek is 1 for Monday, 7 for Sunday
    final int todayWeekday = DateTime.now().weekday;
    final bool isToday = dayOfWeek == todayWeekday;

    // --- Date Calculation Logic ---
    final now = DateTime.now();
    // Find the Monday of the current week
    final startOfThisWeek = now.subtract(Duration(days: now.weekday - 1));
    // Get the specific date for this column
    final dateForDay = startOfThisWeek.add(Duration(days: dayOfWeek - 1));
    // Normalize the date to remove time component for consistent ID generation
    final normalizedDate = DateTime(
      dateForDay.year,
      dateForDay.month,
      dateForDay.day,
    );

    // --- Status Checking Logic ---
    final String taskInstanceId = TaskInstance.generateId(
      activity.id,
      normalizedDate,
    );
    final TaskInstance? taskInstance =
        _activityController.taskInstanceMap[taskInstanceId];
    final bool isCompleted =
        taskInstance != null && taskInstance.status == TaskStatus.completed;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          dayLabels[dayOfWeek - 1], // dayOfWeek is 1-based, list is 0-based
          style: TextStyle(
            fontSize: 14,
            fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
            color: isToday ? (activity.color ?? Colors.redAccent) : Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        _buildStatusDot(isCompleted, context),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHeader(),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 6.0),
            child: Divider(color: Colors.grey.shade300, thickness: 0.5),
          ),
          // Obx ensures this Row rebuilds when the task map changes
          Obx(
            () => Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(
                7,
                (index) => _buildDayColumn(
                  index + 1,
                  context,
                ), // index 0 becomes day 1 (Mon)
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Calculates the frequency text based on the activity's schedule.
  String _getFrequencyText(ActivityModel activity) {
    switch (activity.frequency) {
      case 'daily':
        return 'Everyday';

      case 'weekly':
        return activity.weeksInterval == 1
            ? '${activity.selectedDays.length} days per week'
            : '${activity.selectedDays.length} days every ${activity.weeksInterval} weeks';

      case 'monthly':
        return '${activity.selectedMonthDays.length} days per month';

      default:
        return 'Custom';
    }
  }
}
