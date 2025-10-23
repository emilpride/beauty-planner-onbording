import 'package:flutter/material.dart';

import '../../../features/authentication/controllers/activity_schedule/date_picker_controller.dart';
import '../../../utils/constants/colors.dart';
import '../dropdowns/custom_picker.dart';
import '../dropdowns/picker_button.dart';

class DatePickerHeader extends StatefulWidget {
  DatePickerHeader({super.key});

  final DatePickerController controller = DatePickerController.instance;

  @override
  State<DatePickerHeader> createState() => _DatePickerHeaderState();
}

class _DatePickerHeaderState extends State<DatePickerHeader>
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
    // Use a curve for a nicer effect
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
  void _showOverlay({
    required BuildContext context,
    required List<String> items,
    required String initialValue,
    required Function(String) onSelected,
    required Offset offset,
    required int height,
    required int width,
  }) {
    // Dismiss any existing overlay
    _hideOverlay();

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            // 1. Add a full-screen GestureDetector to dismiss the overlay when tapping outside
            Positioned.fill(
              child: GestureDetector(
                onTap: _hideOverlay,
                behavior:
                    HitTestBehavior.translucent, // Ensures it catches taps
              ),
            ),
            // 2. Position the picker using CompositedTransformFollower
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              // offset: const Offset(0.0, 45.0), // Small gap below the button
              offset: offset,
              child: FadeTransition(
                opacity: _animation,
                child: CustomPicker(
                  items: items,
                  height: height,
                  width: width,
                  initialValue: initialValue,
                  onSelectedItemChanged: (newValue) {
                    setState(() {
                      onSelected(newValue);
                    });
                    // Hide the overlay after a selection is made
                    // _hideOverlay();
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
        // Only remove the entry after the animation is complete
        _overlayEntry?.remove();
        _overlayEntry = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: widget.controller.goToToday,
          child: Container(
            height: 35,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            margin: const EdgeInsets.only(right: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: Colors.grey.withOpacity(0.15),
            ),
            child: const Center(
              child: Text(
                "Today",
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ),
        ),

        CompositedTransformTarget(
          link: _layerLink,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              PickerButton(
                width: 65,
                isCalendar: true,
                text: widget.controller.displayDate.value.year.toString(),
                onPressed: () {
                  _showOverlay(
                    context: context,
                    height: 165,
                    width: 67,
                    items:
                        widget.controller.years
                            .map((year) => year.toString())
                            .toList(),
                    initialValue:
                        widget.controller.displayDate.value.year.toString(),

                    offset: const Offset(0.0, 45.0),
                    onSelected:
                        (year) => widget.controller.changeYear(int.parse(year)),
                  );
                },
              ),
              const SizedBox(width: 8),
              PickerButton(
                width: 105,
                isCalendar: true,
                text:
                    widget
                        .controller
                        .months[widget.controller.displayDate.value.month - 1],
                onPressed: () {
                  _showOverlay(
                    context: context,
                    height: 165,
                    width: 120,
                    items: widget.controller.months,
                    initialValue:
                        widget.controller.months[widget
                                .controller
                                .displayDate
                                .value
                                .month -
                            1],
                    offset: const Offset(65.0, 45.0),
                    onSelected:
                        (month) => widget.controller.changeMonth(
                          widget.controller.months.indexOf(month) + 1,
                        ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}
