import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';

class AnimatedScoreCircle extends StatefulWidget {
  final double score;
  final double maxScore;

  const AnimatedScoreCircle({
    super.key,
    required this.score,
    required this.maxScore,
  });

  @override
  _AnimatedScoreCircleState createState() => _AnimatedScoreCircleState();
}

class _AnimatedScoreCircleState extends State<AnimatedScoreCircle>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progressAnimation;
  late Animation<double> _numberAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    // Animate the progress from 0 to the target score percentage
    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: widget.score / widget.maxScore,
    ).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutCubic),
    );

    // Animate the number from 0 to the target score
    _numberAnimation = Tween<double>(begin: 0.0, end: widget.score).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutCubic),
    );

    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant AnimatedScoreCircle oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If the score changes, restart the animation
    if (widget.score != oldWidget.score) {
      _progressAnimation = Tween<double>(
        begin: oldWidget.score / oldWidget.maxScore,
        end: widget.score / widget.maxScore,
      ).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOutCubic),
      );

      _numberAnimation = Tween<double>(
        begin: oldWidget.score,
        end: widget.score,
      ).animate(
        CurvedAnimation(parent: _controller, curve: Curves.easeInOutCubic),
      );

      _controller.forward(from: 0.0);
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
      animation: _controller,
      builder: (context, child) {
        return SizedBox(
          width: 65, // Increased size for better visuals
          height: 65,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // The custom painter for the circle
              RoundedContainer(
                radius: 100,
                margin: const EdgeInsets.all(2),
                backgroundColor: Colors.white,
                child: RoundedContainer(
                  radius: 100,
                  backgroundColor: _getScoreColor(
                    widget.score,
                  ).withOpacity(0.2),
                ),
              ),
              CustomPaint(
                size: const Size(65, 65),
                painter: _ScoreCirclePainter(
                  progress: _progressAnimation.value,
                  progressColor: _getScoreColor(widget.score),
                  backgroundColor: AppColors.grey,
                  // Define different widths for progress and background
                  progressWidth: 6.5,
                  backgroundWidth: 4.5,
                ),
              ),
              // The animated text in the center
              RichText(
                text: TextSpan(
                  style: DefaultTextStyle.of(
                    context,
                  ).style.copyWith(color: Colors.white),
                  children: <TextSpan>[
                    TextSpan(
                      text: _numberAnimation.value.toStringAsFixed(1),
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: _getScoreColor(widget.score),
                      ),
                    ),
                    TextSpan(
                      text: '/${widget.maxScore.toInt()}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: _getScoreColor(widget.score).withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Color _getScoreColor(double score) {
    if (score < 4) return const Color(0xFFFF7D7E);
    if (score < 6) return const Color(0xFFFFA64D);
    if (score < 8) return const Color(0xFF84DE54);
    return const Color(0xFF33C75A);
  }
}

// Custom Painter to draw the trail and the rounded progress arc
class _ScoreCirclePainter extends CustomPainter {
  final double progress;
  final Color progressColor;
  final Color backgroundColor;
  final double progressWidth;
  final double backgroundWidth;

  _ScoreCirclePainter({
    required this.progress,
    required this.progressColor,
    required this.backgroundColor,
    required this.progressWidth,
    required this.backgroundWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width / 2, size.height / 2);

    // Paint for the background trail
    final backgroundPaint =
        Paint()
          ..color = backgroundColor
          ..strokeWidth = backgroundWidth
          ..style = PaintingStyle.stroke;

    // Draw the full circle for the background
    canvas.drawCircle(center, radius, backgroundPaint);

    // Paint for the progress arc
    final progressPaint =
        Paint()
          ..color = progressColor
          ..strokeWidth = progressWidth
          ..style = PaintingStyle.stroke
          ..strokeCap = StrokeCap.round; // This creates the rounded edges

    // Calculate the angle for the arc
    final double startAngle = -pi / 2; // Start from the top
    final double sweepAngle = 2 * pi * progress;

    // Draw the progress arc
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    // Repaint whenever the progress changes
    return true;
  }
}
