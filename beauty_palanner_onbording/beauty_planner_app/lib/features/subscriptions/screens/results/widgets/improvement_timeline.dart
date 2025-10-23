import 'package:flutter/material.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/constants/sizes.dart';
import 'timeline_widget.dart';

class ImprovementTimeline extends StatefulWidget {
  const ImprovementTimeline({super.key});

  @override
  State<ImprovementTimeline> createState() => _ImprovementTimelineState();
}

class _ImprovementTimelineState extends State<ImprovementTimeline> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RoundedContainer(
      backgroundColor: const Color(0xFFF7F6FF),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.md / 2,
        vertical: 0,
      ),
      child: SingleChildScrollView(
        controller: _scrollController,
        child: const Column(
          children: [
            TimelineWidget(
              isFirst: true,
              isPast: true,
              image: AppImages.tick,
              title: 'Start using the app',
              subTitle:
                  'Get personalized routines for skin, hair, fitness & self-care.',
            ),
            TimelineWidget(
              isPast: true,
              image: AppImages.flag,
              title: 'Stay consistent with your routine',
              subTitle: 'Automatic reminders help you build healthy habits.',
            ),
            TimelineWidget(
              isPast: true,
              image: AppImages.list,
              title: 'Complete daily self-care rituals',
              subTitle: 'Follow your plan to nurture beauty & well-being.',
            ),
            TimelineWidget(
              isPast: true,
              isLast: true,
              image: AppImages.starCircle,
              title: 'Unlock achievements & stay motivated',
              subTitle: 'Reach new milestones as you stick to your routine.',
            ),
            SizedBox(height: AppSizes.md * 2), // Add some space at the end
          ],
        ),
      ),
    );
  }
}
