import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../../../common/widgets/dropdowns/custom_picker.dart';
import '../../../../../utils/constants/colors.dart';

class GraphHeader extends StatefulWidget {
  final String title;
  final String selectedValue;
  final Function(String)? onChanged;
  final List<String>? customItems;

  const GraphHeader({
    super.key,
    required this.title,
    required this.selectedValue,
    this.onChanged,
    this.customItems,
  });

  @override
  State<GraphHeader> createState() => _GraphHeaderState();
}

class _GraphHeaderState extends State<GraphHeader>
    with SingleTickerProviderStateMixin {
  final LayerLink _layerLink = LayerLink();
  late final AnimationController _animationController;
  late final Animation<double> _animation;
  OverlayEntry? _overlayEntry;

  final List<String> defaultItems = [
    'This Week',
    'This Month',
    'Last Month',
    'Last 6 Months',
    'This Year',
    'Last Year',
    'All Time',
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _hideOverlay();
    _animationController.dispose();
    super.dispose();
  }

  void _showOverlay() {
    _hideOverlay();

    final items = widget.customItems ?? defaultItems;

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            Positioned.fill(
              child: GestureDetector(
                onTap: _hideOverlay,
                behavior: HitTestBehavior.translucent,
                child: Container(color: Colors.black.withOpacity(0.01)),
              ),
            ),
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: const Offset(190, 45),
              child: Material(
                color: Colors.transparent,
                child: FadeTransition(
                  opacity: _animation,
                  child: ScaleTransition(
                    scale: Tween<double>(begin: 0.9, end: 1.0).animate(
                      CurvedAnimation(
                        parent: _animationController,
                        curve: Curves.easeOutCubic,
                      ),
                    ),
                    alignment: Alignment.topRight,
                    child: CustomPicker(
                      items: items,
                      height: 200,
                      width: 140,
                      initialValue: widget.selectedValue,
                      onSelectedItemChanged: (newValue) {
                        if (widget.onChanged != null) {
                          widget.onChanged!(newValue);
                        }
                      },
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
    _animationController.forward();
  }

  void _hideOverlay() {
    if (_overlayEntry != null) {
      _animationController.reverse().then((_) {
        _overlayEntry?.remove();
        _overlayEntry = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            widget.title,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 18,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 16),
          Flexible(
            child: GraphPickerButton(
              text: widget.selectedValue,
              onPressed: _showOverlay,
            ),
          ),
        ],
      ),
    );
  }
}

class GraphPickerButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isCalendar;

  const GraphPickerButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isCalendar = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      borderRadius: BorderRadius.circular(10),
      color: Colors.grey.withOpacity(0.15),
      child: GestureDetector(
        onTap: onPressed,
        behavior: HitTestBehavior.translucent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 140, minWidth: 100),
          height: 30,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Center(
                  child: Text(
                    text.isEmpty ? '-' : text,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color:
                          isCalendar ? AppColors.textPrimary : AppColors.black,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ),
              const Icon(
                Iconsax.arrow_down_1,
                size: 16,
                color: AppColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
