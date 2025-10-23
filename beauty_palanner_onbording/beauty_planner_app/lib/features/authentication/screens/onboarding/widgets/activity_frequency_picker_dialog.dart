import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../data/models/physical_activities_model.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class ActivityFrequencyPickerDialog extends StatefulWidget {
  final PhysicalActivitiesModel activity;

  const ActivityFrequencyPickerDialog({super.key, required this.activity});

  @override
  State<ActivityFrequencyPickerDialog> createState() =>
      _ActivityFrequencyPickerDialogState();
}

class _ActivityFrequencyPickerDialogState
    extends State<ActivityFrequencyPickerDialog> {
  late FixedExtentScrollController _numberController;
  late FixedExtentScrollController _periodController;

  // These variables already exist and are used to track the selected items.
  // We'll use them to conditionally color the text.
  int _selectedNumber = 1;
  String _selectedPeriod = 'Day';

  final List<String> _periods = ['Day', 'Week', 'Month', 'Year'];

  @override
  void initState() {
    super.initState();
    // Initialize controllers with the initial selected item (index 0 for 1 and 'Day')
    _numberController = FixedExtentScrollController(
      initialItem: _selectedNumber - 1,
    ); // Adjust for 0-based index
    _periodController = FixedExtentScrollController(
      initialItem: _periods.indexOf(_selectedPeriod),
    ); // Find index of 'Day'
  }

  @override
  void dispose() {
    _numberController.dispose();
    _periodController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = OnboardingController.instance;
    return AlertDialog(
      actionsAlignment: MainAxisAlignment.spaceBetween,
      actionsPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Center(child: Text('${widget.activity.title} Every...')),
      backgroundColor: Colors.white,
      content: SizedBox(
        height: 150,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Number Picker
            SizedBox(
              width: 100,
              child: ListWheelScrollView.useDelegate(
                controller: _numberController,
                itemExtent: 50,
                physics: const FixedExtentScrollPhysics(),
                onSelectedItemChanged: (index) {
                  setState(() {
                    _selectedNumber = index + 1;
                  });
                },
                childDelegate: ListWheelChildBuilderDelegate(
                  builder: (context, index) {
                    final int currentNumber = index + 1;
                    // Determine the color based on whether it's the selected number
                    final Color textColor =
                        currentNumber == _selectedNumber
                            ? AppColors.textPrimary
                            : AppColors.textSecondary;

                    return Center(
                      child: Text(
                        currentNumber.toString(),
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w400,
                          color: textColor,
                        ),
                      ),
                    );
                  },
                  childCount: 30, // Or any max number you prefer
                ),
              ),
            ),
            Container(color: const Color(0xFFEEEEEE), width: 0.5, height: 140),
            // Period Picker
            SizedBox(
              width: 100,
              child: ListWheelScrollView.useDelegate(
                controller: _periodController,
                itemExtent: 50,
                physics: const FixedExtentScrollPhysics(),
                onSelectedItemChanged: (index) {
                  setState(() {
                    _selectedPeriod = _periods[index];
                  });
                },
                childDelegate: ListWheelChildBuilderDelegate(
                  builder: (context, index) {
                    final String currentPeriod = _periods[index];
                    // Determine the color based on whether it's the selected period
                    final Color textColor =
                        currentPeriod == _selectedPeriod
                            ? AppColors.textPrimary
                            : AppColors.textSecondary;

                    return Center(
                      child: Text(
                        currentPeriod,
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w400,
                          color: textColor,
                        ),
                      ),
                    );
                  },
                  childCount: _periods.length,
                ),
              ),
            ),
          ],
        ),
      ),
      actions: [
        SizedBox(
          height: 40,
          width: double.infinity,
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    Get.back();
                  },
                  child: const RoundedContainer(
                    backgroundColor: Color(0xFFEDEAFF),
                    radius: 11,
                    child: Center(
                      child: Text(
                        'Cancel',
                        style: TextStyle(color: Colors.black),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(11),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () {
                    widget.activity.frequency =
                        'Every $_selectedNumber $_selectedPeriod';
                    controller.userModel.refresh();

                    Get.back();
                  },
                  child: const Text('OK'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
