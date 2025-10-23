import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/onboarding_step.dart';

class GenderStep extends StatelessWidget {
  const GenderStep({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<OnboardingController>();
    return Obx(() {
      Text(controller.x.value.toString());
      return OnboardingStep(
        title: "Select Your Gender",
        subtitle: "Let us know a bit about you!",
        condition: controller.userModel.value.gender != 0,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _genderOption(
              context,
              AppImages.genderMale,
              'Male',
              isSelected: controller.userModel.value.gender == 1,
            ),
            _genderOption(
              context,
              AppImages.genderFemale,
              'Female',
              isSelected: controller.userModel.value.gender == 2,
            ),
          ],
        ),
      );
    });
  }

  Widget _genderOption(
    BuildContext context,
    String imagePath,
    String label, {
    bool isSelected = false,
  }) {
    return GestureDetector(
      onTap: () {
        final controller = Get.find<OnboardingController>();
        controller.userModel.update((user) {
          user?.gender = label == 'Male' ? 1 : 2;
          // user?.activities =
          //     label == 'Male'
          //         ? Activities.getManActivities()
          //         : Activities.getWomanActivities();
        });
        controller.x.value++;
      },
      child: Container(
        // height: 110,
        // width: 110,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppColors.textPrimary : Colors.transparent,
            width: 2,
          ),
        ),

        child: Padding(
          padding: const EdgeInsets.all(2.0),
          child: Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color:
                  label == 'Male'
                      ? Colors.lightBlueAccent
                      : const Color(0xfffffc0f7),
            ),

            height: 128,
            width: 128,
            padding: const EdgeInsets.only(
              top: 4.0,
              left: 4.0,
              right: 4.0,
              bottom: 0,
            ),
            child: Stack(
              children: [
                Positioned(
                  bottom: -4,
                  child: Image.asset(
                    fit: BoxFit.cover,
                    imagePath,
                    height: 120,
                    width: 120,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
