import 'package:flutter/material.dart';

import '../../../../../common/widgets/dropdowns/picker_button.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/frequency.dart';
import '../../../../../data/models/activity_model.dart';
import '../../../../../common/widgets/dropdowns/custom_picker.dart';
import '../../../controllers/activity_schedule/schedule_controller.dart';

class NotifyBefore extends StatefulWidget {
  const NotifyBefore({super.key, required this.activityModel});
  final ActivityModel activityModel;

  @override
  State<NotifyBefore> createState() => _NotifyBeforeState();
}

class _NotifyBeforeState extends State<NotifyBefore>
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
    int width = 130,
    Offset offset = const Offset(0.0, 5.0),
    required BuildContext context,
    required List<String> items,
    required String initialValue,
    required Function(String) onSelected,
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
              offset: offset, // Small gap below the button
              child: FadeTransition(
                opacity: _animation,
                child: CustomPicker(
                  items: items,
                  height: 165,
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
        const Text(
          ' Before',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        // 3. This is the link between the button and the overlay's position
        CompositedTransformTarget(
          link: _layerLink,
          child: Row(
            children: [
              PickerButton(
                width: 77,
                text: widget.activityModel.selectedNotifyBeforeUnit ?? '',
                onPressed: () {
                  _showOverlay(
                    width: 77,
                    offset: const Offset(0.0, 40.0),
                    context: context,
                    items: Frequency.numbers,
                    initialValue:
                        widget.activityModel.selectedNotifyBeforeUnit ?? '',
                    onSelected: (newValue) {
                      widget.activityModel.selectedNotifyBeforeUnit = newValue;
                      ScheduleController.instance.x.value++;
                    },
                  );
                },
              ),
              const SizedBox(width: 16),
              PickerButton(
                width: 100,
                text: widget.activityModel.selectedNotifyBeforeFrequency ?? '',
                onPressed: () {
                  _showOverlay(
                    width: 100,
                    offset: const Offset(95.0, 40.0),
                    context: context,
                    items: Frequency.frequency,
                    initialValue:
                        widget.activityModel.selectedNotifyBeforeFrequency ??
                        '',
                    onSelected: (newValue) {
                      widget.activityModel.selectedNotifyBeforeFrequency =
                          newValue;
                      ScheduleController.instance.x.value++;
                    },
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
