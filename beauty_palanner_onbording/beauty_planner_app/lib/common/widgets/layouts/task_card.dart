import 'dart:developer';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';
import '../../../features/app/models/task_model.dart';
import '../../../data/models/activity_model.dart';
import '../../../utils/constants/colors.dart';
import '../../../utils/constants/enums.dart';
import '../../../utils/constants/image_strings.dart';

class CustomSlidableTaskCard extends StatefulWidget {
  final Task task;
  final ActivityModel? activity;
  final VoidCallback onComplete;
  final VoidCallback onSkip;
  final bool isSlidable;

  const CustomSlidableTaskCard({
    super.key,
    required this.task,
    required this.activity,
    required this.onComplete,
    required this.onSkip,
    this.isSlidable = true,
  });

  @override
  State<CustomSlidableTaskCard> createState() => _CustomSlidableTaskCardState();
}

class _CustomSlidableTaskCardState extends State<CustomSlidableTaskCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragExtent = 0.0;
  double _widgetWidth = 0.0;
  final AudioPlayer _audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _controller.addListener(() {
      setState(() {
        _dragExtent = _controller.value;
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    // Calculate the drag distance as a fraction of the widget's width.
    if (_widgetWidth > 0) {
      final newDragExtent =
          _dragExtent + (details.primaryDelta! / _widgetWidth);
      // Limit the drag extent to a specific range (-0.2 to 0.2)
      setState(() {
        _dragExtent = newDragExtent.clamp(-0.2, 0.2);
      });
    }
  }

  void _handleDragEnd(DragEndDetails details) {
    // Define a threshold to trigger the action.
    const triggerThreshold = 0.18; // 20% of the screen width

    if (_dragExtent.abs() > triggerThreshold) {
      if (_dragExtent > 0) {
        _playSound(); // Play sound when marking as done
        widget.onComplete();
        log('completed');
      } else {
        widget.onSkip();
      }
      // Animate the card off-screen if action is triggered.
      _controller.animateTo(
        // _dragExtent > 0 ? 1.0 : -1.0,
        -1.0,
        curve: Curves.easeOut,
      );
    } else {
      // If the threshold isn't met, animate back to the center.
      _controller.animateTo(0.0, curve: Curves.easeOut);
      setState(() {
        _dragExtent = 0;
      });
    }
  }

  // Plays a sound when a task is marked as done
  void _playSound() async {
    try {
      // Play the sound from assets
      await _audioPlayer.play(AssetSource('sounds/applepay.mp3'));
    } catch (e) {
      log('Error playing sound: $e');
    }
  }

  // Builds the background action widgets (Done/Skip)
  Widget _buildAction(bool isCompleteAction) {
    final Color color =
        isCompleteAction ? const Color(0xFF2BAE70) : const Color(0xFFFE4A49);
    final String? label = isCompleteAction ? null : 'Skip';
    final Alignment alignment =
        isCompleteAction ? Alignment.centerLeft : Alignment.centerRight;

    return Container(
      color: color,
      height: 64,
      alignment: alignment,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isCompleteAction) ...[
            const SizedBox(width: 6),
            LottieBuilder.asset(AppImages.lottieCheck, repeat: false),
          ],
          if (!isCompleteAction) ...[
            Text(
              label ?? '',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
            const SizedBox(width: 16),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final iconColor = widget.activity?.color ?? Colors.grey;
    final illustrationPath =
        widget.activity?.illustration ?? AppImages.learnGrow;

    // The foreground card content
    Widget cardContent = ClipRRect(
      borderRadius: BorderRadius.circular(100.0),
      child: Container(
        color: AppColors.white,
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: _getCardColorForStatus()),
          child: Row(
            children: [
              _buildIcon(iconColor, illustrationPath),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      widget.task.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      widget.task.time.format(context),
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );

    // The core of the custom implementation with LayoutBuilder to get the size
    return LayoutBuilder(
      builder: (context, constraints) {
        // Update widget width when layout constraints change
        _widgetWidth = constraints.maxWidth;

        return GestureDetector(
          onHorizontalDragUpdate: widget.isSlidable ? _handleDragUpdate : null,
          onHorizontalDragEnd: widget.isSlidable ? _handleDragEnd : null,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(100.0),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Background Actions
                // Show "Done" when swiping right, "Skip" when swiping left
                if (_dragExtent > 0) _buildAction(true),
                if (_dragExtent < 0) _buildAction(false),

                // Foreground Card
                // We use Transform.translate to move the card based on the drag.
                Transform.translate(
                  offset: Offset(_widgetWidth * _dragExtent, 0),
                  child: cardContent,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Color _getCardColorForStatus() {
    switch (widget.task.status) {
      case TaskStatus.pending:
        return widget.activity?.color?.withOpacity(0.6) ?? Colors.grey.shade200;
      case TaskStatus.completed:
        return const Color(0xFFE3E3E3);
      case TaskStatus.skipped:
        return const Color(0xFFE3E3E3);
      default:
        return const Color(0xFFE3E3E3);
    }
  }

  Widget _buildIcon(Color iconColor, String? illustrationPath) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(color: iconColor, shape: BoxShape.circle),
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (illustrationPath != null && illustrationPath.endsWith('.svg'))
            SvgPicture.asset(
              illustrationPath,
              width: 24,
              height: 24,
              colorFilter: const ColorFilter.mode(
                Colors.white,
                BlendMode.srcIn,
              ),
            )
          else
            const Icon(Icons.error, color: Colors.white),
        ],
      ),
    );
  }
}
