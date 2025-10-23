import 'package:flutter/material.dart';

import '../../../../../common/widgets/appbar/appbar.dart';
import '../../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../../common/widgets/texts/terms_and_conditions_text.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';

class TermConditionsScreen extends StatelessWidget {
  const TermConditionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: BMAppbar(title: "Terms of Service"),
      backgroundColor: AppColors.light,
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: AppSizes.md),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: AppSizes.spaceBtnSections),
              RoundedContainer(
                backgroundColor: AppColors.white,
                padding: EdgeInsets.all(AppSizes.md),
                child: TermsAndConditionsText(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
