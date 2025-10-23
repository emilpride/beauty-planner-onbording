import 'package:flutter/material.dart';

// Enum to define the shape of the overlay cutout.
enum OverlayShape { oval, rectangle }

// A custom painter to draw the semi-transparent overlay.
class OverlayPainter extends CustomPainter {
  final OverlayShape shape;

  OverlayPainter({required this.shape});

  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..color = Colors.black.withOpacity(
            0.6,
          ) // Semi-transparent black color
          ..style = PaintingStyle.fill;

    // Create a path for the outer rectangle that covers the whole screen.
    final outerPath =
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    // Create a path for the inner cutout shape.
    Path innerPath;
    if (shape == OverlayShape.rectangle) {
      // Define the rectangle for the cutout. Adjust padding as needed.
      final cutoutRect = Rect.fromLTRB(
        size.width * 0.1, // 10% padding from left
        size.height * 0.1, // 10% padding from top
        size.width * 0.9, // 10% padding from right
        size.height *
            0.7, // 30% padding from bottom to leave space for controls
      );
      innerPath =
          Path()..addRRect(
            RRect.fromRectAndRadius(cutoutRect, const Radius.circular(16)),
          );
    } else {
      // Define the oval for the cutout.
      final cutoutRect = Rect.fromCenter(
        center: Offset(size.width / 2, size.height / 2 - 50), // Center the oval
        width: size.width * 0.8, // 80% of screen width
        height: size.height * 0.5, // 50% of screen height
      );
      innerPath = Path()..addOval(cutoutRect);
    }

    // Combine the outer and inner paths to create a "hole" in the overlay.
    // The `evenOdd` fill type ensures that the area where paths overlap is not filled.
    final path = Path.combine(PathOperation.difference, outerPath, innerPath);

    canvas.drawPath(path, paint);

    // Optionally, draw a border around the cutout.
    final borderPaint =
        Paint()
          ..color = Colors.white.withOpacity(0.8)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 4.0;

    // Create a dashed border effect.
    const dashWidth = 10.0;
    const dashSpace = 5.0;
    final pathMetrics = innerPath.computeMetrics();
    for (final metric in pathMetrics) {
      double distance = 0.0;
      while (distance < metric.length) {
        canvas.drawPath(
          metric.extractPath(distance, distance + dashWidth),
          borderPaint,
        );
        distance += dashWidth + dashSpace;
      }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
