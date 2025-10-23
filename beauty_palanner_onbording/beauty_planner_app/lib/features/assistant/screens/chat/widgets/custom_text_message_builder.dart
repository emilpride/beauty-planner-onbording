import 'package:flutter/material.dart';
import 'package:flutter_chat_core/flutter_chat_core.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:get/get.dart';

import '../../../../../common/widgets/images/circular_image.dart';
import '../../../../../utils/constants/colors.dart';
import '../../../../../utils/constants/image_strings.dart';
import '../../../../personalization/controllers/user_controller.dart';
import '../../../controller/chat_controller.dart';

class CustomTextMessageBuilder extends StatelessWidget {
  const CustomTextMessageBuilder({
    super.key,
    required this.isCurrentUser,
    required this.message,
  });

  final bool isCurrentUser;
  final TextMessage message;

  @override
  Widget build(BuildContext context) {
    final MyChatController controller = Get.find<MyChatController>();
    return Container(
      margin: EdgeInsets.only(
        left: isCurrentUser ? 16.0 : 8,
        right: isCurrentUser ? 8 : 16.0,
        bottom: 8.0,
      ),
      child: Row(
        mainAxisAlignment:
            isCurrentUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          !isCurrentUser
              ? Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: _buildAvatar(message, controller),
              )
              : const SizedBox.shrink(),
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color:
                    isCurrentUser
                        ? const Color(0xFF8682E4)
                        : const Color(0xFFF2F4F5),
                borderRadius: BorderRadius.only(
                  bottomLeft: const Radius.circular(24),
                  bottomRight: const Radius.circular(24),
                  topLeft: Radius.circular(isCurrentUser ? 24 : 0),
                  topRight: Radius.circular(isCurrentUser ? 0 : 24),
                ),
              ),
              child:
                  isCurrentUser
                      ? Text(
                        textAlign: TextAlign.center,
                        message.text,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          height: 1.4,
                          fontWeight: FontWeight.w400,
                        ),
                      )
                      : MarkdownBody(
                        data: message.text,
                        styleSheet: MarkdownStyleSheet(
                          textAlign: WrapAlignment.center,
                          p: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 16,
                            height: 1.4,
                            fontWeight: FontWeight.w400,
                          ),
                          h1: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                          h2: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                          h3: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          strong: const TextStyle(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                          listBullet: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 16,
                          ),
                          code: TextStyle(
                            backgroundColor: Colors.grey.shade200,
                            fontFamily: 'monospace',
                            fontSize: 14,
                          ),
                          codeblockDecoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          blockquoteDecoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            border: const Border(
                              left: BorderSide(color: Colors.blue, width: 4),
                            ),
                          ),
                        ),
                        selectable: true,
                      ),
            ),
          ),
          isCurrentUser
              ? Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: _buildAvatar(message, controller),
              )
              : const SizedBox.shrink(),
        ],
      ),
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
