import 'package:beautymirror/common/widgets/dropdowns/custom_picker.dart';
import 'package:flutter/material.dart';

import '../../../../../common/widgets/dropdowns/picker_button.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/enums.dart';

// --- Custom Segmented Control for Frequency ---
class SegmentedControl extends StatelessWidget {
  final String? selectedValue;
  final ValueChanged<String> onChanged;

  const SegmentedControl({
    super.key,
    required this.selectedValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _buildSegment('Daily', RepeatFrequency.daily),
        const SizedBox(width: 16),
        _buildSegment('Weekly', RepeatFrequency.weekly),
        const SizedBox(width: 16),
        _buildSegment('Monthly', RepeatFrequency.monthly),
      ],
    );
  }

  Widget _buildSegment(String text, RepeatFrequency value) {
    final bool isSelected = selectedValue == value.name;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value.name),
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
      ),
    );
  }
}

class WeekIntervalSelector extends StatefulWidget {
  final int selectedInterval;
  final ValueChanged<int> onIntervalSelected;

  const WeekIntervalSelector({
    super.key,
    required this.selectedInterval,
    required this.onIntervalSelected,
  });

  @override
  State<WeekIntervalSelector> createState() => _WeekIntervalSelectorState();
}

class _WeekIntervalSelectorState extends State<WeekIntervalSelector>
    with SingleTickerProviderStateMixin {
  // Key to link the button and the overlay position
  final LayerLink _layerLink = LayerLink();

  // Controller for the show/hide animation
  late final AnimationController _animationController;
  late final Animation<double> _animation;

  OverlayEntry? _overlayEntry;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  /// Shows the picker overlay
  void _showOverlay() {
    // Dismiss any existing overlay
    _hideOverlay();

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            // Full-screen GestureDetector to dismiss the overlay when tapping outside
            Positioned.fill(
              child: GestureDetector(
                onTap: _hideOverlay,
                behavior: HitTestBehavior.translucent,
              ),
            ),
            // Position the picker using CompositedTransformFollower
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: const Offset(145.0, 40.0), // Small gap below the button
              child: FadeTransition(
                opacity: _animation,
                child: CustomPicker(
                  items: const ['1', '2', '3', '4'],
                  height: 125,
                  width: 65,
                  initialValue: widget.selectedInterval.toString(),
                  onSelectedItemChanged: (newValue) {
                    widget.onIntervalSelected(int.parse(newValue));
                  },
                ),
              ),
            ),
          ],
        );
      },
    );

    // Add to the overlay and start the animation
    Overlay.of(context).insert(_overlayEntry!);
    _animationController.forward();
  }

  /// Hides and removes the picker overlay
  void _hideOverlay() {
    if (_overlayEntry != null) {
      _animationController.reverse().then((_) {
        _overlayEntry?.remove();
        _overlayEntry = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 8.0),
      child: CompositedTransformTarget(
        link: _layerLink,
        child: RichText(
          text: TextSpan(
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            children: [
              const TextSpan(text: 'On these days '),
              const TextSpan(
                text: ' every  ',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              WidgetSpan(
                alignment: PlaceholderAlignment.middle,
                child: PickerButton(
                  width: 55,
                  text: widget.selectedInterval.toString(),
                  onPressed: _showOverlay,
                ),
              ),
              TextSpan(
                text: widget.selectedInterval == 1 ? '  week' : '  weeks',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class WeeklyDaySelector extends StatelessWidget {
  final List<int> selectedDays;
  final ValueChanged<int> onDaySelected;
  final List<String> days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  WeeklyDaySelector({
    super.key,
    required this.selectedDays,
    required this.onDaySelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(7, (index) {
        final day = index + 1; // 1-7 for Sun-Sat
        final isSelected = selectedDays.contains(day);
        return GestureDetector(
          onTap: () => onDaySelected(day),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : Colors.grey[200],
              borderRadius: BorderRadius.circular(100),
            ),
            child: Center(
              child: Text(
                days[index],
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}

// --- Monthly Day Selector ---
class MonthlyDaySelector extends StatelessWidget {
  final String selectedDaysText;
  final VoidCallback onTap;

  const MonthlyDaySelector({
    super.key,
    required this.selectedDaysText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: GestureDetector(
        onTap: onTap,
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
              Expanded(
                child: Text(
                  selectedDaysText,
                  style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                ),
              ),
              Icon(Icons.calendar_today, color: Colors.grey[600]),
            ],
          ),
        ),
      ),
    );
  }
}

// --- Time Chip ---
class TimeChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onSelected;

  const TimeChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: () => onSelected(),
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
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
