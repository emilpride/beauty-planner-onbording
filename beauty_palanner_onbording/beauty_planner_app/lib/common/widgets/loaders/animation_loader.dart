import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../../../utils/constants/colors.dart';
import '../../../utils/constants/sizes.dart';

class AnimationLoaderWidget extends StatelessWidget {
  const AnimationLoaderWidget(
      {super.key,
      required this.text,
      required this.animation,
      this.showAction = false,
      this.actionText,
      this.onActionPressed});

  final String text;
  final String animation;
  final bool showAction;
  final String? actionText;
  final VoidCallback? onActionPressed;
  @override
  Widget build(BuildContext context) {
    // final dark = MyHelperFunctions.isDarkMode(context);
    return Center(
      child: Column(
        children: [
          const SizedBox(height: 100),
          Lottie.asset(animation, width: MediaQuery.of(context).size.width),
          const SizedBox(height: AppSizes.defaultSpace),
          const SizedBox(height: AppSizes.defaultSpace),
          // showAction
          //     ? SizedBox(
          //         width: 250,
          //         child: OutlinedButton(
          //           onPressed: onActionPressed,
          //           style: OutlinedButton.styleFrom(
          //               backgroundColor: AppColors.dark),
          //           child: Text(
          //             text,
          //             style: Theme.of(context)
          //                 .textTheme
          //                 .bodyMedium!
          //                 .apply(color: AppColors.light),
          //           ),
          //         ),
          //       )
          //     : const SizedBox()
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              text,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall!.apply(
                    color: AppColors.black,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
