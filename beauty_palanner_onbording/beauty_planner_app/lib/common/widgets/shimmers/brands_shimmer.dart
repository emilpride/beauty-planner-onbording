import 'package:flutter/material.dart';

import '../layouts/grid_layout.dart';
import 'shimmer_loader.dart';

class BrandsShimmer extends StatelessWidget {
  const BrandsShimmer({super.key, this.itemCount = 4});

  final int itemCount;

  @override
  Widget build(BuildContext context) {
    return GridLayout(
      mainAxisExtent: 80,
      itemCount: itemCount,
      itemBuilder: (p0, p1) => const ShimmerEffect(height: 300, width: 80),
    );
  }
}
