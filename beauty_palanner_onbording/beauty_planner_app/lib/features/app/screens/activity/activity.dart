import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../data/models/activity_model.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../../common/widgets/list_tile/activity_item.dart';
import '../../../personalization/controllers/user_controller.dart';
import '../../controllers/activity_controller.dart';
import 'activity_info.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({super.key});

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen>
    with TickerProviderStateMixin {
  final ActivityController activityController = ActivityController.instance;
  final UserController userController = UserController.instance;

  late AnimationController _listAnimationController;
  late AnimationController _rotationController;
  late Animation<double> _rotationAnimation;

  int? _rotatedItemIndex;

  @override
  void initState() {
    super.initState();

    _listAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _rotationAnimation = Tween<double>(begin: 0, end: 0.1).animate(
      CurvedAnimation(parent: _rotationController, curve: Curves.easeInOut),
    );

    _startAnimations();
  }

  void _startAnimations() {
    _listAnimationController.reset();
    _rotationController.reset();

    final initialActivities =
        userController.user.value.activities
            .where((a) => a.activeStatus && a.type == 'regular')
            .toList();

    if (initialActivities.isNotEmpty) {
      _rotatedItemIndex = Random().nextInt(min(4, initialActivities.length));
    } else {
      _rotatedItemIndex = null;
    }

    _listAnimationController.forward();

    _listAnimationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted && _rotatedItemIndex != null) {
            _rotationController.forward();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _listAnimationController.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  void _onReorder(
    int oldIndex,
    int newIndex,
    List<ActivityModel> filteredActivities,
  ) {
    setState(() {
      if (newIndex > oldIndex) {
        newIndex -= 1;
      }

      // Get the activity to move
      final activityToMove = filteredActivities[oldIndex];

      // Find the actual indices in the complete list
      final allActivities = userController.user.value.activities;
      final oldActualIndex = allActivities.indexOf(activityToMove);

      // Remove from the complete list
      allActivities.removeAt(oldActualIndex);

      // Calculate the new actual index
      int newActualIndex;
      if (newIndex == 0) {
        // Moving to the beginning - find first matching type
        newActualIndex = allActivities.indexWhere(
          (a) => a.activeStatus && a.type == activityToMove.type,
        );
        if (newActualIndex == -1) newActualIndex = 0;
      } else if (newIndex >= filteredActivities.length - 1) {
        // Moving to the end - find last matching type
        newActualIndex = allActivities.lastIndexWhere(
          (a) => a.activeStatus && a.type == activityToMove.type,
        );
        if (newActualIndex == -1) {
          newActualIndex = allActivities.length;
        } else {
          newActualIndex += 1;
        }
      } else {
        // Moving to middle - find the target activity's position
        final targetActivity = filteredActivities[newIndex];
        newActualIndex = allActivities.indexOf(targetActivity);
        if (oldActualIndex < newActualIndex) {
          newActualIndex += 1;
        }
      }

      // Insert at the new position
      allActivities.insert(newActualIndex, activityToMove);

      // Trigger update
      userController.user.refresh();
      userController.updateActivitiesOrder(allActivities);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const BMAppbar(title: 'My Activities', showBackButton: false),
      backgroundColor: AppColors.light,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSizes.md),
        child: Column(
          children: [
            const SizedBox(height: 16),
            // Segmented Control
            Obx(
              () => Row(
                children: [
                  _SegmentedControlChild(
                    text: 'Regular Activities',
                    isSelected: activityController.selectedTab.value == 0,
                    onTap: () => activityController.selectedTab.value = 0,
                  ),
                  const SizedBox(width: 16),
                  _SegmentedControlChild(
                    text: 'One-Time Task',
                    isSelected: activityController.selectedTab.value == 1,
                    onTap: () => activityController.selectedTab.value = 1,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Reorderable List of Activities
            Expanded(
              child: Obx(() {
                final String currentType =
                    activityController.selectedTab.value == 0
                        ? 'regular'
                        : 'one_time';
                final filteredActivities =
                    userController.user.value.activities
                        .where(
                          (activity) =>
                              activity.activeStatus &&
                              activity.type == currentType,
                        )
                        .toList();

                return AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  transitionBuilder: (
                    Widget child,
                    Animation<double> animation,
                  ) {
                    return FadeTransition(
                      opacity: animation,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0.0, 0.1),
                          end: Offset.zero,
                        ).animate(animation),
                        child: child,
                      ),
                    );
                  },
                  child: ReorderableListView.builder(
                    key: ValueKey(currentType),
                    itemCount: filteredActivities.length,
                    buildDefaultDragHandles: true,
                    onReorder:
                        (oldIndex, newIndex) =>
                            _onReorder(oldIndex, newIndex, filteredActivities),
                    proxyDecorator: (child, index, animation) {
                      return AnimatedBuilder(
                        animation: animation,
                        builder: (context, child) {
                          final t = Curves.easeInOut.transform(animation.value);
                          return Transform.scale(
                            scale: 1.0 + (t * 0.05),
                            child: Transform.rotate(
                              angle: t * 0.05,
                              child: Material(
                                elevation: 8.0 + (t * 4.0),
                                borderRadius: BorderRadius.circular(16),
                                shadowColor: Colors.black.withOpacity(0.3),
                                color: Colors.transparent,
                                child: child,
                              ),
                            ),
                          );
                        },
                        child: child,
                      );
                    },
                    itemBuilder: (context, index) {
                      final activity = filteredActivities[index];

                      return ReorderableDragStartListener(
                        key: ValueKey(activity.id),
                        index: index,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: ActivityItem(
                            activity: activity,
                            showTime: true,
                            showRecommended: false,
                            onTap:
                                () => Get.to(
                                  () => ActivityInfo(activity: activity),
                                ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

class _SegmentedControlChild extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback onTap;
  const _SegmentedControlChild({
    required this.text,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: GestureDetector(
        onTap: onTap,
        child: RoundedContainer(
          height: isSelected ? 40 : 38,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          radius: 8,
          backgroundColor: isSelected ? AppColors.primary : Colors.white,
          showBorder: isSelected,
          borderColor: AppColors.white,
          child: Center(
            child: Text(
              text,
              style: TextStyle(
                color: isSelected ? Colors.white : AppColors.textSecondary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
