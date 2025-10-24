import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/switches/custom_switch.dart';
import '../../../../common/widgets/list_tile/activity_item.dart';
import '../../../../navigation_menu.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../app/controllers/activity_controller.dart';
import '../../../app/screens/calendar/calendar.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../controllers/activity_schedule/date_picker_controller.dart';
import '../../controllers/activity_schedule/schedule_controller.dart';
import '../../../../data/models/activity_model.dart';
import '../../controllers/activity_selection/choose_activity_controller.dart';
import '../onboarding_2/onboarding_2.dart';
import 'widgets/note_container.dart';
import 'widgets/notify_before.dart';
import 'widgets/widgets.dart';

class ScheduleScreen extends StatelessWidget {
  // Assume activities are passed from the previous screen
  final List<ActivityModel> allActivities;

  const ScheduleScreen({super.key, required this.allActivities});

  @override
  Widget build(BuildContext context) {
    // Initialize the controller and set up schedules
    final ScheduleController controller = Get.put(ScheduleController());
    final DatePickerController datePickerController = Get.put(
      DatePickerController(),
    );
    datePickerController.setupNormal();
    final userController = UserController.instance;

    return Scaffold(
      appBar: const BMAppbar(title: ''),
      backgroundColor: AppColors.light,
      body: Obx(() {
        Text(controller.x.value.toString());
        Text(datePickerController.x.value.toString());
        return GestureDetector(
          onTap: () {
            // Dismiss the keyboard when tapping outside of text fields
            FocusScope.of(context).unfocus();
          },
          child: Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount:
                      allActivities
                          .where((activity) => activity.activeStatus)
                          .length,
                  itemBuilder: (context, index) {
                    final activeActivities =
                        allActivities
                            .where((activity) => activity.activeStatus)
                            .toList();
                    final activity = activeActivities.elementAt(index);
                    return ActivityScheduleCard(
                      activity: activity,
                      controller: controller,
                      datePickerController: datePickerController,
                      userController: userController,
                    );
                  },
                ),
              ),
              _buildSaveButton(
                isEnabled:
                    ChooseActivitiesController.instance.activityType.value ==
                            'regular'
                        ? allActivities
                            .where((activity) => activity.activeStatus)
                            .every((activity) {
                              final hasRepeat =
                                  activity.frequency == 'daily'
                                      ? true // Daily is always valid now
                                      : activity.frequency == 'weekly'
                                      ? activity.selectedDays.isNotEmpty
                                      : activity.selectedMonthDays.isNotEmpty;
                              final endBeforeValid =
                                  !activity.endBeforeActive.value ||
                                  (activity.endBeforeType == 'date'
                                      ? activity.selectedEndBeforeDate != null
                                      : activity.endBeforeUnit != null &&
                                          activity.endBeforeUnit!.isNotEmpty);
                              final notifyBeforeValid =
                                  !activity.notifyBeforeActive.value ||
                                  (activity.selectedNotifyBeforeUnit != null &&
                                      activity.selectedNotifyBeforeFrequency !=
                                          null);
                              return hasRepeat &&
                                  endBeforeValid &&
                                  notifyBeforeValid &&
                                  activity.time?.value != null;
                            })
                        : allActivities
                            .where((activity) => activity.activeStatus)
                            .every((activity) {
                              final endBeforeValid =
                                  activity.selectedEndBeforeDate != null;

                              final notifyBeforeValid =
                                  !activity.notifyBeforeActive.value ||
                                  (activity.selectedNotifyBeforeUnit != null &&
                                      activity.selectedNotifyBeforeFrequency !=
                                          null);
                              return activity.time?.value != null &&
                                  endBeforeValid &&
                                  notifyBeforeValid;
                            }),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildSaveButton({required bool isEnabled}) {
    final userController = UserController.instance;
    return Padding(
      padding: const EdgeInsets.only(right: 16.0, left: 16.0, bottom: 8.0),
      child: SizedBox(
        height: 50,
        width: double.infinity,
        child: Opacity(
          opacity: isEnabled ? 1 : 0.6,
          child: ElevatedButton(
            onPressed: () {
              if (ChooseActivitiesController.instance.activityType.value ==
                  'regular') {
                if (isEnabled) {
                  allActivities
                      .where((activity) => activity.activeStatus)
                      .forEach((activity) {
                        activity.enabledAt = DateTime.now();
                      });
                  userController.addUserActivities(allActivities);

                  if (userController.user.value.onboarding2Completed) {
                    for (var activity in allActivities) {
                      ActivityController.instance.onActivityAdded(activity);
                    }
                    Get.to(() => const NavigationMenu());
                  } else {
                    Get.offAll(() => const OnboardingScreen2());
                  }
                }
              } else if (ChooseActivitiesController
                      .instance
                      .activityType
                      .value ==
                  'one_time') {
                if (isEnabled) {
                  allActivities
                      .where((activity) => activity.activeStatus)
                      .forEach((activity) {
                        activity.type = 'one_time';
                        activity.enabledAt = DateTime.now();
                      });
                  userController.addUserActivities(allActivities);
                  for (var activity in allActivities) {
                    ActivityController.instance.onActivityAdded(activity);
                  }
                  Get.to(() => const NavigationMenu());
                }
              } else if (ChooseActivitiesController
                      .instance
                      .activityType
                      .value ==
                  'calendar') {
                if (isEnabled) {
                  allActivities
                      .where((activity) => activity.activeStatus)
                      .forEach((activity) {
                        activity.type = 'one_time';
                        ActivityController.instance.addOneTimeTask(
                          activity,
                          activity.selectedEndBeforeDate!,
                          activity.time!.value,
                        );
                        log('Added ${activity.name}');
                      });

                  Get.to(() => const CalendarScreen());
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              minimumSize: const Size(double.infinity, 45),
              maximumSize: const Size(double.infinity, 45),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Save',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// --- Main Activity Card Widget ---

class ActivityScheduleCard extends StatelessWidget {
  final ActivityModel activity;
  final ScheduleController controller;
  final DatePickerController datePickerController;
  final UserController userController;

  const ActivityScheduleCard({
    super.key,
    required this.activity,
    required this.controller,
    required this.datePickerController,
    required this.userController,
  });

  @override
  Widget build(BuildContext context) {
    final chooseActivitiesController = ChooseActivitiesController.instance;
    return Card(
      elevation: 0,
      color: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Activity Header
          ActivityItem(activity: activity, onTap: () {}),
          const SizedBox(height: 8),
          NoteContainer(activityModel: activity),
          const SizedBox(height: 20),

          if (chooseActivitiesController.activityType.value == 'regular') ...[
            // Repeat Section
            const Text(
              '  Repeat',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),

            _buildFrequencySelector(activity),

            // Animated content based on frequency
            AnimatedSize(
              duration: const Duration(milliseconds: 400),
              curve: Curves.easeInOut,
              child: _buildFrequencyDetails(activity),
            ),
            const SizedBox(height: 20),

            // Time Section
            const Text(
              '  Do It At',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),

            _buildTimeSelector(context, activity),
            const SizedBox(height: 24),

            _buildEndBefore(activity),
            const SizedBox(height: 24),
          ],
          if (chooseActivitiesController.activityType.value == 'one_time' ||
              chooseActivitiesController.activityType.value == 'calendar') ...[
            // One-time activity specific widgets
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '  Time',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildTimePicker(activity, context),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '  Date',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildDateContent(activity),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildTimeChips(activity),

            const SizedBox(height: 24),
          ],

          // Remind Me Toggle
          _buildRemindBefore(activity),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildFrequencySelector(ActivityModel activity) {
    return SegmentedControl(
      selectedValue: activity.frequency,
      onChanged: (newFrequency) {
        activity.frequency = newFrequency;
        log('Frequency changed to: $newFrequency');
        controller.x.value++;
      },
    );
  }

  Widget _buildFrequencyDetails(ActivityModel activity) {
    switch (activity.frequency) {
      case 'daily':
        // Daily now automatically means all 7 days - no selector needed
        return const SizedBox.shrink(); // Return empty widget

      case 'weekly':
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            // Week interval selector (every 1, 2, 3, or 4 weeks)
            WeekIntervalSelector(
              selectedInterval: activity.weeksInterval,
              onIntervalSelected: (interval) {
                activity.weeksInterval = interval;
                controller.x.value++;
              },
            ),
            const SizedBox(height: 16),
            // Weekday selector (S, M, T, W, T, F, S)
            WeeklyDaySelector(
              selectedDays: activity.selectedDays,
              onDaySelected: (day) {
                if (activity.selectedDays.contains(day)) {
                  activity.selectedDays.remove(day);
                } else {
                  activity.selectedDays.add(day);
                }
                // Reset other selections
                activity.selectedMonthDays = [];
                controller.x.value++;
              },
            ),
          ],
        );

      case 'monthly':
        return MonthlyDaySelector(
          selectedDaysText: activity.monthlyDaysText,
          onTap: () async {
            controller.showCustomMultipleDatePicker(activity);
          },
        );

      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildTimeSelector(BuildContext context, ActivityModel activity) {
    return Column(
      children: [
        _buildTimePicker(activity, context),
        const SizedBox(height: 12),
        _buildTimeChips(activity),
      ],
    );
  }

  GestureDetector _buildTimePicker(
    ActivityModel activity,
    BuildContext context,
  ) {
    return GestureDetector(
      onTap: () async {
        controller.showCustomTimePicker(activity);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[300]!),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              activity.time?.value.format(context) ?? '--:--',
              style: TextStyle(fontSize: 16, color: Colors.grey[700]),
            ),
            const Icon(Icons.access_time, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }

  Row _buildTimeChips(ActivityModel activity) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        TimeChip(
          label: 'Morning',
          onSelected: () {
            activity.time = userController.morningStartsAt;
            controller.x.value++;
          },
          isSelected:
              activity.time != null
                  ? activity.time!.value.hour >=
                          userController.morningStartsAt.value.hour &&
                      activity.time!.value.hour <
                          userController.afternoonStartsAt.value.hour
                  : false,
        ),
        const SizedBox(width: 16),
        TimeChip(
          label: 'Afternoon',
          onSelected: () {
            activity.time = userController.afternoonStartsAt;
            controller.x.value++;
          },
          isSelected:
              activity.time != null
                  ? activity.time!.value.hour ==
                          userController.afternoonStartsAt.value.hour &&
                      activity.time!.value.hour <
                          userController.eveningStartsAt.value.hour
                  : false,
        ),
        const SizedBox(width: 16),
        TimeChip(
          label: 'Evening',
          onSelected: () {
            activity.time = userController.eveningStartsAt;
            controller.x.value++;
          },
          isSelected:
              activity.time != null
                  ? activity.time!.value.hour >=
                      userController.eveningStartsAt.value.hour
                  : false,
        ),
      ],
    );
  }

  Widget _buildToggle(
    String text,
    ActivityModel activity,
    bool value,
    Function onChanged,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          text,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 14,
            color: AppColors.textPrimary,
          ),
        ),
        CustomSwitch(
          value: value, // Example condition
          onChanged: (value) => onChanged(value),
        ),
      ],
    );
  }

  Widget _buildEndBefore(ActivityModel activity) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Column(
        children: [
          _buildToggle(
            ' End Before',
            activity,
            activity.endBeforeActive.value,
            (value) {
              activity.endBeforeActive.value = value;
              controller.x.value++;
            },
          ),
          const SizedBox(height: 24),
          AnimatedContainer(
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeInOut,
            // If toggle is off, height is 0, collapsing the view.
            // If on, it expands to fit its content.
            height: activity.endBeforeActive.value ? null : 0,
            clipBehavior: Clip.hardEdge,
            decoration: const BoxDecoration(
              // This ensures content doesn't overflow during animation
            ),
            // child: Opacity(
            //   opacity: activity.endBeforeActive.value ? 1.0 : 0.0,
            //   child: _buildAnimatedContent(activity),
            // ),
            child: _buildAnimatedContent(activity),
          ),
        ],
      ),
    );
  }

  Widget _buildRemindBefore(ActivityModel activity) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Column(
        children: [
          _buildToggle(
            ' Remind Me',
            activity,
            activity.notifyBeforeActive.value,
            (value) {
              activity.notifyBeforeActive.value = value;
              controller.x.value++;
            },
          ),
          const SizedBox(height: 24),
          activity.notifyBeforeActive.value
              ? NotifyBefore(activityModel: activity)
              : const SizedBox.shrink(),
          SizedBox(height: activity.notifyBeforeActive.value ? 48 : 0),
        ],
      ),
    );
  }

  Widget _buildAnimatedContent(ActivityModel activity) {
    return Column(
      children: [
        const SizedBox(height: 16),
        // 3. The Tab Selection Row
        _buildTabSelector(activity),
        const SizedBox(height: 24),

        // 4. The AnimatedSwitcher for the tab content
        // This widget animates between the 'Days' and 'Date' content widgets.
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 400),
          transitionBuilder: (child, animation) {
            // Use a fade and scale transition for a smooth effect.
            return FadeTransition(
              opacity: animation,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.9, end: 1.0).animate(animation),
                child: child,
              ),
            );
          },
          child:
              activity.endBeforeType == 'date'
                  ? _buildDateContent(activity)
                  : _buildDaysContent(activity),
        ),
      ],
    );
  }

  /// Builds the 'Date' and 'Days' tabs.
  Widget _buildTabSelector(ActivityModel activity) {
    return Row(
      children: [
        Expanded(
          child: _buildTab('Date', activity.endBeforeType == 'date', () {
            activity.endBeforeType = 'date';
            controller.x.value++;
          }),
        ),
        const SizedBox(width: 24),
        Expanded(
          child: _buildTab('Days', activity.endBeforeType == 'days', () {
            activity.endBeforeType = 'days';
            controller.x.value++;
          }),
        ),
      ],
    );
  }

  /// Helper for creating a single animated tab.
  Widget _buildTab(String text, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        height: 26,
        // width: 50,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        // padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.textPrimary : Colors.white,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  /// Builds the content for the 'Date' tab.
  Widget _buildDateContent(ActivityModel activity) {
    // Using a Key ensures AnimatedSwitcher treats this as a distinct widget.
    return KeyedSubtree(
      key: const ValueKey('date_content'),
      child: GestureDetector(
        onTap:
            () => datePickerController.showCustomDatePicker(
              activity,
            ), //_showDatePicker(activity),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                activity.selectedEndBeforeDate != null
                    ? DateFormat(
                      'd MMM yyyy',
                    ).format(activity.selectedEndBeforeDate!)
                    : '',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 16,
                ),
              ),
              SvgPicture.asset(
                AppImages.calendarIcon,
                // color: AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds the content for the 'Days' tab.
  Widget _buildDaysContent(
    // EndActivityController controller,
    ActivityModel activity,
  ) {
    // The Obx wrapper ensures this widget rebuilds when reminderDays changes,
    // which correctly updates the text in the TextFormField.
    final textController = TextEditingController(
      text:
          activity.endBeforeUnit != null
              ? activity.endBeforeUnit.toString()
              : '0',
    );
    // This places the cursor at the end of the text.
    textController.selection = TextSelection.fromPosition(
      TextPosition(offset: textController.text.length),
    );

    return KeyedSubtree(
      key: const ValueKey('days_content_formfield'),
      child: TextFormField(
        controller: textController,
        onChanged: (value) {
          final days = int.tryParse(value);
          if (days != null && days > 0) {
            activity.endBeforeUnit = days.toString();
          }
        },
        keyboardType: TextInputType.number,
        inputFormatters: <TextInputFormatter>[
          FilteringTextInputFormatter
              .digitsOnly, // Ensures only numbers can be entered
        ],
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 16),
        decoration: InputDecoration(
          prefixText: 'After  ',
          prefixStyle: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 16,
          ),
          suffixText: 'days',
          suffixStyle: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 16,
          ),
          suffixIcon: GestureDetector(
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: SvgPicture.asset(AppImages.rotateIcon),
            ),
            onTap: () {
              final List<int> presetDays = [1, 7, 14, 30, 60, 90];
              final currentIndex =
                  activity.endBeforeUnit != null
                      ? presetDays.indexOf(int.parse(activity.endBeforeUnit!))
                      : -1;
              if (currentIndex == -1) {
                // If the current value isn't a preset, start from the first one.
                activity.endBeforeUnit = presetDays.first.toString();
              } else {
                // Move to the next preset, or wrap around to the first.
                final nextIndex = (currentIndex + 1) % presetDays.length;
                activity.endBeforeUnit = presetDays[nextIndex].toString();
                activity.selectedEndBeforeDate = null;
              }
              controller.x.value++;
            },
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12.0),
            borderSide: const BorderSide(color: AppColors.primary),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16.0,
            vertical: 14.0,
          ),
        ),
      ),
    );
  }
}
