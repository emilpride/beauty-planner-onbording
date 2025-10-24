import 'dart:async';
import 'dart:developer';
import 'dart:io';

import 'package:audio_waveforms/audio_waveforms.dart';
import 'package:beautymirror/common/widgets/loaders/loaders.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../../utils/helpers/permissions_helper.dart';

/// Callback when the attachment button is tapped.
typedef OnAttachmentTapCallback = void Function();

/// Callback when the message is sent.
typedef OnMessageSendCallback = void Function(String text);

/// Callback when message is sent with images.
typedef OnMessageSendWithImagesCallback =
    void Function(String text, List<File> images);

/// Callback when voice message is sent
typedef OnVoiceMessageSendCallback =
    void Function(File audioFile, Duration duration);

/// Defines the visibility of the send button.
enum SendButtonVisibilityMode {
  /// The send button is always visible.
  always,

  /// The send button is disabled when the text field is empty.
  disabled,

  /// The send button is hidden when the text field is empty.
  hidden,
}

/// Defines the behavior of the text input field after a message is sent.
enum InputClearMode {
  /// The text input field is always cleared.
  always,

  /// The text input field is never cleared.
  never,
}

// --- New Custom Composer Widget ---

class CustomComposer extends StatefulWidget {
  /// Creates a custom message composer widget.
  const CustomComposer({
    super.key,
    this.textEditingController,
    this.focusNode,
    required this.onMessageSend,
    this.onAttachmentTap,
    this.onMicTap,
    this.backgroundColor,
    this.inputBackgroundColor,
    this.sendButtonColor,
    this.hintText = 'Type a message...',
    this.inputClearMode = InputClearMode.always,
    this.allowEmptyMessage = false,
    this.onMessageSendWithImages,
    this.onVoiceMessageSend,
  });

  /// Callback when message is sent with images
  final OnMessageSendWithImagesCallback? onMessageSendWithImages;

  /// Callback when voice message is sent
  final OnVoiceMessageSendCallback? onVoiceMessageSend;

  /// Controller for the text input field.
  final TextEditingController? textEditingController;

  /// Focus node for the text input field.
  final FocusNode? focusNode;

  /// Callback when the message is sent.
  final OnMessageSendCallback onMessageSend;

  /// Callback when the image attachment button is tapped.
  final VoidCallback? onAttachmentTap;

  /// Callback when the microphone button is tapped.
  final VoidCallback? onMicTap;

  /// Background color of the composer area.
  final Color? backgroundColor;

  /// Background color of the text input field.
  final Color? inputBackgroundColor;

  /// Background color of the send button.
  final Color? sendButtonColor;

  /// Placeholder text for the input field.
  final String? hintText;

  /// Controls the behavior of the text input field after a message is sent.
  final InputClearMode inputClearMode;

  /// Whether to allow sending empty messages. Defaults to `false`.
  final bool allowEmptyMessage;

  @override
  State<CustomComposer> createState() => _CustomComposerState();
}

class _CustomComposerState extends State<CustomComposer>
    with TickerProviderStateMixin {
  late final TextEditingController _textController;
  late final FocusNode _focusNode;
  final ValueNotifier<bool> _hasTextNotifier = ValueNotifier(false);

  // Image attachment state
  final List<File> _selectedImages = [];
  final int maxImages = 5;

  // Animation controllers
  late AnimationController _imagePreviewAnimationController;
  late Animation<double> _imagePreviewAnimation;

  // Voice recording state
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  String? _recordingPath;
  Duration _recordingDuration = Duration.zero;
  Timer? _recordingTimer;

  // Animation for recording
  late AnimationController _recordingPulseController;
  late Animation<double> _recordingPulseAnimation;

  late RecorderController _recorderController;

  @override
  void initState() {
    super.initState();
    _textController = widget.textEditingController ?? TextEditingController();
    _focusNode = widget.focusNode ?? FocusNode();
    _hasTextNotifier.value = _textController.text.trim().isNotEmpty;
    _textController.addListener(_handleTextControllerChange);

    _imagePreviewAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _imagePreviewAnimation = CurvedAnimation(
      parent: _imagePreviewAnimationController,
      curve: Curves.easeOutCubic,
    );
    _recordingPulseController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..repeat(reverse: true);

    _recordingPulseAnimation = Tween<double>(begin: 1.0, end: 1.6).animate(
      CurvedAnimation(
        parent: _recordingPulseController,
        curve: Curves.easeInOut,
      ),
    );

    _recorderController =
        RecorderController()
          ..androidEncoder = AndroidEncoder.aac
          ..androidOutputFormat = AndroidOutputFormat.mpeg4
          ..iosEncoder = IosEncoder.kAudioFormatMPEG4AAC
          ..sampleRate = 44100;
  }

  @override
  void dispose() {
    _textController.removeListener(_handleTextControllerChange);
    if (widget.textEditingController == null) {
      _textController.dispose();
    }
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    _hasTextNotifier.dispose();
    _imagePreviewAnimationController.dispose();
    _recordingPulseController.dispose();
    _recordingTimer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  void _handleTextControllerChange() {
    _hasTextNotifier.value = _textController.text.trim().isNotEmpty;
  }

  void _handleSubmitted(String text) {
    if (widget.allowEmptyMessage == false &&
        text.trim().isEmpty &&
        _selectedImages.isEmpty) {
      return;
    }

    // Create a callback that passes both text and images
    if (_selectedImages.isNotEmpty) {
      widget.onMessageSendWithImages?.call(
        text.trim(),
        List.from(_selectedImages),
      );
    } else {
      widget.onMessageSend(text.trim());
    }

    if (widget.inputClearMode == InputClearMode.always) {
      _textController.clear();
    }

    // Clear images after sending
    _clearAllImages();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    final composerBackgroundColor =
        widget.backgroundColor ??
        (isDarkMode ? Colors.grey[850] : Colors.white);
    final inputBackgroundColor =
        widget.inputBackgroundColor ??
        (isDarkMode ? Colors.grey[800] : Colors.white);
    final sendButtonColor = widget.sendButtonColor ?? theme.primaryColor;

    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        const Spacer(),
        // Suggestion chips (only when not recording and no text)
        if (!_isRecording)
          ValueListenableBuilder<bool>(
            valueListenable: _hasTextNotifier,
            builder: (context, hasText, child) {
              return AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: ScaleTransition(scale: animation, child: child),
                  );
                },
                child:
                    !hasText && _selectedImages.isEmpty
                        ? _buildSuggestionChips()
                        : const SizedBox.shrink(),
              );
            },
          ),

        // Image preview section
        if (!_isRecording) _buildImagePreviewSection(),

        if (!_isRecording) const SizedBox(height: 4.0),

        // Main composer area
        Container(
          padding: const EdgeInsets.only(
            right: 16.0,
            left: 16.0,
            bottom: 16.0,
            top: 12.0,
          ),
          color: composerBackgroundColor,
          child: Column(
            children: [
              // AnimatedSwitcher for smooth transition between input and recording
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0, 0.1),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  );
                },
                child:
                    _isRecording
                        ? _buildRecordingRow(theme, sendButtonColor)
                        : _buildInputRow(
                          theme,
                          isDarkMode,
                          inputBackgroundColor!,
                          sendButtonColor,
                        ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  // New method: Normal input row
  Widget _buildInputRow(
    ThemeData theme,
    bool isDarkMode,
    Color inputBackgroundColor,
    Color sendButtonColor,
  ) {
    return Row(
      key: const ValueKey('input_row'),
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Text Input Field
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: inputBackgroundColor,
              borderRadius: BorderRadius.circular(48.0),
              border: Border.all(color: const Color(0xFF969AB7), width: 1.5),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    focusNode: _focusNode,
                    style: TextStyle(
                      color: isDarkMode ? Colors.white : Colors.black,
                    ),
                    decoration: InputDecoration(
                      hintText: widget.hintText,
                      hintStyle: TextStyle(color: Colors.grey[500]),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20.0,
                        vertical: 12.0,
                      ),
                      fillColor: Colors.transparent,
                    ),
                    minLines: 1,
                    maxLines: 5,
                    textCapitalization: TextCapitalization.sentences,
                    keyboardType: TextInputType.multiline,
                  ),
                ),
                // Animated Suffix Icons
                ValueListenableBuilder<bool>(
                  valueListenable: _hasTextNotifier,
                  builder: (context, hasText, child) {
                    return AnimatedSwitcher(
                      duration: const Duration(milliseconds: 200),
                      transitionBuilder: (child, animation) {
                        return FadeTransition(
                          opacity: animation,
                          child: ScaleTransition(
                            scale: animation,
                            child: child,
                          ),
                        );
                      },
                      child:
                          hasText
                              ? const SizedBox.shrink()
                              : Row(
                                key: const ValueKey('icons'),
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  GestureDetector(
                                    onTap:
                                        widget.onAttachmentTap ??
                                        _handleImagePick,
                                    child: SvgPicture.asset(
                                      AppImages.attachment,
                                      height: 24,
                                      width: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  GestureDetector(
                                    onTap: widget.onMicTap ?? _startRecording,
                                    child: SvgPicture.asset(
                                      AppImages.microphone,
                                      height: 24,
                                      width: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                ],
                              ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Send Button
        ValueListenableBuilder<bool>(
          valueListenable: _hasTextNotifier,
          builder: (context, hasText, child) {
            return InkWell(
              onTap:
                  hasText ? () => _handleSubmitted(_textController.text) : null,
              borderRadius: BorderRadius.circular(25),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 50,
                height: 50,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color:
                      hasText
                          ? sendButtonColor
                          : sendButtonColor.withOpacity(0.8),
                ),
                child: SvgPicture.asset(AppImages.send, height: 24, width: 24),
              ),
            );
          },
        ),
      ],
    );
  }

  // New method: Recording row (WhatsApp style)
  Widget _buildRecordingRow(ThemeData theme, Color sendButtonColor) {
    return Row(
      key: const ValueKey('recording_row'),
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Delete/Cancel button
        InkWell(
          onTap: _cancelRecording,
          borderRadius: BorderRadius.circular(25),
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.delete_outline,
              size: 22,
              color: Colors.red,
            ),
          ),
        ),

        const SizedBox(width: 12),

        // Recording indicator (pulsing red dot) + Timer + Waveform
        Expanded(
          child: Container(
            height: 50,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(25),
            ),
            child: Row(
              children: [
                // Pulsing red dot
                ScaleTransition(
                  scale: _recordingPulseAnimation,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                // Timer
                Text(
                  _formatDuration(_recordingDuration),
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    fontFeatures: [FontFeature.tabularFigures()],
                  ),
                ),

                const SizedBox(width: 16),

                // Waveform
                Expanded(
                  child: AudioWaveforms(
                    size: const Size(double.infinity, 40),
                    recorderController: _recorderController,
                    enableGesture: false,
                    waveStyle: WaveStyle(
                      waveColor: theme.primaryColor,
                      extendWaveform: true,
                      showMiddleLine: false,
                      waveThickness: 2.5,
                      spacing: 4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(width: 12),

        // Microphone/Send button
        InkWell(
          onTap: () => _stopRecording(send: true),
          borderRadius: BorderRadius.circular(25),
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: sendButtonColor,
              shape: BoxShape.circle,
            ),
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: SvgPicture.asset(AppImages.send, height: 24, width: 24),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuggestionChips() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      color: Colors.transparent,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildChip('What is BMS?', onTap: () {}),
            _buildChip('How am I doing?', onTap: () {}),
            _buildChip('🙋‍♂️ FAQs', onTap: () {}),
          ],
        ),
      ),
    );
  }

  Widget _buildChip(String label, {VoidCallback? onTap}) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(
          label,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        onPressed: onTap,
        backgroundColor: const Color(0xFFF2F4F5),
        elevation: 1,
        shadowColor: Colors.grey.withOpacity(0.3),
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Colors.transparent),
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  Future<void> _handleImagePick() async {
    // Check permission first
    final hasPermission = await PermissionHelper.requestPhotosPermission();
    if (!hasPermission) return;

    if (_selectedImages.length >= maxImages) {
      // Show snackbar: "Maximum 5 images allowed"
      return;
    }

    final ImagePicker picker = ImagePicker();
    final List<XFile> images = await picker.pickMultiImage(
      maxWidth: 1920,
      maxHeight: 1080,
      imageQuality: 100,
    );

    if (images.isEmpty) return;

    final remainingSlots = maxImages - _selectedImages.length;
    final imagesToAdd = images.take(remainingSlots).toList();

    setState(() {
      _selectedImages.addAll(imagesToAdd.map((xFile) => File(xFile.path)));
    });

    if (_selectedImages.isNotEmpty &&
        _imagePreviewAnimationController.isDismissed) {
      _imagePreviewAnimationController.forward();
    }
  }

  Widget _buildImagePreviewSection() {
    if (_selectedImages.isEmpty) return const SizedBox.shrink();

    return SizeTransition(
      sizeFactor: _imagePreviewAnimation,
      axisAlignment: -1.0,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4),
        color:
            widget.backgroundColor ?? Theme.of(context).scaffoldBackgroundColor,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  '${_selectedImages.length}/$maxImages images',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: _clearAllImages,
                  icon: const Icon(Icons.clear_all, size: 16),
                  label: const Text('Clear All'),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    iconColor: AppColors.textPrimary,
                    textStyle: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 12,
                    ),
                    minimumSize: const Size(0, 32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _selectedImages.length,
                itemBuilder: (context, index) {
                  return _buildImagePreviewItem(_selectedImages[index], index);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePreviewItem(File image, int index) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(right: 12),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(
              image,
              width: 100,
              height: 100,
              fit: BoxFit.cover,
            ),
          ),
          Positioned(
            top: 4,
            right: 4,
            child: GestureDetector(
              onTap: () => _removeImage(index),
              child: Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, size: 16, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });

    if (_selectedImages.isEmpty) {
      _imagePreviewAnimationController.reverse();
    }
  }

  void _clearAllImages() {
    setState(() {
      _selectedImages.clear();
    });
    _imagePreviewAnimationController.reverse();
  }

  Future<void> _startRecording() async {
    try {
      // Check permission first
      final hasPermission =
          await PermissionHelper.requestMicrophonePermission();
      if (!hasPermission) return;

      if (!await _recorderController.checkPermission()) {
        // Show permission dialog
        _showPermissionDialog();
        return;
      }

      final directory = await getTemporaryDirectory();
      final path =
          '${directory.path}/voice_message_${DateTime.now().millisecondsSinceEpoch}.m4a';

      await _recorderController.record(path: path);

      setState(() {
        _isRecording = true;
        _recordingPath = path;
        _recordingDuration = Duration.zero;
      });

      HapticFeedback.mediumImpact();

      _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        setState(() {
          _recordingDuration = Duration(seconds: timer.tick);
        });

        // Haptic feedback every 10 seconds
        if (timer.tick % 10 == 0) {
          HapticFeedback.lightImpact();
        }

        if (_recordingDuration.inMinutes >= 5) {
          _stopRecording(send: true);
        }
      });
    } catch (e) {
      log('Error starting recording: $e');
      Loaders.customToast(
        message:
            'Could not start recording. Please check microphone permissions.',
      );
    }
  }

  Future<void> _stopRecording({bool send = false}) async {
    try {
      final path = await _recorderController.stop();
      _recordingTimer?.cancel();

      HapticFeedback.heavyImpact();

      setState(() {
        _isRecording = false;
      });

      if (send && path != null) {
        widget.onVoiceMessageSend?.call(File(path), _recordingDuration);
      }

      _recordingPath = null;
      _recordingDuration = Duration.zero;
    } catch (e) {
      log('Error stopping recording: $e');
    }
  }

  Future<void> _cancelRecording() async {
    await _recorderController.stop();
    _recordingTimer?.cancel();

    HapticFeedback.lightImpact();

    if (_recordingPath != null) {
      final file = File(_recordingPath!);
      if (await file.exists()) {
        await file.delete();
      }
    }

    setState(() {
      _isRecording = false;
      _recordingPath = null;
      _recordingDuration = Duration.zero;
    });
  }

  void _showPermissionDialog() {
    Get.dialog(
      AlertDialog(
        title: const Text('Microphone Permission'),
        content: const Text(
          'This app needs microphone access to record voice messages. '
          'Please grant permission in your device settings.',
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Get.back();
              // openAppSettings();
            },
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }
}
