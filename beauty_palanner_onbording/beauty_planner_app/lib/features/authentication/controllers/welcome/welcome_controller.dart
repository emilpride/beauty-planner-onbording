import 'package:beautymirror/common/widgets/screens/choose_assistant.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../utils/constants/image_strings.dart';
import '../../screens/onboarding/onboarding.dart';

class WelcomeController extends GetxController {
  final PageController pageController = PageController();
  final RxInt currentPage = 0.obs; // Observable integer for current page index

  @override
  void onInit() {
    super.onInit();
    // Listen to page changes from user swipes
    pageController.addListener(() {
      if (pageController.page != null) {
        // Update currentPage only if it's a whole number (actual page)
        // This prevents updates during fractional scrolls between pages
        int newPage = pageController.page!.round();
        if (currentPage.value != newPage) {
          currentPage.value = newPage;
        }
      }
    });
  }

  // List of onboarding items
  final List<OnboardingItem> onboardingPages = [
    OnboardingItem(
      imagePath: AppImages.welcomeImage1, // Placeholder
      title:
          "Beauty is not just about your routine—it's also about mental and physical well-being",
      description: '',
    ),
    OnboardingItem(
      imagePath: AppImages.welcomeImage2, // Placeholder
      title: "Welcome! I’m Your Beauty & Wellness Guide!",
      description: 'Let’s start your journey to holistic self-care!',
    ),
    OnboardingItem(
      imagePath: AppImages.welcomeImage3, // Placeholder
      title: "Discover Beauty Mirror Features for Your Journey!",
      description:
          'With smart tracking and personalized routines, Beauty Mirror keeps you motivated and balanced in beauty, mind, and body.',
    ),
    OnboardingItem(
      imagePath: AppImages.welcomeImage4, // Placeholder
      title: "Unlock Your Best Self with Beauty Mirror!",
      description:
          'Stay consistent, cultivate healthy beauty & wellness Activities, and unlock your natural glow—inside and out!',
    ),
  ];

  // Navigate to the next page
  void nextPage() {
    if (currentPage.value < onboardingPages.length - 1) {
      pageController.nextPage(
        duration: const Duration(
          milliseconds: 400,
        ), // Smooth animation duration
        curve: Curves.easeOut, // Animation curve
      );
    } else {
      // Last page, navigate to home or sign-up screen
      // Get.offAllNamed('/home'); // Example navigation to a home screen
      // Or you can show a dialog or final action
      Get.to(
        // () => const OnboardingScreen(),
        () => const ChooseAssistant(),
      );
    }
  }

  // You can also add a function to skip onboarding or navigate to a specific page
  void skipOnboarding() {
    Get.offAllNamed('/home'); // Example navigation
  }

  @override
  void onClose() {
    pageController
        .dispose(); // Dispose the PageController when the controller is no longer needed
    super.onClose();
  }
}

class OnboardingItem {
  final String imagePath;
  final String title;
  final String description;

  OnboardingItem({
    required this.imagePath,
    required this.title,
    required this.description,
  });
}
