import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../controllers/home_controller.dart';

class HomeCalendarWidget extends StatefulWidget {
  const HomeCalendarWidget({super.key});

  @override
  State<HomeCalendarWidget> createState() => _HomeCalendarWidgetState();
}

class _HomeCalendarWidgetState extends State<HomeCalendarWidget> {
  final HomeScreenController controller = HomeScreenController.instance;
  late ScrollController scrollController;

  @override
  void initState() {
    super.initState();
    scrollController = ScrollController();
    // Scroll to selected date after initial build and month changes
    ever(
      controller.currentMonth,
      (_) =>
          WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToDate()),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToDate());
  }

  // void _scrollToDate() {
  //   if (!scrollController.hasClients) return;

  //   final month = controller.currentMonthCalendar.value;
  //   final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
  //   final days = List.generate(daysInMonth, (index) => index + 1);
  //   final index = days.indexOf(controller.selectedDate.value.day);

  //   if (index == -1) return;

  //   final itemWidth = 70.0; // Adjust based on your item's actual width
  //   final viewportWidth = scrollController.position.viewportDimension;
  //   double offset = (index * itemWidth) - (viewportWidth / 2) + (itemWidth / 2);
  //   offset = offset.clamp(0, scrollController.position.maxScrollExtent);

  //   scrollController.animateTo(
  //     offset,
  //     duration: const Duration(milliseconds: 300),
  //     curve: Curves.easeOut,
  //   );
  // }
  void _scrollToDate() {
    if (!scrollController.hasClients) return;

    final month = controller.currentMonthCalendar.value;
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final days = List.generate(daysInMonth, (index) => index + 1);
    final index = days.indexOf(DateTime.now().day); // Use current date

    if (index == -1) return;

    // Use the actual itemExtent from your ListView (60.0)
    final itemWidth = 60.0;
    final viewportWidth = scrollController.position.viewportDimension;

    // Calculate offset to center the item
    double offset = (index * itemWidth) - (viewportWidth / 2) + (itemWidth / 2);

    // Ensure offset stays within valid range
    offset = offset.clamp(0, scrollController.position.maxScrollExtent);

    scrollController.animateTo(
      offset,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final month = controller.currentMonthCalendar.value;
      final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
      final days = List.generate(daysInMonth, (index) => index + 1);

      return SizedBox(
        height: 80,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          controller: scrollController,
          itemExtent: 60, // Match this with the itemWidth in _scrollToDate
          itemCount: days.length,
          itemBuilder: (context, index) {
            final day = days[index];
            final isToday =
                (DateTime.now().day == day &&
                    month.month == DateTime.now().month &&
                    month.year == DateTime.now().year);

            return Container(
              decoration: BoxDecoration(
                color: const Color(0x00ffffff).withOpacity(0.5),
                borderRadius: const BorderRadius.all(Radius.circular(28)),
              ),
              margin: const EdgeInsets.only(
                right: AppSizes.xs,
                left: AppSizes.xs,
              ),

              child: Container(
                margin: const EdgeInsets.all(3),
                // padding: const EdgeInsets.all(AppSizes.sm * 1.5),
                decoration: BoxDecoration(
                  color: isToday ? null : Colors.transparent,
                  gradient:
                      isToday
                          ? const LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Color(0xFFFFD2D2), Color(0xFF8985E9)],
                          )
                          : null,
                  borderRadius: const BorderRadius.all(Radius.circular(28)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    RoundedContainer(
                      width: 32,
                      height: 32,
                      radius: 100,
                      backgroundColor:
                          isToday ? AppColors.white : Colors.transparent,
                      child: Center(
                        child: Text(
                          '$day',
                          style: TextStyle(
                            color:
                                isToday
                                    ? AppColors.primary
                                    : AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSizes.xs),
                    Text(
                      DateFormat('E')
                          .format(DateTime(month.year, month.month, day))
                          .toUpperCase(),
                      style: TextStyle(
                        color: isToday ? Colors.white : AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    });
  }
}
