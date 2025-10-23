import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/custom_shapes/switches/custom_switch.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../data/repositories/user/user_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../../utils/helpers/helper_functions.dart';
import '../../../../utils/local_storage/storage_utility.dart';
import '../../../authentication/screens/onboarding/widgets/onboarding_option.dart';
import '../../../authentication/screens/onboarding/widgets/time_picker.dart';
import '../../controllers/user_controller.dart';

class PreferencesScreen extends StatelessWidget {
  const PreferencesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = UserController.instance;
    return Scaffold(
      appBar: const BMAppbar(title: 'Preferences'),
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 24.0),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Obx(
                  () => Column(
                    children: [
                      preferenceOptionTile(
                        title: 'Morning',
                        subTitle:
                            'Starts at ${controller.morningStartsAt.value.format(context)}',
                        onTap:
                            () => showCustomTimePicker(
                              initialTime: controller.morningStartsAt.value,
                              onTimeChanged: (time) {
                                controller.morningStartsAt.value = time;
                              },
                              onConfirm: () {
                                UserRepository.instance.updateSingleField({
                                  'MorningStartsAt':
                                      MyHelperFunctions.timeOfDayToFirebase(
                                        controller.morningStartsAt.value,
                                      ),
                                });
                                Get.back();
                              },
                              onCancel: () {
                                controller.morningStartsAt.value =
                                    controller.user.value.morningStartsAt;
                                Get.back();
                              },
                            ),
                      ),
                      preferenceOptionTile(
                        title: 'Afternoon',
                        subTitle:
                            'Starts at ${controller.afternoonStartsAt.value.format(context)}',
                        onTap:
                            () => showCustomTimePicker(
                              initialTime: controller.afternoonStartsAt.value,
                              onTimeChanged: (time) {
                                controller.afternoonStartsAt.value = time;
                              },
                              onConfirm: () {
                                UserRepository.instance.updateSingleField({
                                  'AfternoonStartsAt':
                                      MyHelperFunctions.timeOfDayToFirebase(
                                        controller.afternoonStartsAt.value,
                                      ),
                                });
                                Get.back();
                              },
                              onCancel: () {
                                controller.afternoonStartsAt.value =
                                    controller.user.value.afternoonStartsAt;
                                Get.back();
                              },
                            ),
                      ),
                      preferenceOptionTile(
                        title: 'Evening',
                        subTitle:
                            'Starts at ${controller.eveningStartsAt.value.format(context)}',
                        onTap:
                            () => showCustomTimePicker(
                              initialTime: controller.eveningStartsAt.value,
                              onTimeChanged: (time) {
                                controller.eveningStartsAt.value = time;
                              },
                              onConfirm: () {
                                UserRepository.instance.updateSingleField({
                                  'EveningStartsAt':
                                      MyHelperFunctions.timeOfDayToFirebase(
                                        controller.eveningStartsAt.value,
                                      ),
                                });
                                Get.back();
                              },
                              onCancel: () {
                                controller.eveningStartsAt.value =
                                    controller.user.value.eveningStartsAt;
                                Get.back();
                              },
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16.0),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    preferenceOptionTile(
                      title: 'First Day Of The Week',
                      subTitle: controller.user.value.firstDayOfWeek,
                      onTap: () => showPickFirstDayOfWeekBottomSheet(),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Vacation Mode',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Obx(
                          () => CustomSwitch(
                            value: controller.vacationMode.value,
                            onChanged: (value) {
                              controller.vacationMode.value = value;
                              UserRepository.instance.updateSingleField({
                                'VacationMode': value,
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
              const SizedBox(height: 16.0),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Daily Reminder',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Obx(
                          () => CustomSwitch(
                            value: controller.dailyReminder.value,
                            onChanged: (value) {
                              controller.dailyReminder.value = value;
                              UserRepository.instance.updateSingleField({
                                'DailyReminder': value,
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    preferenceOptionTile(
                      title: 'Reminder Time',
                      subTitle: controller.reminderTime.value.format(context),
                      onTap:
                          () => showCustomTimePicker(
                            initialTime: controller.reminderTime.value,
                            onTimeChanged: (time) {
                              controller.reminderTime.value = time;
                            },
                            onConfirm: () {
                              UserRepository.instance.updateSingleField({
                                'ReminderTime':
                                    MyHelperFunctions.timeOfDayToFirebase(
                                      controller.reminderTime.value,
                                    ),
                              });
                              Get.back();
                            },
                            onCancel: () {
                              controller.reminderTime.value =
                                  controller.user.value.reminderTime;
                              Get.back();
                            },
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16.0),
              RoundedContainer(
                width: double.infinity,
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    preferenceOptionTile(
                      title: 'Clear Cache',
                      onTap: () {
                        final storage = LocalStorage.instance();
                        storage.removeData('TaskInstances');
                        storage.removeData('PendingUpdates');
                        storage.removeData('FailedSyncIds');
                        storage.removeData('SyncMetadata');
                        MyHelperFunctions.clearCachedImages();
                        Loaders.customToast(
                          message: 'Cache cleared successfully.',
                        );
                      },
                    ),
                    preferenceOptionTile(
                      title: 'Restart All Activities',
                      onTap: () {},
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget preferenceOptionTile({
    required String title,
    String? subTitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                subTitle != null
                    ? Text(
                      subTitle,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    )
                    : const SizedBox.shrink(),
                const SizedBox(width: 8),
                const Icon(
                  Iconsax.arrow_right_3,
                  size: 18,
                  weight: 2,
                  color: AppColors.primary,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void showCustomTimePicker({
    required TimeOfDay initialTime,
    required ValueChanged<TimeOfDay> onTimeChanged,
    required Function onConfirm,
    required Function onCancel,
  }) {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(0),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: RoundedContainer(
          radius: 12,
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          width: Get.width * 0.9,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Time",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSizes.spaceBtnSections),

              SizedBox(
                height: 140,
                child: TimePicker(
                  initialTime: initialTime,
                  onTimeChanged: (time) {
                    onTimeChanged(time);
                  },
                ),
              ),

              const SizedBox(height: AppSizes.spaceBtnSections),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.secondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () => onCancel(),
                      child: const Text(
                        "Cancel",
                        style: TextStyle(color: AppColors.black),
                      ),
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
                      onPressed: () => onConfirm(),
                      child: const Text(
                        "OK",
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void showPickFirstDayOfWeekBottomSheet() {
    final controller = UserController.instance;
    showModalBottomSheet(
      context: Get.context!,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Obx(
          () => Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Choose First Day Of The Week",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 20),
                OnboardingOption(
                  text: "Monday",
                  isSelected: controller.firstDayOfWeek.value == 'Monday',
                  onTap: () {
                    controller.firstDayOfWeek.value = 'Monday';
                  },
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Divider(thickness: 0.5, color: AppColors.grey),
                ),
                OnboardingOption(
                  text: "Sunday",
                  isSelected: controller.firstDayOfWeek.value == 'Sunday',
                  onTap: () {
                    controller.firstDayOfWeek.value = 'Sunday';
                  },
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.secondary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () {
                          controller.firstDayOfWeek.value =
                              controller.user.value.firstDayOfWeek;
                          Get.back();
                        },
                        child: const Text(
                          "Cancel",
                          style: TextStyle(color: AppColors.black),
                        ),
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
                        onPressed: () {
                          UserRepository.instance.updateSingleField({
                            'FirstDayOfWeek': controller.firstDayOfWeek.value,
                          });
                          Get.back();
                        },
                        child: const Text(
                          "OK",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }
}
