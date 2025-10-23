import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';

class FeaturesCard extends StatelessWidget {
  const FeaturesCard({super.key, required this.image, required this.title});

  final String image, title;

  @override
  Widget build(BuildContext context) {
    return RoundedContainer(
      backgroundColor: AppColors.primary.withOpacity(0.2),
      padding: const EdgeInsets.all(AppSizes.md),
      child: Row(
        children: [
          image.endsWith('.png')
              ? ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset(image, width: 44, height: 44),
              )
              : SvgPicture.asset(image, width: 44, height: 44),
          const SizedBox(width: AppSizes.spaceBtnItems),
          Flexible(
            child: Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
            ),
          ),
        ],
      ),
    );
  }
}
