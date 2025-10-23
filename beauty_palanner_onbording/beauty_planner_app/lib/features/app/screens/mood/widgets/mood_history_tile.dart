import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../data/models/mood_model.dart';
import '../../../../../utils/helpers/mood_helper.dart';

class MoodHistoryTile extends StatelessWidget {
  final MoodEntry entry;
  const MoodHistoryTile({super.key, required this.entry});

  @override
  Widget build(BuildContext context) {
    final moodLabel = MoodDataHelper.getLabel(entry.mood);
    final moodEmoji = MoodDataHelper.getEmoji(entry.mood);
    final formattedDate = DateFormat('E, MMM d, yyyy').format(entry.date);
    final formattedTime = DateFormat('hh:mm a').format(entry.updatedAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Image.asset(moodEmoji, width: 48, height: 48),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                    ),
                    children: [
                      TextSpan(
                        text: '$moodLabel  ',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const TextSpan(
                        text: '•  ',
                        style: TextStyle(color: AppColors.textPrimary),
                      ),
                      TextSpan(
                        text: entry.feeling,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '$formattedDate  •  $formattedTime',
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
    );
  }
}
