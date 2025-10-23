import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../controllers/activity_selection/choose_activity_controller.dart';
import '../create_activity.dart'; // Keep this if ChooseActivitiesController.instance.searchController is still the source

class ExpandableSearchWidget extends StatelessWidget {
  const ExpandableSearchWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final ChooseActivitiesController controller = Get.find();

    return GestureDetector(
      onTap: controller.toggleExpansion,
      child: Obx(
        () => AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
          width:
              controller.isExpanded
                  ? MediaQuery.of(context).size.width * 0.9
                  : 320.0,
          constraints: BoxConstraints(
            maxWidth: controller.isExpanded ? 500.0 : 320.0,
          ),
          height: controller.isExpanded ? 148.0 : 68.0,
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color:
                  controller.isExpanded || controller.focusNode.hasFocus
                      ? AppColors.primary
                      : Colors.grey[300]!,
              width: 1.0,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              SizedBox(height: controller.isExpanded ? 8.0 : 2),
              Row(
                children: [
                  SvgPicture.asset(
                    AppImages.searchSvg,
                    width: 24,
                    height: 24,
                    color: Colors.grey[500],
                  ),
                  const SizedBox(width: 8.0),
                  Expanded(
                    child: TextFormField(
                      controller: controller.searchController,
                      focusNode: controller.focusNode,
                      readOnly: !controller.isExpanded,
                      decoration: InputDecoration(
                        hintText: 'Search',
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                        hintStyle: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[500],
                        ),
                      ),
                      onTap: () {
                        if (!controller.isExpanded) {
                          controller.toggleExpansion();
                        }
                      },
                    ),
                  ),
                  // Use Obx to react to changes in searchController.text
                  Obx(
                    () =>
                        controller.isExpanded &&
                                controller.searchController.text.isNotEmpty
                            ? IconButton(
                              icon: Icon(Icons.close, color: Colors.grey[500]),
                              onPressed: controller.clearSearchText,
                              visualDensity: VisualDensity.compact,
                              padding: EdgeInsets.zero,
                            )
                            : const SizedBox.shrink(),
                  ),
                ],
              ),
              controller.isExpanded
                  ? const Padding(
                    padding: EdgeInsets.only(top: 2.0),
                    child: Divider(),
                  )
                  : const SizedBox.shrink(),
              AnimatedOpacity(
                opacity: controller.isExpanded ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOut,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOut,
                  height: controller.isExpanded ? 48.0 : 0.0,
                  width: double.infinity,
                  child:
                      controller.isExpanded
                          ? ElevatedButton(
                            onPressed: controller.onCreateCustomProcedure,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              elevation: 0,
                              maximumSize: const Size(double.infinity, 48.0),
                              minimumSize: const Size(double.infinity, 48.0),
                              padding: const EdgeInsets.symmetric(
                                vertical: 12.0,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.add, size: 20),
                                const SizedBox(width: 8.0),
                                GestureDetector(
                                  onTap:
                                      () => Get.to(
                                        () => const CreateActivityScreen(),
                                      ),
                                  child: const Text(
                                    'Create Custom Procedure',
                                    style: TextStyle(
                                      fontSize: 16.0,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )
                          : const SizedBox.shrink(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
