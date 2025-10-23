import 'package:beautymirror/common/widgets/appbar/appbar.dart';
import 'package:beautymirror/features/personalization/controllers/ai_analysis_controller.dart';
import 'package:beautymirror/utils/constants/image_strings.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'dart:math';

import '../../../../common/widgets/widgets/activity_stats.dart';
import '../../../../utils/constants/colors.dart';
import '../../controllers/report_controller.dart';
import 'widgets/bms_widget.dart';
import 'widgets/graph_header.dart';

class ReportScreen extends StatelessWidget {
  const ReportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AIAnalysisController aiController = Get.find();
    final ReportController controller = ReportController.instance;

    return Scaffold(
      backgroundColor: AppColors.light,
      extendBodyBehindAppBar: true,
      appBar: const BMAppbar(title: 'Report', showBackButton: false),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 120),
              BmsCard(bmsScore: aiController.aiAnalysis.value.bmsScore),
              const SizedBox(height: 24),
              Obx(
                () => ActivityStats(
                  completionRate: controller.overallCompletionRate.value * 100,
                  activitiesCompleted:
                      controller.totalActivitiesCompleted.value,
                  perfectDays: controller.currentStreak.value,
                ),
              ),
              const SizedBox(height: 24),
              _ActivitiesCompletedChart(),
              const SizedBox(height: 24),
              _CompletionRateChart(),
              const SizedBox(height: 24),
              _CalendarStatsWidget(),
              const SizedBox(height: 24),
              _MoodChartWidget(),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

// --- Reusable Card Widget ---
class ReportCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;

  const ReportCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(padding: padding, child: child),
    );
  }
}

class _ActivitiesCompletedChart extends StatelessWidget {
  final ReportController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return ReportCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => GraphHeader(
              title: 'Activities Completed',
              selectedValue: controller.activityChartPeriod.value,
              onChanged: (val) {
                controller.activityChartPeriod.value = val;
              },
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 240,
            child: Obx(() {
              if (controller.activitiesChartData.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.bar_chart, size: 48, color: Colors.grey[300]),
                      const SizedBox(height: 8),
                      Text(
                        "No data for this period",
                        style: TextStyle(color: Colors.grey[500], fontSize: 14),
                      ),
                    ],
                  ),
                );
              }

              // Make the chart horizontally scrollable to accommodate wider bars
              // Compute a width based on number of groups to keep spacing consistent
              final groups = controller.activitiesChartData;
              final groupCount = groups.length == 0 ? 1 : groups.length;
              // Each group will get 48px for bar width + spacing; clamp min width to screen
              final estimatedWidth = max(
                MediaQuery.of(context).size.width,
                groupCount * 48.0 + (groupCount + 1) * 6.0,
              );

              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  // Add top padding so the top-most Y axis label is not clipped
                  padding: const EdgeInsets.only(
                    top: 24.0,
                    right: 8.0,
                    bottom: 8.0,
                  ),
                  child: SizedBox(
                    width: estimatedWidth,
                    child: BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceBetween,
                        barTouchData: BarTouchData(
                          enabled: true,
                          touchTooltipData: BarTouchTooltipData(
                            getTooltipColor: (group) => AppColors.textPrimary,
                            tooltipPadding: const EdgeInsets.symmetric(
                              vertical: 8,
                              horizontal: 16,
                            ),
                            tooltipBorderRadius: BorderRadius.circular(12),
                            getTooltipItem: (group, groupIndex, rod, rodIndex) {
                              final period =
                                  controller.activityChartPeriod.value;

                              String title;
                              if (period == 'This Month' ||
                                  period == 'Last Month') {
                                final startDate = controller.getStartDate(
                                  period,
                                );
                                final monthStart = DateTime(
                                  startDate.year,
                                  startDate.month,
                                  1,
                                );
                                final date = monthStart.add(
                                  Duration(days: group.x),
                                );
                                title = DateFormat.yMMMd().format(date);
                              } else if (period.contains('Week')) {
                                // Map weekday index (0..6) to names
                                final weekdays = [
                                  'Sun',
                                  'Mon',
                                  'Tue',
                                  'Wed',
                                  'Thu',
                                  'Fri',
                                  'Sat',
                                ];
                                final idx = group.x % weekdays.length;
                                title = weekdays[idx];
                              } else {
                                // For monthly aggregated charts, show month name
                                final now = DateTime.now();
                                DateTime startMonth;
                                if (period == 'Last 6 Months') {
                                  startMonth = DateTime(
                                    now.year,
                                    now.month - 5,
                                    1,
                                  );
                                } else if (period == 'This Year') {
                                  startMonth = DateTime(now.year, 1, 1);
                                } else {
                                  startMonth = DateTime(now.year, 1, 1);
                                }
                                final monthDate = DateTime(
                                  startMonth.year,
                                  startMonth.month + group.x,
                                  1,
                                );
                                title = DateFormat.yMMM().format(monthDate);
                              }

                              return BarTooltipItem(
                                '$title\n${rod.toY.round()} activities',
                                const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              );
                            },
                          ),
                        ),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                String text = '';
                                final period =
                                    controller.activityChartPeriod.value;

                                if (period == 'Today') {
                                  // Show hour labels (0-23)
                                  final hour = value.toInt();
                                  if (hour % 4 == 0) {
                                    text = '${hour}h';
                                  }
                                } else if (period.contains('Week')) {
                                  // Show weekday labels
                                  final weekdays = [
                                    'Sun',
                                    'Mon',
                                    'Tue',
                                    'Wed',
                                    'Thu',
                                    'Fri',
                                    'Sat',
                                  ];
                                  if (value.toInt() >= 0 &&
                                      value.toInt() < weekdays.length) {
                                    text = weekdays[value.toInt()];
                                  }
                                } else if (period == 'This Month' ||
                                    period == 'Last Month') {
                                  // Show day numbers for monthly view.
                                  // Compute the chart's start date: for 'This Month' start at first day
                                  // of the month; for 'Last Month' the controller already provides
                                  // the appropriate startDate via getStartDate.
                                  final startDate = controller.getStartDate(
                                    period,
                                  );
                                  final monthStart = DateTime(
                                    startDate.year,
                                    startDate.month,
                                    1,
                                  );
                                  final date = monthStart.add(
                                    Duration(days: value.toInt()),
                                  );
                                  // Always show day numbers for monthly charts
                                  text = '${date.day}';
                                } else {
                                  // Show month labels for year/longer periods
                                  final labels = [
                                    'Jan',
                                    'Feb',
                                    'Mar',
                                    'Apr',
                                    'May',
                                    'Jun',
                                    'Jul',
                                    'Aug',
                                    'Sep',
                                    'Oct',
                                    'Nov',
                                    'Dec',
                                  ];

                                  // Determine the start month for the current chart data so labels align
                                  DateTime startMonth;
                                  if (period == 'Last 6 Months') {
                                    final now = DateTime.now();
                                    // Last 6 months should include current month as the last item
                                    startMonth = DateTime(
                                      now.year,
                                      now.month - 5,
                                      1,
                                    );
                                  } else if (period == 'This Year') {
                                    final now = DateTime.now();
                                    startMonth = DateTime(now.year, 1, 1);
                                  } else {
                                    // Fallback: assume start at January of current year
                                    final now = DateTime.now();
                                    startMonth = DateTime(now.year, 1, 1);
                                  }

                                  final totalGroups =
                                      controller.activitiesChartData.length;
                                  final idx = value.toInt();
                                  if (idx >= 0 && idx < totalGroups) {
                                    final monthIndex =
                                        (startMonth.month - 1 + idx) % 12;
                                    text = labels[monthIndex];
                                  }
                                }

                                return SideTitleWidget(
                                  space: 8.0,
                                  meta: meta,
                                  child: Text(
                                    text,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                );
                              },
                              reservedSize: 32,
                            ),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 32,
                              interval: _getLeftAxisInterval(
                                controller.activitiesChartData,
                              ),
                              getTitlesWidget: (value, meta) {
                                return Text(
                                  value.toInt().toString(),
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: AppColors.textPrimary,
                                  ),
                                );
                              },
                            ),
                          ),
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                        ),
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          horizontalInterval: _getLeftAxisInterval(
                            controller.activitiesChartData,
                          ),
                          getDrawingHorizontalLine: (value) {
                            return FlLine(
                              color: Colors.grey[200]!,
                              strokeWidth: 1,
                            );
                          },
                        ),
                        borderData: FlBorderData(show: false),
                        // Use modified groups with larger bar width and spacing
                        barGroups:
                            controller.activitiesChartData.map((g) {
                              return BarChartGroupData(
                                x: g.x,
                                barsSpace: 12,
                                barRods:
                                    g.barRods.map((rod) {
                                      return BarChartRodData(
                                        toY: rod.toY,
                                        color: rod.color,
                                        width: 28,
                                        borderRadius: BorderRadius.circular(6),
                                      );
                                    }).toList(),
                              );
                            }).toList(),
                        maxY: _getMaxY(controller.activitiesChartData),
                      ),

                      swapAnimationDuration: const Duration(milliseconds: 400),
                      swapAnimationCurve: Curves.easeInOutCubic,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  double _getMaxY(List<BarChartGroupData> data) {
    if (data.isEmpty) return 10;
    final maxValue = data.map((e) => e.barRods.first.toY).reduce(max);
    return (maxValue * 1.2).ceilToDouble();
  }

  double _getLeftAxisInterval(List<BarChartGroupData> data) {
    final maxY = _getMaxY(data);
    if (maxY <= 5) return 1;
    if (maxY <= 10) return 2;
    if (maxY <= 20) return 5;
    return 10;
  }
}

class _CompletionRateChart extends StatelessWidget {
  final ReportController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return ReportCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => GraphHeader(
              title: 'Completion Rate',
              selectedValue: controller.completionRateChartPeriod.value,
              onChanged: (val) {
                controller.completionRateChartPeriod.value = val;
              },
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 240,
            child: Obx(() {
              if (controller.completionRateChartData.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.show_chart, size: 48, color: Colors.grey[300]),
                      const SizedBox(height: 8),
                      Text(
                        "Not enough data for this period",
                        style: TextStyle(color: Colors.grey[500], fontSize: 14),
                      ),
                    ],
                  ),
                );
              }

              final spots = controller.completionRateChartData;

              // Determine period and configure axis ranges/labels similar to Activities chart
              final period = controller.completionRateChartPeriod.value;
              double minX = 0;
              double maxX = 12;
              double leftInterval = 20;

              if (period == 'Today') {
                minX = 0;
                maxX = 23;
                leftInterval = 20;
              } else if (period.contains('Week')) {
                // Use actual spots length so 'This Week' (up to today) shows the final day
                minX = 0;
                maxX = (spots.length - 1).toDouble();
                leftInterval = 20;
              } else if (period == 'This Month' || period == 'Last Month') {
                // number of days corresponds to spots length
                minX = 0;
                maxX = (spots.length - 1).toDouble();
                leftInterval = 20;
              } else if (period == 'Last 6 Months') {
                minX = 0;
                maxX = 5;
                leftInterval = 20;
              } else if (period == 'This Year') {
                minX = 0;
                maxX = (spots.length - 1).toDouble();
                leftInterval = 20;
              } else {
                minX = 0;
                maxX = (spots.length - 1).toDouble();
                leftInterval = 20;
              }

              String bottomTitleForValue(double value) {
                if (period == 'Today') {
                  final hour = value.toInt();
                  return hour % 4 == 0 ? '${hour}h' : '';
                } else if (period.contains('Week')) {
                  // Map index (0..) to actual weekday starting from period start
                  final startWeek = controller.getStartDate(period);
                  final date = DateTime(
                    startWeek.year,
                    startWeek.month,
                    startWeek.day + value.toInt(),
                  );
                  final weekdays = [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                  ];
                  return weekdays[date.weekday % 7];
                } else if (period == 'This Month' || period == 'Last Month') {
                  final startDate = controller.getStartDate(period);
                  final monthStart = DateTime(
                    startDate.year,
                    startDate.month,
                    1,
                  );
                  final date = monthStart.add(Duration(days: value.toInt()));
                  return '${date.day}';
                } else {
                  final labels = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ];
                  DateTime startMonth;
                  final now = DateTime.now();
                  if (period == 'Last 6 Months') {
                    startMonth = DateTime(now.year, now.month - 5, 1);
                  } else if (period == 'This Year') {
                    startMonth = DateTime(now.year, 1, 1);
                  } else {
                    startMonth = DateTime(now.year, 1, 1);
                  }
                  final idx = value.toInt();
                  if (idx >= 0 && idx < spots.length) {
                    final monthIndex = (startMonth.month - 1 + idx) % 12;
                    return labels[monthIndex];
                  }
                  return '';
                }
              }

              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: LineChart(
                  LineChartData(
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: false,
                      horizontalInterval: leftInterval,
                      getDrawingHorizontalLine:
                          (value) =>
                              FlLine(color: Colors.grey[200]!, strokeWidth: 1),
                    ),
                    titlesData: FlTitlesData(
                      show: true,
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            final text = bottomTitleForValue(value);
                            return SideTitleWidget(
                              space: 8.0,
                              meta: meta,
                              child: Text(
                                text,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            );
                          },
                          reservedSize: 32,
                          interval:
                              (maxX - minX) > 6
                                  ? ((maxX - minX) / 6).ceilToDouble()
                                  : 1,
                        ),
                      ),
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 40,
                          interval: leftInterval,
                          getTitlesWidget:
                              (value, meta) => Text(
                                '${value.toInt()}%',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                        ),
                      ),
                      topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                    ),
                    borderData: FlBorderData(show: false),
                    minX: minX,
                    maxX: maxX,
                    minY: 0,
                    maxY: 100,
                    lineBarsData: [
                      LineChartBarData(
                        spots: spots,
                        isCurved: true,
                        curveSmoothness: 0.2,
                        color: AppColors.primary,
                        barWidth: 3,
                        isStrokeCapRound: true,
                        dotData: FlDotData(
                          show: true,
                          getDotPainter: (spot, percent, barData, index) {
                            return FlDotCirclePainter(
                              radius: 6,
                              color: Colors.white,
                              strokeWidth: 2,
                              strokeColor: AppColors.primary,
                            );
                          },
                        ),
                        belowBarData: BarAreaData(
                          show: true,
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primary.withOpacity(0.3),
                              AppColors.primary.withOpacity(0.01),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                    lineTouchData: LineTouchData(
                      enabled: true,
                      touchTooltipData: LineTouchTooltipData(
                        getTooltipColor: (spot) => AppColors.textPrimary,
                        tooltipPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        tooltipBorderRadius: BorderRadius.circular(12),
                        getTooltipItems: (touchedSpots) {
                          return touchedSpots.map((spot) {
                            // Build tooltip title based on period and spot.x
                            String title;
                            if (period == 'This Month' ||
                                period == 'Last Month') {
                              final startDate = controller.getStartDate(period);
                              final monthStart = DateTime(
                                startDate.year,
                                startDate.month,
                                1,
                              );
                              final date = monthStart.add(
                                Duration(days: spot.x.toInt()),
                              );
                              title = DateFormat.yMMMd().format(date);
                            } else if (period.contains('Week')) {
                              final startWeek = controller.getStartDate(period);
                              final date = DateTime(
                                startWeek.year,
                                startWeek.month,
                                startWeek.day + spot.x.toInt(),
                              );
                              title = DateFormat.E().format(date);
                            } else if (period == 'Today') {
                              title = '${spot.x.toInt()}h';
                            } else {
                              // Monthly labels based on start month
                              final now = DateTime.now();
                              DateTime startMonth;
                              if (period == 'Last 6 Months') {
                                startMonth = DateTime(
                                  now.year,
                                  now.month - 5,
                                  1,
                                );
                              } else if (period == 'This Year') {
                                startMonth = DateTime(now.year, 1, 1);
                              } else {
                                startMonth = DateTime(now.year, 1, 1);
                              }
                              final monthDate = DateTime(
                                startMonth.year,
                                startMonth.month + spot.x.toInt(),
                                1,
                              );
                              title = DateFormat.yMMM().format(monthDate);
                            }

                            return LineTooltipItem(
                              '$title\n${spot.y.toStringAsFixed(1)}%',
                              const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            );
                          }).toList();
                        },
                      ),
                      handleBuiltInTouches: true,
                    ),
                  ),
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOutCubic,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _CalendarStatsWidget extends StatelessWidget {
  final ReportController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return ReportCard(
      child: Obx(() {
        // Generate month options for the picker
        final now = DateTime.now();
        final List<String> monthOptions = [];
        for (int i = 0; i < 12; i++) {
          final date = DateTime(now.year, now.month - i, 1);
          monthOptions.add(DateFormat.yMMMM().format(date));
        }

        return Column(
          children: [
            GraphHeader(
              title: 'Calendar Stats',
              selectedValue: DateFormat.yMMMM().format(
                controller.calendarDisplayMonth.value,
              ),
              customItems: monthOptions,
              onChanged: (val) {
                final parsedDate = DateFormat.yMMMM().parse(val);
                controller.calendarDisplayMonth.value = DateTime(
                  parsedDate.year,
                  parsedDate.month,
                  1,
                );
              },
            ),
            const SizedBox(height: 16),
            _CalendarView(),
          ],
        );
      }),
    );
  }
}

class _CalendarView extends StatelessWidget {
  final ReportController controller = Get.find();
  final List<String> weekdayNames = const [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final calendarDays = _getCalendarDays(
        controller.calendarDisplayMonth.value,
      );

      return Column(
        children: [
          // Weekday headers
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children:
                weekdayNames
                    .map(
                      (day) => SizedBox(
                        width: 38,
                        child: Center(
                          child: Text(
                            day,
                            style: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    )
                    .toList(),
          ),
          const SizedBox(height: 12),

          // Calendar grid
          GridView.builder(
            shrinkWrap: true,
            padding: EdgeInsets.zero,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 12,
              crossAxisSpacing: 8,
            ),
            itemCount: calendarDays.length,
            itemBuilder: (context, index) {
              final date = calendarDays[index];
              final isCurrentMonth =
                  date.month == controller.calendarDisplayMonth.value.month;
              final normalizedDate = DateTime(date.year, date.month, date.day);
              final completionRate =
                  controller.calendarStatsData[normalizedDate];
              final isToday = normalizedDate.isAtSameMomentAs(
                DateTime(
                  DateTime.now().year,
                  DateTime.now().month,
                  DateTime.now().day,
                ),
              );

              return AnimatedOpacity(
                duration: const Duration(milliseconds: 300),
                opacity: isCurrentMonth ? 1.0 : 0.8,
                child: SizedBox(
                  width: 42,
                  height: 42,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Completion circle
                      if (completionRate != null && completionRate >= 0)
                        TweenAnimationBuilder<double>(
                          tween: Tween<double>(begin: 0.0, end: completionRate),
                          duration: Duration(milliseconds: 500 + (index * 10)),
                          curve: Curves.easeOutCubic,
                          builder: (context, value, child) {
                            return SizedBox(
                              width: 42,
                              height: 42,
                              child: CircularProgressIndicator(
                                value: value,
                                strokeWidth: isToday ? 4 : 3,
                                backgroundColor: const Color(0xFFEBEDFC),
                                valueColor: const AlwaysStoppedAnimation<Color>(
                                  AppColors.primary,
                                ),
                              ),
                            );
                          },
                        ),

                      // Day number
                      Text(
                        date.day.toString(),
                        style: TextStyle(
                          color:
                              isToday
                                  ? AppColors.primary
                                  : (isCurrentMonth
                                      ? AppColors.textPrimary
                                      : Colors.grey[600]),
                          fontWeight:
                              isToday ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      );
    });
  }

  List<DateTime> _getCalendarDays(DateTime displayMonth) {
    final firstDayOfMonth = DateTime(displayMonth.year, displayMonth.month, 1);
    final daysInMonth =
        DateTime(displayMonth.year, displayMonth.month + 1, 0).day;
    final firstWeekday = firstDayOfMonth.weekday % 7;

    final List<DateTime> days = [];

    for (int i = 0; i < firstWeekday; i++) {
      days.add(firstDayOfMonth.subtract(Duration(days: firstWeekday - i)));
    }

    for (int i = 0; i < daysInMonth; i++) {
      days.add(firstDayOfMonth.add(Duration(days: i)));
    }

    final remaining = 42 - days.length;
    final lastDay = days.last;
    for (int i = 1; i <= remaining; i++) {
      days.add(lastDay.add(Duration(days: i)));
    }

    return days;
  }
}

class _MoodChartWidget extends StatelessWidget {
  final ReportController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return ReportCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Obx(
            () => GraphHeader(
              title: 'Mood Over Time',
              selectedValue: controller.moodChartPeriod.value,
              onChanged: (val) {
                controller.moodChartPeriod.value = val;
              },
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 240,
            child: Obx(() {
              if (controller.moodChartData.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.mood, size: 48, color: Colors.grey[300]),
                      const SizedBox(height: 8),
                      Text(
                        "No mood entries for this period",
                        style: TextStyle(color: Colors.grey[500], fontSize: 14),
                      ),
                    ],
                  ),
                );
              }

              final spots = controller.moodChartData;
              final period = controller.moodChartPeriod.value;

              // Configure x-axis ranges similar to CompletionRate chart
              double minX = 0;
              double maxX = 12;

              if (period == 'Today') {
                minX = 0;
                maxX = 23;
              } else if (period.contains('Week')) {
                // Determine number of days in the week range from startWeek to endWeek
                final startWeek = controller.getStartDate(period);
                final endWeek =
                    period == 'This Week'
                        ? DateTime(
                          DateTime.now().year,
                          DateTime.now().month,
                          DateTime.now().day,
                        )
                        : startWeek.add(const Duration(days: 6));
                maxX = (endWeek.difference(startWeek).inDays).toDouble();
              } else if (period == 'This Month' || period == 'Last Month') {
                final startDate = controller.getStartDate(period);
                final monthStart = DateTime(startDate.year, startDate.month, 1);
                final monthLastDay =
                    period == 'This Month'
                        ? DateTime(
                          DateTime.now().year,
                          DateTime.now().month,
                          DateTime.now().day,
                        )
                        : DateTime(monthStart.year, monthStart.month + 1, 0);
                maxX = (monthLastDay.difference(monthStart).inDays).toDouble();
              } else if (period == 'Last 6 Months') {
                minX = 0;
                maxX = 5;
              } else if (period == 'This Year') {
                minX = 0;
                maxX = (spots.length - 1).toDouble();
              } else {
                minX = 0;
                maxX = (spots.length - 1).toDouble();
              }

              String bottomTitleForValue(double value) {
                if (period == 'Today') {
                  final hour = value.toInt();
                  return hour % 4 == 0 ? '${hour}h' : '';
                } else if (period.contains('Week')) {
                  final startWeek = controller.getStartDate(period);
                  final date = DateTime(
                    startWeek.year,
                    startWeek.month,
                    startWeek.day + value.toInt(),
                  );
                  final weekdays = [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                  ];
                  return weekdays[date.weekday % 7];
                } else if (period == 'This Month' || period == 'Last Month') {
                  final startDate = controller.getStartDate(period);
                  final monthStart = DateTime(
                    startDate.year,
                    startDate.month,
                    1,
                  );
                  final date = monthStart.add(Duration(days: value.toInt()));
                  return '${date.day}';
                } else {
                  final labels = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ];
                  DateTime startMonth;
                  final now = DateTime.now();
                  if (period == 'Last 6 Months') {
                    startMonth = DateTime(now.year, now.month - 5, 1);
                  } else if (period == 'This Year') {
                    startMonth = DateTime(now.year, 1, 1);
                  } else {
                    startMonth = DateTime(now.year, 1, 1);
                  }
                  final idx = value.toInt();
                  if (idx >= 0 && idx < spots.length) {
                    final monthIndex = (startMonth.month - 1 + idx) % 12;
                    return labels[monthIndex];
                  }
                  return '';
                }
              }

              String tooltipTitleForSpot(FlSpot spot) {
                if (period == 'This Month' || period == 'Last Month') {
                  final startDate = controller.getStartDate(period);
                  final monthStart = DateTime(
                    startDate.year,
                    startDate.month,
                    1,
                  );
                  final date = monthStart.add(Duration(days: spot.x.toInt()));
                  return DateFormat.yMMMd().format(date);
                } else if (period.contains('Week')) {
                  final startWeek = controller.getStartDate(period);
                  final date = DateTime(
                    startWeek.year,
                    startWeek.month,
                    startWeek.day + spot.x.toInt(),
                  );
                  return DateFormat.E().format(date);
                } else if (period == 'Today') {
                  return '${spot.x.toInt()}h';
                } else {
                  final now = DateTime.now();
                  DateTime startMonth;
                  if (period == 'Last 6 Months') {
                    startMonth = DateTime(now.year, now.month - 5, 1);
                  } else if (period == 'This Year') {
                    startMonth = DateTime(now.year, 1, 1);
                  } else {
                    startMonth = DateTime(now.year, 1, 1);
                  }
                  final monthDate = DateTime(
                    startMonth.year,
                    startMonth.month + spot.x.toInt(),
                    1,
                  );
                  return DateFormat.yMMM().format(monthDate);
                }
              }

              final moodLabels = [
                '',
                'Bad',
                'Not Good',
                'Okay',
                'Good',
                'Great',
              ];
              final moodEmojis = [
                '',
                AppImages.bad,
                AppImages.notGood,
                AppImages.okay,
                AppImages.good,
                AppImages.great,
              ];

              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: LineChart(
                  LineChartData(
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: false,
                      horizontalInterval: 1,
                      getDrawingHorizontalLine:
                          (value) =>
                              FlLine(color: Colors.grey[100]!, strokeWidth: 1),
                    ),
                    titlesData: FlTitlesData(
                      show: true,
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 40,
                          interval: 1,
                          getTitlesWidget: (value, meta) {
                            final intVal = value.toInt();
                            final emoji =
                                (intVal >= 1 && intVal <= 5)
                                    ? moodEmojis[intVal]
                                    : '';
                            if (emoji.isEmpty) return const SizedBox.shrink();
                            return Padding(
                              padding: const EdgeInsets.only(right: 4),
                              child: Image.asset(emoji, width: 24, height: 24),
                            );
                          },
                        ),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            final text = bottomTitleForValue(value);
                            return SideTitleWidget(
                              space: 8.0,
                              meta: meta,
                              child: Text(
                                text,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            );
                          },
                          reservedSize: 32,
                          interval:
                              (maxX - minX) > 6
                                  ? ((maxX - minX) / 6).ceilToDouble()
                                  : 1,
                        ),
                      ),
                      topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                    ),
                    borderData: FlBorderData(show: false),
                    minY: 1,
                    maxY: 5,
                    minX: minX,
                    maxX: maxX,
                    lineBarsData: [
                      LineChartBarData(
                        spots: spots,
                        isCurved: true,
                        curveSmoothness: 0.2,
                        color: AppColors.primary,
                        barWidth: 3,
                        isStrokeCapRound: true,
                        dotData: FlDotData(
                          show: true,
                          getDotPainter: (spot, percent, barData, index) {
                            return FlDotCirclePainter(
                              radius: 6,
                              color: Colors.white,
                              strokeWidth: 2,
                              strokeColor: AppColors.primary,
                            );
                          },
                        ),
                        belowBarData: BarAreaData(
                          show: true,
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primary.withOpacity(0.3),
                              AppColors.primary.withOpacity(0.01),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                    lineTouchData: LineTouchData(
                      enabled: true,
                      touchTooltipData: LineTouchTooltipData(
                        getTooltipColor: (spot) => AppColors.primary,
                        tooltipPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        tooltipBorderRadius: BorderRadius.circular(12),
                        getTooltipItems: (touchedSpots) {
                          return touchedSpots.map((spot) {
                            final label =
                                (spot.y <= 0 || spot.y.isNaN)
                                    ? 'No data'
                                    : moodLabels[spot.y.round()];
                            final title = tooltipTitleForSpot(spot);
                            return LineTooltipItem(
                              '$title\n$label',
                              const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            );
                          }).toList();
                        },
                      ),
                    ),
                  ),
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOutCubic,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
