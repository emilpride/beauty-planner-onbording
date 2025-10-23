import 'package:flutter/material.dart';

class AnimatedListItem extends StatelessWidget {
  const AnimatedListItem({
    super.key,
    required this.animation,
    required this.child,
    this.isRotated = false,
    this.rotationAnimation,
  });

  final Animation<double> animation;
  final Widget child;
  final bool isRotated;
  final Animation<double>? rotationAnimation;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([animation, rotationAnimation]),
      builder: (context, child) {
        // Apply rotation only to the designated item
        Widget rotatedChild =
            isRotated && rotationAnimation != null
                ? Transform.rotate(
                  angle: rotationAnimation!.value,
                  alignment: Alignment.centerLeft,
                  child: child,
                )
                : child!;

        return Transform.translate(
          offset: Offset(0, 50 * (1 - animation.value)),
          child: Opacity(opacity: animation.value, child: rotatedChild),
        );
      },
      child: child,
    );
  }
}
