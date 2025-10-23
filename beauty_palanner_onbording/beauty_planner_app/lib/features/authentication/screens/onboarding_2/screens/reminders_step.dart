import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../common/widgets/custom_shapes/switches/custom_switch.dart';
import '../../../../../data/repositories/notifications/notifications_repository.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../personalization/controllers/user_controller.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class RemindersScreen extends StatelessWidget {
  const RemindersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = UserController.instance;
    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: SizedBox(
        height: 62,
        child: Column(
          children: [
            SizedBox(
              height: 50,
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  controller.updateUserNotificationSettings();
                  OnboardingController.instance.currentPage2.value++;
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  "Save",
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 0.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Placeholder for the main image
              const Text(
                "Stay on track with personalized reminders!",
                textAlign: TextAlign.start,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF4B3963),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                "By enabling notifications, you'll get timely reminders to stay consistent and keep progressing.",
                textAlign: TextAlign.start,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 24),
              // Reminder toggles
              Obx(() {
                Text(controller.x.value.toString());
                return _buildReminderRow(
                  "Daily reminder to log your mood",
                  controller.user.value.dailyMoodReminder,
                  (value) {
                    final bool wasEnabled =
                        controller.user.value.dailyMoodReminder;
                    controller.user.value.dailyMoodReminder = !wasEnabled;
                    controller.user.refresh();
                    controller.x.value++;
                    if (!wasEnabled) {
                      // Request permission if just turned ON
                      NotificationsRepository.instance.requestPermission();
                    }
                  },
                );
              }),
              const SizedBox(height: 32),
              Obx(() {
                Text(controller.x.value.toString());
                return _buildReminderRow(
                  "Reminders of Activities",
                  controller.user.value.activityReminder,
                  (value) {
                    final bool wasEnabled =
                        controller.user.value.activityReminder;
                    controller.user.value.activityReminder = !wasEnabled;
                    controller.user.refresh();
                    controller.x.value++;
                    if (!wasEnabled) {
                      // Request permission if just turned ON
                      NotificationsRepository.instance.requestPermission();
                    }
                  },
                );
              }),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReminderRow(
    String text,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 18,
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        CustomSwitch(
          value: value, // Example condition
          onChanged: (value) => onChanged(value),
        ),
      ],
    );
  }
}
