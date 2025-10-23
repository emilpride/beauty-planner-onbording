import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../utils/constants/colors.dart';
import '../../controllers/mood_controller.dart';
import 'widgets/mood_history_tile.dart';

class MoodHistoryScreen extends StatelessWidget {
  const MoodHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<MoodController>();
    // final moodEntries = controller.moodEntryMap.values.
    return Scaffold(
      appBar: const BMAppbar(title: 'Mood Stat History'),
      backgroundColor: AppColors.light,
      extendBodyBehindAppBar: true,
      body: Obx(() {
        if (controller.moodEntryMap.isEmpty) {
          return const Center(child: Text("No mood history yet."));
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 140),
          shrinkWrap: true,
          itemCount: controller.moodEntryMap.length,
          itemBuilder: (context, index) {
            final entry = controller.moodEntryMap.values.elementAt(index);
            return MoodHistoryTile(entry: entry);
          },
        );
      }),
    );
  }
}
