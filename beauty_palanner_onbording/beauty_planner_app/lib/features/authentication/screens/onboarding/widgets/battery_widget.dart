import 'package:flutter/material.dart';

class BatteryWidget extends StatelessWidget {
  final double energyLevel; // 1.0 to 5.0
  final Function(double) onChanged;
  final int totalSegments = 5;

  const BatteryWidget({
    super.key,
    required this.energyLevel,
    required this.onChanged,
  });

  Color _getSegmentColor(double level) {
    if (level <= 1) return Colors.red;
    if (level <= 2) return Colors.orange;
    if (level <= 3) return Colors.yellow;
    if (level <= 4) return Colors.lightGreen;
    return Colors.green;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 230,
      width: 120,
      margin: const EdgeInsets.only(top: 24.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.deepPurple, width: 5),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Battery segments
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: GestureDetector(
              onVerticalDragUpdate: (details) {
                // Calculate change based on drag distance
                double change = -details.delta.dy / 25; // Adjust sensitivity
                onChanged(energyLevel + change);
              },
              child: Column(
                // mainAxisAlignment: MainAxisAlignment.end,
                children:
                    List.generate(totalSegments, (index) {
                      final segmentLevel = totalSegments - index;
                      return Expanded(
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(vertical: 3.0),
                          decoration: BoxDecoration(
                            color:
                                energyLevel >= segmentLevel
                                    ? _getSegmentColor(energyLevel)
                                    : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      );
                    }).toList(),
              ),
            ),
          ),
          // Battery top
          Positioned(
            top: -23,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 49,
                height: 18,
                decoration: const BoxDecoration(
                  color: Colors.deepPurple,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(5),
                    topRight: Radius.circular(5),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
