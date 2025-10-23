import 'dart:developer';
import 'dart:io';
import 'package:firebase_ai/firebase_ai.dart';

class GeminiService {
  // Conversation history storage
  final List<Content> _conversationHistory = [];
  static const int maxHistoryLength =
      20; // Keep last 10 exchanges (20 messages)

  /// Sends a text message with conversation context
  Future<String> sendTextMessage(
    String message, {
    String? systemInstruction,
    bool maintainHistory = true,
  }) async {
    try {
      final model = FirebaseAI.googleAI().generativeModel(
        model: 'gemini-2.5-flash-lite',
        systemInstruction:
            systemInstruction != null
                ? Content.system(systemInstruction)
                : null,
      );

      // Add user message to history
      final userContent = Content.text(message);
      if (maintainHistory) {
        _conversationHistory.add(userContent);
      }

      // Generate response with full context
      final response = await model.generateContent(
        maintainHistory ? _conversationHistory : [userContent],
      );

      final responseText =
          response.text ??
          "Sorry, I couldn't process the response. Please try again.";

      // Add AI response to history
      if (maintainHistory) {
        _conversationHistory.add(Content.model([TextPart(responseText)]));

        // Trim history if it exceeds max length
        if (_conversationHistory.length > maxHistoryLength) {
          _conversationHistory.removeRange(
            0,
            _conversationHistory.length - maxHistoryLength,
          );
        }
      }

      return responseText;
    } catch (e) {
      log('Error in sendTextMessage: $e');
      return "There was an error communicating with the AI. Please check your connection or try again later.";
    }
  }

  /// Analyzes user health with images and structured output
  Future<String> analyzeUserHealth({
    required List<File> images,
    required String prompt,
    required Schema jsonSchema,
  }) async {
    final model = FirebaseAI.googleAI().generativeModel(
      model: 'gemini-2.5-flash',
    );

    try {
      final List<Part> promptParts = [];

      for (var image in images) {
        promptParts.add(
          InlineDataPart('image/jpeg', await image.readAsBytes()),
        );
      }
      promptParts.add(TextPart(prompt));

      final response = await model.generateContent(
        [Content.multi(promptParts)],
        generationConfig: GenerationConfig(
          responseMimeType: 'application/json',
          responseSchema: jsonSchema,
        ),
      );

      return response.text ??
          "Sorry, I couldn't process the response. Please try again.";
    } catch (e) {
      log('Error in analyzeUserHealth: $e');
      throw Exception(
        'Failed to communicate with the Gemini API via Firebase: $e',
      );
    }
  }

  /// Clears conversation history
  void clearHistory() {
    _conversationHistory.clear();
  }

  /// Gets current conversation history length
  int getHistoryLength() {
    return _conversationHistory.length;
  }

  /// Exports conversation history for persistence
  List<Map<String, dynamic>> exportHistory() {
    return _conversationHistory.map((content) {
      return {
        'role': content.role,
        'parts':
            content.parts.map((part) {
              if (part is TextPart) {
                return {'type': 'text', 'text': part.text};
              }
              return {'type': 'unknown'};
            }).toList(),
      };
    }).toList();
  }

  /// Imports conversation history from storage
  void importHistory(List<Map<String, dynamic>> history) {
    _conversationHistory.clear();
    for (var item in history) {
      final role = item['role'] as String;
      final parts =
          (item['parts'] as List).map((p) {
            if (p['type'] == 'text') {
              return TextPart(p['text'] as String);
            }
            return TextPart('');
          }).toList();

      if (role == 'user') {
        _conversationHistory.add(Content.text(parts.first.text));
      } else if (role == 'model') {
        _conversationHistory.add(Content.model(parts));
      }
    }
  }

  Future<String> analyzeImagesWithText({
    required List<File> images,
    required String prompt,
    String? systemInstruction,
  }) async {
    try {
      final model = FirebaseAI.googleAI().generativeModel(
        model: 'gemini-2.5-flash',
        systemInstruction:
            systemInstruction != null
                ? Content.system(systemInstruction)
                : null,
      );

      final List<Part> parts = [];

      // Add images
      for (var image in images) {
        parts.add(InlineDataPart('image/jpeg', await image.readAsBytes()));
      }

      // Add text prompt
      parts.add(TextPart(prompt));

      final response = await model.generateContent([Content.multi(parts)]);

      final responseText =
          response.text ??
          "Sorry, I couldn't analyze the images. Please try again.";

      // Add to conversation history
      _conversationHistory.add(
        Content.text(
          "User sent ${images.length} image(s) with message: $prompt",
        ),
      );
      _conversationHistory.add(Content.model([TextPart(responseText)]));

      // Trim history
      if (_conversationHistory.length > maxHistoryLength) {
        _conversationHistory.removeRange(
          0,
          _conversationHistory.length - maxHistoryLength,
        );
      }

      return responseText;
    } catch (e) {
      log('Error in analyzeImagesWithText: $e');
      return "There was an error analyzing the images. Please try again.";
    }
  }

  Future<String> processAudioMessage({
    required File audioFile,
    String? additionalPrompt,
    String? systemInstruction,
  }) async {
    try {
      final model = FirebaseAI.googleAI().generativeModel(
        model: 'gemini-2.5-flash',
        systemInstruction:
            systemInstruction != null
                ? Content.system(systemInstruction)
                : null,
      );

      // Read audio file as bytes
      final audioBytes = await audioFile.readAsBytes();

      // Determine MIME type from file extension
      final mimeType = _getAudioMimeType(audioFile.path);

      // Create audio part
      final audioPart = InlineDataPart(mimeType, audioBytes);

      // Create prompt
      final promptText =
          additionalPrompt != null && additionalPrompt.isNotEmpty
              ? "The user sent a voice message and said: (transcribe the audio). $additionalPrompt"
              : "The user sent a voice message. Please transcribe what they said and respond naturally to their message.";

      final textPart = TextPart(promptText);

      // Generate response
      final response = await model.generateContent([
        Content.multi([textPart, audioPart]),
      ]);

      final responseText =
          response.text ??
          "Sorry, I couldn't process your voice message. Please try again.";

      // Add to conversation history
      _conversationHistory.add(
        Content.text(
          "User sent a voice message${additionalPrompt != null && additionalPrompt.isNotEmpty ? ' with text: $additionalPrompt' : ''}",
        ),
      );
      _conversationHistory.add(Content.model([TextPart(responseText)]));

      // Trim history
      if (_conversationHistory.length > maxHistoryLength) {
        _conversationHistory.removeRange(
          0,
          _conversationHistory.length - maxHistoryLength,
        );
      }

      return responseText;
    } catch (e) {
      log('Error in processAudioMessage: $e');
      return "There was an error processing your voice message. Please check your connection and try again.";
    }
  }

  String _getAudioMimeType(String filePath) {
    final extension = filePath.split('.').last.toLowerCase();
    switch (extension) {
      case 'aac':
        return 'audio/aac';
      case 'flac':
        return 'audio/flac';
      case 'mp3':
        return 'audio/mp3';
      case 'm4a':
        return 'audio/m4a';
      case 'mpeg':
        return 'audio/mpeg';
      case 'mpga':
        return 'audio/mpga';
      case 'mp4':
        return 'audio/mp4';
      case 'opus':
        return 'audio/opus';
      case 'pcm':
        return 'audio/pcm';
      case 'wav':
        return 'audio/wav';
      case 'webm':
        return 'audio/webm';
      default:
        return 'audio/m4a'; // Default fallback
    }
  }
}
