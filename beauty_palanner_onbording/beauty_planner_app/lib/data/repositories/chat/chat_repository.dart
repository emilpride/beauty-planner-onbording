import 'dart:developer';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../../../utils/exceptions/exceptions.dart';
import '../../../utils/exceptions/format_exceptions.dart';
import '../../../utils/exceptions/platform_exceptions.dart';

class ChatRepository extends GetxController {
  static ChatRepository get instance => Get.find();

  final _db = FirebaseFirestore.instance;

  /// Saves chat history to Firebase
  /// This replaces the entire chat history document
  Future<void> saveChatHistory(
    String userId,
    List<Map<String, dynamic>> history,
  ) async {
    try {
      // Store chat history with timestamp
      await _db
          .collection('Users')
          .doc(userId)
          .collection('ChatHistory')
          .doc('conversation') // Single doc for conversation history
          .set({
            'messages': history,
            'lastUpdated': FieldValue.serverTimestamp(),
            'messageCount': history.length,
          }, SetOptions(merge: true));

      log('Saved ${history.length} messages to Firebase');
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log('Error saving chat history: $e');
      throw 'Failed to save chat history. Please try again.';
    }
  }

  /// Fetches chat history from Firebase
  Future<List<Map<String, dynamic>>> fetchChatHistory(String userId) async {
    try {
      final documentSnapshot =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('ChatHistory')
              .doc('conversation')
              .get();

      if (documentSnapshot.exists && documentSnapshot.data() != null) {
        final data = documentSnapshot.data()!;
        final messages = data['messages'] as List?;

        if (messages != null && messages.isNotEmpty) {
          log('Fetched ${messages.length} messages from Firebase');
          return messages
              .map((m) => Map<String, dynamic>.from(m as Map))
              .toList();
        }
      }

      log('No chat history found in Firebase');
      return [];
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log('Error fetching chat history: $e');
      throw 'Failed to fetch chat history. Please try again.';
    }
  }

  /// Clears chat history from Firebase
  Future<void> clearChatHistory(String userId) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('ChatHistory')
          .doc('conversation')
          .delete();

      log('Cleared chat history from Firebase');
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log('Error clearing chat history: $e');
      throw 'Failed to clear chat history. Please try again.';
    }
  }

  /// Saves a single chat session (for archiving purposes)
  Future<void> archiveChatSession({
    required String userId,
    required String sessionId,
    required List<Map<String, dynamic>> messages,
    required DateTime startTime,
    DateTime? endTime,
  }) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('ChatSessions')
          .doc(sessionId)
          .set({
            'sessionId': sessionId,
            'startTime': Timestamp.fromDate(startTime),
            'endTime': endTime != null ? Timestamp.fromDate(endTime) : null,
            'messageCount': messages.length,
            'messages': messages,
            'archived': true,
            'createdAt': FieldValue.serverTimestamp(),
          });

      log('Archived session $sessionId with ${messages.length} messages');
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log('Error archiving chat session: $e');
      throw 'Failed to archive chat session. Please try again.';
    }
  }

  /// Fetches archived chat sessions
  Future<List<Map<String, dynamic>>> fetchArchivedSessions(
    String userId, {
    int limit = 10,
  }) async {
    try {
      final querySnapshot =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('ChatSessions')
              .orderBy('createdAt', descending: true)
              .limit(limit)
              .get();

      return querySnapshot.docs
          .map((doc) => {...doc.data(), 'id': doc.id})
          .toList();
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log('Error fetching archived sessions: $e');
      throw 'Failed to fetch archived sessions. Please try again.';
    }
  }

  /// Deletes an archived session
  Future<void> deleteArchivedSession(String userId, String sessionId) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('ChatSessions')
          .doc(sessionId)
          .delete();

      log('Deleted archived session $sessionId');
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log('Error deleting archived session: $e');
      throw 'Failed to delete archived session. Please try again.';
    }
  }

  /// Gets the last sync timestamp
  Future<DateTime?> getLastSyncTime(String userId) async {
    try {
      final documentSnapshot =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('ChatHistory')
              .doc('conversation')
              .get();

      if (documentSnapshot.exists && documentSnapshot.data() != null) {
        final timestamp = documentSnapshot.data()!['lastUpdated'] as Timestamp?;
        return timestamp?.toDate();
      }

      return null;
    } catch (e) {
      log('Error getting last sync time: $e');
      return null;
    }
  }

  /// Checks if chat history exists for a user
  Future<bool> hasChatHistory(String userId) async {
    try {
      final documentSnapshot =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('ChatHistory')
              .doc('conversation')
              .get();

      return documentSnapshot.exists &&
          documentSnapshot.data() != null &&
          (documentSnapshot.data()!['messageCount'] as int? ?? 0) > 0;
    } catch (e) {
      log('Error checking chat history: $e');
      return false;
    }
  }

  /// Batch update multiple messages (for efficiency)
  Future<void> batchUpdateMessages(
    String userId,
    List<Map<String, dynamic>> newMessages,
  ) async {
    try {
      // Get existing messages
      final existing = await fetchChatHistory(userId);

      // Merge with new messages (avoid duplicates if needed)
      final allMessages = [...existing, ...newMessages];

      // Keep only last 50 messages to prevent bloat
      final trimmedMessages =
          allMessages.length > 50
              ? allMessages.sublist(allMessages.length - 50)
              : allMessages;

      // Save back
      await saveChatHistory(userId, trimmedMessages);

      log('Batch updated with ${newMessages.length} new messages');
    } catch (e) {
      log('Error in batch update: $e');
      throw 'Failed to batch update messages. Please try again.';
    }
  }
}
