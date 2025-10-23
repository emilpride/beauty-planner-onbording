import 'package:flutter/material.dart';
import '../../../../../utils/constants/colors.dart';

class TimePicker extends StatefulWidget {
  final TimeOfDay initialTime;
  final Function(TimeOfDay) onTimeChanged;

  const TimePicker({
    super.key,
    required this.initialTime,
    required this.onTimeChanged,
  });

  @override
  State<TimePicker> createState() => _TimePickerState();
}

class _TimePickerState extends State<TimePicker> {
  late FixedExtentScrollController _hourController;
  late FixedExtentScrollController _minuteController;

  int _selectedHour = 0;
  int _selectedMinute = 0;

  static const int _loopCount = 1000; // Number of loops (odd number to center)
  static const int _loopOffset = _loopCount ~/ 2;

  @override
  void initState() {
    super.initState();
    _selectedHour = widget.initialTime.hour;
    _selectedMinute = widget.initialTime.minute;

    _hourController = FixedExtentScrollController(
      initialItem: (_loopOffset * 24) + _selectedHour,
    );
    _minuteController = FixedExtentScrollController(
      initialItem: (_loopOffset * 60) + _selectedMinute,
    );
  }

  @override
  void dispose() {
    _hourController.dispose();
    _minuteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Hour Picker
        SizedBox(
          width: 145,
          child: ListWheelScrollView.useDelegate(
            controller: _hourController,
            itemExtent: 50,
            physics: const FixedExtentScrollPhysics(),
            // diameterRatio: 2,
            // offAxisFraction: -0.3,
            // squeeze: 1,
            onSelectedItemChanged: (index) {
              final actualHour = index % 24;
              if (_selectedHour != actualHour) {
                setState(() {
                  _selectedHour = actualHour;
                });
                _notifyTimeChange(actualHour, _selectedMinute);
              }
            },
            childDelegate: ListWheelChildBuilderDelegate(
              builder: (context, index) {
                final actualHour = index % 24;
                final isSelected = actualHour == _selectedHour;
                return _buildTimeItem(
                  actualHour.toString().padLeft(2, '0'),
                  isSelected,
                );
              },
              childCount: _loopCount * 24,
            ),
          ),
        ),
        Container(color: const Color(0xFFEEEEEE), width: 0.5, height: 140),
        // Minute Picker
        SizedBox(
          width: 145,
          child: ListWheelScrollView.useDelegate(
            controller: _minuteController,
            itemExtent: 50,
            physics: const FixedExtentScrollPhysics(),
            // diameterRatio: 1.5,
            // offAxisFraction: -0.3,
            // squeeze: 1.2,
            onSelectedItemChanged: (index) {
              final actualMinute = index % 60;
              if (_selectedMinute != actualMinute) {
                setState(() {
                  _selectedMinute = actualMinute;
                });
                _notifyTimeChange(_selectedHour, actualMinute);
              }
            },
            childDelegate: ListWheelChildBuilderDelegate(
              builder: (context, index) {
                final actualMinute = index % 60;
                final isSelected = actualMinute == _selectedMinute;
                return _buildTimeItem(
                  actualMinute.toString().padLeft(2, '0'),
                  isSelected,
                );
              },
              childCount: _loopCount * 60,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTimeItem(String text, bool isSelected) {
    return Center(
      child: Text(
        text,
        style: TextStyle(
          fontSize: 40,
          fontWeight: FontWeight.w500,
          color: isSelected ? AppColors.textPrimary : AppColors.textSecondary,
        ),
      ),
    );
  }

  void _notifyTimeChange(int hour, int minute) {
    widget.onTimeChanged(TimeOfDay(hour: hour, minute: minute));
  }
}
