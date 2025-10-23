import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:lottie/lottie.dart';

import '../../../../data/repositories/authentication/authentication_repository.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';

class CongratulationsScreen extends StatefulWidget {
  const CongratulationsScreen({super.key});

  @override
  State<CongratulationsScreen> createState() => _CongratulationsScreenState();
}

// Add TickerProviderStateMixin for animation
class _CongratulationsScreenState extends State<CongratulationsScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;

  // A list to hold our benefits for easier management
  final List<List<TextSpan>> _benefits = [
    [
      const TextSpan(
        text: 'Unlimited',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: ' Activity tracking'),
    ],
    [
      const TextSpan(text: 'Advanced progress'),
      const TextSpan(
        text: ' tracking and reports',
        style: TextStyle(color: AppColors.primary),
      ),
    ],
    [
      const TextSpan(
        text: 'Customization ',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: 'options (themes, notifications)'),
    ],
    [
      const TextSpan(text: 'Customer priority'),
      const TextSpan(
        text: ' support',
        style: TextStyle(color: AppColors.primary),
      ),
    ],
    [
      const TextSpan(text: 'Advanced '),
      const TextSpan(
        text: 'mood stat ',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: 'options'),
    ],
    [
      const TextSpan(
        text: 'Ad-free',
        style: TextStyle(color: AppColors.primary),
      ),
      const TextSpan(text: ' experience'),
    ],
  ];

  @override
  void initState() {
    super.initState();
    // Initialize the animation controller
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(
        milliseconds: 2000,
      ), // Total duration for all animations
    );
    // Start the animation as soon as the screen loads
    _animationController.forward();
  }

  @override
  void dispose() {
    // Dispose the controller when the widget is removed
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          const SizedBox(height: AppSizes.xl * 1.5),
          // PERFORMANCE FIX: Wrap the expensive container in a RepaintBoundary.
          // This caches the container and its shadow, so it doesn't need to be
          // redrawn during the list animation, improving performance.
          RepaintBoundary(
            child: Container(
              height: size.height * 0.92,
              padding: const EdgeInsets.only(
                top: 0,
                right: 8.0,
                left: 8.0,
                bottom: 12.0,
              ),
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.all(Radius.circular(16.0)),
                // boxShadow: [
                //   BoxShadow(
                //     color: Colors.black12,
                //     // PERFORMANCE FIX: Reduced blurRadius slightly.
                //     blurRadius: 20,
                //     offset: Offset(0, -10),
                //   ),
                // ],
              ),
              child: Column(
                children: [
                  // Expanded widget to make the main content scrollable if it overflows.
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Top section with confetti and crown icon.
                          // PERFORMANCE FIX: Wrap the header (with Lottie) in its own RepaintBoundary
                          // to isolate its painting from the rest of the UI.
                          RepaintBoundary(child: _buildHeader()),
                          // Main text content.
                          _buildInfoText(),
                          const SizedBox(height: 32),
                          // The list of animated benefits.
                          _buildBenefitsList(),

                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                            ),
                            child: Divider(color: Colors.grey[300]),
                          ),
                          const SizedBox(height: 16),
                          // Footer text.
                          _buildFooterText(),
                        ],
                      ),
                    ),
                  ),
                  // The button at the bottom of the screen.
                  const SizedBox(height: 16),
                  _buildBottomButton(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Builds the header with the Lottie animation and the crown icon.
  Widget _buildHeader() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Lottie.asset(
          AppImages.congratulationsAnimation,
          height: 200,
          fit: BoxFit.fitWidth,
        ),
        // A circular background for the crown icon.
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.deepPurple[300],
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.workspace_premium_rounded, // A suitable crown-like icon
            color: Colors.white,
            size: 48,
          ),
        ),
      ],
    );
  }

  // Builds the main "Congratulations" and "Welcome" text.
  Widget _buildInfoText() {
    return Column(
      children: [
        const Text(
          'Congratulations!',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary, // Deep purple color
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Welcome to the Premium experience!',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Divider(color: Colors.grey[300]),
        ),
      ],
    );
  }

  // Builds the list of benefits that animate in sequentially.
  Widget _buildBenefitsList() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Benefits Unlocked:',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Generate the list of benefit items using a loop.
          Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: Column(
              // Use a loop to create an animated widget for each benefit
              children: List.generate(_benefits.length, (index) {
                // Calculate staggered start and end times for each item's animation
                final intervalStart = (index * 0.1);
                final intervalEnd = intervalStart + 0.3;

                // Create a curved animation for a smoother effect
                final animation = CurvedAnimation(
                  parent: _animationController,
                  curve: Interval(
                    intervalStart,
                    intervalEnd > 1.0
                        ? 1.0
                        : intervalEnd, // Ensure end is not > 1.0
                    curve: Curves.easeOut,
                  ),
                );
                return AnimatedBenefitItem(
                  animation: animation,
                  child: _buildBenefitRow(_benefits[index]),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  // Helper widget to build a single benefit row
  Widget _buildBenefitRow(List<TextSpan> textSpans) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SvgPicture.asset(
            AppImages.tick,
            color: AppColors.textPrimary,
            height: 14,
            width: 14,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text.rich(
              TextSpan(
                // Base style for all text in the row
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: AppColors.black,
                ),
                children: textSpans,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Builds the footer text below the benefits list.
  Widget _buildFooterText() {
    return const Text(
      "You've successfully upgraded and unlocked the full Beauty Mirror experience. Enjoy your exclusive benefits!",
      textAlign: TextAlign.center,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
    );
  }

  // Builds the persistent button at the bottom.
  Widget _buildBottomButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SizedBox(
        height: 50,
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () async {
            await AuthenticationRepository.instance.screenRedirect();
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 5,
            shadowColor: Colors.deepPurple.withOpacity(0.4),
          ),
          child: const Text(
            'Start Exploring Premium Features',
            style: TextStyle(
              fontSize: 13,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

/// A reusable widget that applies a fade and slide animation to its child.
class AnimatedBenefitItem extends StatelessWidget {
  const AnimatedBenefitItem({
    super.key,
    required this.animation,
    required this.child,
  });

  final Animation<double> animation;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: animation,
      child: SlideTransition(
        // The slide animation goes from bottom to top (y-axis)
        position: Tween<Offset>(
          begin: const Offset(0, 0.5), // Start 50% down from its final position
          end: Offset.zero,
        ).animate(animation),
        child: child,
      ),
    );
  }
}
