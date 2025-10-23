import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/calendar_controller.dart';

class CalendarViewWidget extends StatelessWidget {
  CalendarViewWidget({super.key});

  final List<String> weekdayNames = const [
    'Su',
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
  ];
  final CalendarController controller = Get.find<CalendarController>();

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
          Text(controller.selectedCategory.value.toString());
          Text(controller.nameFilter.value.toString());
          Text(controller.selectedDate.value.toString());
          final calendarDays = _getCalendarDays(controller.displayDate.value);
          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 10,
              crossAxisSpacing: 0,
            ),
            padding: const EdgeInsets.all(0),
            itemCount: calendarDays.length,
            itemBuilder: (context, index) {
              final date = calendarDays[index];
              final isSelected =
                  date.year == controller.selectedDate.value.year &&
                  date.month == controller.selectedDate.value.month &&
                  date.day == controller.selectedDate.value.day;
              final isCurrentMonth =
                  date.month == controller.displayDate.value.month;
              final hasTasks = controller.datesWithTasks.contains(
                DateTime(date.year, date.month, date.day),
              );

              return GestureDetector(
                onTap: () => controller.selectDay(date),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        color:
                            isSelected
                                ? AppColors.primary
                                : date.isBefore(DateTime.now())
                                ? AppColors.light
                                : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      width: 35,
                      height: 35,
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
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                    if (hasTasks) ...[
                      const SizedBox(height: 4),
                      Container(
                        width: 5,
                        height: 5,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: hasTasks ? AppColors.primary : Colors.white,
                        ),
                      ),
                    ],
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
    final firstWeekday =
        firstDayOfMonth.weekday % 7; // Sunday is 7, we want it to be 0

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
