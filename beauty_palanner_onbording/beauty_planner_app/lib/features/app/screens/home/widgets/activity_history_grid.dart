import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../../../data/models/activity_model.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/enums.dart';
import '../../../controllers/activity_controller.dart';
import '../../../models/task_model.dart';

const int _kTotalWeeks = 18; // Total number of weeks to display

class ActivityHistoryGrid extends StatelessWidget {
  final ActivityModel activity;

  ActivityHistoryGrid({super.key, required this.activity});

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
                activity.illustration ?? 'assets/icons/default_icon.svg',
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

  /// Builds the column of day labels (M, T, W, etc.).
  Widget _buildDayLabels() {
    const List<String> days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children:
          days
              .map(
                (day) => Text(
                  day,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              )
              .toList(),
    );
  }

  /// Builds a single dot based on its completion status.
  Widget _buildDot(bool isCompleted, BuildContext context) {
    final Color activeColor = activity.color ?? Theme.of(context).primaryColor;
    final Color dotColor = isCompleted ? activeColor : Color(0xFFE0E0E0);

    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
    );
  }

  /// Builds a column representing a single week's activity.
  Widget _buildWeekColumn(int weekIndex, BuildContext context) {
    // Calculate the starting date for the given week column.
    // weekIndex = 0 is this week, 1 is last week, etc.
    final now = DateTime.now();
    // Normalize 'now' to midnight to avoid time-of-day issues
    final today = DateTime(now.year, now.month, now.day);
    // Dart's weekday: Monday = 1, Sunday = 7. Find the most recent Monday.
    final startOfThisWeek = today.subtract(Duration(days: today.weekday - 1));
    final startOfWeekForColumn = startOfThisWeek.subtract(
      Duration(days: weekIndex * 7),
    );

    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: List.generate(7, (dayIndex) {
        // The specific date for this dot
        final date = startOfWeekForColumn.add(Duration(days: dayIndex));

        // Generate the ID to look up in the map
        final String taskInstanceId = TaskInstance.generateId(
          activity.id,
          date,
        );

        // Check the status from the controller's map
        final TaskInstance? taskInstance =
            _activityController.taskInstanceMap[taskInstanceId];

        final bool isCompleted =
            taskInstance != null && taskInstance.status == TaskStatus.completed;

        return _buildDot(isCompleted, context);
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 16, right: 16, top: 16),
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
          Obx(
            () => SizedBox(
              height: 120, // Fixed height for the grid area
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildDayLabels(),
                  const SizedBox(width: 8),
                  // The main grid of dots
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children:
                          List.generate(
                            _kTotalWeeks,
                            (index) => _buildWeekColumn(
                              //_kTotalWeeks - 1 - index,
                              index,
                              context,
                            ),
                          ).toList(),
                    ),
                  ),
                ],
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
