import 'package:flutter/material.dart';
import '../../../utils/constants/colors.dart';

class CustomPicker extends StatefulWidget {
  final List<String> items;
  final Function(String) onSelectedItemChanged;
  final String initialValue;
  final int height;
  final int width;

  const CustomPicker({
    super.key,
    required this.items,
    required this.onSelectedItemChanged,
    required this.initialValue,
    required this.height,
    required this.width,
  });

  @override
  State<CustomPicker> createState() => _CustomPickerState();
}

class _CustomPickerState extends State<CustomPicker> {
  late FixedExtentScrollController _controller;
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.items.indexOf(widget.initialValue);
    if (_selectedIndex == -1) {
      _selectedIndex = 0;
    }

    const int itemMultiple = 100000;
    final int centerIndex =
        (itemMultiple ~/ 2) * widget.items.length + _selectedIndex;

    _controller = FixedExtentScrollController(initialItem: centerIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget build(BuildContext context) {
    const double itemHeight = 35.0;

    // This multiplier makes the list feel infinite
    const int itemMultiple = 100000;
    final int centerIndex =
        (itemMultiple ~/ 2) * widget.items.length + _selectedIndex;

    return SizedBox(
      height: widget.height.toDouble(),
      width: widget.width.toDouble(),
      child: Material(
        elevation: 4.0,
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          alignment: Alignment.center,
          children: [
            ShaderMask(
              shaderCallback: (Rect bounds) {
                return LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primary.withOpacity(0.0),
                    AppColors.primary,
                    AppColors.primary,
                    AppColors.primary.withOpacity(0.0),
                  ],
                  stops: const [0.0, 0.4, 0.6, 1.0],
                ).createShader(bounds);
              },
              blendMode: BlendMode.dstIn,
              child: ListWheelScrollView.useDelegate(
                controller: _controller,
                itemExtent: itemHeight,
                physics: const FixedExtentScrollPhysics(),
                onSelectedItemChanged: (index) {
                  final actualIndex = index % widget.items.length;
                  setState(() {
                    _selectedIndex = actualIndex;
                    widget.onSelectedItemChanged(widget.items[actualIndex]);
                  });
                },
                childDelegate: ListWheelChildBuilderDelegate(
                  builder: (context, index) {
                    final actualIndex = index % widget.items.length;
                    final itemValue = widget.items[actualIndex];
                    final isSelected = actualIndex == _selectedIndex;
                    final style = TextStyle(
                      fontSize: 18,
                      fontWeight:
                          isSelected ? FontWeight.w700 : FontWeight.normal,
                      color:
                          isSelected
                              ? AppColors.textPrimary
                              : Colors.grey.shade600,
                    );
                    return Center(
                      child: Text(
                        itemValue,
                        textAlign: TextAlign.center,
                        overflow: TextOverflow.ellipsis,
                        style: style,
                      ),
                    );
                  },
                  childCount: widget.items.length * itemMultiple,
                ),
              ),
            ),
            Positioned(
              top: widget.height / 2 - itemHeight / 2,
              left: 20,
              right: 20,
              child: Divider(
                height: 0.4,
                thickness: 1,
                color: Colors.grey.shade300,
              ),
            ),
            Positioned(
              bottom: widget.height / 2 - itemHeight / 2,
              left: 20,
              right: 20,
              child: Divider(
                height: 0.4,
                thickness: 1,
                color: Colors.grey.shade300,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
