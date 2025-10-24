// import 'dart:math' as math;
// import 'package:flutter/material.dart';

// class CustomRoundedProgressIndicator extends StatefulWidget {
//   final Color color;
//   final double strokeWidth;
//   final double value;

//   const CustomRoundedProgressIndicator({
//     Key? key,
//     this.color = Colors.blue,
//     this.strokeWidth = 4.0,
//     this.value = 0.0,
//   }) : super(key: key);

//   @override
//   _CustomRoundedProgressIndicatorState createState() =>
//       _CustomRoundedProgressIndicatorState();
// }

// class _CustomRoundedProgressIndicatorState
//     extends State<CustomRoundedProgressIndicator>
//     with SingleTickerProviderStateMixin {
//   AnimationController? _controller;
//   Animation<double>? _animation;

//   @override
//   void initState() {
//     super.initState();
//     if (widget.value == 0.0) {
//       _controller = AnimationController(
//         vsync: this,
//         duration: const Duration(milliseconds: 1000), // Faster rotation
//       )..repeat();
//       _animation = Tween(begin: 0.0, end: 1.0).animate(_controller!);
//     }
//   }

//   @override
//   void didUpdateWidget(covariant CustomRoundedProgressIndicator oldWidget) {
//     super.didUpdateWidget(oldWidget);
//     if (widget.value != oldWidget.value && widget.value != 0.0) {
//       _controller?.stop();
//       _controller?.dispose();
//       _controller = null;
//     } else if (widget.value == 0.0 && oldWidget.value != 0.0) {
//       _controller = AnimationController(
//         vsync: this,
//         duration: const Duration(milliseconds: 1000), // Faster rotation
//       )..repeat();
//       _animation = Tween(begin: 0.0, end: 1.0).animate(_controller!);
//     }
//   }

//   @override
//   void dispose() {
//     _controller?.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return AnimatedBuilder(
//       animation: _animation ?? AlwaysStoppedAnimation(widget.value),
//       builder: (context, child) {
//         return CustomPaint(
//           painter: _ProgressPainter(
//             color: widget.color,
//             strokeWidth: widget.strokeWidth,
//             progress: _animation?.value ?? widget.value,
//             isIndeterminate: widget.value == 0.0,
//           ),
//           child: const SizedBox(width: 48, height: 48),
//         );
//       },
//     );
//   }
// }

// class _ProgressPainter extends CustomPainter {
//   final Color color;
//   final double strokeWidth;
//   final double progress;
//   final bool isIndeterminate;

//   _ProgressPainter({
//     required this.color,
//     required this.strokeWidth,
//     required this.progress,
//     required this.isIndeterminate,
//   });

//   @override
//   void paint(Canvas canvas, Size size) {
//     final center = Offset(size.width / 2, size.height / 2);
//     final radius = (math.min(size.width, size.height) / 2) - (strokeWidth / 2);
//     final rect = Rect.fromCircle(center: center, radius: radius);

//     double startAngle;
//     double sweepAngle;

//     if (isIndeterminate) {
//       // Fixed arc length (270 degrees)
//       sweepAngle = math.pi * 1.5;

//       // Smooth continuous rotation (2 rotations per animation cycle)
//       startAngle = 4 * math.pi * progress;
//     } else {
//       startAngle = -math.pi / 2;
//       sweepAngle = progress * 2 * math.pi;
//     }

//     // Gradient for the fading tail
//     final gradient = SweepGradient(
//       startAngle: 0,
//       endAngle: sweepAngle,
//       colors: [color.withOpacity(0.0), color],
//       stops: const [0.0, 0.5], // Shorter fade
//       transform: GradientRotation(startAngle),
//     );

//     final arcPaint =
//         Paint()
//           ..shader = gradient.createShader(rect)
//           ..style = PaintingStyle.stroke
//           ..strokeWidth = strokeWidth
//           ..strokeCap = StrokeCap.butt;

//     canvas.drawArc(rect, startAngle, sweepAngle, false, arcPaint);

//     // Draw rounded head
//     if (sweepAngle > 0) {
//       final headAngle = startAngle + sweepAngle;
//       final headX = center.dx + radius * math.cos(headAngle);
//       final headY = center.dy + radius * math.sin(headAngle);

//       final headPaint =
//           Paint()
//             ..color = color
//             ..style = PaintingStyle.fill;

//       canvas.drawCircle(Offset(headX, headY), strokeWidth / 2, headPaint);
//     }
//   }

//   @override
//   bool shouldRepaint(covariant _ProgressPainter oldDelegate) {
//     return oldDelegate.progress != progress ||
//         oldDelegate.color != color ||
//         oldDelegate.strokeWidth != strokeWidth ||
//         oldDelegate.isIndeterminate != isIndeterminate;
//   }
// }

import 'dart:math' as math;
import 'package:flutter/material.dart';

import '../../../../utils/constants/colors.dart';

/// A custom progress indicator that can be either determinate (showing a specific
/// progress value) or indeterminate (spinning).
///
/// This widget has been optimized for performance and visual correctness,
/// ensuring smooth animations and no rendering artifacts.
class CustomRoundedProgressIndicator extends StatefulWidget {
  final Color color;
  final double strokeWidth;

  /// The progress value. A value of 0.0 indicates an indeterminate state,
  /// causing the indicator to spin. Any value from 0.0 to 1.0 will be
  /// displayed as a determinate progress arc.
  final double value;

  const CustomRoundedProgressIndicator({
    super.key,
    this.color = AppColors.textPrimary,
    this.strokeWidth = 4.0,
    this.value = 0.0,
  }) : assert(
         value >= 0.0 && value <= 1.0,
         "Value must be between 0.0 and 1.0, or 0.0 for indeterminate.",
       );

  @override
  State<CustomRoundedProgressIndicator> createState() =>
      _CustomRoundedProgressIndicatorState();
}

class _CustomRoundedProgressIndicatorState
    extends State<CustomRoundedProgressIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    // OPTIMIZATION: The controller is created once and reused.
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(_controller);

    // If the indicator should be indeterminate at launch, start the animation.
    if (widget.value == 0.0) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(CustomRoundedProgressIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    // OPTIMIZATION: The controller is not disposed. It's simply started or
    // stopped based on whether the indicator is indeterminate.
    if (widget.value == 0.0 && !_controller.isAnimating) {
      _controller.repeat();
    } else if (widget.value != 0.0 && _controller.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final isIndeterminate = widget.value == 0.0;
        return CustomPaint(
          painter: _ProgressPainter(
            color: widget.color,
            strokeWidth: widget.strokeWidth,
            // Use the animation's value for indeterminate, or the widget's
            // value for determinate progress.
            progress: isIndeterminate ? _animation.value : widget.value,
            isIndeterminate: isIndeterminate,
          ),
          // Provides a default size for the indicator.
          child: const SizedBox(width: 48, height: 48),
        );
      },
    );
  }
}

class _ProgressPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double progress;
  final bool isIndeterminate;

  _ProgressPainter({
    required this.color,
    required this.strokeWidth,
    required this.progress,
    required this.isIndeterminate,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (math.min(size.width, size.height) / 2) - (strokeWidth / 2);
    final rect = Rect.fromCircle(center: center, radius: radius);

    if (isIndeterminate) {
      // For the indeterminate indicator, the arc length is a fixed 270 degrees.
      final sweepAngle = math.pi * 1.5;
      // The start angle is animated to create the spinning effect.
      final startAngle = 2 * math.pi * progress * 2;

      // The gradient creates the "fading tail" effect.
      final gradient = SweepGradient(
        startAngle: 0.0,
        endAngle: sweepAngle,
        colors: [color.withOpacity(0.0), color],
        stops: const [0.0, 0.5], // Fades in over the first half of the arc.
        transform: GradientRotation(startAngle),
      );

      // 1. Paint for the gradient trail, with a flat end cap.
      final trailPaint =
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = strokeWidth
            ..strokeCap =
                StrokeCap
                    .butt // Use butt cap to prevent a cap at the transparent end.
            ..isAntiAlias = true
            ..shader = gradient.createShader(rect);

      canvas.drawArc(rect, startAngle, sweepAngle, false, trailPaint);

      // 2. Paint for the solid-colored, rounded head.
      final headPaint =
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = strokeWidth
            ..strokeCap =
                StrokeCap
                    .round // This will create the rounded cap.
            ..isAntiAlias = true
            ..color = color;

      // ARTIFACT FIX: Draw a tiny solid arc at the junction point. This covers
      // any seam artifact between the gradient trail and the solid head.
      final headAngle = startAngle + sweepAngle;
      const epsilon = 0.001; // A very small angle to paint over the seam.
      canvas.drawArc(rect, headAngle - epsilon, epsilon * 2, false, headPaint);
    } else {
      // For the determinate indicator, we draw a simple solid-colored arc.
      final paint =
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = strokeWidth
            ..strokeCap =
                StrokeCap
                    .round // Round caps on both ends look good here.
            ..isAntiAlias = true
            ..color = color;

      final startAngle = -math.pi / 2;
      final sweepAngle = progress * 2 * math.pi;

      if (sweepAngle > 0) {
        canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _ProgressPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.color != color ||
        oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.isIndeterminate != isIndeterminate;
  }
}
