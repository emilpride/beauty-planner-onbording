import 'package:flutter/material.dart';

import '../../../utils/constants/sizes.dart';
import 'shimmer_loader.dart';

class BoxesShimmer extends StatelessWidget {
  const BoxesShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: ShimmerEffect(height: 110, width: 150)),
            SizedBox(width: AppSizes.spaceBtnItems),
            Expanded(child: ShimmerEffect(height: 110, width: 150)),
            SizedBox(width: AppSizes.spaceBtnItems),
            Expanded(child: ShimmerEffect(height: 110, width: 150)),
          ],
        )
      ],
    );
  }
}
