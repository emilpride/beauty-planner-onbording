import 'package:flutter/material.dart';
import 'package:flutter_chat_core/flutter_chat_core.dart';
import 'package:get/get.dart';
import 'package:just_audio/just_audio.dart';
import 'package:audio_waveforms/audio_waveforms.dart';

import '../../../../../common/widgets/images/circular_image.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../personalization/controllers/user_controller.dart';
import '../../../controller/chat_controller.dart';

class CustomAudioMessageBuilder extends StatefulWidget {
  const CustomAudioMessageBuilder({
    super.key,
    required this.isCurrentUser,
    required this.message,
    this.audioWaveformStyle,
    this.playButtonStyle,
  });

  final bool isCurrentUser;
  final AudioMessage message;
  final AudioWaveformStyle? audioWaveformStyle;
  final PlayButtonStyle? playButtonStyle;

  @override
  State<CustomAudioMessageBuilder> createState() =>
      _CustomAudioMessageBuilderState();
}

class _CustomAudioMessageBuilderState extends State<CustomAudioMessageBuilder> {
  late final AudioPlayer _audioPlayer;
  late final PlayerController _playerController;
  final MyChatController controller = Get.find<MyChatController>();

  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();
    _playerController = PlayerController();
    _initializeAudio();
  }

  Future<void> _initializeAudio() async {
    try {
      // Load audio file
      await _audioPlayer.setFilePath(widget.message.source);

      // Prepare waveform
      await _playerController.preparePlayer(
        path: widget.message.source,
        shouldExtractWaveform: true,
      );

      // Listen to player state
      _audioPlayer.playerStateStream.listen((state) {
        if (mounted) {
          setState(() {
            _isPlaying = state.playing;
          });
        }
      });

      // Listen to duration
      _audioPlayer.durationStream.listen((duration) {
        if (mounted && duration != null) {
          setState(() {
            _duration = duration;
          });
        }
      });

      // Listen to position
      _audioPlayer.positionStream.listen((position) {
        if (mounted) {
          setState(() {
            _position = position;
          });
        }
      });

      // Listen to completion
      _audioPlayer.processingStateStream.listen((state) {
        if (state == ProcessingState.completed) {
          _audioPlayer.seek(Duration.zero);
          _audioPlayer.pause();
        }
      });

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error initializing audio: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _togglePlayPause() async {
    try {
      if (_isPlaying) {
        await _audioPlayer.pause();
      } else {
        await _audioPlayer.play();
        _playerController.startPlayer();
      }
    } catch (e) {
      debugPrint('Error toggling play/pause: $e');
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    _playerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(
        left: widget.isCurrentUser ? 16.0 : 8,
        right: widget.isCurrentUser ? 8 : 16.0,
        bottom: 8.0,
      ),
      child: Row(
        mainAxisAlignment:
            widget.isCurrentUser
                ? MainAxisAlignment.end
                : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          !widget.isCurrentUser
              ? Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: _buildAvatar(widget.message, controller),
              )
              : const SizedBox.shrink(),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              decoration: BoxDecoration(
                color:
                    widget.isCurrentUser
                        ? const Color(0xFF8682E4)
                        : const Color(0xFFF2F4F5),
                borderRadius: BorderRadius.only(
                  bottomLeft: const Radius.circular(24),
                  bottomRight: const Radius.circular(24),
                  topLeft: Radius.circular(widget.isCurrentUser ? 24 : 0),
                  topRight: Radius.circular(widget.isCurrentUser ? 0 : 24),
                ),
              ),
              child: _isLoading ? _buildLoadingState() : _buildAudioPlayer(),
            ),
          ),
          widget.isCurrentUser
              ? Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: _buildAvatar(widget.message, controller),
              )
              : const SizedBox.shrink(),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(
              widget.isCurrentUser ? Colors.white : AppColors.primary,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          'Loading...',
          style: TextStyle(
            color: widget.isCurrentUser ? Colors.white : AppColors.textPrimary,
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildAudioPlayer() {
    final waveformStyle =
        widget.audioWaveformStyle ??
        AudioWaveformStyle(
          playedColor: widget.isCurrentUser ? Colors.white : AppColors.primary,
          notPlayedColor:
              widget.isCurrentUser ? Colors.white54 : Colors.grey.shade300,
          height: 30,
          width: 150,
        );

    final playButtonStyle =
        widget.playButtonStyle ??
        PlayButtonStyle(
          iconSize: 24,
          iconColor: widget.isCurrentUser ? Colors.white : AppColors.primary,
        );

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Play/Pause Button
        GestureDetector(
          onTap: _togglePlayPause,
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color:
                  widget.isCurrentUser
                      ? Colors.white.withOpacity(0.2)
                      : Colors.grey.withOpacity(0.2),
            ),
            child: Icon(
              _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
              size: playButtonStyle.iconSize,
              color: playButtonStyle.iconColor,
            ),
          ),
        ),

        const SizedBox(width: 12),

        // Waveform and Duration
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Waveform
              AudioFileWaveforms(
                size: Size(waveformStyle.width, waveformStyle.height),
                playerController: _playerController,
                enableSeekGesture: true,
                waveformType: WaveformType.fitWidth,
                playerWaveStyle: PlayerWaveStyle(
                  fixedWaveColor: waveformStyle.notPlayedColor,
                  liveWaveColor: waveformStyle.playedColor,
                  spacing: 4,
                  showSeekLine: false,
                  waveThickness: 2.5,
                ),
              ),

              const SizedBox(height: 4),

              // Duration
              Text(
                _isPlaying
                    ? '${_formatDuration(_position)} / ${_formatDuration(_duration)}'
                    : _formatDuration(_duration),
                style: TextStyle(
                  color:
                      widget.isCurrentUser
                          ? Colors.white70
                          : Colors.grey.shade600,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAvatar(Message message, MyChatController controller) {
    final bool isCurrentUser = message.authorId == controller.user.id;
    return isCurrentUser
        ? Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: AppColors.primary.withOpacity(0.2),
              width: 2,
            ),
          ),
          padding: const EdgeInsets.all(2),
          child: CircularImage(
            height: 32,
            width: 32,
            backgroundColor: AppColors.white,
            isNetworkImage: true,
            image: UserController.instance.user.value.profilePicture,
          ),
        )
        : Container(
          width: 32,
          height: 32,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [Color(0xFFFFD2D2), Color(0xFFBAA5FC)],
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: Column(
              children: [
                const SizedBox(height: 4),
                Image.asset(
                  controller.assistant.imageSource ?? AppImages.assistantEllie,
                  fit: BoxFit.cover,
                  height: 28,
                ),
              ],
            ),
          ),
        );
  }
}

class AudioWaveformStyle {
  final Color playedColor;
  final Color notPlayedColor;
  final double height;
  final double width;

  AudioWaveformStyle({
    required this.playedColor,
    required this.notPlayedColor,
    required this.height,
    required this.width,
  });
}

class PlayButtonStyle {
  final double iconSize;
  final Color iconColor;

  PlayButtonStyle({required this.iconSize, required this.iconColor});
}
