import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../data/models/activity_model.dart';
import '../../../../../utils/constants/colors.dart';

class ActivityInfoCard extends StatelessWidget {
  const ActivityInfoCard({super.key, required this.activity});

  final ActivityModel activity;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          const SizedBox(height: 16),
          RoundedContainer(
            height: 80,
            radius: 8,
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              children: [
                _buildIcon(activity.color!, activity.illustration),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        activity.name ?? '',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
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
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildIcon(Color iconColor, String? illustrationPath) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(color: iconColor, shape: BoxShape.circle),
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (illustrationPath != null && illustrationPath.endsWith('.svg'))
            SvgPicture.asset(
              illustrationPath,
              width: 24,
              height: 24,
              colorFilter: const ColorFilter.mode(
                Colors.white,
                BlendMode.srcIn,
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
