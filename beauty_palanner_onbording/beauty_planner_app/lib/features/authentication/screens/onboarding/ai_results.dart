import 'dart:developer';
import 'dart:io';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../personalization/screens/profile/resources_and_citations.dart';
import '../../controllers/onboarding/onboarding_controller.dart';
import 'widgets/animated_score_circle.dart';
import 'widgets/onboarding_button.dart';

class ConditionAnalysisScreen extends StatelessWidget {
  const ConditionAnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = OnboardingController.instance;
    return Scaffold(
      extendBody: true,
      appBar: BMAppbar(
        title: 'Current Condition Analysis',
        onBackPressed: () {
          if (controller.currentPage.value > 0) {
            if (Platform.isAndroid) {
              controller.currentPage.value--;
            } else if (Platform.isIOS) {
              controller.currentPage.value -= 3;
            }
          } else {
            Get.back(); // Go back to the previous screen if on the first page
          }
        },
      ),
      backgroundColor: AppColors.light,
      body: Container(
        color: AppColors.light,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // const SizedBox(height: 24),
            _AnimatedListItem(
              index: -1, // Animate in first
              child: Container(
                margin: const EdgeInsets.only(bottom: 16, left: 4, right: 4),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primary.withOpacity(0.1),
                      AppColors.primary.withOpacity(0.05),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.primary.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.verified_outlined,
                      color: AppColors.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Based on medical guidelines from WHO, AAD, and NIMH',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Get.to(() => const ResourcesCitationsScreen());
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Row(
                        children: [
                          Text(
                            'Sources',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                          SizedBox(width: 4),
                          Icon(
                            Icons.open_in_new_rounded,
                            size: 14,
                            color: AppColors.primary,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // const SizedBox(height: 24),
            _AnimatedListItem(
              index: 0,
              child: _BmiWidget(
                bmi:
                    Platform.isIOS
                        ? controller.wellnessModel.value.bmi
                        : controller.aiAnalysisModel.value.bmi,
                bmiScore:
                    Platform.isIOS
                        ? controller.wellnessModel.value.bmiScore
                        : controller.aiAnalysisModel.value.bmiScore,
                onInfoPressed: () {
                  _showCitationBottomSheet(
                    context,
                    'Body Mass Index (BMI)',
                    'Our Body Mass Index (BMI) calculation is based on the standard formula and classifications provided by the World Health Organization (WHO).',
                    "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations",
                  );
                },
              ),
            ),
            if (Platform.isAndroid) ...[
              const SizedBox(height: 24),
              _AnimatedListItem(
                index: 1,
                child: _ConditionCard(
                  title: 'Skin Condition',
                  score: controller.aiAnalysisModel.value.skinConditionScore,
                  explanation:
                      controller.aiAnalysisModel.value.skinConditionExplanation,
                  color: _getScoreColor(
                    controller.aiAnalysisModel.value.skinConditionScore,
                  ),
                  maxScore: 10,
                  onInfoPressed: () {
                    _showCitationBottomSheet(
                      context,
                      'Skin Condition Citation',
                      'Our skin health recommendations are based on general guidelines from the American Academy of Dermatology (AAD).',
                      "https://www.aad.org/public/everyday-care/skin-care-basics",
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              _AnimatedListItem(
                index: 2,
                child: _ConditionCard(
                  title: 'Hair Condition',
                  score: controller.aiAnalysisModel.value.hairConditionScore,
                  explanation:
                      controller.aiAnalysisModel.value.hairConditionExplanation,
                  color: _getScoreColor(
                    controller.aiAnalysisModel.value.hairConditionScore,
                  ),
                  maxScore: 10,
                  onInfoPressed: () {
                    _showCitationBottomSheet(
                      context,
                      'Hair Condition Citation',
                      'Our hair care advice is aligned with fundamental tips for healthy hair as recommended by the American Academy of Dermatology (AAD).',
                      "https://www.aad.org/public/everyday-care/hair-scalp-care/hair/healthy-hair-tips",
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              _AnimatedListItem(
                index: 3,
                child: _ConditionCard(
                  title: 'Physical Condition',
                  score:
                      controller.aiAnalysisModel.value.physicalConditionScore,
                  explanation:
                      controller
                          .aiAnalysisModel
                          .value
                          .physicalConditionExplanation,
                  color: _getScoreColor(
                    controller.aiAnalysisModel.value.physicalConditionScore,
                  ),
                  maxScore: 10,
                  onInfoPressed: () {
                    _showCitationBottomSheet(
                      context,
                      'Physical Condition Citation',
                      'Regular physical activity is essential for maintaining overall health and well-being. The World Health Organization (WHO) provides guidelines on the recommended levels of physical activity for different age groups.',
                      "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              _AnimatedListItem(
                index: 4,
                child: _ConditionCard(
                  title: 'Mental Condition',
                  score: controller.aiAnalysisModel.value.mentalConditionScore,
                  explanation:
                      controller
                          .aiAnalysisModel
                          .value
                          .mentalConditionExplanation,
                  color: _getScoreColor(
                    controller.aiAnalysisModel.value.mentalConditionScore,
                  ),
                  maxScore: 10,
                  onInfoPressed: () {
                    _showCitationBottomSheet(
                      context,
                      'Mental Condition Citation',
                      'Our mindfulness and stress management techniques are based on principles supported by the National Institute of Mental Health (NIMH).',
                      "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
                    );
                  },
                ),
              ),
            ],
            if (Platform.isIOS) ...[
              const SizedBox(height: 24),
              _AnimatedListItem(
                index: 1,
                child: BulletedListCard(
                  title: 'Negative Factors',
                  items: controller.wellnessModel.value.negativeFactors,
                  onInfoPressed: () {
                    _showCitationBottomSheet(
                      context,
                      'Negative Factors Citation',
                      'Our health recommendations are based on guidelines from the World Health Organization (WHO).',
                      "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations",
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              _AnimatedListItem(
                index: 2,
                child: BulletedListCard(
                  title: 'Positive Factors',
                  titleColor: Colors.green,
                  items: controller.wellnessModel.value.positiveFactors,
                  onInfoPressed: () {
                    _showCitationBottomSheet(
                      context,
                      'Positive Factors Citation',
                      'Our health recommendations are based on guidelines from the World Health Organization (WHO).',
                      "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations",
                    );
                  },
                ),
              ),
            ],
            const SizedBox(height: 24),
            _AnimatedListItem(
              index: Platform.isIOS ? 3 : 5,
              child: _BmsCard(
                bmsScore:
                    Platform.isIOS
                        ? controller.wellnessModel.value.bms
                        : controller.aiAnalysisModel.value.bmsScore,
                onInfoPressed: () {
                  _showCitationBottomSheet(
                    context,
                    'Beauty Mirror Score (BMS)',
                    'BMS is calculated by averaging scores from four categories— BMI, Skin, Hair, Fitness, and Mind—each rated on a scale from 0 to 10.',
                    "https://beautymirror.app/bms",
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Color _getScoreColor(double score) {
    if (score < 4) return Colors.red;
    if (score < 7) return Colors.orange;
    return Colors.green;
  }
}

// --- CUSTOM WIDGETS ---

// A simple animation wrapper to fade and slide in list items.
class _AnimatedListItem extends StatefulWidget {
  final int index;
  final Widget child;

  const _AnimatedListItem({required this.index, required this.child});

  @override
  __AnimatedListItemState createState() => __AnimatedListItemState();
}

class __AnimatedListItemState extends State<_AnimatedListItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _offsetAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _offsetAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));

    // Stagger the animation based on the item index
    Future.delayed(Duration(milliseconds: widget.index * 100), () {
      if (mounted) {
        _controller.forward();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(position: _offsetAnimation, child: widget.child),
    );
  }
}

// BMI Widget with custom gauge and illustration
class _BmiWidget extends StatelessWidget {
  final double bmi;
  final double bmiScore;
  final VoidCallback? onInfoPressed;

  const _BmiWidget({
    required this.bmi,
    required this.bmiScore,
    this.onInfoPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Your BMI is:',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (onInfoPressed != null) ...[
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: onInfoPressed,
                            child: Icon(
                              Iconsax.info_circle,
                              size: 20,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
                Flexible(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AnimatedScoreCircle(score: bmiScore, maxScore: 10),
                      const SizedBox(height: 8),

                      Text(
                        _getBmiCategory(bmi),
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              _getBmiExplanation(bmi),
              style: const TextStyle(
                fontSize: 15,
                color: Colors.black,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _BmiGauge(bmi: bmi, color: _getBmiColor(bmi)),
                const SizedBox(width: 16),
                Image.asset(_getBmiImage(bmi), height: 256),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getBmiImage(double bmi) {
    final controller = Get.find<OnboardingController>();
    int gender = controller.userModel.value.gender;

    switch (bmi) {
      case < 16.0:
        return gender == 1 ? AppImages.bmiMale1 : AppImages.bmiFemale1;
      case < 18.5:
        return gender == 1 ? AppImages.bmiMale2 : AppImages.bmiFemale2;
      case < 25.0:
        return gender == 1 ? AppImages.bmiMale3 : AppImages.bmiFemale3;
      case < 30.0:
        return gender == 1 ? AppImages.bmiMale4 : AppImages.bmiFemale4;
      case <= 40.0 || >= 40:
        return gender == 1 ? AppImages.bmiMale5 : AppImages.bmiFemale5;
      default:
        return gender == 1 ? AppImages.bmiMale1 : AppImages.bmiFemale1;
    }
  }

  String _getBmiCategory(double bmi) {
    if (bmi < 16) return 'Severely Underweight';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obesity (Class I)';
    if (bmi < 40) return 'Obesity (Class II)';
    if (bmi >= 40) return 'Obesity (Class III)';
    return '';
  }

  String _getBmiExplanation(double bmi) {
    if (bmi < 16) {
      return 'Extremely low body mass. May cause fatigue, low immunity.';
    }
    if (bmi < 18.5) return 'Below healthy weight. Risk of nutrient deficiency.';
    if (bmi < 25) return 'Ideal weight range. Lowest risk of health issues.';
    if (bmi < 30) {
      return 'Slightly above normal. Risk of heart and metabolic issues.';
    }
    if (bmi < 35) {
      return 'Increased risk of diabetes, high blood pressure, etc.';
    }
    if (bmi < 40) return 'High risk of serious health conditions.';
    if (bmi >= 40) {
      return 'Very high risk. Medical advice strongly recommended.';
    }
    return '';
  }

  Color _getBmiColor(double bmi) {
    if (bmi < 16) return Colors.lightBlue;
    if (bmi < 18.5) return Colors.blue;
    if (bmi < 25) return Colors.green;
    if (bmi < 30) return Colors.yellow;
    if (bmi < 35) return Colors.orange;
    if (bmi < 40) return Colors.red;
    return Colors.red;
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

// The vertical gauge/slider for BMI
class _BmiGauge extends StatefulWidget {
  final double bmi;
  final Color color;

  const _BmiGauge({required this.bmi, required this.color});

  @override
  __BmiGaugeState createState() => __BmiGaugeState();
}

class __BmiGaugeState extends State<_BmiGauge>
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
      end: widget.bmi,
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
      height: 256,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          // Normalize BMI to a 0-1 scale for the slider
          final double value = (_animation.value - 15).clamp(0, 30) / (45 - 15);
          return Row(
            children: [
              CustomPaint(
                painter: _BmiGaugePainter(value),
                size: const Size(20, 256),
              ),
              const SizedBox(width: 12),
              Text(
                _animation.value.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.bold,
                  color: widget.color,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _BmiGaugePainter extends CustomPainter {
  final double value; // 0.0 to 1.0

  _BmiGaugePainter(this.value);

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
              Color(0xFF43B7FF),
              Color(0xFF33C75A),
              Color(0xFFFBF447),
              Color(0xFFFFA64D),
              Color(0xFFFF9463),
              Color(0xFFFF7D7E),
            ],
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
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

    RRect foregroundRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        0,
        0, //size.height * (1 - value),
        size.width,
        size.height, //* value,
      ),
      const Radius.circular(10),
    );

    canvas.drawRRect(foregroundRRect, foregroundPaint);

    final thumbY = size.height * (1 - value);
    canvas.drawCircle(Offset(size.width / 2, thumbY), 16, thumbPaint);
    canvas.drawCircle(Offset(size.width / 2, thumbY), 16, thumbBorderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}

// Add this method to your ConditionAnalysisScreen class
void _showCitationBottomSheet(
  BuildContext context,
  String title,
  String citation,
  String url,
) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: false,
    backgroundColor: Colors.transparent,
    builder:
        (context) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey[500],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              Text(
                '$title - Sources',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),

              Text(
                citation,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.black87,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 20),

              // Learn More Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _launchUrl(url),
                  icon: const Icon(Icons.open_in_new_rounded, size: 18),
                  label: const Text('Learn More'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
  );
}

// URL launcher method
Future<void> _launchUrl(String url) async {
  if (await canLaunchUrl(Uri.parse(url))) {
    await launchUrl(Uri.parse(url));
  }
}

// Updated _ConditionCard with info button
class _ConditionCard extends StatelessWidget {
  final String title;
  final double score;
  final double maxScore;
  final String explanation;
  final Color color;
  final VoidCallback? onInfoPressed;

  const _ConditionCard({
    required this.title,
    required this.score,
    required this.explanation,
    required this.color,
    required this.maxScore,
    this.onInfoPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (onInfoPressed != null) ...[
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: onInfoPressed,
                          child: Icon(
                            Iconsax.info_circle,
                            size: 20,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                AnimatedScoreCircle(score: score, maxScore: maxScore),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              explanation,
              style: const TextStyle(
                fontSize: 15,
                color: Colors.black,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Card for the final BMS score
class _BmsCard extends StatelessWidget {
  final double bmsScore;
  final VoidCallback? onInfoPressed; // Add this parameter

  const _BmsCard({required this.bmsScore, this.onInfoPressed});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: Colors.grey.withOpacity(0.2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Beauty Mirror Score (BMS)',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (onInfoPressed != null) ...[
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: onInfoPressed,
                    child: Icon(
                      Iconsax.info_circle,
                      size: 20,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'BMS is calculated by averaging scores from four categories— BMI, Skin, Hair, Fitness, and Mind—each rated on a scale from 0 to 10.',
              textAlign: TextAlign.start,
              style: TextStyle(
                fontSize: 15,
                color: Colors.black,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Your BMS is:',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
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
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.info_outline_rounded,
                    size: 18,
                    color: Colors.grey[700],
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'This is not medical advice. Consult healthcare professionals for personalized guidance.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[700],
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSizes.md),

            OnboardingButton(
              text: 'To The Activities',
              ontap: () {
                log(
                  OnboardingController
                      .instance
                      .aiAnalysisModel
                      .value
                      .recommendedActivities
                      .toString(),
                );
              },
              condition: true,
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

class BulletedListCard extends StatelessWidget {
  final String title;
  final List<String> items;
  final Color titleColor;
  final Color bulletColor;
  final VoidCallback? onInfoPressed;

  const BulletedListCard({
    super.key,
    required this.title,
    required this.items,
    this.titleColor = Colors.red,
    this.bulletColor = Colors.black,
    this.onInfoPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: Colors.grey.withOpacity(0.2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: titleColor,
                  ),
                ),
                if (onInfoPressed != null) ...[
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: onInfoPressed,
                    child: Icon(
                      Iconsax.info_circle,
                      size: 20,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            _buildBulletedList(),
          ],
        ),
      ),
    );
  }

  Widget _buildBulletedList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children:
          items.map((item) {
            return Padding(
              padding: const EdgeInsets.only(
                right: 4.0,
                left: 12.0,
                bottom: 4.0,
                top: 4.0,
              ),
              child: Row(
                children: [
                  Text(
                    '•  ', // A simple bullet point character with a space
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: bulletColor,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      item,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: bulletColor,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
    );
  }
}
