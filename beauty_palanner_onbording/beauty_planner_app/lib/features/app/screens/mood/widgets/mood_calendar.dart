import 'package:beautymirror/features/app/controllers/mood_controller.dart';
import 'package:beautymirror/utils/constants/image_strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/helpers/mood_helper.dart';
import 'add_mood_bottom_sheet.dart';

class MoodCalendar extends StatelessWidget {
  MoodCalendar({super.key});

  final List<String> weekdayNames = const [
    'Su',
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
  ];
  final MoodController controller = Get.find<MoodController>();

  void _showAddMoodBottomSheet(BuildContext context, DateTime date) {
    controller.setFocusedDay(
      date,
    ); // Ensure controller knows which day we're adding for
    Get.bottomSheet(
      const AddMoodBottomSheet(),
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      isScrollControlled: true,
      enterBottomSheetDuration: const Duration(milliseconds: 300),
      exitBottomSheetDuration: const Duration(milliseconds: 300),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children:
              weekdayNames
                  .map(
                    (day) => Text(
                      day,
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[600],
                      ),
                    ),
                  )
                  .toList(),
        ),
        const SizedBox(height: 12),
        Obx(() {
          final calendarDays = _getCalendarDays(controller.focusedDay.value);
          final today = DateTime.now();
          Text(controller.x.value.toString()); // Reactive trigger

          return GridView.builder(
            shrinkWrap: true,
            padding: EdgeInsets.zero,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 16,
              crossAxisSpacing: 0,
              // childAspectRatio: 0.8,
              mainAxisExtent: 92,
            ),
            itemCount: calendarDays.length,
            itemBuilder: (context, index) {
              final date = calendarDays[index];
              final dateKey =
                  '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

              final isSelected =
                  date.year == controller.focusedDay.value.year &&
                  date.month == controller.focusedDay.value.month &&
                  date.day == controller.focusedDay.value.day;

              final isCurrentMonth =
                  date.month == controller.focusedDay.value.month;
              final isToday =
                  date.year == today.year &&
                  date.month == today.month &&
                  date.day == today.day;

              final moodValue = controller.moodEntryMap[dateKey];

              Widget dayContent;

              if (moodValue != null) {
                dayContent = Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      MoodDataHelper.getEmoji(moodValue.mood),
                      width: 36,
                      height: 36,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      MoodDataHelper.getLabel(moodValue.mood),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                );
              } else if (isToday && !date.isAfter(today)) {
                dayContent = GestureDetector(
                  onTap: () => _showAddMoodBottomSheet(context, date),
                  child: Column(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: AppColors.light, width: 1),
                        ),
                        child: const Icon(
                          Icons.add,
                          color: AppColors.primary,
                          size: 20,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        moodValue?.mood != null
                            ? MoodDataHelper.getLabel(moodValue!.mood)
                            : 'Today',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                );
              } else {
                dayContent = Column(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: AppColors.light, width: 1),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: SvgPicture.asset(AppImages.mood),
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Mood',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                );
              }

              return GestureDetector(
                onTap: () => controller.setFocusedDay(date),
                child: Column(
                  children: [
                    dayContent,
                    const SizedBox(height: 6),
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        color:
                            isSelected ? AppColors.primary : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      width: 33,
                      height: 33,
                      child: Center(
                        child: Text(
                          date.day.toString(),
                          style: TextStyle(
                            color:
                                isSelected
                                    ? Colors.white
                                    : isCurrentMonth
                                    ? AppColors.textPrimary
                                    : Colors.grey[400],
                            fontSize: 17,
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        }),
      ],
    );
  }

  List<DateTime> _getCalendarDays(DateTime displayMonth) {
    final firstDayOfMonth = DateTime(displayMonth.year, displayMonth.month, 1);
    final daysInMonth =
        DateTime(displayMonth.year, displayMonth.month + 1, 0).day;
    int firstWeekday = firstDayOfMonth.weekday;
    if (firstWeekday == 7) firstWeekday = 0; // Handle Sunday

    final List<DateTime> days = [];

    // Add days from previous month
    for (int i = 0; i < firstWeekday; i++) {
      days.add(firstDayOfMonth.subtract(Duration(days: firstWeekday - i)));
    }

    // Add days from current month
    for (int i = 0; i < daysInMonth; i++) {
      days.add(firstDayOfMonth.add(Duration(days: i)));
    }

    // Add days from next month to fill the grid
    final remainingDays = (42 - days.length); //
    final remaining = remainingDays > 7 ? remainingDays - 7 : 0;
    final lastDay = days.last;
    for (int i = 1; i <= remaining; i++) {
      days.add(lastDay.add(Duration(days: i)));
    }
    return days;
  }
}
