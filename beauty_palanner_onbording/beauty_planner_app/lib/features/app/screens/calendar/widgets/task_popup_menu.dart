import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../controllers/calendar_controller.dart';
import '../../../models/calendar_model.dart';

class TaskPopupMenu extends StatefulWidget {
  TaskPopupMenu({super.key, required this.task});

  final CalendarTaskDisplay task;
  final controller = Get.find<CalendarController>();

  @override
  State<TaskPopupMenu> createState() => _TaskPopupMenuState();
}

class _TaskPopupMenuState extends State<TaskPopupMenu>
    with SingleTickerProviderStateMixin {
  // Key to link the button and the overlay position
  final LayerLink _layerLink = LayerLink();

  // Controller for the show/hide animation
  late final AnimationController _animationController;
  late final Animation<double> _animation;

  OverlayEntry? _overlayEntry;
  final double _popupWidth = 160.0;

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

  /// Builds the custom popup menu widget
  Widget _buildPopupMenu() {
    return Material(
      child: Container(
        width: _popupWidth,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildPopupMenuItem(
              icon: Icons.check_circle_outline,
              text: 'Mark done',
              onTap: () {
                widget.controller.markTaskAsDone(widget.task);
                _hideOverlay();
              },
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Divider(
                height: 1,
                thickness: 0.5,
                color: Color(0xFFE0E0E0),
              ),
            ),
            _buildPopupMenuItem(
              icon: Icons.remove_circle_outline,
              text: 'Skip',
              onTap: () {
                widget.controller.markTaskAsSkipped(widget.task);
                _hideOverlay();
              },
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Divider(
                height: 1,
                thickness: 0.5,
                color: Color(0xFFE0E0E0),
              ),
            ),
            InkWell(
              onTap: () {
                widget.controller.editTask(widget.task);
                _hideOverlay();
              },
              borderRadius: BorderRadius.circular(12.0),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 12.0,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.textPrimary,
                          width: 1.5,
                        ),
                      ),

                      child: const Icon(
                        Icons.edit,
                        color: AppColors.textPrimary,
                        size: 10,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Edit',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Helper to build individual menu items for the popup
  Widget _buildPopupMenuItem({
    required IconData icon,
    required String text,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.0),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Row(
          children: [
            Icon(icon, color: AppColors.textPrimary, size: 20),
            const SizedBox(width: 12),
            Text(
              text,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Shows the custom popup menu overlay
  void _showOverlay(BuildContext context) {
    // Dismiss any existing overlay
    if (_overlayEntry != null) {
      _hideOverlay();
      return;
    }

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
            // Position the popup menu using CompositedTransformFollower
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              // Adjust the offset to position the popup correctly
              // The X offset is negative to align the right edge of the popup with the icon
              // The Y offset is positive to place it below the icon
              offset: Offset(-_popupWidth + 45, 45.0),
              child: FadeTransition(
                opacity: _animation,
                child: _buildPopupMenu(),
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

  /// Hides and removes the popup menu overlay
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
      child: IconButton(
        icon: const Icon(Icons.more_horiz, color: Colors.grey),
        onPressed: () {
          _showOverlay(context);
        },
      ),
    );
  }
}
