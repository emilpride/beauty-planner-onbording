import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/custom_shapes/containers/rounded_container.dart';
import '../../../../common/widgets/images/circular_image.dart';
import '../../../../data/models/user_model.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../../../utils/validators/validation.dart';
import '../../../authentication/controllers/activity_schedule/date_picker_controller.dart';
import '../../../authentication/screens/schedule_screen/widgets/calendar_view.dart';
import '../../controllers/user_controller.dart';
import 'widgets/birthday_calendar_header.dart';
import 'widgets/gender_drop_down.dart';

class EditProfile extends StatelessWidget {
  const EditProfile({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = UserController.instance;
    final dateTimeController = Get.put(DatePickerController());
    dateTimeController.displayDate.value =
        controller.birthDate.value ?? DateTime.now();
    dateTimeController.setupBirthday();
    return Scaffold(
      appBar: BMAppbar(
        title: 'Edit Profile',
        onBackPressed: () {
          controller.userName.text = controller.user.value.name;
          controller.selectedGender.value =
              controller.user.value.gender == 1 ? 'Male' : 'Female';
          controller.user.value.dateOfBirth != null
              ? controller.birthDate.value = controller.user.value.dateOfBirth!
              : controller.birthDate.value = null;
          controller.imageFile = null;
          Get.back();
        },
      ),
      backgroundColor: AppColors.light,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const SizedBox(height: 16),
              Obx(() {
                Text(controller.x.value.toString());
                return Stack(
                  children: [
                    CircularImage(
                      height: 120,
                      width: 120,
                      backgroundColor: AppColors.white,
                      isNetworkImage: true,
                      image: controller.user.value.profilePicture,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: controller.pickProfilePicture,
                        child: SvgPicture.asset(AppImages.edit),
                      ),
                    ),
                  ],
                );
              }),
              const SizedBox(height: 32),
              RoundedContainer(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSizes.md),
                backgroundColor: AppColors.white,
                child: Form(
                  key: controller.editAccountFormKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTextField(
                        label: 'Full Name',
                        controller: controller.userName,
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        label: 'Email',
                        controller: controller.userEmail,
                        isEmail: true,
                      ),
                      const SizedBox(height: 16),
                      GenderDropDown(
                        label: '  Gender',
                        selectedValueRx: controller.selectedGender,
                        validator:
                            (value) =>
                                MyValidator.validateEmptyText('Gender', value),
                        onChangedExternal: (value) {
                          controller.selectedGender.value = value!;
                        },
                        items: controller.genders,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        '  Birth Date',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Obx(() {
                        Text(controller.x.value.toString());
                        return _buildBirthDateDateContent(controller);
                      }),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            if (controller.editAccountFormKey.currentState!
                                .validate()) {
                              controller.updateUserProfile();
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            minimumSize: const Size(double.infinity, 45),
                            maximumSize: const Size(double.infinity, 45),
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                          ),
                          child: const Text(
                            'Save',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    isEmail = false,
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
          enabled: !isEmail,
          controller: controller,
          keyboardType: keyboardType,
          validator: (value) => MyValidator.validateEmptyText(label, value),
          decoration: InputDecoration(
            prefixIcon:
                isEmail
                    ? Padding(
                      padding: const EdgeInsets.all(14),
                      child: SvgPicture.asset(
                        AppImages.email,
                        height: 18,
                        width: 18,
                      ),
                    )
                    : null,
            hintText: 'Type the ${label.toLowerCase()}',
            filled: true,
            fillColor: Colors.white,
            hintStyle: TextStyle(color: Colors.grey[600]!),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBirthDateDateContent(UserController controller) {
    return GestureDetector(
      onTap: () => showCustomDatePicker(controller.user.value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primary),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              controller.birthDate.value != null
                  ? DateFormat('d MMM yyyy').format(controller.birthDate.value!)
                  : '',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 16,
              ),
            ),
            SvgPicture.asset(
              AppImages.calendarIcon,
              // color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }

  void showCustomDatePicker(UserModel user) {
    if (user.dateOfBirth != null) {
      DatePickerController.instance.selectDay(user.dateOfBirth!);
    }

    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          width: Get.width,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // --- DIALOG HEADER ---
              const Text(
                "Birth Date",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),
              BirthdayCalendarHeader(),
              // --- CALENDAR BODY ---
              const Divider(thickness: 0.5),
              const SizedBox(height: 4),
              const CalendarView(),
              const Divider(thickness: 0.5),
              const SizedBox(height: 20),

              // --- ACTION BUTTONS ---
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds the "Cancel" and "OK" buttons.
  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: TextButton(
            style: TextButton.styleFrom(
              backgroundColor: AppColors.secondary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              "Cancel",
              style: TextStyle(color: AppColors.black, fontSize: 16),
            ),
            onPressed: () => Get.back(),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: TextButton(
            style: TextButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              "OK",
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
            onPressed: () {
              UserController.instance.birthDate =
                  DatePickerController.instance.selectedDate;
              UserController.instance.x.value++;
              Get.back();
            },
          ),
        ),
      ],
    );
  }
}
