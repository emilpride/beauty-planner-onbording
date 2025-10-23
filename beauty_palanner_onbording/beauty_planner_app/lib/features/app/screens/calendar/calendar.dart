import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../navigation_menu.dart';
import '../../../../utils/constants/colors.dart';
import '../../controllers/calendar_controller.dart';
import 'widgets/calendar_filter.dart';
import 'widgets/calendar_header.dart';
import 'widgets/calendar_view_widget.dart';
import 'widgets/task_list_widget.dart';

class CalendarScreen extends StatelessWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize the controller
    final controller = CalendarController.instance;
    return Scaffold(
      appBar: BMAppbar(
        title: 'Calendar',
        onBackPressed: () => Get.to(() => const NavigationMenu()),
      ),
      extendBodyBehindAppBar: true,
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 120),
            CalendarFilter(),
            const SizedBox(height: 8),
            RoundedContainer(
              padding: const EdgeInsets.symmetric(horizontal: 10.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 20),
                  // _buildCalendarHeader(controller),
                  CalendarHeader(),
                  const SizedBox(height: 12),
                  const Divider(thickness: 0.5),
                  const SizedBox(height: 12),
                  CalendarViewWidget(),
                  const SizedBox(height: 12),
                  const Divider(thickness: 0.5),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Obx(
                      () => Opacity(
                        opacity:
                            controller.selectedDate.value.isBefore(
                                  DateTime.now().subtract(
                                    const Duration(days: 1),
                                  ),
                                )
                                ? 0.5
                                : 1.0,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary, // Purple color
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed:
                              controller.selectedDate.value.isBefore(
                                    DateTime.now().subtract(
                                      const Duration(days: 1),
                                    ),
                                  )
                                  ? () {}
                                  : () => controller.addActivity(),
                          child: const Text(
                            'Add activity',
                            style: TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const TaskListWidget(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            const SizedBox(height: 96),
          ],
        ),
      ),
    );
  }
}
