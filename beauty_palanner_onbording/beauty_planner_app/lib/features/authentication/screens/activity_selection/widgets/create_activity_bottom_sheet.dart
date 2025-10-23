import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';
import '../../../../../common/widgets/loaders/loaders.dart';
import '../../../../../data/models/category_model.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/icons.dart';
import '../../../../../utils/validators/validation.dart';
import '../../../../personalization/controllers/user_controller.dart';
import '../../../controllers/activity_schedule/schedule_controller.dart';
import 'expandable_picker.dart';

class CreateCategoryBottomSheet extends StatefulWidget {
  const CreateCategoryBottomSheet({super.key});

  @override
  State<CreateCategoryBottomSheet> createState() =>
      _CreateCategoryBottomSheetState();
}

class _CreateCategoryBottomSheetState extends State<CreateCategoryBottomSheet> {
  final categoryNameController = TextEditingController();
  final searchColorController = TextEditingController();
  final searchIconController = TextEditingController();

  // --- State for selections ---
  Color? selectedColor;
  String? selectedIcon;

  GlobalKey<FormState> formKey = GlobalKey<FormState>();

  void _createCategory() {
    if (UserController.instance.user.value.categories.toList().any(
      (c) => c.name == categoryNameController.text,
    )) {
      Loaders.customToast(message: 'This category already exists');
    } else {
      if (formKey.currentState!.validate() != true) {
        return;
      }
      if (selectedColor == null) {
        Get.snackbar(
          'Error',
          'Please select a color.',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }
      if (selectedIcon == null) {
        Get.snackbar(
          'Error',
          'Please select an icon.',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }

      ScheduleController.instance.categoryNamesForDropdown.add(
        categoryNameController.text,
      );

      UserController.instance.user.value.categories.add(
        CategoryModel(
          id: const Uuid().v4(),
          name: categoryNameController.text,
          color: selectedColor!,
          illustration: selectedIcon!,
        ),
      );

      UserController.instance.updateUserCategories(
        UserController.instance.user.value.categories,
      );

      ScheduleController.instance.selectedCategory.value =
          categoryNameController.text;
      ScheduleController.instance.x.value++;

      Get.back();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom, // For keyboard
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Form(
        key: formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Text(
                'Create New Category',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Category Name
            const Text(
              ' Category Name',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: categoryNameController,
              validator:
                  (value) =>
                      MyValidator.validateEmptyText('Category Name', value),
              decoration: InputDecoration(
                hintText: 'Type the name',
                filled: true,
                fillColor: Colors.white,
                hintStyle: TextStyle(color: Colors.grey[600]!),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF8A60FF)),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Color Picker
            ExpandablePicker<Color>(
              title: 'Color',
              items: AppColors.colorMap,
              searchController: searchColorController,
              onItemSelected: (color) => setState(() => selectedColor = color),
              itemBuilder:
                  (color) => Container(
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border:
                          selectedColor == color
                              ? Border.all(
                                color: AppColors.textPrimary,
                                width: 3,
                              )
                              : null,
                    ),
                    child: Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                  ),
              filterLogic: (key, value, query) {
                return key.toLowerCase().contains(query.toLowerCase());
              },
              selectedItem: selectedColor,
            ),
            const SizedBox(height: 24),

            // Icon Picker
            ExpandablePicker<String>(
              title: 'Icon',
              items: ActivityIcons.icons,
              searchController: searchIconController,
              onItemSelected: (icon) => setState(() => selectedIcon = icon),
              itemBuilder:
                  (icon) => Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border:
                          selectedIcon == icon
                              ? Border.all(
                                color: AppColors.textPrimary,
                                width: 3,
                              )
                              : null,
                    ),
                    child: Container(
                      width: 46,
                      height: 46,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: SvgPicture.asset(icon, color: Colors.white),
                    ),
                  ),
              filterLogic: (key, value, query) {
                return key.toLowerCase().contains(query.toLowerCase());
              },
              selectedItem: selectedIcon,
            ),
            const SizedBox(height: 32),

            // Action Buttons
            SizedBox(
              height: 50,
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _createCategory,
                      child: const Text('OK'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
