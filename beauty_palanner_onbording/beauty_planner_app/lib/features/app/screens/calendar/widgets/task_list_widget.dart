import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../controllers/calendar_controller.dart';
import 'task_card_widget.dart';

class TaskListWidget extends StatelessWidget {
  const TaskListWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<CalendarController>();
    return Obx(() {
      if (controller.tasksForSelectedDay.isEmpty) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 40.0),
            child: Text(
              'No Activities',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ),
        );
      }
      return ListView.builder(
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.tasksForSelectedDay.length,
        itemBuilder: (context, index) {
          final taskDisplay = controller.tasksForSelectedDay[index];
          return TaskCard(
            taskDisplay: taskDisplay,
            divider: index == controller.tasksForSelectedDay.length - 1,
          );
        },
      );
    });
  }
}
