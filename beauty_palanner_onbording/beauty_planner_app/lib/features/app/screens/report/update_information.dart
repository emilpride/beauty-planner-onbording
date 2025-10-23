import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/backgrounds/soft_eclipse_blur_background.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../../common/widgets/dropdowns/custom_dropdown.dart';
import '../../../../utils/validators/validation.dart';
import '../../../authentication/screens/onboarding/widgets/time_picker.dart';
import '../../controllers/report_controller.dart';

class UpdateInformation extends StatelessWidget {
  const UpdateInformation({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ReportController>();
    final size = MediaQuery.of(context).size;
    return Scaffold(
      appBar: const BMAppbar(title: ''),
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SizedBox(
              height:
                  MediaQuery.of(context).size.height *
                  0.3, // 30% of screen height
              child: CustomPaint(painter: SoftEllipsePainter()),
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 800),
            curve: Curves.fastOutSlowIn,
            bottom: 30,
            left: 0,
            right: 0,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 500),
              curve: Curves.fastOutSlowIn,
              height: size.height * 0.82,
              padding: const EdgeInsets.only(
                top: 0.0,
                right: 16.0,
                left: 16.0,
                bottom: 12.0,
              ),
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(16.0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 30,
                    offset: Offset(0, -10),
                  ),
                ],
              ),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 400),
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0.0, 0.3),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child: SingleChildScrollView(
                  child: Form(
                    key: controller.updateReportFormKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: AppSizes.lg),
                        const Text(
                          'Update your information',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 32),
                        Obx(
                          () => _buildHeightInput(
                            label: 'Growth',
                            controller: controller.height,
                            inchesController: controller.inches,
                            unit: controller.selectedHeightUnit,
                            units: controller.heightUnits,
                            onUnitChanged:
                                (value) =>
                                    controller.selectedHeightUnit.value =
                                        value!,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildWeightInput(
                          label: 'Weight',
                          controller: controller.weight,
                          unit: controller.selectedWeightUnit,
                          units: controller.weightUnits,
                          onUnitChanged:
                              (value) =>
                                  controller.selectedWeightUnit.value = value!,
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'How long do you usually sleep at night?',
                          selectedValueRx: controller.selectedSleepDuration,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Sleep duration',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedSleepDuration.value = value!;
                          },
                          items: controller.sleepDurationOptions,
                        ),
                        const SizedBox(height: 24),
                        Obx(
                          () => _buildTimePicker(
                            'What time do you usually wake up?',
                            controller.wakeUpTime.value,
                            (time) {
                              controller.wakeUpTime.value = time;
                            },
                            context,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Obx(
                          () => _buildTimePicker(
                            'What time do you usually end your day?',
                            controller.endDayTime.value,
                            (time) {
                              controller.endDayTime.value = time;
                            },
                            context,
                          ),
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'How often do you get stressed?',
                          selectedValueRx: controller.selectedStressFrequency,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Stress frequency',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedStressFrequency.value = value!;
                          },
                          items: controller.stressFrequencyOptions,
                        ),

                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'What’s your work environment?',
                          selectedValueRx: controller.selectedWorkEnvironment,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Work environment',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedWorkEnvironment.value = value!;
                          },
                          items: controller.workEnvironmentOptions,
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'What is your skin type?',
                          selectedValueRx: controller.selectedSkinType,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Skin type',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedSkinType.value = value!;
                          },
                          items: controller.skinTypeOptions,
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'Skin problems',
                          selectedValueRx: controller.selectedSkinProblems,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Skin problems',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedSkinProblems.value = value!;
                          },
                          items: controller.skinProblemsOptions,
                        ),

                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'What is your hair type?',
                          selectedValueRx: controller.selectedHairType,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Hair type',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedHairType.value = value!;
                          },
                          items: controller.hairTypeOptions,
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'Hair problems',
                          selectedValueRx: controller.selectedHairProblems,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Hair problems',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedHairProblems.value = value!;
                          },
                          items: controller.hairProblemsOptions,
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label:
                              'How\'s your daily energy level (from 1 to 5)?',
                          selectedValueRx: controller.selectedEnergyLevel,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Energy level',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedEnergyLevel.value = value!;
                          },
                          items: controller.energyLevelOptions,
                        ),
                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'Do you often procrastinate?',
                          selectedValueRx:
                              controller.selectedProcrastinationFrequency,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Procrastination frequency',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedProcrastinationFrequency.value =
                                value!;
                          },
                          items: controller.procrastinationFrequencyOptions,
                        ),

                        const SizedBox(height: 24),
                        CustomDropdown(
                          label: 'Do you often find it hard to focus?',
                          selectedValueRx: controller.selectedFocusLevel,
                          validator:
                              (value) => MyValidator.validateEmptyText(
                                'Focus level',
                                value,
                              ),
                          onChangedExternal: (value) {
                            controller.selectedFocusLevel.value = value!;
                          },
                          items: controller.focusLevelOptions,
                        ),

                        const SizedBox(height: 32),
                        // Button now inside the scrollable area
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              controller.updateReport();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              minimumSize: const Size(double.infinity, 45),
                              maximumSize: const Size(double.infinity, 45),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              "Next",
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        // Add bottom padding to ensure button is accessible when keyboard is open
                        // MediaQuery.of(context).viewInsets.bottom - 24 < 0
                        //     ? const SizedBox(height: 8)
                        //     : SizedBox(
                        //       height: MediaQuery.of(context).viewInsets.bottom,
                        //     ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  GestureDetector _buildTimePicker(
    String label,
    TimeOfDay? selectedTime,
    Function(TimeOfDay) onTap,
    BuildContext context,
  ) {
    return GestureDetector(
      onTap:
          () async => showCustomTimePicker(selectedTime, (time) {
            onTap(time);
          }),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF4A4A6A),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.textSecondary),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  selectedTime?.format(context) ?? '--:--',
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Icon(Icons.access_time, color: AppColors.textSecondary),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeightInput({
    required String label,
    required TextEditingController controller,
    required RxString unit,
    required List<String> units,
    required ValueChanged<String?> onUnitChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF4A4A6A),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 4,
              child: TextFormField(
                controller: controller,
                keyboardType: TextInputType.number,
                validator:
                    (value) => MyValidator.validateEmptyText(label, value),
                decoration: InputDecoration(
                  hintText: 'Type your ${label.toLowerCase()}',
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
                      color: AppColors.textSecondary,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF8A60FF)),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: CustomDropdown(
                label: '',
                selectedValueRx: unit,
                validator:
                    (value) => MyValidator.validateEmptyText('Unit', value),
                onChangedExternal: onUnitChanged,
                items: units,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildHeightInput({
    required String label,
    required TextEditingController controller,
    required TextEditingController inchesController,
    required RxString unit,
    required List<String> units,
    required ValueChanged<String?> onUnitChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF4A4A6A),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: unit.value == 'cm' ? 4 : 1,
              child: TextFormField(
                controller: controller,
                keyboardType: TextInputType.number,
                validator:
                    (value) => MyValidator.validateEmptyText(label, value),
                decoration: InputDecoration(
                  hintText:
                      unit.value == 'cm'
                          ? 'Type your ${label.toLowerCase()}'
                          : 'feet',
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
                      color: AppColors.textSecondary,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF8A60FF)),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            if (unit.value == 'ft&in') ...[
              Expanded(
                flex: 1,
                child: TextFormField(
                  controller: inchesController,
                  keyboardType: TextInputType.number,
                  validator:
                      (value) => MyValidator.validateEmptyText(label, value),
                  decoration: InputDecoration(
                    hintText: 'inches',
                    hintStyle: TextStyle(color: Colors.grey[600]!),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFADB2D7)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF8A60FF)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              flex: unit.value == 'cm' ? 2 : 1,
              child: CustomDropdown(
                label: '',
                selectedValueRx: unit,
                validator:
                    (value) => MyValidator.validateEmptyText('Unit', value),
                onChangedExternal: onUnitChanged,
                items: units,
              ),
            ),
          ],
        ),
      ],
    );
  }

  void showCustomTimePicker(
    TimeOfDay? prevTime,
    Function(TimeOfDay) onTimeSelected,
  ) {
    TimeOfDay time = prevTime ?? TimeOfDay.now();
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
                  initialTime: time,
                  onTimeChanged: (newTime) {
                    time = newTime;
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
                      child: const Text(
                        "Cancel",
                        style: TextStyle(color: AppColors.black),
                      ),
                      onPressed: () => Get.back(),
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
                      child: const Text(
                        "OK",
                        style: TextStyle(color: Colors.white),
                      ),
                      onPressed: () {
                        onTimeSelected(time);
                        Get.back();
                      },
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
}
