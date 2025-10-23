import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:timeline_tile/timeline_tile.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';

class TimelineWidget extends StatefulWidget {
  const TimelineWidget({
    super.key,
    this.isFirst = false,
    this.isLast = false,
    required this.isPast,
    required this.title,
    this.subTitle = '',
    this.image = '',
  });

  final bool isFirst;
  final bool isLast;
  final bool isPast;
  final String title, subTitle, image;

  @override
  State<TimelineWidget> createState() => _TimelineWidgetState();
}

class _TimelineWidgetState extends State<TimelineWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _opacityAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_animationController);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _onVisibilityChanged(VisibilityInfo info) {
    if (info.visibleFraction > 0.5) {
      _animationController.forward();
    } else {
      _animationController.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    return VisibilityDetector(
      key: Key(widget.title),
      onVisibilityChanged: _onVisibilityChanged,
      child: AnimatedBuilder(
        animation: _opacityAnimation,
        builder: (context, child) {
          return Opacity(
            opacity: _opacityAnimation.value,
            child: SizedBox(
              height: widget.isLast ? 125 : 105,
              child: TimelineTile(
                isFirst: widget.isFirst,
                isLast: widget.isLast,
                hasIndicator: true,
                beforeLineStyle: LineStyle(
                  color:
                      widget.isPast
                          ? AppColors.primary
                          : AppColors.primary.withOpacity(0.5),
                  thickness: 4,
                ),
                indicatorStyle: IndicatorStyle(
                  width: 24,
                  height: 24,
                  padding: const EdgeInsets.symmetric(horizontal: AppSizes.sm),
                  drawGap: false,
                  indicator: RoundedContainer(
                    radius: 100,
                    height: 24,
                    width: 24,
                    backgroundColor: Colors.white,
                    child: RoundedContainer(
                      radius: 100,
                      height: 24,
                      width: 24,
                      margin: const EdgeInsets.all(0),
                      padding: const EdgeInsets.all(3),
                      backgroundColor:
                          widget.isPast
                              ? AppColors.primary
                              : AppColors.primary.withOpacity(0.5),
                      child: Center(
                        child: SvgPicture.asset(
                          widget.image,
                          color:
                              widget.isPast
                                  ? AppColors.white
                                  : AppColors.darkGrey,
                        ),
                      ),
                    ),
                  ),
                ),
                endChild: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 39),
                    Text(
                      widget.title,
                      style: const TextStyle(
                        color: AppColors.black,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (widget.subTitle.isNotEmpty)
                      Flexible(
                        child: Text(
                          widget.subTitle,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 3,
                          style: const TextStyle(
                            color: AppColors.black,
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
