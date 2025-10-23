import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/dropdowns/custom_dropdown.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../../../utils/validators/validation.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';

class GeneralStep extends StatelessWidget {
  const GeneralStep({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = OnboardingController.instance;

    return SingleChildScrollView(
      child: Form(
        key: controller.generalFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: AppSizes.lg),
            const Text(
              'Tell us about you for personalized recommendations',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 32),
            _buildTextField(label: 'Name', controller: controller.name),
            const SizedBox(height: 24),
            _buildTextField(
              label: 'Age',
              controller: controller.age,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            Obx(
              () => _buildHeightInput(
                label: 'Height',
                controller: controller.height,
                inchesController: controller.inches,
                unit: controller.selectedHeightUnit,
                units: controller.heightUnits,
                onUnitChanged:
                    (value) => controller.selectedHeightUnit.value = value!,
              ),
            ),
            const SizedBox(height: 24),
            _buildWeightInput(
              label: 'Weight',
              controller: controller.weight,
              unit: controller.selectedWeightUnit,
              units: controller.weightUnits,
              onUnitChanged:
                  (value) => controller.selectedWeightUnit.value = value!,
            ),
            const SizedBox(height: 24),
            CustomDropdown(
              label: 'Ethnic group',
              selectedValueRx: controller.selectedEthnicGroup,
              validator:
                  (value) =>
                      MyValidator.validateEmptyText('Ethnic group', value),
              onChangedExternal: (value) {
                controller.selectedEthnicGroup.value = value!;
              },
              items: controller.ethnicGroups,
            ),
            const SizedBox(height: 32),
            // Button now inside the scrollable area
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (controller.generalFormKey.currentState!.validate()) {
                    FocusScope.of(context).unfocus();
                    controller.userModel.value.name = controller.name.text;
                    controller.userModel.value.age = int.parse(
                      controller.age.text,
                    );
                    controller.weightModel.value.weight = double.parse(
                      controller.weight.text,
                    );
                    controller.weightModel.value.weightUnit =
                        controller.selectedWeightUnit.value;

                    controller.heightModel.value.heightUnit =
                        controller.selectedHeightUnit.value;

                    if (controller.selectedHeightUnit.value == 'ft&in') {
                      controller.heightModel.value.height = double.parse(
                        controller.height.text,
                      );
                      controller.heightModel.value.inch = double.parse(
                        controller.inches.text,
                      );
                    } else {
                      controller.heightModel.value.height = double.parse(
                        controller.height.text,
                      );
                    }
                    controller.userModel.value.ethnicity =
                        controller.selectedEthnicGroup.value;

                    log(controller.currentPage.value.toString());

                    controller.nextPage();
                    controller.x.value++;
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  minimumSize: const Size(double.infinity, 45),
                  maximumSize: const Size(double.infinity, 45),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  "Next",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            // Add bottom padding to ensure button is accessible when keyboard is open
            MediaQuery.of(context).viewInsets.bottom - 24 < 0
                ? const SizedBox(height: 8)
                : SizedBox(height: MediaQuery.of(context).viewInsets.bottom),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '  $label',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: (value) => MyValidator.validateEmptyText(label, value),
          decoration: InputDecoration(
            hintText: 'Type the ${label.toLowerCase()}',
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
      ],
    );
  }

  Widget _buildWeightInput({
    required String label,
    required TextEditingController controller,
    required RxString unit,
    required List<String> units,
    required ValueChanged<String?> onUnitChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF4A4A6A),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: TextFormField(
                controller: controller,
                keyboardType: TextInputType.number,
                validator:
                    (value) => MyValidator.validateEmptyText(label, value),
                decoration: InputDecoration(
                  hintText: 'Type your ${label.toLowerCase()}',
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
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: CustomDropdown(
                label: '',
                selectedValueRx: unit,
                validator:
                    (value) => MyValidator.validateEmptyText('Unit', value),
                onChangedExternal: onUnitChanged,
                items: units,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildHeightInput({
    required String label,
    required TextEditingController controller,
    required TextEditingController inchesController,
    required RxString unit,
    required List<String> units,
    required ValueChanged<String?> onUnitChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF4A4A6A),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: unit.value == 'cm' ? 3 : 1,
              child: TextFormField(
                controller: controller,
                keyboardType: TextInputType.number,
                validator:
                    (value) => MyValidator.validateEmptyText(label, value),
                decoration: InputDecoration(
                  hintText:
                      unit.value == 'cm'
                          ? 'Type your ${label.toLowerCase()}'
                          : 'feet',
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
            ),
            const SizedBox(width: 12),
            if (unit.value == 'ft&in') ...[
              Expanded(
                flex: 1,
                child: TextFormField(
                  controller: inchesController,
                  keyboardType: TextInputType.number,
                  validator:
                      (value) => MyValidator.validateEmptyText(label, value),
                  decoration: InputDecoration(
                    hintText: 'inches',
                    hintStyle: TextStyle(color: Colors.grey[600]!),
                    filled: true,
                    fillColor: Colors.white,
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
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              flex: unit.value == 'cm' ? 2 : 1,
              child: CustomDropdown(
                label: '',
                selectedValueRx: unit,
                validator:
                    (value) => MyValidator.validateEmptyText('Unit', value),
                onChangedExternal: onUnitChanged,
                items: units,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
