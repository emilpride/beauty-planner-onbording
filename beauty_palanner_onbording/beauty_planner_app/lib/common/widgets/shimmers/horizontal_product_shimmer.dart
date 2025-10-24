import 'package:flutter/material.dart';

import '../../../utils/constants/sizes.dart';
import 'shimmer_loader.dart';

class HorizontalProductShimmer extends StatelessWidget {
  const HorizontalProductShimmer({super.key, this.itemCount = 4});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSizes.spaceBtnSections),
      height: 120,
      child: ListView.separated(
        itemCount: itemCount,
        shrinkWrap: true,
        scrollDirection: Axis.horizontal,
        separatorBuilder: (context, index) =>
            const SizedBox(width: AppSizes.spaceBtnItems),
        itemBuilder: (context, index) => const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ShimmerEffect(height: 120, width: 120),
            SizedBox(width: AppSizes.spaceBtnItems),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: AppSizes.spaceBtnItems / 2),
                ShimmerEffect(height: 15, width: 160),
                SizedBox(height: AppSizes.spaceBtnItems / 2),
                ShimmerEffect(height: 15, width: 110),
                SizedBox(height: AppSizes.spaceBtnItems / 2),
                ShimmerEffect(height: 15, width: 80),
                Spacer()
              ],
            )
          ],
        ),
      ),
    );
  }
}
