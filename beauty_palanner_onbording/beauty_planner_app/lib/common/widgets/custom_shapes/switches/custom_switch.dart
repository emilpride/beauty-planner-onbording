import 'package:flutter/material.dart';

import '../../../../utils/constants/colors.dart';

class CustomSwitch extends StatefulWidget {
  final bool value;
  final ValueChanged<bool> onChanged;
  final Color activeColor;
  final Color inactiveColor;
  final Color activeTrackColor;
  final Color inactiveTrackColor;
  final Duration animationDuration;

  const CustomSwitch({
    super.key,
    required this.value,
    required this.onChanged,
    this.activeColor = const Color(0xFF5C4688), // Darker purple from image
    this.inactiveColor = Colors.white, // White from image
    this.activeTrackColor = AppColors.primary,
    this.inactiveTrackColor = const Color(
      0xFFADB2D7,
    ), // Lighter blue/purple from image
    this.animationDuration = const Duration(milliseconds: 200),
  });

  @override
  _CustomSwitchState createState() => _CustomSwitchState();
}

class _CustomSwitchState extends State<CustomSwitch>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<AlignmentGeometry> _alignAnimation;
  late Animation<Color?> _thumbColorAnimation;
  late Animation<Color?> _trackColorAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: widget.animationDuration,
    );

    _alignAnimation = AlignmentTween(
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _thumbColorAnimation = ColorTween(
      begin: widget.inactiveColor,
      end: widget.activeColor,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _trackColorAnimation = ColorTween(
      begin: widget.inactiveTrackColor,
      end: widget.activeTrackColor,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    if (widget.value) {
      _animationController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant CustomSwitch oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      if (widget.value) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (_animationController.isAnimating) {
          return;
        }
        widget.onChanged(!widget.value);
      },
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return SizedBox(
            width: 36.0, // Adjust as needed
            height: 14.0, // Adjust as needed
            child: CustomPaint(
              painter: _CustomSwitchPainter(
                thumbAlignment: _alignAnimation.value,
                thumbColor: _thumbColorAnimation.value!,
                trackColor: _trackColorAnimation.value!,
                shadowColor: Colors.black.withOpacity(0.4), // Subtle shadow
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }
}

class _CustomSwitchPainter extends CustomPainter {
  final AlignmentGeometry thumbAlignment;
  final Color thumbColor;
  final Color trackColor;
  final Color shadowColor;

  _CustomSwitchPainter({
    required this.thumbAlignment,
    required this.thumbColor,
    required this.trackColor,
    required this.shadowColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double trackHeight = size.height;
    final double trackWidth = size.width;
    final double thumbRadius =
        10; // Slightly smaller than half height for padding/shadow

    // 1. Draw the track (rounded rectangle)
    final RRect trackRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, trackWidth, trackHeight),
      Radius.circular(trackHeight / 2),
    );
    final Paint trackPaint = Paint()..color = trackColor;
    canvas.drawRRect(trackRRect, trackPaint);

    // 2. Calculate thumb position
    final Alignment currentAlignment = thumbAlignment as Alignment;
    final double thumbCenterX =
        (currentAlignment.x + 1) / 2 * (trackWidth - 2 * thumbRadius) +
        thumbRadius;
    final double thumbCenterY = trackHeight / 2;
    final Offset thumbCenter = Offset(thumbCenterX, thumbCenterY);

    // 3. Draw the thumb shadow
    final Paint shadowPaint =
        Paint()
          ..color = shadowColor
          ..maskFilter = const MaskFilter.blur(
            BlurStyle.normal,
            2.0,
          ); // Adjust blur as needed
    canvas.drawCircle(thumbCenter, thumbRadius, shadowPaint);

    // 4. Draw the thumb (circle)
    final Paint thumbPaint = Paint()..color = thumbColor;
    canvas.drawCircle(thumbCenter, thumbRadius, thumbPaint);
  }

  @override
  bool shouldRepaint(covariant _CustomSwitchPainter oldDelegate) {
    return oldDelegate.thumbAlignment != thumbAlignment ||
        oldDelegate.thumbColor != thumbColor ||
        oldDelegate.trackColor != trackColor ||
        oldDelegate.shadowColor != shadowColor;
  }
}
