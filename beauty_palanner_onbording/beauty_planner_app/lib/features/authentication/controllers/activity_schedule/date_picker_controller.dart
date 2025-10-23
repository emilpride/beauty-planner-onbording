import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../common/widgets/headers/date_picker_header.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../data/models/activity_model.dart';
import '../../screens/schedule_screen/widgets/calendar_view.dart';

class DatePickerController extends GetxController {
  static DatePickerController get instance => Get.find<DatePickerController>();

  /// The currently selected date, initialized to today.
  final Rx<DateTime> selectedDate = DateTime.now().obs;

  final RxBool isBirthday = false.obs;

  /// The month/year being displayed in the calendar view.
  final Rx<DateTime> displayDate = DateTime.now().obs;

  List<int> years = List<int>.generate(
    3,
    (index) => DateTime.now().year + index,
  );

  Rx<int> x = 0.obs;

  /// A list of full month names.
  final List<String> months = DateFormat.MMMM().dateSymbols.MONTHS;

  @override
  void onInit() {
    super.onInit();
    // Ensure the display month matches the selected date initially.
    displayDate.value = DateTime(
      selectedDate.value.year,
      selectedDate.value.month,
    );
  }

  void setupBirthday() {
    isBirthday.value = true;
    years = List<int>.generate(
      100,
      (index) => DateTime.now().year - 100 + index,
    );
  }

  void setupNormal() {
    isBirthday.value = false;
    years = List<int>.generate(3, (index) => DateTime.now().year + index);
  }

  /// Changes the year of the displayed calendar.
  void changeYear(int year) {
    displayDate.value = DateTime(year, displayDate.value.month);
  }

  /// Changes the month of the displayed calendar.
  void changeMonth(int month) {
    displayDate.value = DateTime(displayDate.value.year, month);
  }

  /// Sets the selected date.
  void selectDay(DateTime day) {
    if (isBirthday.value) {
      // If it's a birthday selection, only allow past dates
      if (day.isAfter(DateTime.now())) {
        return;
      }
    } else {
      if (day.isBefore(DateTime.now().subtract(const Duration(days: 1)))) {
        // Prevent selecting past dates
        return;
      }
    }
    selectedDate.value = day;
    displayDate.value = DateTime(day.year, day.month, day.day);
  }

  /// Resets the calendar to show today's date.
  void goToToday() {
    selectedDate.value = DateTime.now();
    displayDate.value = DateTime(DateTime.now().year, DateTime.now().month);
    x.value++;
  }

  /// A list of all the `DateTime` objects to display on the calendar grid.
  /// It includes placeholder days from the previous and next months.
  List<DateTime> get calendarDaysList {
    final year = displayDate.value.year;
    final month = displayDate.value.month;

    final firstDayOfMonth = DateTime(year, month, 1);
    final lastDayOfMonth = DateTime(year, month + 1, 0);

    // Find the Sunday of the week the month starts in.
    // Dart's weekday: Monday=1, ..., Sunday=7.
    final firstDayOfGrid = firstDayOfMonth.subtract(
      Duration(days: firstDayOfMonth.weekday % 7),
    );

    // Find the Saturday of the week the month ends in.
    final lastDayOfGrid = lastDayOfMonth.add(
      Duration(days: (7 - lastDayOfMonth.weekday) % 7),
    );

    List<DateTime> calendarDays = [];
    var currentDay = firstDayOfGrid;
    while (currentDay.isBefore(lastDayOfGrid.add(const Duration(days: 1)))) {
      calendarDays.add(currentDay);
      currentDay = currentDay.add(const Duration(days: 1));
    }
    return calendarDays;
  }

  void showCustomDatePicker(ActivityModel activity) {
    // Set the initial date from the activity model if it exists.
    if (activity.selectedEndBeforeDate != null) {
      selectDay(activity.selectedEndBeforeDate!);
    }

    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          width: Get.width,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // --- DIALOG HEADER ---
              const Text(
                "Date",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              DatePickerHeader(), const SizedBox(height: 8),

              // --- CALENDAR BODY ---
              const Divider(thickness: 0.5),
              const CalendarView(),
              const Divider(thickness: 0.5),
              const SizedBox(height: 20),

              // --- ACTION BUTTONS ---
              _buildActionButtons(activity),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds the "Cancel" and "OK" buttons.
  Widget _buildActionButtons(ActivityModel activity) {
    return Row(
      children: [
        Expanded(
          child: TextButton(
            style: TextButton.styleFrom(
              backgroundColor: AppColors.secondary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              "Cancel",
              style: TextStyle(color: AppColors.black, fontSize: 16),
            ),
            onPressed: () => Get.back(),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: TextButton(
            style: TextButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              "OK",
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
            onPressed: () {
              // Update the original activity model with the selected date.
              activity.selectedEndBeforeDate = selectedDate.value;
              activity.endBeforeUnit = null;
              selectedDate.value = DateTime.now();
              Get.back();
              x.value++;
            },
          ),
        ),
      ],
    );
  }
}
