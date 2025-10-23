import 'package:flutter/material.dart';

import '../../../utils/constants/sizes.dart';
import 'shimmer_loader.dart';

class CategoryShimmer extends StatelessWidget {
  const CategoryShimmer({super.key, this.itemCount = 6});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 80,
      child: ListView.separated(
        itemCount: itemCount,
        scrollDirection: Axis.horizontal,
        separatorBuilder: (_, __) =>
            const SizedBox(width: AppSizes.spaceBtnItems),
        itemBuilder: (_, idx) {
          return const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              //image
              ShimmerEffect(height: 55, width: 55, radius: 55),
              SizedBox(height: AppSizes.spaceBtnItems / 2),

              //text
              //ShimmerEffect(height: 55, width: 2)
            ],
          );
        },
      ),
    );
  }
}
