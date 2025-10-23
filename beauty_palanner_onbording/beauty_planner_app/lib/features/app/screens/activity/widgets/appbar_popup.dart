import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../data/models/activity_model.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/sizes.dart';
import '../../../../personalization/controllers/user_controller.dart';
import '../../../controllers/activity_controller.dart';
import '../edit_activity.dart';

class AppbarPopup extends StatefulWidget {
  AppbarPopup({super.key, required this.activityModel});

  final ActivityModel activityModel;

  final EditActivityController controller = Get.put(EditActivityController());

  @override
  State<AppbarPopup> createState() => _AppbarPopupState();
}

class _AppbarPopupState extends State<AppbarPopup>
    with SingleTickerProviderStateMixin {
  // Key to link the button and the overlay position
  final LayerLink _layerLink = LayerLink();

  // Controller for the show/hide animation
  late final AnimationController _animationController;
  late final Animation<double> _animation;

  OverlayEntry? _overlayEntry;
  final double _popupWidth = 160.0;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    // Use a curve for a nicer effect
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  /// Builds the custom popup menu widget
  Widget _buildPopupMenu() {
    return Material(
      child: Container(
        height: 96,
        width: _popupWidth,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildPopupMenuItem(
              icon: Icons.edit,
              text: 'Edit',
              onTap: () {
                _hideOverlay();
                Get.to(
                  () => EditActivity(
                    activityModel: ActivityModel.fromJson(
                      widget.activityModel.toJson(),
                    ),
                  ),
                );
              },
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Divider(
                height: 1,
                thickness: 0.5,
                color: Color(0xFFE0E0E0),
              ),
            ),
            _buildPopupMenuItem(
              icon: Icons.delete,
              text: 'Delete',
              onTap: () {
                showDeleteDialog();
                _hideOverlay();
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Helper to build individual menu items for the popup
  Widget _buildPopupMenuItem({
    required IconData icon,
    required String text,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.0),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Row(
          children: [
            Icon(icon, color: AppColors.textPrimary, size: 20),
            const SizedBox(width: 12),
            Text(
              text,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Shows the custom popup menu overlay
  void _showOverlay(BuildContext context) {
    // Dismiss any existing overlay
    if (_overlayEntry != null) {
      _hideOverlay();
      return;
    }

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            // Full-screen GestureDetector to dismiss the overlay when tapping outside
            Positioned.fill(
              child: GestureDetector(
                onTap: _hideOverlay,
                behavior: HitTestBehavior.translucent,
              ),
            ),
            // Position the popup menu using CompositedTransformFollower
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              // Adjust the offset to position the popup correctly
              // The X offset is negative to align the right edge of the popup with the icon
              // The Y offset is positive to place it below the icon
              offset: Offset(-_popupWidth + 45, 45.0),
              child: FadeTransition(
                opacity: _animation,
                child: _buildPopupMenu(),
              ),
            ),
          ],
        );
      },
    );

    // Add to the overlay and start the animation
    Overlay.of(context).insert(_overlayEntry!);
    _animationController.forward();
  }

  /// Hides and removes the popup menu overlay
  void _hideOverlay() {
    if (_overlayEntry != null) {
      _animationController.reverse().then((_) {
        // Only remove the entry after the animation is complete
        _overlayEntry?.remove();
        _overlayEntry = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: IconButton(
        icon: const Icon(Icons.more_vert, color: AppColors.textPrimary),
        onPressed: () {
          _showOverlay(context);
        },
      ),
    );
  }

  void showDeleteDialog() {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
          width: Get.width,
          child: Obx(
            () => Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // --- DIALOG HEADER ---
                const Text(
                  'Delete this activity?',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 24),
                DeleteOption(
                  text: "Delete Activity & Keep History",
                  isSelected: widget.controller.selectedIndex.value == 1,
                  onTap: () {
                    widget.controller.selectedIndex.value = 1;
                  },
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Divider(thickness: 0.5, color: AppColors.grey),
                ),
                DeleteOption(
                  text: "Delete Activity & Clear History",
                  isSelected: widget.controller.selectedIndex.value == 2,
                  onTap: () {
                    widget.controller.selectedIndex.value = 2;
                  },
                ),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          style: TextButton.styleFrom(
                            backgroundColor: AppColors.secondary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: () {
                            Get.back();
                          },
                          child: const Text(
                            "Cancel",
                            style: TextStyle(color: AppColors.black),
                          ),
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
                          onPressed: () {
                            if (widget.controller.selectedIndex.value > 0) {
                              Get.back();
                              UserController.instance.deleteUserActivity(
                                widget.activityModel,
                                widget.controller.selectedIndex.value == 1,
                              );
                              ActivityController.instance.onActivityDeleted(
                                widget.activityModel.id,
                                keepHistorY:
                                    widget.controller.selectedIndex.value == 1,
                              );
                              showDeleteSuccessDialog();
                            }
                          },
                          child: const Text(
                            "OK",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void showDeleteSuccessDialog() {
    Get.dialog(
      useSafeArea: true,
      barrierDismissible: false,
      Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primary.withOpacity(0),
                AppColors.primary.withOpacity(0.15),
                AppColors.primary.withOpacity(0),
              ],
            ),
          ),
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          width: Get.width,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100),
                  color: AppColors.success,
                  border: Border.all(color: AppColors.white, width: 4),
                ),
                child: const Center(
                  child: Icon(
                    Icons.check,
                    color: AppColors.textWhite,
                    size: 32,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Successfully Deleted',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                textAlign: TextAlign.center,
                'Your activity and history has been deleted',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppColors.black,
                ),
              ),
              const SizedBox(height: 32),

              SizedBox(
                height: 45,
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Get.back();
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
                    'Ok',
                    style: TextStyle(
                      fontSize: 13,
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
    );
  }
}

class DeleteOption extends StatelessWidget {
  final String text;
  final bool isSelected;
  final VoidCallback onTap;

  const DeleteOption({
    super.key,
    required this.text,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        height: 35,
        child: Row(
          children: [
            const SizedBox(width: AppSizes.lg),
            Icon(
              isSelected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_unchecked,
              color: isSelected ? AppColors.textPrimary : Colors.grey,
            ),
            const SizedBox(width: AppSizes.md),
            Text(
              text,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class EditActivityController extends GetxController {
  static EditActivityController get instance => Get.find();
  final Rx<int> selectedIndex = 0.obs;
}
