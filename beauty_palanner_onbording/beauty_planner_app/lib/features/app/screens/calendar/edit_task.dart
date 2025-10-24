import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/switches/custom_switch.dart';
import '../../../../common/widgets/list_tile/activity_item.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../data/models/activity_model.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../authentication/controllers/activity_schedule/date_picker_controller.dart';
import '../../../authentication/controllers/activity_schedule/schedule_controller.dart';
import '../../../authentication/screens/schedule_screen/widgets/note_container.dart';
import '../../../authentication/screens/schedule_screen/widgets/notify_before.dart';
import '../../../authentication/screens/schedule_screen/widgets/widgets.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../controllers/activity_controller.dart';
import '../../models/task_model.dart';

class EditTask extends StatelessWidget {
  const EditTask({super.key, required this.task});

  final TaskInstance task;

  @override
  Widget build(BuildContext context) {
    final ScheduleController controller = Get.put(ScheduleController());
    final DatePickerController datePickerController = Get.put(
      DatePickerController(),
    );
    datePickerController.setupNormal();
    final userController = UserController.instance;

    final activityMap = {
      for (var act in ActivityController.instance.userModel.value.activities)
        act.id: act,
    };
    final activityModel = activityMap[task.activityId];
    task.time != null ? activityModel!.time!.value = task.time! : null;
    activityModel!.selectedEndBeforeDate = task.date;
    return Scaffold(
      appBar: const BMAppbar(title: 'Edit Task'),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Obx(() {
            Text(controller.x.value.toString());
            Text(datePickerController.x.value.toString());
            return GestureDetector(
              onTap: () {
                // Dismiss the keyboard when tapping outside of text fields
                FocusScope.of(context).unfocus();
              },
              child: Column(
                children: [
                  ActivityScheduleCard(
                    activity: activityModel,
                    controller: controller,
                    datePickerController: datePickerController,
                    userController: userController,
                  ),
                  _buildSaveButton(
                    isEnabled:
                        (activityModel.time?.value != null &&
                            activityModel.selectedEndBeforeDate != null &&
                            (!activityModel.notifyBeforeActive.value ||
                                (activityModel.selectedNotifyBeforeUnit !=
                                        null &&
                                    activityModel
                                            .selectedNotifyBeforeFrequency !=
                                        null))),
                    task: task,
                    activityModel: activityModel,
                  ),
                ],
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildSaveButton({
    required bool isEnabled,
    required TaskInstance task,
    required ActivityModel activityModel,
  }) {
    return SizedBox(
      height: 50,
      width: double.infinity,
      child: Opacity(
        opacity: isEnabled ? 1 : 0.6,
        child: ElevatedButton(
          onPressed: () {
            if (isEnabled) {
              ActivityController.instance.rescheduleTask(
                task,
                activityModel.selectedEndBeforeDate!,
                activityModel.time!.value,
              );
              Loaders.customToast(message: 'Task updated successfully');
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
    );
  }
}

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
    return Card(
      elevation: 0,
      color: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Activity Header
          ActivityItem(
            activity: activity,
            onTap: () {},
            showRecommended: false,
          ),
          const SizedBox(height: 8),
          NoteContainer(activityModel: activity),
          const SizedBox(height: 20),

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

          // Remind Me Toggle
          _buildRemindBefore(activity),
          const SizedBox(height: 24),
        ],
      ),
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
}
