import 'package:flutter/material.dart';
import '../../../../../common/widgets/dropdowns/custom_picker.dart';
import '../../../../../common/widgets/dropdowns/picker_button.dart';
import '../../../controllers/calendar_controller.dart';

class CalendarFilter extends StatefulWidget {
  CalendarFilter({super.key});

  final CalendarController controller = CalendarController.instance;

  @override
  State<CalendarFilter> createState() => _CalendarFilterState();
}

class _CalendarFilterState extends State<CalendarFilter>
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
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        const Text('Filter by:', style: TextStyle(color: Colors.grey)),
        const SizedBox(width: 8),
        CompositedTransformTarget(
          link: _layerLink,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              PickerButton(
                width: 60,
                isCalendar: true,
                text: widget.controller.nameFilter.value,
                onPressed: () {
                  _showOverlay(
                    context: context,
                    height: 165,
                    width: 130,
                    items: widget.controller.activityNames,
                    initialValue: widget.controller.nameFilter.value,
                    offset: const Offset(-35.0, 45.0),
                    onSelected:
                        (name) => widget.controller.nameFilter.value = name,
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
