import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/custom_shapes/switches/custom_switch.dart';
import '../../../../common/widgets/dropdowns/custom_dropdown.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/icons.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../../utils/validators/validation.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../controllers/activity_schedule/date_picker_controller.dart';
import '../../controllers/activity_schedule/schedule_controller.dart';
import '../../controllers/activity_selection/choose_activity_controller.dart';
import '../../../../data/models/activity_model.dart';
import '../schedule_screen/widgets/notify_before.dart';
import '../schedule_screen/widgets/widgets.dart';
import 'choose_activity.dart';
import 'widgets/expandable_picker.dart';

class CreateActivityScreen extends StatelessWidget {
  const CreateActivityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(ScheduleController());
    final datePickerController = Get.put(DatePickerController());
    final userController = UserController.instance;

    return Scaffold(
      appBar: const BMAppbar(title: 'Create New Activity'),
      extendBodyBehindAppBar: true,
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),

        child: GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 120),
              RoundedContainer(
                backgroundColor: Colors.white,
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: controller.createActivityFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        ' Task name',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller:
                            controller.newActivity.value.taskNameController,
                        validator:
                            (value) => MyValidator.validateEmptyText(
                              'Task Name',
                              value,
                            ),
                        decoration: InputDecoration(
                          hintText: 'Type the name',
                          filled: true,
                          fillColor: Colors.white,
                          hintStyle: TextStyle(color: Colors.grey[600]!),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFADB2D7),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFF8A60FF),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // --- NOTE ---
                      const Text(
                        ' Note',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: controller.newActivity.value.noteController,
                        maxLines: 4, // Multi-line text field
                        validator:
                            (value) =>
                                MyValidator.validateEmptyText('Note', value),
                        decoration: InputDecoration(
                          hintText: 'Type the note here...',
                          filled: true,
                          fillColor: Colors.white,
                          hintStyle: TextStyle(color: Colors.grey[600]!),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Color(0xFFADB2D7)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFF8A60FF),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // --- CATEGORY ---
                      Obx(
                        () => CustomDropdown(
                          label: 'Category',
                          // This RxString will hold the name for display in the dropdown
                          selectedValueRx: controller.selectedCategory,
                          items: controller.categoryNamesForDropdown,
                          onChangedExternal:
                              (value) => controller.selectCategory(value),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please select a category';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Color Picker
                      Obx(
                        () => ExpandablePicker<Color>(
                          title: 'Color',
                          items: AppColors.colorMap,
                          searchController: controller.searchColorController,
                          onItemSelected: (color) {
                            controller.newActivity.value.color = color;
                            controller.newActivity.refresh();
                          },

                          itemBuilder:
                              (color) => Container(
                                decoration: BoxDecoration(
                                  color: color,
                                  shape: BoxShape.circle,
                                  border:
                                      controller.newActivity.value.color ==
                                              color
                                          ? Border.all(
                                            color: AppColors.textPrimary,
                                            width: 3,
                                          )
                                          : null,
                                ),
                                child: Container(
                                  width: 46,
                                  height: 46,
                                  decoration: BoxDecoration(
                                    color: color,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white,
                                      width: 2,
                                    ),
                                  ),
                                ),
                              ),
                          // This is a simple search logic. You can make it more sophisticated.
                          filterLogic: (key, value, query) {
                            return key.toLowerCase().contains(
                              query.toLowerCase(),
                            );
                          },
                          selectedItem: controller.newActivity.value.color,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Icon Picker
                      Obx(
                        () => ExpandablePicker<String>(
                          title: 'Icon',
                          items: ActivityIcons.icons,
                          searchController: controller.searchIconController,
                          onItemSelected: (icon) {
                            controller.newActivity.value.illustration = icon;
                            controller.newActivity.refresh();
                          },
                          itemBuilder:
                              (illustration) => Container(
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border:
                                      controller
                                                  .newActivity
                                                  .value
                                                  .illustration ==
                                              illustration
                                          ? Border.all(
                                            color: AppColors.textPrimary,
                                            width: 3,
                                          )
                                          : null,
                                ),
                                child: Container(
                                  width: 46,
                                  height: 46,
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white,
                                      width: 2,
                                    ),
                                  ),
                                  child: SvgPicture.asset(
                                    illustration,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                          filterLogic: (key, value, query) {
                            return key.toLowerCase().contains(
                              query.toLowerCase(),
                            );
                          },
                          selectedItem:
                              controller.newActivity.value.illustration,
                        ),
                      ),
                      const SizedBox(height: 32),

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
                      Obx(() {
                        Text(controller.x.value.toString());
                        return _buildFrequencySelector(
                          controller.newActivity.value,
                          controller,
                        );
                      }),

                      // Animated content based on frequency
                      Obx(() {
                        Text(controller.x.value.toString());
                        return AnimatedSize(
                          duration: const Duration(milliseconds: 400),
                          curve: Curves.easeInOut,
                          child: _buildFrequencyDetails(
                            controller.newActivity.value,
                            controller,
                          ),
                        );
                      }),
                      const SizedBox(height: 20),

                      // --- TIME & DATE ---
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  ' Time',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Obx(() {
                                  Text(controller.x.value.toString());
                                  return GestureDetector(
                                    onTap: () async {
                                      controller.showCustomTimePicker(
                                        controller.newActivity.value,
                                      );
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 14,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: Colors.grey[300]!,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            controller
                                                    .newActivity
                                                    .value
                                                    .time!
                                                    .value
                                                    .format(context) ??
                                                '--:--',
                                            style: TextStyle(
                                              fontSize: 16,
                                              color: Colors.grey[700],
                                            ),
                                          ),
                                          const Icon(
                                            Icons.access_time,
                                            color: AppColors.textSecondary,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // --- TIME SHORTCUTS ---
                      Obx(() {
                        Text(controller.x.value.toString());
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            TimeChip(
                              label: 'Morning',
                              onSelected: () {
                                controller.newActivity.value.time =
                                    userController.morningStartsAt;
                                controller.x.value++;
                              },
                              isSelected:
                                  controller.newActivity.value.time != null
                                      ? controller
                                                  .newActivity
                                                  .value
                                                  .time!
                                                  .value
                                                  .hour >=
                                              userController
                                                  .morningStartsAt
                                                  .value
                                                  .hour &&
                                          controller
                                                  .newActivity
                                                  .value
                                                  .time!
                                                  .value
                                                  .hour <
                                              userController
                                                  .afternoonStartsAt
                                                  .value
                                                  .hour
                                      : false,
                            ),
                            const SizedBox(width: 16),
                            TimeChip(
                              label: 'Afternoon',
                              onSelected: () {
                                controller.newActivity.value.time =
                                    userController.afternoonStartsAt;
                                controller.x.value++;
                              },
                              isSelected:
                                  controller.newActivity.value.time != null
                                      ? controller
                                                  .newActivity
                                                  .value
                                                  .time!
                                                  .value
                                                  .hour >=
                                              userController
                                                  .afternoonStartsAt
                                                  .value
                                                  .hour &&
                                          controller
                                                  .newActivity
                                                  .value
                                                  .time!
                                                  .value
                                                  .hour <
                                              userController
                                                  .eveningStartsAt
                                                  .value
                                                  .hour
                                      : false,
                            ),
                            const SizedBox(width: 16),
                            TimeChip(
                              label: 'Evening',
                              onSelected: () {
                                controller.newActivity.value.time =
                                    userController.eveningStartsAt;
                                controller.x.value++;
                              },
                              isSelected:
                                  controller.newActivity.value.time != null
                                      ? controller
                                              .newActivity
                                              .value
                                              .time!
                                              .value
                                              .hour >=
                                          userController
                                              .eveningStartsAt
                                              .value
                                              .hour
                                      : false,
                            ),
                          ],
                        );
                      }),
                      const SizedBox(height: 32),

                      // --- REMIND ME ---
                      Obx(() {
                        Text(controller.x.value.toString());
                        return _buildRemindBefore(
                          controller.newActivity.value,
                          controller,
                        );
                      }),

                      const SizedBox(height: 24),
                      Obx(() {
                        Text(controller.x.value.toString());
                        return _buildEndBefore(
                          controller.newActivity.value,
                          controller,
                          datePickerController,
                        );
                      }),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Obx(() {
        Text(controller.x.value.toString());
        Text(datePickerController.x.value.toString());
        bool condition = _isActivityValid(controller.newActivity.value);
        return Container(
          // height: 50,
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 32.0),
          color: Colors.transparent,
          width: double.infinity,
          child: Opacity(
            opacity: condition ? 1.0 : 0.6,
            child: ElevatedButton(
              onPressed:
                  () =>
                      condition
                          ? _createActivity()
                          : controller.createActivityFormKey.currentState
                              ?.validate(),
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
                'Create',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        );
      }),
    );
  }

  bool _isActivityValid(ActivityModel activity) {
    final hasRepeat = activity.selectedEndBeforeDate != null;
    final notifyBeforeValid =
        !activity.notifyBeforeActive.value ||
        (activity.selectedNotifyBeforeUnit != null &&
            activity.selectedNotifyBeforeFrequency != null);
    return activity.taskNameController.text.isNotEmpty &&
        activity.noteController.text.isNotEmpty &&
        activity.category != null &&
        activity.color != null &&
        activity.illustration != null &&
        activity.name != null &&
        activity.note != null &&
        hasRepeat &&
        notifyBeforeValid;
  }

  void _createActivity() {
    try {
      ScheduleController.instance.createActivity();
      ChooseActivitiesController.instance.reinitialize();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to create activity: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withOpacity(0.8),
        colorText: Colors.white,
      );
    } finally {
      Get.to(() => ChooseActivitiesScreen(onBack: Get.back));
    }
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

  Widget _buildRemindBefore(
    ActivityModel activity,
    ScheduleController controller,
  ) {
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
          SizedBox(height: activity.notifyBeforeActive.value ? 120 : 0),
        ],
      ),
    );
  }

  Widget _buildFrequencySelector(
    ActivityModel activity,
    ScheduleController controller,
  ) {
    return SegmentedControl(
      selectedValue: activity.frequency,
      onChanged: (newFrequency) {
        activity.frequency = newFrequency;
        log('Frequency changed to: $newFrequency');
        controller.x.value++;
      },
    );
  }

  Widget _buildFrequencyDetails(
    ActivityModel activity,
    ScheduleController controller,
  ) {
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
              selectedInterval: activity.weeksInterval ?? 1,
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

  Widget _buildEndBefore(
    ActivityModel activity,
    ScheduleController controller,
    DatePickerController datePickerController,
  ) {
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
            child: _buildAnimatedContent(
              activity,
              controller,
              datePickerController,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedContent(
    ActivityModel activity,
    ScheduleController controller,
    DatePickerController datePickerController,
  ) {
    return Column(
      children: [
        const SizedBox(height: 16),
        // 3. The Tab Selection Row
        _buildTabSelector(activity, controller),
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
                  ? _buildDateContent(activity, datePickerController)
                  : _buildDaysContent(activity, controller),
        ),
      ],
    );
  }

  /// Builds the 'Date' and 'Days' tabs.
  Widget _buildTabSelector(
    ActivityModel activity,
    ScheduleController controller,
  ) {
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
  Widget _buildDateContent(
    ActivityModel activity,
    DatePickerController datePickerController,
  ) {
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
    ScheduleController controller,
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
