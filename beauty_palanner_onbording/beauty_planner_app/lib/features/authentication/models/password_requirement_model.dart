// Model for password requirements
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../utils/constants/colors.dart';

class PasswordRequirement {
  final String label;
  final RxBool met;
  Rx<Color> backgroundColor = AppColors.lightContainer.obs;
  Rx<Color> color = AppColors.textPrimary.obs;

  PasswordRequirement({required this.label, required this.met});
}
