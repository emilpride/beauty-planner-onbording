import 'package:flutter/material.dart';

import '../../../utils/constants/sizes.dart';
import 'shimmer_loader.dart';

class ListTileShimmer extends StatelessWidget {
  const ListTileShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Row(
          children: [
            ShimmerEffect(height: 50, width: 50, radius: 50),
            SizedBox(width: AppSizes.spaceBtnItems),
            Column(
              children: [
                ShimmerEffect(height: 15, width: 100),
                SizedBox(height: AppSizes.spaceBtnItems / 2),
                ShimmerEffect(height: 12, width: 80)
              ],
            )
          ],
        ),
      ],
    );
  }
}
