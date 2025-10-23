import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../../../../data/models/activity_model.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/enums.dart';
import '../../../models/calendar_model.dart';
import 'task_popup_menu.dart';

class TaskCard extends StatelessWidget {
  final CalendarTaskDisplay taskDisplay;
  final bool divider;
  const TaskCard({super.key, required this.taskDisplay, required this.divider});

  @override
  Widget build(BuildContext context) {
    final activity = taskDisplay.activity;
    final time = taskDisplay.instance.time ?? activity.time?.value;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildIcon(activity.color!, activity.illustration),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (time != null)
                      Row(
                        children: [
                          const Icon(
                            Icons.access_time,
                            color: Colors.grey,
                            size: 16,
                          ),
                          Text(
                            ' ${time.format(context)}',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    Text(
                      // taskDisplay.instance.id,
                      activity.name ?? 'Unnamed Activity',
                      style: const TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: 16,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      _getFrequencyText(activity),
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              taskDisplay.instance.status == TaskStatus.pending
                  ? TaskPopupMenu(task: taskDisplay)
                  : taskDisplay.instance.status == TaskStatus.completed
                  ? const Icon(
                    Icons.check_circle_outline,
                    color: AppColors.success,
                    size: 20,
                  )
                  : const Icon(
                    Icons.remove_circle_outline,
                    color: AppColors.error,
                    size: 20,
                  ),
            ],
          ),
        ),
        if (!divider) ...[
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Divider(
              color: Colors.grey.withOpacity(0.5),
              height: 0.5,
              thickness: 1,
            ),
          ),
          const SizedBox(height: 24),
        ],
      ],
    );
  }

  Widget _buildIcon(Color iconColor, String? illustrationPath) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(color: iconColor, shape: BoxShape.circle),
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (illustrationPath != null && illustrationPath.endsWith('.svg'))
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: SvgPicture.asset(
                illustrationPath,
                colorFilter: const ColorFilter.mode(
                  Colors.white,
                  BlendMode.srcIn,
                ),
              ),
            )
          else
            const Icon(Icons.error, color: Colors.white),
        ],
      ),
    );
  }

  // Show the frequency of the activity in text, like everyday, 5 days per week, every 3 weeks etc.
  String _getFrequencyText(ActivityModel activity) {
    switch (activity.frequency) {
      case 'daily':
        return activity.selectedDays.length == 7
            ? 'Everyday'
            : '${activity.selectedDays.length} days per week';
      case 'weekly':
        return activity.weeksInterval == 1
            ? 'Every week'
            : 'Every ${activity.weeksInterval} weeks';
      case 'monthly':
        return '${activity.selectedMonthDays.length} days per month';
      default:
        return 'Custom';
    }
  }
}
