import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/mood_widgtet.dart';
import '../widgets/onboarding_step.dart';

class MoodStep extends StatelessWidget {
  const MoodStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    final moods = {
      'Great': AppImages.great,
      'Good': AppImages.good,
      'Okay': AppImages.okay,
      'Not Good': AppImages.notGood,
      'Bad': AppImages.bad,
    };

    return Obx(
      () => OnboardingStep(
        key: const ValueKey('Mood'),
        title: 'Your Most Common Mood Last Month?',
        condition: controller.moodModel.value.mood != 0,
        child: Center(
          child: Wrap(
            spacing: 12.0,
            runSpacing: 16.0,
            alignment: WrapAlignment.center,
            children:
                moods.entries.map((entry) {
                  return MoodOption(
                    emoji: entry.value,
                    label: entry.key,
                    isSelected:
                        controller.moodModel.value.mood ==
                        _moodIndex(entry.key),

                    onTap: () {
                      controller.moodModel.update((mood) {
                        mood!.mood = _moodIndex(entry.key);
                      });
                      controller.moodModel.refresh();
                    },
                  );
                }).toList(),
          ),
        ),
      ),
    );
  }

  int _moodIndex(String mood) {
    switch (mood) {
      case 'Great':
        return 1;
      case 'Good':
        return 2;
      case 'Okay':
        return 3;
      case 'Not Good':
        return 4;
      case 'Bad':
        return 5;
      default:
        return 0; // Default case if mood doesn't match
    }
  }
}
