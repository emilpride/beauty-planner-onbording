import 'dart:math';
import 'package:beautymirror/features/personalization/controllers/user_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'features/app/screens/activity/activity.dart';
import 'features/app/screens/home/home.dart';
import 'features/app/screens/mood/mood.dart';
import 'features/app/screens/report/report.dart';
import 'features/assistant/screens/chat/chat_screen.dart';
import 'features/authentication/controllers/activity_selection/choose_activity_controller.dart';
import 'features/authentication/screens/activity_selection/choose_activity.dart';
import 'features/personalization/screens/profile/profile_screen.dart';
import 'utils/constants/colors.dart';
import 'utils/constants/image_strings.dart';

class NotificationFabController extends GetxController {
  static NotificationFabController get instance => Get.find();

  final RxBool isVisible = false.obs;
  final RxString currentTip = ''.obs;

  // Predefined self-care advice list
  final List<String> selfCareAdvice = [
    "Hi, Here's a useful tip for you today:\nUse a primer. This will make your skin smoother and help your foundation last longer.",
    "Hi! You've got 6 tasks scheduled for today.",
    "Remember to drink water regularly to keep your skin hydrated and glowing.",
    "Take a 5-minute break every hour to rest your eyes and stretch your body.",
    "Practice deep breathing for 2 minutes to reduce stress and anxiety.",
    "Don't forget to apply sunscreen before going outside, even on cloudy days.",
    "Get enough sleep tonight - your skin repairs itself while you rest.",
    "Take time to appreciate something beautiful around you today.",
    "Remember to be kind to yourself. You're doing better than you think.",
    "Try to eat something colorful today - your body will thank you for the nutrients.",
  ];

  void showRandomTip() {
    if (isVisible.value) {
      // If already visible, hide it
      hideTip();
    } else {
      // Show a random tip
      final randomIndex =
          (selfCareAdvice.length * Random().nextDouble()).floor();
      currentTip.value = selfCareAdvice[randomIndex];
      isVisible.value = true;
    }
  }

  void hideTip() {
    isVisible.value = false;
    currentTip.value = '';
  }
}

class NotificationFab extends StatelessWidget {
  const NotificationFab({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<NotificationFabController>();

    return Obx(
      () => Stack(
        clipBehavior: Clip.none,
        children: [
          // Text Bubble - positioned above and to the left of FAB
          if (controller.isVisible.value)
            Positioned(
              bottom: 78, // Position above the FAB
              right:
                  78, // Position to the left of the FAB so it doesn't overlap
              child: _buildTextBubble(controller),
            ),

          // Floating Action Button
          _buildFab(controller),
        ],
      ),
    );
  }

  Widget _buildTextBubble(NotificationFabController controller) {
    return AnimatedScale(
      scale: controller.isVisible.value ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 400),
      curve: Curves.elasticOut,
      child: AnimatedOpacity(
        opacity: controller.isVisible.value ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        child: IgnorePointer(
          ignoring: !controller.isVisible.value,
          child: Container(
            constraints: const BoxConstraints(maxWidth: 235, minWidth: 200),
            margin: const EdgeInsets.only(top: 8, left: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF8B7BD8), // Purple color from the image
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(0), // Right angle at bottom-right
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              controller.currentTip.value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFab(NotificationFabController controller) {
    return AnimatedScale(
      scale: controller.isVisible.value ? 0.95 : 1.0,
      duration: const Duration(milliseconds: 200),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Main FAB
          GestureDetector(
            onTap: () {
              if (controller.isVisible.value) {
                controller.hideTip();
              } else {
                // controller.showRandomTip();
                Get.to(() => const AIChatScreen());
              }
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 78,
              height: 78,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFFFFD2D2), Color(0xFFBAA5FC)],
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: Column(
                  children: [
                    const SizedBox(height: 12),
                    Image.asset(
                      UserController.instance.user.value.assistant == 2
                          ? AppImages.assistantEllie
                          : AppImages.assistantMax,
                      fit: BoxFit.cover,
                      height: 66,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Star icon at bottom right with bounce animation
          Positioned(
            bottom: 2,
            right: -12,
            child: AnimatedScale(
              scale: controller.isVisible.value ? 1.2 : 1.0,
              duration: const Duration(milliseconds: 300),
              curve: Curves.elasticOut,
              child: const aIStar(),
            ),
          ),
        ],
      ),
    );
  }
}

extension WidgetGradient on Widget {
  Widget gradient({required Gradient gradient}) {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback:
          (bounds) => gradient.createShader(
            Rect.fromLTWH(0, 0, bounds.width, bounds.height),
          ),
      child: this,
    );
  }
}

class aIStar extends StatelessWidget {
  const aIStar({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SvgPicture.asset(AppImages.aISvg, width: 24, height: 24).gradient(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF8A6EDA),
            Color(0xFFB76EDA),
            Color(0xFFDB75E0),
            Color(0xFFEBB1EB),
          ],
          begin: Alignment.bottomRight,
          end: Alignment.topLeft,
        ),
      ),
    );
  }
}

class NavigationMenu extends StatelessWidget {
  const NavigationMenu({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(NavigationController());
    final notificationController = Get.put(NotificationFabController());

    final List<BottomNavItem> items = [
      BottomNavItem(icon: AppImages.home, title: "Home"),
      BottomNavItem(icon: AppImages.mood, title: "Mood Stat"),
      BottomNavItem(icon: AppImages.report, title: "Report"),
      BottomNavItem(icon: AppImages.activities, title: "Activities"),
      BottomNavItem(icon: AppImages.account, title: "Account"),
    ];

    return Scaffold(
      body: Stack(
        clipBehavior: Clip.none,
        children: [
          // Main screen content
          Obx(() => controller.screens[controller.selectedIndex.value]),

          // Animated Floating Action Button for Activities (existing)
          Obx(() {
            final isVisible = controller.selectedIndex.value == 3;
            return Positioned(
              bottom: 0,
              right: 10,
              child: ExpandingFloatingActionButton(isVisible: isVisible),
            );
          }),

          // Notification FAB for Home screen only
          Obx(() {
            final isVisible = controller.selectedIndex.value == 0;
            return AnimatedPositioned(
              duration: const Duration(milliseconds: 400),
              bottom: isVisible ? 30 : -70,
              right: 16,
              child: AnimatedOpacity(
                opacity: isVisible ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: IgnorePointer(
                  ignoring: !isVisible,
                  child: const NotificationFab(),
                ),
              ),
            );
          }),
        ],
      ),
      bottomNavigationBar: Obx(
        () => AnimatedBottomNavBar(
          items: items,
          selectedIndex: controller.selectedIndex.value,
          onItemTapped: (index) {
            controller.selectedIndex.value = index;
            // Hide notification when navigating away from home
            if (index != 0) {
              NotificationFabController.instance.hideTip();
            }
          },
        ),
      ),
    );
  }
}

// Rest of your existing code remains the same...
class NavigationController extends GetxController {
  static NavigationController get instance => Get.find();
  final Rx<int> selectedIndex = 0.obs;

  final screens = [
    HomeScreen(),
    const MoodScreen(),
    const ReportScreen(),
    const ActivityScreen(),
    const ProfileScreen(),
  ];
}

class AnimatedBottomNavBar extends StatelessWidget {
  const AnimatedBottomNavBar({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  final List<BottomNavItem> items;
  final int selectedIndex;
  final ValueChanged<int> onItemTapped;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 65,
      // padding: const EdgeInsets.symmetric(horizontal: ),
      margin: const EdgeInsets.only(top: 16, bottom: 8),
      decoration: const BoxDecoration(color: AppColors.white),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(items.length, (index) {
          final item = items[index];
          final bool isSelected = selectedIndex == index;
          return NavBarItem(
            icon: item.icon,
            title: item.title,
            isSelected: isSelected,
            onTap: () => onItemTapped(index),
          );
        }),
      ),
    );
  }
}

class NavBarItem extends StatelessWidget {
  const NavBarItem({
    super.key,
    required this.icon,
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  final String icon;
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.translucent,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.white,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            SvgPicture.asset(
              icon,
              width: 24,
              height: 24,
              color: isSelected ? AppColors.white : AppColors.textSecondary,
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              child: Row(
                children: [
                  if (isSelected) const SizedBox(width: 8),
                  AnimatedOpacity(
                    opacity: isSelected ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeIn,
                    child:
                        isSelected
                            ? Text(
                              title,
                              style: const TextStyle(
                                color: AppColors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                              maxLines: 1,
                            )
                            : const SizedBox.shrink(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class BottomNavItem {
  final String icon;
  final String title;

  BottomNavItem({required this.icon, required this.title});
}

// Your existing ExpandingFloatingActionButton widget
class ExpandingFloatingActionButton extends StatefulWidget {
  final bool isVisible;
  const ExpandingFloatingActionButton({super.key, required this.isVisible});

  @override
  State<ExpandingFloatingActionButton> createState() =>
      _ExpandingFloatingActionButtonState();
}

class _ExpandingFloatingActionButtonState
    extends State<ExpandingFloatingActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _fabController;
  late Animation<double> _expandAnimation;
  late Animation<double> _rotateAnimation;
  bool _isOpen = false;

  @override
  void initState() {
    super.initState();
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );

    _expandAnimation = CurvedAnimation(
      parent: _fabController,
      curve: Curves.fastOutSlowIn,
    );

    _rotateAnimation = Tween<double>(
      begin: 0,
      end: 0.375,
    ).animate(CurvedAnimation(parent: _fabController, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _fabController.forward();
      } else {
        _fabController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: widget.isVisible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 200),
      child: IgnorePointer(
        ignoring: !widget.isVisible,
        child: SizedBox(
          width: 120,
          height: 195,
          child: Stack(
            alignment: Alignment.bottomCenter,
            children: [
              // Expanded Options
              _buildFabOption(
                distance: 0,
                index: 0,
                child: const _FabOption(text: "Regular"),
              ),
              _buildFabOption(
                distance: 0,
                index: 1,
                child: const _FabOption(text: "One-Time"),
              ),

              // Main FAB Button
              Positioned(
                bottom: 30,
                right: 28,
                child: GestureDetector(
                  onTap: _toggleFab,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 60,
                    height: 60,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: RotationTransition(
                        turns: _rotateAnimation,
                        child: Icon(
                          _isOpen ? Icons.add : Icons.add,
                          color: AppColors.white,
                          size: 30,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFabOption({
    required double distance,
    required int index,
    required Widget child,
  }) {
    return AnimatedBuilder(
      animation: _expandAnimation,
      builder: (context, _) {
        final offset = -distance * _expandAnimation.value;
        return Positioned(
          top: offset + (index * 50),
          left: 0,
          right: 0,
          child: Opacity(
            opacity: _expandAnimation.value,
            child: Transform.scale(
              scale: _expandAnimation.value,
              child: GestureDetector(
                onTap: () {
                  ChooseActivitiesController.instance.activityType.value =
                      index == 0 ? 'regular' : 'one_time';
                  ChooseActivitiesController.instance.loadActivities();
                  _toggleFab();
                  Get.to(() => ChooseActivitiesScreen(onBack: Get.back));
                },
                child: child,
              ),
            ),
          ),
        );
      },
    );
  }
}

class _FabOption extends StatelessWidget {
  final String text;
  const _FabOption({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 40, minWidth: 120),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.white,
            fontWeight: FontWeight.w600,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
