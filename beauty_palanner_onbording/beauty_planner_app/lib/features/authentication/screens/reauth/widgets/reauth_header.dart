import 'package:flutter/material.dart';
import '../../../../../utils/constants/sizes.dart';

class ReauthHeader extends StatelessWidget {
  const ReauthHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: AppSizes.spaceBtnSections),
        Text(
          'Please reauthenticate to continue',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: AppSizes.spaceBtnSections),
      ],
    );
  }
}
