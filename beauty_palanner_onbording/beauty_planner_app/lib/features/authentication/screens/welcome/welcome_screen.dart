import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../utils/constants/colors.dart';
import '../../controllers/welcome/welcome_controller.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    // Initialize the GetX controller
    Get.put(WelcomeController());

    // Setup for screen entrance animation
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(
        milliseconds: 800,
      ), // Duration for entrance animation
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _animationController.forward(); // Start the animation
  }

  @override
  void dispose() {
    _animationController.dispose(); // Dispose the animation controller
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Get the instance of the controller
    final WelcomeController controller = Get.find<WelcomeController>();

    return Scaffold(
      backgroundColor: Colors.white, // Background color matching the image
      bottomNavigationBar: Obx(
        () => SizedBox(
          height:
              controller.currentPage.value == 0
                  ? 132 // Height for the bottom navigation bar
                  : 100,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              // Next Button
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 12,
                ),
                child: SizedBox(
                  width: double.infinity,
                  height: 56, // Standard button height
                  child: ElevatedButton(
                    onPressed: controller.nextPage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor:
                          AppColors.primary, // Light purple button color
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                          20.0,
                        ), // Rounded corners
                      ),
                      elevation: 2, // Shadow effect
                    ),
                    child: const Text(
                      'Next',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),

              // Already have an account? Sign in
              controller.currentPage.value == 0
                  ? Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Already have an account?',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF4A4A4A),
                          ),
                        ),
                        const SizedBox(width: 8), // Space between text and link
                        GestureDetector(
                          onTap:
                              () => Get.toNamed(
                                '/sign-in',
                              ), // Navigate to login screen
                          child: const Text(
                            'Sign in',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: AppColors.primary, // Light purple for link
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                  : const SizedBox.shrink(),
              // const SizedBox(height: AppSizes.sm), // Bottom padding
            ],
          ),
        ),
      ),
      body: FadeTransition(
        opacity: _fadeAnimation, // Apply the fade animation to the whole body
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Top Padding for status bar
              const SizedBox(height: 50),

              // PageView for the onboarding cards
              SizedBox(
                height: MediaQuery.of(context).size.height * 0.55,
                child: PageView.builder(
                  controller: controller.pageController,
                  itemCount: controller.onboardingPages.length,
                  onPageChanged: (index) {
                    // This callback is less reliable for updating the RxInt
                    // because PageController's listener directly updates it.
                    // It's here if you need other side effects on page change.
                  },
                  itemBuilder: (context, index) {
                    final OnboardingItem item =
                        controller.onboardingPages[index];
                    return _buildOnboardingCard(item);
                  },
                ),
              ),

              // Description Text
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Obx(
                  () => AnimatedSwitcher(
                    duration: const Duration(
                      milliseconds: 300,
                    ), // Text fade animation
                    transitionBuilder: (
                      Widget child,
                      Animation<double> animation,
                    ) {
                      return FadeTransition(opacity: animation, child: child);
                    },
                    child: Text(
                      controller
                          .onboardingPages[controller.currentPage.value]
                          .title,
                      key: ValueKey<int>(
                        controller.currentPage.value,
                      ), // Key for AnimatedSwitcher
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary, // Dark gray color
                      ),
                    ),
                  ),
                ),
              ),
              controller
                      .onboardingPages[controller.currentPage.value]
                      .description
                      .isNotEmpty
                  ? const SizedBox(height: 12)
                  : const SizedBox.shrink(),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Obx(
                  () => AnimatedSwitcher(
                    duration: const Duration(
                      milliseconds: 300,
                    ), // Text fade animation
                    transitionBuilder: (
                      Widget child,
                      Animation<double> animation,
                    ) {
                      return FadeTransition(opacity: animation, child: child);
                    },
                    child: Text(
                      controller
                          .onboardingPages[controller.currentPage.value]
                          .description,
                      key: ValueKey<int>(
                        controller.currentPage.value,
                      ), // Key for AnimatedSwitcher
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.black, // Dark gray color
                      ),
                    ),
                  ),
                ),
              ),
              // Space between description and dots
              // Page Indicator Dots
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 24.0),
                child: Obx(
                  () => Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      controller.onboardingPages.length,
                      (index) => _buildDot(index, controller.currentPage.value),
                    ),
                  ),
                ),
              ),

              // Hide if not on first page
            ],
          ),
        ),
      ),
    );
  }

  // Helper widget to build a single onboarding card
  Widget _buildOnboardingCard(OnboardingItem item) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Image container with rounded corners and shadow
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            // boxShadow: [
            //   BoxShadow(
            //     color: Colors.grey.withOpacity(0.3),
            //     spreadRadius: 3,
            //     blurRadius: 7,
            //     offset: const Offset(0, 3), // changes position of shadow
            //   ),
            // ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            // Placeholder for image - replace with actual image asset
            child: Image.asset(
              item.imagePath,
              fit: BoxFit.cover,
              height:
                  MediaQuery.of(context).size.height * 0.5, // Responsive height
              width: double.infinity,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: MediaQuery.of(context).size.height * 0.5,
                  width: double.infinity,
                  color: Colors.grey[200],
                  child: const Icon(
                    Icons.image_not_supported,
                    size: 80,
                    color: Colors.grey,
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  // Helper widget to build a single dot for the page indicator
  Widget _buildDot(int index, int currentPage) {
    return AnimatedContainer(
      duration: const Duration(
        milliseconds: 300,
      ), // Animation for dot size/color change
      margin: const EdgeInsets.symmetric(horizontal: 4.0),
      height: 8,
      width: currentPage == index ? 32 : 8, // Wider for active dot
      decoration: BoxDecoration(
        color: currentPage == index ? AppColors.primary : Colors.grey[300],
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
