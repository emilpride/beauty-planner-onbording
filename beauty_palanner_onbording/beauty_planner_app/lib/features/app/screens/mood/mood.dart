import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/common/widgets/custom_shapes/containers/rounded_container.dart';
import 'package:beautymirror/utils/constants/colors.dart';
import 'package:beautymirror/utils/constants/image_strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import 'mood_history.dart';
import 'widgets/mood_calendar.dart';
import 'widgets/mood_header.dart';

class MoodScreen extends StatelessWidget {
  const MoodScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: BMAppbar(
        title: 'Mood Stat',
        showBackButton: false,
        actions: [
          GestureDetector(
            onTap: () => Get.to(() => const MoodHistoryScreen()),
            child: Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: SvgPicture.asset(AppImages.history, height: 28, width: 28),
            ),
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 120),
            RoundedContainer(
              margin: const EdgeInsets.all(16.0),
              padding: const EdgeInsets.symmetric(
                horizontal: 12.0,
                vertical: 16,
              ),
              backgroundColor: Colors.white,
              child: Column(
                children: [
                  MoodHeader(),
                  const SizedBox(height: 12),
                  const Divider(thickness: 0.5),
                  const SizedBox(height: 12),
                  MoodCalendar(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
