import 'package:flutter/material.dart';

import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../utils/constants/sizes.dart';
import 'widgets/reauth_form.dart';
import 'widgets/reauth_header.dart';

class ReauthScreen extends StatelessWidget {
  const ReauthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: BMAppbar(title: 'Reauthenticate'),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(AppSizes.md),
          child: Column(
            children: [
              ReauthHeader(),

              //Form
              // const ReauthForm(),
              SizedBox(height: AppSizes.spaceBtnSections),
            ],
          ),
        ),
      ),
    );
  }
}
