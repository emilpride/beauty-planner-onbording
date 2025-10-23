import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controllers/onboarding/onboarding_controller.dart';
import '../widgets/battery_widget.dart';
import '../widgets/onboarding_step.dart';

class EnergyLevelStep extends StatelessWidget {
  const EnergyLevelStep({super.key});

  @override
  Widget build(BuildContext context) {
    final OnboardingController controller = Get.find();
    return Obx(() {
      Text(controller.energyLevelTriggered.value.toString());
      return OnboardingStep(
        key: const ValueKey('EnergyLevel'),
        title: 'How\'s Your Daily Energy Level?',
        condition: controller.energyLevelTriggered.value,
        child: Center(
          child: Obx(
            () => BatteryWidget(
              energyLevel: controller.energyLevel.value,
              onChanged: (newLevel) => controller.updateEnergyLevel(newLevel),
            ),
          ),
        ),
      );
    });
  }
}
