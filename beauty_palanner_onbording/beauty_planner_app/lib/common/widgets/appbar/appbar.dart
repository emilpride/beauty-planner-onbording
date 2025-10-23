import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../utils/constants/colors.dart';
import '../../../utils/constants/sizes.dart';

class BMAppbar extends StatelessWidget implements PreferredSizeWidget {
  const BMAppbar({
    super.key,
    required this.title,
    this.onBackPressed,
    this.actions,
    this.showBackButton = true,
  });

  final String title;
  final bool showBackButton;
  final VoidCallback? onBackPressed;

  /// A list of widgets to display in a row after the [title] widget.
  /// This is where you'll place the "more options" button.
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSizes.defaultSpace / 2,
      ),
      child: AppBar(
        systemOverlayStyle: SystemUiOverlayStyle.dark.copyWith(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          systemNavigationBarColor: AppColors.light,
          systemNavigationBarIconBrightness: Brightness.dark,
        ),
        // Remove the default back button
        automaticallyImplyLeading: false,
        // Set background color to match the screen's background for a seamless look
        backgroundColor: Colors.transparent,
        // Remove the shadow
        elevation: 0,
        // Custom leading back button
        leading:
            showBackButton
                ? IconButton(
                  // Use the provided callback or Get.back() as a default
                  onPressed: onBackPressed ?? () => Get.back(),
                  icon: const Icon(
                    Icons.arrow_back_ios,
                    color: AppColors.textPrimary,
                    size: AppSizes.lg,
                  ),
                )
                : null,
        // Centered title
        title: Text(
          title,
          maxLines: 2,
          textAlign: TextAlign.start,
          style: const TextStyle(
            fontSize: AppSizes.lg,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        // Trailing widgets
        actions: actions,
      ),
    );
  }

  /// Required for implementing PreferredSizeWidget.
  /// This defines the height of the AppBar. kToolbarHeight is the standard AppBar height.
  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
