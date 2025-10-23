import 'dart:math';
import 'package:flutter/material.dart';
import '../../../features/app/models/progress_category_model.dart';
import '../custom_shapes/containers/rounded_container.dart';

class ProgressChartScreen extends StatefulWidget {
  final List<ProgressCategory> chartData;

  const ProgressChartScreen({super.key, required this.chartData});

  @override
  _ProgressChartScreenState createState() => _ProgressChartScreenState();
}

class _ProgressChartScreenState extends State<ProgressChartScreen> {
  Key _chartKey = UniqueKey();

  void _restartAnimation() {
    setState(() {
      _chartKey = UniqueKey();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        alignment: Alignment.center,
        children: [
          if (widget.chartData.isNotEmpty)
            RoundedContainer(
              width: 30,
              height: 30,
              radius: 100,
              backgroundColor: Colors.cyan.withOpacity(0.35),
            ),
          MultiRingProgressChart(
            key: _chartKey,
            categories: widget.chartData,
            size: 260,
            ringThickness: 15,
          ),
        ],
      ),
    );
  }
}

class MultiRingProgressChart extends StatefulWidget {
  final List<ProgressCategory> categories;
  final double size;
  final double ringThickness;
  final double ringGap;
  final Duration animationDuration;

  const MultiRingProgressChart({
    super.key,
    required this.categories,
    this.size = 200.0,
    this.ringThickness = 20.0,
    this.ringGap = 10.0,
    this.animationDuration = const Duration(seconds: 2),
  });

  @override
  State<MultiRingProgressChart> createState() => _MultiRingProgressChartState();
}

class _MultiRingProgressChartState extends State<MultiRingProgressChart>
    with TickerProviderStateMixin {
  List<ProgressCategory> _processedCategories = [];
  List<AnimationController> _animationControllers = [];
  List<Animation<double>> _animations = [];
  List<double> _previousValues = [];
  double _currentSize = 60;

  @override
  void initState() {
    super.initState();
    _updateCategories();
  }

  @override
  void didUpdateWidget(MultiRingProgressChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.categories != widget.categories) {
      _updateCategories();
    }
  }

  void _updateCategories() {
    List<ProgressCategory> newProcessedCategories = _processCategories(
      widget.categories,
    );

    // Calculate new size based on number of categories
    _currentSize = _calculateSize(widget.categories.length);

    // Dispose old controllers
    for (var controller in _animationControllers) {
      controller.dispose();
    }

    _animationControllers.clear();
    _animations.clear();

    // Create new controllers and animations
    for (int i = 0; i < newProcessedCategories.length; i++) {
      final controller = AnimationController(
        duration: widget.animationDuration,
        vsync: this,
      );

      double previousValue = 0.0;
      if (i < _previousValues.length) {
        previousValue = _previousValues[i];
      }

      final animation = Tween<double>(
        begin: previousValue,
        end: newProcessedCategories[i].percentage,
      ).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeInOutCubic),
      );

      _animationControllers.add(controller);
      _animations.add(animation);

      // Only animate if value actually changed
      if (previousValue != newProcessedCategories[i].percentage) {
        controller.forward();
      } else {
        controller.value = 1.0; // Set to end value immediately
      }
    }

    // Update stored values
    _previousValues = newProcessedCategories.map((c) => c.percentage).toList();
    _processedCategories = newProcessedCategories;

    setState(() {});
  }

  double _calculateSize(int categoryCount) {
    switch (categoryCount) {
      case 1:
        return 60;
      case 2:
        return 110;
      case 3:
        return 160;
      case 4:
        return 210;
      case 5:
        return 260;
      default:
        return 60;
    }
  }

  @override
  void dispose() {
    for (var controller in _animationControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_processedCategories.isEmpty) {
      return Center(
        child: Text(
          'No Tasks Today!',
          style: TextStyle(color: Colors.grey[600]),
        ),
      );
    }

    return AnimatedBuilder(
      animation: Listenable.merge(_animationControllers),
      builder: (context, child) {
        return CustomPaint(
          size: Size(_currentSize, _currentSize),
          painter: _MultiRingPainter(
            categories: _processedCategories,
            animatedValues: _animations.map((a) => a.value).toList(),
            ringThickness: widget.ringThickness,
            ringGap: widget.ringGap,
          ),
        );
      },
    );
  }

  List<ProgressCategory> _processCategories(List<ProgressCategory> input) {
    if (input.isEmpty) return [];

    if (input.length <= 5) {
      // Reverse to make first item innermost
      return input.reversed.toList();
    }

    // First item goes to innermost ring
    ProgressCategory firstItem = input[0];

    // Next 3 items for rings 2, 3, 4
    List<ProgressCategory> middleItems = input.skip(1).take(3).toList();

    // Average the rest (items 5 and beyond) for the outermost ring
    List<ProgressCategory> remaining = input.skip(4).toList();
    double avgPercentage =
        remaining.map((c) => c.percentage).reduce((a, b) => a + b) /
        remaining.length;
    Color avgColor = Colors.teal;

    // Build result: [average ring (outermost), middle items reversed, first item (innermost)]
    List<ProgressCategory> result = [
      ProgressCategory(
        percentage: avgPercentage,
        color: avgColor,
      ), // outermost (5th ring)
      ...middleItems.reversed,
      firstItem, // innermost (1st ring)
    ];

    return result;
  }
}

class _MultiRingPainter extends CustomPainter {
  final List<ProgressCategory> categories;
  final List<double> animatedValues;
  final double ringThickness;
  final double ringGap;

  _MultiRingPainter({
    required this.categories,
    required this.animatedValues,
    this.ringThickness = 20.0,
    this.ringGap = 10.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final startAngle = -pi / 2;
    final maxRadius = size.width / 2 - ringThickness / 2;

    for (int i = 0; i < categories.length; i++) {
      final category = categories[i];
      final currentRadius = maxRadius - i * (ringThickness + ringGap);
      final animatedValue =
          i < animatedValues.length ? animatedValues[i] : category.percentage;

      if (currentRadius <= 0) continue;

      final backgroundPaint =
          Paint()
            ..color = category.color.withOpacity(0.15)
            ..style = PaintingStyle.stroke
            ..strokeWidth = ringThickness;

      final progressPaint =
          Paint()
            ..color = category.color
            ..style = PaintingStyle.stroke
            ..strokeWidth = ringThickness
            ..strokeCap = StrokeCap.round;

      // Draw background circle
      canvas.drawCircle(center, currentRadius, backgroundPaint);

      // Draw animated progress arc
      final sweepAngle = animatedValue * 2 * pi;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: currentRadius),
        startAngle,
        sweepAngle,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_MultiRingPainter oldDelegate) {
    return oldDelegate.animatedValues != animatedValues;
  }
}
