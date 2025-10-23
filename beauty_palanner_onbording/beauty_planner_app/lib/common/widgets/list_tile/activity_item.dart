import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import '../../../utils/helpers/helper_functions.dart';
import '../custom_shapes/containers/rounded_container.dart';
import '../../../utils/constants/image_strings.dart';
import '../../../utils/constants/sizes.dart';
import '../../../data/models/activity_model.dart';

class ActivityItem extends StatelessWidget {
  const ActivityItem({
    super.key,
    required this.activity,
    this.showRecommended = true,
    required this.onTap,
    this.showTime = false,
  });

  final ActivityModel activity;
  final bool showRecommended;
  final VoidCallback onTap;
  final bool showTime;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: activity.activeStatus ? 1.0 : 0.6,
        child: AnimatedContainer(
          height: 70,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: activity.color!.withOpacity(0.5),
            borderRadius: BorderRadius.circular(100),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                children: [
                  RoundedContainer(
                    radius: 100,
                    width: 48,
                    height: 48,
                    backgroundColor: activity.color!,
                    child: Center(
                      child: SvgPicture.asset(
                        activity.illustration!,
                        width: 24,
                        height: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activity.name!,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      showTime
                          ? Text(
                            MyHelperFunctions.timeOfDayToString(
                              activity.time!.value,
                            ),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.black,
                            ),
                          )
                          : const SizedBox.shrink(),
                    ],
                  ),
                  const Spacer(),
                  if (activity.isRecommended && showRecommended)
                    Column(
                      // crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        SvgPicture.asset(
                          AppImages.recommendedStar,
                          width: 24,
                          height: 24,
                        ),
                        const Text(
                          'Recommended',
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w700,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(width: AppSizes.xs),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
