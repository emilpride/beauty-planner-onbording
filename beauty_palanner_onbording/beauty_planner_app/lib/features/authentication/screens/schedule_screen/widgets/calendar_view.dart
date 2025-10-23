import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../controllers/activity_schedule/date_picker_controller.dart';

class CalendarView extends StatelessWidget {
  const CalendarView({super.key});

  final List<String> weekdayNames = const [
    'Su',
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
  ];

  @override
  Widget build(BuildContext context) {
    // Find the controller instance created in the dialog function.
    final controller = DatePickerController.instance;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Weekday Headers (Su, Mo, Tu, etc.)
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
        // The main calendar grid, wrapped in Obx for reactivity.
        Obx(() {
          Text(controller.x.value.toString());
          final calendarDays = controller.calendarDaysList;
          return GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 10,
              crossAxisSpacing: 4, // A little horizontal space
            ),
            itemCount: calendarDays.length,
            itemBuilder: (context, index) {
              final date = calendarDays[index];

              // Check if this date is the currently selected one.
              final isSelected =
                  date.year == controller.selectedDate.value.year &&
                  date.month == controller.selectedDate.value.month &&
                  date.day == controller.selectedDate.value.day;

              // Check if this date belongs to the currently displayed month.
              final isCurrentMonth =
                  date.month == controller.displayDate.value.month;

              return GestureDetector(
                onTap: () {
                  controller.selectDay(date);
                  // Optional: If a day outside the current month is tapped,
                  // jump the calendar to that month.
                  if (!isCurrentMonth) {
                    controller.displayDate.value = DateTime(
                      date.year,
                      date.month,
                    );
                  }
                  controller.x.value++;
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      date.day.toString(),
                      style: TextStyle(
                        color:
                            isSelected
                                ? Colors.white
                                : isCurrentMonth &&
                                    (controller.isBirthday.value
                                        ? true
                                        : date.isAfter(
                                          DateTime.now().subtract(
                                            const Duration(days: 1),
                                          ),
                                        ))
                                ? AppColors.textPrimary
                                : Colors.grey[400], // Faded for other months
                        fontWeight:
                            isSelected ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              );
            },
          );
        }),
      ],
    );
  }
}
