import 'package:beautymirror/common/widgets/widgets/activity_stats.dart';
import 'package:flutter/material.dart';
import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../data/models/activity_model.dart';
import '../../../../utils/constants/colors.dart';
import 'widgets/activity_history_calendar.dart';
import 'widgets/activity_info_card.dart';
import 'widgets/appbar_popup.dart';

class ActivityInfo extends StatelessWidget {
  final ActivityModel activity;
  const ActivityInfo({super.key, required this.activity});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.light,
      appBar: BMAppbar(
        title: 'Activity',
        // onBackPressed: () => Get.to(() => const NavigationMenu()),
        actions: [AppbarPopup(activityModel: activity)],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            ActivityInfoCard(activity: activity),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 10),
              child: ActivityStats(),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 20,
              ),
              child: ActivityHistoryCalendar(activityId: activity.id),
            ),
          ],
        ),
      ),
    );
  }
}
