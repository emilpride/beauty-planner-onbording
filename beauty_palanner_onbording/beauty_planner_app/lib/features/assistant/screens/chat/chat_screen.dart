import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flyer_chat_image_message/flyer_chat_image_message.dart';
import 'package:get/get.dart';
import 'package:flutter_chat_core/flutter_chat_core.dart';
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:iconsax/iconsax.dart';
import 'package:lottie/lottie.dart';
import '../../../../utils/constants/colors.dart';
import '../../../../utils/constants/image_strings.dart';
import '../../../../utils/constants/sizes.dart';
import '../../controller/chat_controller.dart';
import 'widgets/custom_audio_message_builder.dart';
import 'widgets/custom_composer.dart';
import 'widgets/custom_text_message_builder.dart';

class AIChatScreen extends StatelessWidget {
  const AIChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final MyChatController controller = Get.find<MyChatController>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        systemOverlayStyle: SystemUiOverlayStyle.dark.copyWith(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          systemNavigationBarColor: AppColors.light,
          systemNavigationBarIconBrightness: Brightness.dark,
        ),
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: IconButton(
            onPressed: () => Get.back(),
            icon: const Icon(
              Icons.arrow_back_ios,
              color: AppColors.textPrimary,
              size: AppSizes.lg,
            ),
          ),
        ),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
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
                    const SizedBox(height: 6),
                    Image.asset(
                      controller.assistant.imageSource ??
                          AppImages.assistantEllie,
                      fit: BoxFit.cover,
                      height: 34,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.assistant.name ?? 'Assistant',
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                const Row(
                  children: [
                    Icon(Icons.circle, color: Color(0xFF7DDE86), size: 8),
                    SizedBox(width: 4),
                    Text(
                      'Always active',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: PopupMenuButton(
              icon: Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.grey.shade300, width: 1),
                ),
                child: const Icon(
                  Icons.more_horiz,
                  color: Colors.grey,
                  size: 24,
                ),
              ),
              offset: const Offset(-10, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              color: AppColors.light,
              menuPadding: const EdgeInsets.symmetric(
                vertical: 0,
                horizontal: 0,
              ),
              itemBuilder:
                  (context) => [
                    PopupMenuItem(
                      onTap: controller.clearChat,
                      child: const Center(
                        child: Text(
                          'Clear Chat',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ],
            ),
          ),
        ],
      ),
      body: Obx(
        () => Stack(
          children: [
            Chat(
              backgroundColor: Colors.white,
              currentUserId: controller.user.id,
              chatController: controller.chatController,
              resolveUser: (String id) async {
                if (id == controller.user.id) {
                  return controller.user;
                } else if (id == controller.assistant.id) {
                  return controller.assistant;
                }
                log('Unknown user ID: $id');
                return User(id: id, name: 'Unknown');
              },
              theme: ChatTheme.light(),
              builders: Builders(
                chatAnimatedListBuilder: (context, itemBuilder) {
                  return ChatAnimatedList(
                    itemBuilder: itemBuilder,
                    bottomPadding: controller.isLoading.value ? 170 : 150,
                  );
                },

                scrollToBottomBuilder: (context, animation, onPressed) {
                  return ScrollToBottom(
                    animation: animation,
                    onPressed: onPressed,
                    backgroundColor: AppColors.light,
                    useComposerHeightForBottomOffset: true,
                    icon: const Icon(
                      Iconsax.arrow_down_1,
                      color: AppColors.textPrimary,
                      size: 20,
                    ),
                    bottom: 150,
                  );
                },

                textMessageBuilder: (
                  context,
                  message,
                  int index, {
                  required bool isSentByMe,
                  MessageGroupStatus? groupStatus,
                }) {
                  final isCurrentUser = message.authorId == controller.user.id;
                  return CustomTextMessageBuilder(
                    isCurrentUser: isCurrentUser,
                    message: message,
                  );
                },
                imageMessageBuilder:
                    (
                      context,
                      message,
                      index, {
                      required bool isSentByMe,
                      MessageGroupStatus? groupStatus,
                    }) => FlyerChatImageMessage(
                      message: message,
                      index: index,
                      showStatus: false,
                      showTime: false,
                    ),
                audioMessageBuilder: (
                  context,
                  message,
                  index, {
                  required bool isSentByMe,
                  MessageGroupStatus? groupStatus,
                }) {
                  final isCurrentUser = message.authorId == controller.user.id;
                  return CustomAudioMessageBuilder(
                    message: message,
                    isCurrentUser: isCurrentUser,
                    audioWaveformStyle: AudioWaveformStyle(
                      playedColor:
                          isCurrentUser ? Colors.white : AppColors.primary,
                      notPlayedColor:
                          isCurrentUser ? Colors.white54 : Colors.grey.shade300,
                      height: 30,
                      width: 150,
                    ),
                    playButtonStyle: PlayButtonStyle(
                      iconSize: 24,
                      iconColor:
                          isCurrentUser ? Colors.white : AppColors.primary,
                    ),
                  );
                },
                composerBuilder:
                    (context) => CustomComposer(
                      onMessageSend:
                          (text) => controller.handleSendPressed(text),
                      onMessageSendWithImages:
                          (text, images) => controller
                              .handleSendPressedWithImages(text, images),
                      onVoiceMessageSend:
                          (audioFile, duration) => controller
                              .handleVoiceMessage(audioFile, duration),
                      sendButtonColor: const Color(0xFF8682E4),

                      // onMicTap: () {},
                    ),
              ),
            ),
            Positioned(
              bottom: 135,
              left: 16,
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                transitionBuilder: (child, animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: ScaleTransition(scale: animation, child: child),
                  );
                },
                child:
                    controller.isLoading.value
                        ? SizedBox(
                          height: 100,
                          child: Row(
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                margin: const EdgeInsets.only(
                                  bottom: 8,
                                  top: 12,
                                ),
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    colors: [
                                      Color(0xFFFFD2D2),
                                      Color(0xFFBAA5FC),
                                    ],
                                  ),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(100),
                                  child: Column(
                                    children: [
                                      const SizedBox(height: 4),
                                      Image.asset(
                                        controller.assistant.imageSource ??
                                            AppImages.assistantEllie,
                                        fit: BoxFit.cover,
                                        height: 28,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              Lottie.asset(
                                AppImages.typingIndicator,
                                fit: BoxFit.cover,
                                repeat: true,
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
    );
  }
}
