import 'package:beautymirror/features/personalization/controllers/user_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/diagrams/circular_segmented_progress_painter.dart';
import '../../../../common/widgets/layouts/task_card.dart';
import '../../../../utils/constants/colors.dart';

import '../../../../utils/constants/image_strings.dart';
import '../../../assistant/controller/chat_controller.dart';
import '../../../personalization/controllers/achiements_controller.dart';
import '../../controllers/calendar_controller.dart';
import '../../controllers/home_controller.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import '../../controllers/report_controller.dart';
import '../../models/task_model.dart';
import '../calendar/calendar.dart';
import 'widgets/activity_history_grid.dart';
import 'widgets/animated_segment_controll.dart';
import 'widgets/current_week_activity_status.dart';
import 'widgets/home_calendar_widget.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({super.key});

  final HomeScreenController controller = HomeScreenController.instance;
  final CalendarController calendarController = CalendarController.instance;
  final MyChatController chatController = Get.put(MyChatController());
  final ReportController reportController = Get.put(ReportController());
  final achievementController = Get.put(AchievementController());
  final userController = UserController.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Use theme-driven background to support dark mode
      body: Obx(
        () => AnimationLimiter(
          child: CustomScrollView(
            physics: const ClampingScrollPhysics(),
            slivers: [
              _buildHeader(context),
              _buildCategoryProgressCards(context),
              _buildFilterChips(context),
              if (controller.selectedTab.value == 0) ...[
                _buildTaskList(
                  title: 'Upcoming',
                  tasks: controller.pendingTasks,
                ),
                _buildTaskList(
                  title: 'Completed',
                  tasks: controller.completedTasks,
                  isDismissible: false,
                ),
                _buildTaskList(
                  title: 'Skipped',
                  tasks: controller.skippedTasks,
                  isDismissible: false,
                ),
              ] else if (controller.selectedTab.value == 1)
                _buildWeeklyActivityStatus()
              else if (controller.selectedTab.value == 2)
                _buildActivityHistoryGrid(),

              const SliverToBoxAdapter(child: SizedBox(height: 30)),
            ],
          ),
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildHeader(BuildContext context) {
    return SliverToBoxAdapter(
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          Image.asset(AppImages.homeIllustration),
          Column(
            children: [
              if (controller.selectedTab.value == 0)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 56, 20, 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Obx(
                        () => Text(
                          controller.currentMonth.value,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ),
                      // Actual themed color applied via DefaultTextStyle below
                      GestureDetector(
                        onTap: () => Get.to(() => const CalendarScreen()),
                        behavior: HitTestBehavior.translucent,
                        child: Container(
                          height: 40,
                          width: 40,
                          padding: const EdgeInsets.all(7),
                          child: SvgPicture.asset(
                            AppImages.calendarIcon,
                            width: 20,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 56, 20, 8),
                  child: Text(
                    'Home',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                ),

              if (controller.selectedTab.value == 0) const HomeCalendarWidget(),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: AnimatedSegmentControl(
                  segments: const ['Daily', 'Weekly', 'Overall'],
                  backgroundColor: Theme.of(context).colorScheme.surface,
                  selectedColor: AppColors.primary,
                  unselectedTextColor:
                      Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                  selectedTextColor: Theme.of(context).colorScheme.onPrimary,
                  height: 55,
                  borderRadius: 10,
                  onSegmentSelected:
                      (index) => controller.selectedTab.value = index,
                ),
              ),

              _buildProgressChart(context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProgressChart(BuildContext context) {
    return RoundedContainer(
      // width: 300,
      // height: 300,
      backgroundColor: Get.context != null
          ? Theme.of(Get.context!).colorScheme.surface
          : AppColors.white,
      radius: 12,
      margin: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Obx(
            () => Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Activities',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        'Your progress',
                        style: TextStyle(
                          fontSize: 14,
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withOpacity(0.6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text(
                        '${controller.completedCount.value}',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        '/${controller.totalCount.value}',
                        style: TextStyle(
                          fontSize: 11,
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withOpacity(0.6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Obx(
            () => SizedBox(
              // color: Colors.red,
              height: _getDiagramSize(controller.chartData.length),
              width: _getDiagramSize(controller.chartData.length),
              child: ProgressChartScreen(chartData: controller.chartData),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  _getDiagramSize(int length) {
    double size;
    switch (length) {
      case 1:
        size = 60;
        break;
      case 2:
        size = 110;
        break;
      case 3:
        size = 160;
        break;
      case 4:
        size = 210;
        break;
      case 5:
        size = 260;
        break;
      default:
        size = 260;
    }
    return size;
  }

  SliverToBoxAdapter _buildCategoryProgressCards(BuildContext context) {
    return SliverToBoxAdapter(
      child:
          controller.chartData.isNotEmpty
              ? Obx(
                () => SizedBox(
                  height: 180,
                  width: double.infinity,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemBuilder: (context, index) {
                        final category = controller.chartData[index];
                        final progressPercentage = (category.percentage * 100)
                            .toStringAsFixed(0);
                        return RoundedContainer(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: SizedBox(
                            width: 200,
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          color: category.color,
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: SvgPicture.asset(
                                            category.illustration!,
                                            width: 20,
                                            height: 20,
                                            colorFilter: const ColorFilter.mode(
                                              Colors.white,
                                              BlendMode.srcIn,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      SizedBox(
                                        width: 128,
                                        child: Text(
                                          category.name!,
                                          style: TextStyle(
                                            fontSize: 16,
                                            color: Theme.of(context)
                                                .colorScheme
                                                .onSurface,
                                            fontWeight: FontWeight.w700,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Spacer(),

                                  Text.rich(
                                    TextSpan(
                                      children: [
                                        TextSpan(
                                          text: progressPercentage,
                                          style: TextStyle(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .onSurface,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 32,
                                          ),
                                        ),
                                        TextSpan(
                                          text: '/100%',
                                          style: TextStyle(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .onSurface
                                                .withOpacity(0.6),
                                            fontSize: 16,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      separatorBuilder:
                          (context, index) => const SizedBox(width: 8),
                      //number the unique categories among activities
                      itemCount: controller.chartData.length,
                      shrinkWrap: true,
                    ),
                  ),
                ),
              )
              : const SizedBox.shrink(),
    );
  }

  SliverToBoxAdapter _buildFilterChips(BuildContext context) {
    return SliverToBoxAdapter(
      child: Container(
        height: 40,
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Obx(
          () => Row(
            // scrollDirection: Axis.horizontal,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children:
                TimeFilter.values.map((filter) {
                  final isSelected = controller.selectedFilter.value == filter;
                  return GestureDetector(
                    onTap: () => controller.setFilter(filter),
                    child: RoundedContainer(
                      height: isSelected ? 40 : 38,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      radius: 8,
                      backgroundColor:
                          isSelected
                              ? AppColors.primary
                              : Theme.of(context).colorScheme.surface,
                      showBorder: isSelected,
                      borderColor: Theme.of(context).colorScheme.surface,

                      child: Center(
                        child: Text(
                          filter.name,
                          style: TextStyle(
                            color:
                                isSelected
                                    ? Theme.of(context)
                                        .colorScheme
                                        .onPrimary
                                    : Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withOpacity(0.6),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
          ),
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildWeeklyActivityStatus() {
    return SliverToBoxAdapter(
      child: Column(
        children:
            userController.user.value.activities
                .where(
                  (activity) =>
                      activity.activeStatus && activity.type == 'regular',
                )
                .map((activity) {
                  return CurrentWeekActivityStatus(activity: activity);
                })
                .toList(),
      ),
    );
  }

  SliverToBoxAdapter _buildActivityHistoryGrid() {
    return SliverToBoxAdapter(
      child: Column(
        children:
            userController.user.value.activities
                .where(
                  (activity) =>
                      activity.activeStatus && activity.type == 'regular',
                )
                .map((activity) {
                  return ActivityHistoryGrid(activity: activity);
                })
                .toList(),
      ),
    );
  }

  Widget _buildTaskList({
    required String title,
    required RxList<Task> tasks,
    bool isDismissible = true,
  }) {
    return Obx(() {
      Text(controller.selectedFilter.value.name);
      if (tasks.isEmpty) {
        return const SliverToBoxAdapter(child: SizedBox.shrink());
      }
      return SliverMainAxisGroup(
        slivers: [
          if (title != 'Upcoming') ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(22, 24, 22, 8),
                child: Row(
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Divider(color: Colors.grey[300], thickness: 1),
                    ),
                  ],
                ),
              ),
            ),
          ],
          SliverList(
            delegate: SliverChildBuilderDelegate((context, index) {
              final task = tasks[index];
              final activity = controller.getActivityForTask(task);

              return AnimationConfiguration.staggeredList(
                position: index,
                duration: const Duration(milliseconds: 500),
                child: SlideAnimation(
                  verticalOffset: 50.0,
                  child: FadeInAnimation(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: GestureDetector(
                        onTap: () => controller.showTaskInfo(activity!, task),
                        child: Container(
                          color: Colors.transparent,
                          child: CustomSlidableTaskCard(
                            task: task,
                            activity: activity,
                            onComplete:
                                () => controller.markTaskAsCompleted(task),
                            onSkip: () => controller.markTaskAsSkipped(task),
                            isSlidable: isDismissible,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }, childCount: tasks.length),
          ),
        ],
      );
    });
  }
}
