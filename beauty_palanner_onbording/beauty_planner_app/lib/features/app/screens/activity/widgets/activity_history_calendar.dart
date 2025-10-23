import 'package:beautymirror/features/app/controllers/activity_controller.dart';
import 'package:beautymirror/features/app/models/task_model.dart';
import 'package:beautymirror/utils/constants/enums.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../common/widgets/dropdowns/custom_picker.dart';
import '../../../../../common/widgets/dropdowns/picker_button.dart';
import '../../../../../utils/constants/colors.dart';

class ActivityHistoryCalendar extends StatelessWidget {
  const ActivityHistoryCalendar({super.key, required this.activityId});

  final String activityId;

  @override
  Widget build(BuildContext context) {
    return RoundedContainer(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16),
      child: Column(
        children: [
          ActivityCalendarHeader(),
          const SizedBox(height: 12),
          const Divider(thickness: 0.5),
          const SizedBox(height: 12),
          ActivityHistoryCalendarView(activityId: activityId),
        ],
      ),
    );
  }
}

class ActivityHistoryCalendarView extends StatelessWidget {
  const ActivityHistoryCalendarView({super.key, required this.activityId});

  final String activityId;

  final List<String> weekdayNames = const [
    'Su',
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
  ];

  @override
  Widget build(BuildContext context) {
    final ActivityController controller = Get.find<ActivityController>();
    final displayDate = DateTime.now();
    final calendarDays = _getCalendarDays(displayDate);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children:
              weekdayNames
                  .map(
                    (day) => Text(
                      day,
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[600],
                      ),
                    ),
                  )
                  .toList(),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            mainAxisSpacing: 10,
            crossAxisSpacing: 0,
          ),
          padding: const EdgeInsets.all(0),
          itemCount: calendarDays.length,
          itemBuilder: (context, index) {
            final date = calendarDays[index];
            final id = TaskInstance.generateId(activityId, date);
            final taskCompleted =
                controller.taskInstanceMap[id]?.status == TaskStatus.completed;

            return Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color:
                        taskCompleted
                            ? AppColors.primary
                            : date.isBefore(DateTime.now())
                            ? AppColors.light
                            : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  width: 35,
                  height: 35,
                  child: Center(
                    child: Text(
                      date.day.toString(),
                      style: TextStyle(
                        color:
                            taskCompleted
                                ? AppColors.textPrimary
                                : Colors.grey[400],
                        fontWeight:
                            taskCompleted ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  List<DateTime> _getCalendarDays(DateTime displayMonth) {
    final firstDayOfMonth = DateTime(displayMonth.year, displayMonth.month, 1);
    final daysInMonth =
        DateTime(displayMonth.year, displayMonth.month + 1, 0).day;
    final firstWeekday =
        firstDayOfMonth.weekday % 7; // Sunday is 7, we want it to be 0

    final List<DateTime> days = [];
    // Add days from previous month
    for (int i = 0; i < firstWeekday; i++) {
      days.add(firstDayOfMonth.subtract(Duration(days: firstWeekday - i)));
    }
    // Add days from current month
    for (int i = 0; i < daysInMonth; i++) {
      days.add(firstDayOfMonth.add(Duration(days: i)));
    }
    // Add days from next month to fill the grid
    final remainingDays = (42 - days.length); //
    final remaining = remainingDays > 7 ? remainingDays - 7 : 0;
    final lastDay = days.last;
    for (int i = 1; i <= remaining; i++) {
      days.add(lastDay.add(Duration(days: i)));
    }
    return days;
  }
}

class ActivityCalendarHeader extends StatefulWidget {
  const ActivityCalendarHeader({super.key});

  @override
  State<ActivityCalendarHeader> createState() => _ActivityCalendarHeaderState();
}

class _ActivityCalendarHeaderState extends State<ActivityCalendarHeader>
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
    return CompositedTransformTarget(
      link: _layerLink,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Calendar Stats',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          PickerButton(
            width: 132,
            isCalendar: true,
            text: 'Today',
            onPressed: () {
              _showOverlay(
                context: context,
                height: 165,
                width: 130,
                items: ['Today', 'This Week', 'This Month', 'All'],
                initialValue: 'Today',
                offset: const Offset(200.0, 45.0),
                onSelected: (value) {
                  // Handle the selected value
                },
              );
            },
          ),
        ],
      ),
    );
  }
}
