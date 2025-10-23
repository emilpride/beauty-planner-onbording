import 'package:flutter/material.dart';

import '../../data/models/category_model.dart';
import 'image_strings.dart';

class Categories {
  static List<CategoryModel> get allCategories => [
    CategoryModel(
      id: '1',
      name: 'Skin',
      illustration: AppImages.deepHydration,
      color: const Color(0xFF2AC4CF),
    ),
    CategoryModel(
      id: '2',
      name: 'Hair',
      illustration: AppImages.deepNourishment,
      color: Colors.lightGreen,
    ),
    CategoryModel(
      id: '3',
      name: 'Physical health',
      illustration: AppImages.physics,
      color: const Color(0xFFA162F7),
    ),
    CategoryModel(
      id: '4',
      name: 'Mental wellness',
      illustration: AppImages.psychology,
      color: const Color(0xFFFE7E07),
    ),
    CategoryModel(
      id: '5',
      name: 'Routine',
      illustration: AppImages.timer,
      color: const Color(0xFF2ACF56),
    ),
  ];
}
