// Card for the final BMS score
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import '../update_information.dart';

class BmsCard extends StatelessWidget {
  final double bmsScore;
  final VoidCallback? onInfoPressed; // Add this parameter

  const BmsCard({super.key, required this.bmsScore, this.onInfoPressed});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shadowColor: AppColors.light,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      margin: const EdgeInsets.all(0),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Text(
                      'Your BMS   is:',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Positioned(
                      right: 24,
                      top: -5,
                      child: GestureDetector(
                        behavior: HitTestBehavior.translucent,
                        onTap: () {
                          // Default action if no callback is provided
                          Get.defaultDialog(
                            titlePadding: const EdgeInsets.only(
                              top: 16,
                              left: 12,
                              right: 12,
                            ),
                            contentPadding: const EdgeInsets.all(12),
                            title: 'Beauty Mirror Score (BMS)',
                            titleStyle: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            backgroundColor: Colors.white,
                            middleText:
                                'BMS is calculated by averaging scores from four categories— BMI, Skin, Hair, Fitness, and Mind—each rated on a scale from 0 to 10.',
                            middleTextStyle: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.black,
                            ),
                          );
                        },
                        child: SvgPicture.asset(
                          AppImages.info,
                          color: AppColors.primary,
                          width: 14,
                          height: 14,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  _getBmsCategory(bmsScore),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              _getBmsFeedback(bmsScore),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                BmsGaugeHorizontal(
                  bms: bmsScore,
                  color: _getBmsColor(bmsScore),
                ),
              ],
            ),

            const SizedBox(height: AppSizes.xl),
            SizedBox(
              height: 50,
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Get.to(() => const UpdateInformation()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  minimumSize: const Size(double.infinity, 45),
                  maximumSize: const Size(double.infinity, 45),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Update',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getBmsColor(double score) {
    if (score >= 8) return Colors.green;
    if (score >= 6) return Colors.yellow;
    if (score >= 4) return Colors.orange;
    return Colors.red;
  }

  String _getBmsCategory(double score) {
    if (score >= 8) return 'Radiant';
    if (score >= 6) return 'Balanced';
    if (score >= 4) return 'Getting There';
    return 'Needs Attention';
  }

  String _getBmsFeedback(double score) {
    if (score >= 8) return 'Excellent, you\'re shining!';
    if (score >= 6) return 'Solid routine, keep it up.';
    if (score >= 4) return 'On your way, room to grow.';
    return 'Basic care needed.';
  }
}

class BmsGaugeHorizontal extends StatefulWidget {
  final double bms;
  final Color color;

  const BmsGaugeHorizontal({required this.bms, required this.color, super.key});

  @override
  BmsGaugeHorizontalState createState() => BmsGaugeHorizontalState();
}

class BmsGaugeHorizontalState extends State<BmsGaugeHorizontal>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _animation = Tween<double>(
      begin: 0.0,
      end: widget.bms,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 256, // Changed height to width
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final double value = (_animation.value / 10).clamp(0, 1);
          return Column(
            // Changed Row to Column
            children: [
              Text(
                _animation.value.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.bold,
                  color: widget.color,
                ),
              ),
              const SizedBox(height: 12), // Changed width to height
              CustomPaint(
                painter: _BmsGaugePainterHorizontal(value),
                size: const Size(256, 20), // Swapped width and height
              ),
            ],
          );
        },
      ),
    );
  }
}

class _BmsGaugePainterHorizontal extends CustomPainter {
  final double value; // 0.0 to 1.0

  _BmsGaugePainterHorizontal(this.value);

  @override
  void paint(Canvas canvas, Size size) {
    final Paint backgroundPaint =
        Paint()
          ..color = Colors.grey[200]!
          ..style = PaintingStyle.fill;

    final Paint foregroundPaint =
        Paint()
          ..shader = const LinearGradient(
            colors: [
              Color(0xFFFF7D7E),
              Color(0xFFFFA64D),
              Color(0xFF84DE54),
              Color(0xFF33C75A),
            ],
            begin: Alignment.centerLeft, // Changed to centerLeft
            end: Alignment.centerRight, // Changed to centerRight
          ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final Paint thumbPaint =
        Paint()
          ..color = Colors.grey[350]!
          ..style = PaintingStyle.fill;
    final Paint thumbBorderPaint =
        Paint()
          ..color = Colors.white
          ..strokeWidth = 2
          ..style = PaintingStyle.stroke;

    RRect backgroundRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      const Radius.circular(10),
    );

    canvas.drawRRect(backgroundRRect, backgroundPaint);

    // This section now draws the colored foreground
    RRect foregroundRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        0,
        0,
        size.width, //* value, // Adjusted to fill horizontally based on value
        size.height,
      ),
      const Radius.circular(10),
    );

    canvas.drawRRect(foregroundRRect, foregroundPaint);

    final thumbX = size.width * value; // Changed thumbY to thumbX
    canvas.drawCircle(
      Offset(thumbX, size.height / 2),
      16,
      thumbPaint,
    ); // Adjusted thumb position
    canvas.drawCircle(
      Offset(thumbX, size.height / 2),
      16,
      thumbBorderPaint,
    ); // Adjusted thumb position
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
