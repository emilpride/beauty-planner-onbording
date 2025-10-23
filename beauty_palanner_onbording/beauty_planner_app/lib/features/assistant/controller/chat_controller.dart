import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:beautymirror/features/app/controllers/report_controller.dart';
import 'package:flutter_chat_core/flutter_chat_core.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';
import '../../../data/repositories/chat/chat_repository.dart';
import '../../../data/services/gemini/gemini_service.dart';
import '../../../utils/constants/enums.dart';
import '../../../utils/constants/image_strings.dart';
import '../../../utils/local_storage/storage_utility.dart';
import '../../app/controllers/activity_controller.dart';
import '../../app/models/task_model.dart';
import '../../personalization/controllers/user_controller.dart';

class MyChatController extends GetxController {
  static MyChatController get instance => Get.find();

  final GeminiService _geminiService = GeminiService();
  final userController = Get.find<UserController>();
  final _chatRepository = Get.put(ChatRepository());
  final _localStorage = LocalStorage.instance();
  final chatController = InMemoryChatController();

  final RxBool isLoading = false.obs;
  final RxBool isTyping = false.obs;
  final RxBool isSyncing = false.obs;
  final RxString lastError = ''.obs;

  // Current user (you)
  late final User user;
  // AI Assistant
  late final User assistant;

  // Chat session management
  String? _currentSessionId;
  DateTime? _sessionStartTime;

  // Local storage keys
  static const String _chatHistoryKey = 'chat_history';
  static const String _lastSyncKey = 'chat_last_sync';

  @override
  void onInit() {
    super.onInit();
    _initializeUsers();
    _initializeSession();
  }

  @override
  Future<void> onReady() async {
    super.onReady();
    // Sync from Firebase when app starts
    await syncChatHistory();
    addWelcomeMessage();
  }

  void _initializeUsers() {
    user = User(
      id: 'user_id',
      name: userController.user.value.name,
      imageSource: userController.user.value.profilePicture,
    );

    assistant = User(
      id: 'assistant_id',
      name: userController.user.value.assistant == 2 ? 'Ellie' : 'Max',
      imageSource:
          userController.user.value.assistant == 2
              ? AppImages.assistantEllie
              : AppImages.assistantMax,
    );
  }

  void _initializeSession() {
    _currentSessionId = const Uuid().v4();
    _sessionStartTime = DateTime.now();
  }

  /// Syncs chat history from Firebase on app start
  Future<void> syncChatHistory() async {
    if (isSyncing.value) return;

    try {
      isSyncing.value = true;
      final userId = userController.user.value.id;

      // Fetch from Firebase
      final firebaseHistory = await _chatRepository.fetchChatHistory(userId);

      if (firebaseHistory.isNotEmpty) {
        // Import into Gemini service
        _geminiService.importHistory(firebaseHistory);

        // Save to local storage
        await _localStorage.writeData(_chatHistoryKey, firebaseHistory);
        await _localStorage.writeData(
          _lastSyncKey,
          DateTime.now().toIso8601String(),
        );

        log('Synced ${firebaseHistory.length} messages from Firebase');
      } else {
        // Try loading from local storage if Firebase is empty
        _loadFromLocalStorage();
      }
    } catch (e) {
      log('Error syncing chat history: $e');
      // Fallback to local storage
      _loadFromLocalStorage();
    } finally {
      isSyncing.value = false;
    }
  }

  /// Loads chat history from local storage
  void _loadFromLocalStorage() {
    try {
      final localHistory = _localStorage.readData<List>(_chatHistoryKey);

      if (localHistory != null && localHistory.isNotEmpty) {
        _geminiService.importHistory(
          localHistory.map((e) => Map<String, dynamic>.from(e)).toList(),
        );
        log('Loaded ${localHistory.length} messages from local storage');
      }
    } catch (e) {
      log('Error loading from local storage: $e');
    }
  }

  /// Saves conversation history to both Firebase and local storage
  Future<void> _saveConversationHistory() async {
    try {
      final userId = userController.user.value.id;
      final history = _geminiService.exportHistory();

      // Save to local storage immediately (fast)
      await _localStorage.writeData(_chatHistoryKey, history);

      // Save to Firebase in background (slower, but syncs across devices)
      _chatRepository.saveChatHistory(userId, history).catchError((e) {
        log('Background Firebase save failed: $e');
        // Don't throw - local storage already succeeded
      });
    } catch (e) {
      log('Error saving conversation history: $e');
    }
  }

  /// Generates system instruction for the AI assistant
  String _generateSystemInstruction() {
    final userName = userController.user.value.name;
    final assistantName = assistant.name;
    final userStats = _getUserStatistics();

    return '''
You are $assistantName, a friendly and supportive personal Beauty Mirror assistant for $userName.

Your Role:
- Help users build and maintain healthy habits
- Provide motivation, accountability, and personalized insights
- Analyze activity patterns and suggest improvements
- Celebrate successes and provide constructive feedback
- Be empathetic, encouraging, and non-judgmental

Communication Style:
- Be warm, friendly, and conversational
- Use emojis occasionally to show personality (but don't overdo it)
- Keep responses concise and actionable (2-4 sentences for simple queries)
- Ask clarifying questions when needed
- Personalize responses based on user data

User Context:
$userStats

Guidelines:
- Reference specific habits and stats when relevant
- Acknowledge progress and improvements
- Suggest realistic, achievable goals
- Provide tips based on behavioral science
- Never be preachy or judgmental
- If the user seems discouraged, be extra supportive
- Respect user privacy - don't share or reference sensitive data unnecessarily

Current Date: ${DateTime.now().toLocal().toString().split(' ')[0]}
Session: Active conversation with context memory enabled
''';
  }

  /// Gathers user statistics and activity data for context
  String _getUserStatistics() {
    try {
      final user = userController.user.value;

      // Gather activity statistics
      final reportController = Get.find<ReportController>();
      final activities = userController.user.value.activities;

      final totalActiveActivities =
          activities.where((a) => a.activeStatus == true).length;
      final completionRate = reportController.overallCompletionRate.value;

      // Calculate streak information
      final activeStreaks = reportController.currentStreak.value;
      final longestStreak = reportController.totalPerfectDays.value;

      final activityController = Get.find<ActivityController>();
      final List<Task> instancesForDay =
          activityController.regularTasks + activityController.oneTimeTasks;
      final completedToday =
          instancesForDay
              .where((task) => task.status == TaskStatus.completed)
              .length;
      final totalActivities = instancesForDay.length;

      // Calculate weekly completion rate
      final weeklyStats = reportController.calculateWeeklyCompletion();

      String activityHighlights = '';

      for (var activity in activities) {
        if (activity.activeStatus != true) continue;

        final stats = reportController.getActivityMetrics(activity.id);
        activityHighlights +=
            '- ${activity.name}, completion rate: ${stats['completionRate']}% , current streak: ${stats['currentStreak']} days, tasks completed ${stats['tasksCompleted']}, perfect days: ${stats['perfectDay']}\n';
      }

      return '''
User Profile:
- Name: ${user.name}
- Total Active activities: $totalActiveActivities

General Stats:
- Overall Completion Rate: ${completionRate.toStringAsFixed(1)}%

Activity Tracking:
- Completed Today: $completedToday/$totalActivities
- Active Streaks: $activeStreaks activities
- Longest Current Streak: $longestStreak days

- This Week's Completion Rate: ${weeklyStats['completionRate']}%
  - Most Consistent activity: ${weeklyStats['bestHabit'] ?? 'None yet'}
  - Needs Attention: ${weeklyStats['strugglingHabit'] ?? 'All good!'}

Activity Highlights:
$activityHighlights

''';
    } catch (e) {
      log('Error gathering user statistics: $e');
      return '''
User Profile:
- Name: ${userController.user.value.name}
- Activity tracking in progress
''';
    }
  }

  void addWelcomeMessage() {
    final welcomeText = _getPersonalizedWelcome();

    final welcomeMessage = TextMessage(
      authorId: assistant.id,
      createdAt: DateTime.now().toUtc(),
      id: const Uuid().v4(),
      text: welcomeText,
    );
    chatController.insertMessage(welcomeMessage);
  }

  /// Generates personalized welcome message
  String _getPersonalizedWelcome() {
    final hour = DateTime.now().hour;
    String greeting;

    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    try {
      final activityController = Get.find<ActivityController>();
      final List<Task> instancesForDay =
          activityController.regularTasks + activityController.oneTimeTasks;
      final completedToday =
          instancesForDay
              .where((task) => task.status == TaskStatus.completed)
              .length;
      final totalActivities = instancesForDay.length;

      if (completedToday == totalActivities && totalActivities > 0) {
        return "$greeting! 🌟 Wow, you've completed all your activities today! How can I help you?";
      } else if (completedToday > 0) {
        return "$greeting! 👋 You're doing great with $completedToday activity${completedToday == 1 ? '' : 's'} completed today. What's on your mind?";
      } else {
        return "$greeting! 👋 Ready to crush your activities today? How can I assist you?";
      }
    } catch (e) {
      return "$greeting! 👋 I'm your personal assistant. How can I help you today?";
    }
  }

  Future<void> handleSendPressed(String? message) async {
    if (message == null || message.trim().isEmpty) return;

    final textMessage = TextMessage(
      authorId: user.id,
      createdAt: DateTime.now().toUtc(),
      id: const Uuid().v4(),
      text: message.trim(),
      sentAt: DateTime.now().toUtc(),
    );
    chatController.insertMessage(textMessage);

    isLoading.value = true;
    isTyping.value = true;
    lastError.value = '';

    try {
      // Generate system instruction with fresh user data
      final systemInstruction = _generateSystemInstruction();

      // Send message with context
      final response = await _geminiService.sendTextMessage(
        message.trim(),
        systemInstruction: systemInstruction,
        maintainHistory: true,
      );

      // Save conversation history to both local and Firebase
      await _saveConversationHistory();

      final aiMessage = TextMessage(
        authorId: assistant.id,
        createdAt: DateTime.now().toUtc(),
        id: const Uuid().v4(),
        text: response,
        sentAt: DateTime.now().toUtc(),
      );
      chatController.insertMessage(aiMessage);

      // Track analytics (optional)
      _trackMessageSent(message, response);
    } catch (e) {
      log('Error sending message: $e');
      lastError.value = e.toString();

      final errorMessage = TextMessage(
        authorId: assistant.id,
        createdAt: DateTime.now().toUtc(),
        id: const Uuid().v4(),
        text:
            "I'm having trouble connecting right now. Please check your internet and try again. 😅",
        failedAt: DateTime.now().toUtc(),
      );
      chatController.insertMessage(errorMessage);
    } finally {
      isLoading.value = false;
      isTyping.value = false;
    }
  }

  /// Tracks message analytics (optional)
  void _trackMessageSent(String userMessage, String aiResponse) {
    // Example: Firebase Analytics, Mixpanel, etc.
    log('Message sent - Session: $_currentSessionId');
  }

  /// Provides quick action suggestions
  List<String> getQuickActions() {
    try {
      final activityController = Get.find<ActivityController>();
      final List<Task> instancesForDay =
          activityController.regularTasks + activityController.oneTimeTasks;

      final suggestions = <String>[];

      // Check for incomplete activities
      final incomplete =
          instancesForDay
              .where((h) => h.status != TaskStatus.completed)
              .toList();
      if (incomplete.isNotEmpty) {
        suggestions.add("What activities should I focus on today?");
      }

      // Check for streaks
      // final hasStreaks = activities.any((h) => h.currentStreak > 5);
      // if (hasStreaks) {
      //   suggestions.add("Show me my progress this week");
      // }

      // General suggestions
      suggestions.addAll([
        "Give me motivation",
        "Help me build a new activity",
        "Why am I struggling with consistency?",
      ]);

      return suggestions.take(3).toList();
    } catch (e) {
      return [
        "How can I build better activities?",
        "Give me some motivation",
        "Show me my progress",
      ];
    }
  }

  /// Clears chat and syncs to Firebase
  Future<void> clearChat() async {
    chatController.messages.clear();
    _geminiService.clearHistory();
    _initializeSession();

    // Clear from storage
    await _localStorage.removeData(_chatHistoryKey);

    // Clear from Firebase
    final userId = userController.user.value.id;
    await _chatRepository.clearChatHistory(userId);

    addWelcomeMessage();
  }

  /// Forces sync to Firebase (useful for manual refresh)
  Future<void> forceSyncToFirebase() async {
    try {
      isSyncing.value = true;
      await _saveConversationHistory();
      await _localStorage.writeData(
        _lastSyncKey,
        DateTime.now().toIso8601String(),
      );

      Get.snackbar(
        'Synced',
        'Chat history synced successfully',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
      );
    } catch (e) {
      log('Error force syncing: $e');
      Get.snackbar(
        'Sync Failed',
        'Could not sync to cloud',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
      );
    } finally {
      isSyncing.value = false;
    }
  }

  /// Gets last sync time
  String? getLastSyncTime() {
    final lastSync = _localStorage.readData<String>(_lastSyncKey);
    if (lastSync != null) {
      final syncTime = DateTime.parse(lastSync);
      final now = DateTime.now();
      final difference = now.difference(syncTime);

      if (difference.inMinutes < 1) {
        return 'Just now';
      } else if (difference.inHours < 1) {
        return '${difference.inMinutes}m ago';
      } else if (difference.inDays < 1) {
        return '${difference.inHours}h ago';
      } else {
        return '${difference.inDays}d ago';
      }
    }
    return null;
  }

  /// Exports chat history for backup/sharing
  Future<String> exportChatHistory() async {
    try {
      final messages = chatController.messages;
      final export =
          messages
              .map((msg) {
                if (msg is TextMessage) {
                  return {
                    'author': msg.authorId == user.id ? 'User' : assistant.name,
                    'text': msg.text,
                    'timestamp': msg.createdAt!.toIso8601String(),
                  };
                }
                return null;
              })
              .where((m) => m != null)
              .toList();

      return jsonEncode({
        'session_id': _currentSessionId,
        'started_at': _sessionStartTime?.toIso8601String(),
        'user': user.name,
        'messages': export,
      });
    } catch (e) {
      log('Error exporting chat: $e');
      throw Exception('Failed to export chat history');
    }
  }

  Future<void> handleSendPressedWithImages(
    String? message,
    List<File> images,
  ) async {
    if ((message == null || message.trim().isEmpty) && images.isEmpty) return;

    // Create user message with image indicators
    final messageText = message?.trim() ?? '';
    final displayText = messageText;
    // images.isNotEmpty
    //     ? '$messageText ${images.length == 1 ? "[📷 Image]" : "[📷 ${images.length} Images]"}'
    //     : messageText;

    for (var img in images) {
      var imgMessage = ImageMessage(
        authorId: user.id,
        createdAt: DateTime.now().toUtc(),
        id: const Uuid().v4(),
        source: img.path,
        text: displayText,
        sentAt: DateTime.now().toUtc(),
      );
      chatController.insertMessage(imgMessage);
    }

    final textMessage = TextMessage(
      authorId: user.id,
      createdAt: DateTime.now().toUtc(),
      id: const Uuid().v4(),
      text: displayText,
      sentAt: DateTime.now().toUtc(),
    );
    chatController.insertMessage(textMessage);

    isLoading.value = true;
    isTyping.value = true;
    lastError.value = '';

    try {
      final systemInstruction = _generateSystemInstruction();

      // Build prompt with image context
      String prompt =
          messageText.isEmpty
              ? "Please analyze these images and provide insights."
              : messageText;

      // Use Gemini's multimodal capability
      final response = await _geminiService.analyzeImagesWithText(
        images: images,
        prompt: prompt,
        systemInstruction: systemInstruction,
      );

      await _saveConversationHistory();

      final aiMessage = TextMessage(
        authorId: assistant.id,
        createdAt: DateTime.now().toUtc(),
        id: const Uuid().v4(),
        text: response,
        sentAt: DateTime.now().toUtc(),
      );
      chatController.insertMessage(aiMessage);
    } catch (e) {
      log('Error sending message with images: $e');
    } finally {
      isLoading.value = false;
      isTyping.value = false;
    }
  }

  Future<void> handleVoiceMessage(File audioFile, Duration duration) async {
    // Show user message with audio indicator
    final audioMessage = AudioMessage(
      authorId: user.id,
      createdAt: DateTime.now().toUtc(),
      id: const Uuid().v4(),
      source: audioFile.path,
      duration: duration,
      sentAt: DateTime.now().toUtc(),
    );
    chatController.insertMessage(audioMessage);

    isLoading.value = true;
    isTyping.value = true;
    lastError.value = '';

    try {
      final systemInstruction = _generateSystemInstruction();

      // Send audio directly to Gemini
      final response = await _geminiService.processAudioMessage(
        audioFile: audioFile,
        systemInstruction: systemInstruction,
      );

      await _saveConversationHistory();

      final aiMessage = TextMessage(
        authorId: assistant.id,
        createdAt: DateTime.now().toUtc(),
        id: const Uuid().v4(),
        text: response,
        sentAt: DateTime.now().toUtc(),
      );
      chatController.insertMessage(aiMessage);

      _trackMessageSent("Voice message", response);
    } catch (e) {
      log('Error processing voice message: $e');
      lastError.value = e.toString();

      final errorMessage = TextMessage(
        authorId: assistant.id,
        createdAt: DateTime.now().toUtc(),
        id: const Uuid().v4(),
        text: "I couldn't hear that clearly. Could you try recording again? 🎧",
        failedAt: DateTime.now().toUtc(),
      );
      chatController.insertMessage(errorMessage);
    } finally {
      isLoading.value = false;
      isTyping.value = false;
    }
  }

  @override
  void onClose() {
    _saveConversationHistory();
    chatController.dispose();
    super.onClose();
  }
}
