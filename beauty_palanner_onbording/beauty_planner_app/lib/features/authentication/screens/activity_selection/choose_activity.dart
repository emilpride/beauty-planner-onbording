import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/loaders/loaders.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controllers/activity_selection/choose_activity_controller.dart';
import '../../../../data/models/activity_model.dart';
import '../../../../common/widgets/list_tile/activity_item.dart';
import '../schedule_screen/schedule_screen.dart';
import 'create_activity.dart';
import 'widgets/activity_searchbar.dart';

class ChooseActivitiesScreen extends StatelessWidget {
  final Function onBack;
  const ChooseActivitiesScreen({super.key, required this.onBack});

  @override
  Widget build(BuildContext context) {
    final controller = ChooseActivitiesController.instance;

    return Scaffold(
      appBar: BMAppbar(
        title: 'Choose Activities',
        onBackPressed: () {
          //make all activities inactive
          controller.allActivities.map(
            (activity) => activity.activeStatus = false,
          );
          onBack();
        },
        actions: [
          Obx(() {
            return !controller.isExpanded
                ? GestureDetector(
                  onTap: () {
                    Get.to(() => const CreateActivityScreen());
                  },
                  child: const Icon(
                    Icons.add,
                    color: AppColors.textPrimary,
                    size: AppSizes.xl,
                  ),
                )
                : const SizedBox.shrink();
          }),
        ],
      ),
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Obx(() {
          Text(controller.x.value.toString());
          return Column(
            children: [
              const SizedBox(height: 24),
              const ExpandableSearchWidget(),
              // UPDATED: Activities List now uses the new `displayList`
              Expanded(
                child: AnimationLimiter(
                  // The ListView now iterates over the dynamic displayList
                  child: ListView.builder(
                    itemCount: controller.displayList.length,
                    itemBuilder: (context, index) {
                      final item = controller.displayList[index];

                      // Check the type of the item to decide which widget to build
                      if (item is String) {
                        // If it's a String, build the category header
                        return _buildCategoryHeader(item);
                      } else if (item is ActivityModel) {
                        // If it's an ActivityModel, build the activity item
                        final activity = item;
                        return AnimationConfiguration.staggeredList(
                          position: index,
                          duration: const Duration(milliseconds: 375),
                          child: SlideAnimation(
                            verticalOffset: 50.0,
                            child: FadeInAnimation(
                              child: _buildActivityItem(controller, activity),
                            ),
                          ),
                        );
                      }
                      // Return an empty box if the type is unknown
                      return const SizedBox.shrink();
                    },
                  ),
                ),
              ),
              _buildNextButton(
                text: 'Next',
                condition: controller.allActivities.any(
                  (activity) => activity.activeStatus,
                ),
                ontap: () {
                  Get.to(
                    () =>
                        ScheduleScreen(allActivities: controller.allActivities),
                  );
                  log(
                    controller.allActivities
                        .where((activity) => activity.activeStatus)
                        .map(
                          (activity) => activity.toJson(),
                        ) // Log selected activities
                        .toString(),
                  );
                },
                onDisabledTap: () {
                  Loaders.customToast(
                    message: 'Please select at least one activity.',
                  );
                },
              ),
              const SizedBox(height: 24),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildCategoryHeader(String category) {
    return Padding(
      padding: const EdgeInsets.only(
        top: 24.0,
        bottom: 16.0,
        left: 8,
        right: 8,
      ),
      child: Row(
        children: [
          Text(
            category,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(child: Divider(color: Colors.grey[300], thickness: 1)),
        ],
      ),
    );
  }

  Widget _buildActivityItem(
    ChooseActivitiesController controller,
    ActivityModel activity,
  ) {
    // Using GetBuilder here to update only this specific item on selection change
    return GetBuilder<ChooseActivitiesController>(
      id: activity.id, // Unique ID to rebuild only this widget
      builder: (_) {
        return ActivityItem(
          activity: activity,
          onTap: () => controller.toggleActivitySelection(activity),
        );
      },
    );
  }

  // This widget remains unchanged
  Widget _buildNextButton({
    required String text,
    required bool condition,
    Function()? ontap,
    Function()? onDisabledTap,
  }) {
    return RoundedContainer(
      height: 50,
      backgroundColor: Colors.transparent,
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      child: Opacity(
        opacity: condition ? 1.0 : 0.6,
        child: ElevatedButton(
          onPressed: () {
            if (condition) {
              if (ontap != null) {
                ontap();
              }
            } else {
              if (onDisabledTap != null) {
                onDisabledTap();
              }
            }
          },
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
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
