import 'package:flutter/widgets.dart';

import '../../../utils/constants/sizes.dart';
import '../layouts/grid_layout.dart';
import 'shimmer_loader.dart';

class VerticalProductShimmer extends StatelessWidget {
  const VerticalProductShimmer({
    super.key,
    this.itemCount = 4,
  });

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return GridLayout(
        itemCount: itemCount,
        itemBuilder: (_, __) => const SizedBox(
              width: 180,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  //image
                  ShimmerEffect(height: 180, width: 180),
                  SizedBox(height: AppSizes.spaceBtnItems),

                  //text
                  ShimmerEffect(height: 15, width: 160),
                  SizedBox(height: AppSizes.spaceBtnItems / 2),
                  ShimmerEffect(height: 15, width: 110),
                ],
              ),
            ));
  }
}
