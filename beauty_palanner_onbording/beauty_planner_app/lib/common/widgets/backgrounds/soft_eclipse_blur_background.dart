import 'dart:ui' as ui;

import 'package:flutter/material.dart';

class SoftEllipsePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Define the colors for the gradients
    final Color color2Start = Colors.pink.shade100.withOpacity(0.7);
    final Color color2End = Colors.purple.shade100.withOpacity(0.7);
    final Color color1Start = Colors.blue.shade100.withOpacity(0.7);
    final Color color1End = Colors.cyan.shade100.withOpacity(0.7);

    // Define the blur radius for the soft effect
    const double blurRadius = 200.0; // Adjust for more or less blur

    // Paint for the first ellipse (left side)
    final Paint paint1 =
        Paint()
          ..shader = ui.Gradient.radial(
            Offset(
              size.width * 0.25,
              size.height * 0.5,
            ), // Center of the radial gradient for left ellipse
            size.width * 0.4, // Radius of the radial gradient
            [color1Start, color1End], // Colors for the gradient
            [0.0, 1.0], // Stops for the gradient colors
          )
          ..maskFilter = const MaskFilter.blur(
            BlurStyle.normal,
            blurRadius,
          ); // Apply blur

    // Paint for the second ellipse (right side)
    final Paint paint2 =
        Paint()
          ..shader = ui.Gradient.radial(
            Offset(
              size.width * 0.75,
              size.height * 0.5,
            ), // Center of the radial gradient for right ellipse
            size.width * 0.4, // Radius of the radial gradient
            [color2Start, color2End], // Colors for the gradient
            [0.0, 1.0], // Stops for the gradient colors
          )
          ..maskFilter = const MaskFilter.blur(
            BlurStyle.normal,
            blurRadius,
          ); // Apply blur

    // Define the bounds for the ellipses
    // These values are adjusted to prevent overlapping
    final Rect rect1 = Rect.fromCenter(
      center: Offset(
        size.width * 0.25,
        size.height * 0.5,
      ), // Position of the first ellipse
      width: size.width * 0.5, // Width of the first ellipse
      height: size.height * 0.9, // Height of the first ellipse
    );

    final Rect rect2 = Rect.fromCenter(
      center: Offset(
        size.width * 0.75,
        size.height * 0.5,
      ), // Position of the second ellipse
      width: size.width * 0.5, // Width of the second ellipse
      height: size.height * 0.9, // Height of the second ellipse
    );

    // Draw the ellipses
    canvas.drawOval(rect1, paint1);
    canvas.drawOval(rect2, paint2);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    // Return false if the painter's configuration will never change,
    // otherwise return true to repaint when needed.
    return false;
  }
}
