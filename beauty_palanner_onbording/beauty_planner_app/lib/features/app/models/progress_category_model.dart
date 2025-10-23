import 'dart:ui';

class ProgressCategory {
  final double percentage; // A value between 0.0 and 1.0
  final Color color;
  final String? name;
  final String? illustration;

  ProgressCategory({
    required this.percentage,
    required this.color,
    this.name,
    this.illustration,
  });
}
