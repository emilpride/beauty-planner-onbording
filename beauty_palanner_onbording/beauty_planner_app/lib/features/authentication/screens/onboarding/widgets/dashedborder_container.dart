import 'dart:math';

import 'package:flutter/material.dart';

class DashedBorderContainer extends StatelessWidget {
  final Widget child;
  final double strokeWidth;
  final double dashLength;
  final double dashSpace;
  final Color color;
  final BorderRadiusGeometry borderRadius;

  const DashedBorderContainer({
    super.key,
    required this.child,
    this.strokeWidth = 2.0,
    this.dashLength = 8.0,
    this.dashSpace = 5.0,
    this.color = Colors.purple, // A purple shade similar to the image
    this.borderRadius = const BorderRadius.all(Radius.circular(20.0)),
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _DashedBorderPainter(
        strokeWidth: strokeWidth,
        dashLength: dashLength,
        dashSpace: dashSpace,
        color: color,
        borderRadius: borderRadius,
      ),
      child: Padding(
        padding: EdgeInsets.all(
          strokeWidth + 5,
        ), // Add some padding so content doesn't touch the border
        child: child,
      ),
    );
  }
}

class _DashedBorderPainter extends CustomPainter {
  final double strokeWidth;
  final double dashLength;
  final double dashSpace;
  final Color color;
  final BorderRadiusGeometry borderRadius;

  _DashedBorderPainter({
    required this.strokeWidth,
    required this.dashLength,
    required this.dashSpace,
    required this.color,
    required this.borderRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint =
        Paint()
          ..color = color
          ..strokeWidth = strokeWidth
          ..style = PaintingStyle.stroke;

    final RRect outerRRect = borderRadius
        .resolve(TextDirection.ltr)
        .toRRect(Offset.zero & size);

    Path path = Path();
    double currentLength = 0;
    double totalLength =
        2 * (size.width + size.height); // Approximate perimeter

    while (currentLength < totalLength) {
      path.addRRect(outerRRect);
      canvas.drawPath(
        Path()
          ..addRRect(outerRRect)
          ..shift(
            Offset(currentLength, 0),
          ), // Shift to draw dashes along the path
        paint,
      );
      currentLength += dashLength + dashSpace;
    }

    // A more robust way to draw dashed borders along a rounded rectangle:
    // We will draw segment by segment to ensure proper dashing along the curves.
    final double radiusX = outerRRect.tlRadiusX;
    final double radiusY = outerRRect.tlRadiusY;

    final double top = outerRRect.top;
    final double left = outerRRect.left;
    final double right = outerRRect.right;
    final double bottom = outerRRect.bottom;

    // Helper function to draw a dashed line segment
    void drawDashedLine(Offset p1, Offset p2) {
      final double distance = (p2 - p1).distance;
      double current = 0;
      while (current < distance) {
        final double startFraction = current / distance;
        final double endFraction =
            (current + dashLength).clamp(0.0, distance) / distance;
        canvas.drawLine(
          Offset.lerp(p1, p2, startFraction)!,
          Offset.lerp(p1, p2, endFraction)!,
          paint,
        );
        current += dashLength + dashSpace;
      }
    }

    // Top horizontal line
    drawDashedLine(Offset(left + radiusX, top), Offset(right - radiusX, top));

    // Right vertical line
    drawDashedLine(
      Offset(right, top + radiusY),
      Offset(right, bottom - radiusY),
    );

    // Bottom horizontal line
    drawDashedLine(
      Offset(right - radiusX, bottom),
      Offset(left + radiusX, bottom),
    );

    // Left vertical line
    drawDashedLine(Offset(left, bottom - radiusY), Offset(left, top + radiusY));

    // Arcs for corners (simplified approach for dashing arcs)
    // For more precise dashing on arcs, you'd need to calculate arc lengths
    // and distribute dashes along them, which is more complex.
    // For this example, we'll draw solid segments for the arcs,
    // or you could skip them if the straight lines are enough for your aesthetic.

    // Top-right corner
    canvas.drawArc(
      Rect.fromLTWH(right - 2 * radiusX, top, 2 * radiusX, 2 * radiusY),
      -0.5 * pi, // Start angle (from the right)
      -0.5 * pi, // Sweep angle (counter-clockwise)
      false,
      paint,
    );

    // Bottom-right corner
    canvas.drawArc(
      Rect.fromLTWH(
        right - 2 * radiusX,
        bottom - 2 * radiusY,
        2 * radiusX,
        2 * radiusY,
      ),
      0.0, // Start angle (from the right)
      -0.5 * pi, // Sweep angle (counter-clockwise)
      false,
      paint,
    );

    // Bottom-left corner
    canvas.drawArc(
      Rect.fromLTWH(left, bottom - 2 * radiusY, 2 * radiusX, 2 * radiusY),
      0.5 * pi, // Start angle (from the left)
      -0.5 * pi, // Sweep angle (counter-clockwise)
      false,
      paint,
    );

    // Top-left corner
    canvas.drawArc(
      Rect.fromLTWH(left, top, 2 * radiusX, 2 * radiusY),
      pi, // Start angle (from the left)
      -0.5 * pi, // Sweep angle (counter-clockwise)
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _DashedBorderPainter oldDelegate) {
    return oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.dashLength != dashLength ||
        oldDelegate.dashSpace != dashSpace ||
        oldDelegate.color != color ||
        oldDelegate.borderRadius != borderRadius;
  }
}
