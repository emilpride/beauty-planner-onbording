import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';
import 'package:logger/logger.dart';

import '../../models/mood_model.dart';

class MoodRepository extends GetxController {
  static MoodRepository get instance => Get.find();

  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final Logger _logger = Logger();

  // Collection reference
  CollectionReference _getUserMoodCollection(String userId) {
    return _db.collection('Users').doc(userId).collection('Moods');
  }

  // Fetch all mood entries for a user
  Future<List<MoodEntry>> fetchAllMoodEntries(String userId) async {
    try {
      _logger.d('Fetching all mood entries for user: $userId');

      final querySnapshot =
          await _getUserMoodCollection(userId).orderBy('date').get();

      final entries =
          querySnapshot.docs
              .map(
                (doc) => MoodEntry.fromSnapshot(
                  doc as DocumentSnapshot<Map<String, dynamic>>,
                ),
              )
              .where(
                (entry) => entry.userId.isNotEmpty,
              ) // Filter out invalid entries
              .toList();

      _logger.i('Fetched ${entries.length} mood entries for user $userId');
      return entries;
    } catch (e, s) {
      _logger.e(
        'Error fetching all mood entries for user $userId',
        error: e,
        stackTrace: s,
      );
      throw 'Failed to fetch mood history. Please try again later.';
    }
  }

  // Fetch mood entries since a specific date
  Future<List<MoodEntry>> fetchMoodEntriesSince(
    DateTime since,
    String userId,
  ) async {
    try {
      _logger.d('Fetching mood entries for user $userId since $since');

      final sinceTimestamp = Timestamp.fromDate(since);
      final querySnapshot =
          await _getUserMoodCollection(userId)
              .where('updatedAt', isGreaterThan: sinceTimestamp)
              .orderBy('updatedAt')
              .orderBy('date')
              .get();

      final entries =
          querySnapshot.docs
              .map(
                (doc) => MoodEntry.fromSnapshot(
                  doc as DocumentSnapshot<Map<String, dynamic>>,
                ),
              )
              .where((entry) => entry.userId.isNotEmpty)
              .toList();

      _logger.i(
        'Fetched ${entries.length} mood entries for user $userId since $since',
      );
      return entries;
    } catch (e, s) {
      _logger.e(
        'Error fetching mood entries since $since for user $userId',
        error: e,
        stackTrace: s,
      );
      throw 'Failed to sync mood data. Please try again later.';
    }
  }

  // Fetch mood entries for a date range
  Future<List<MoodEntry>> fetchMoodEntriesForDateRange(
    String userId,
    DateTime startDate,
    DateTime endDate,
  ) async {
    try {
      _logger.d(
        'Fetching mood entries for user $userId from $startDate to $endDate',
      );

      final startTimestamp = Timestamp.fromDate(startDate);
      final endTimestamp = Timestamp.fromDate(endDate);

      final querySnapshot =
          await _getUserMoodCollection(userId)
              .where('date', isGreaterThanOrEqualTo: startTimestamp)
              .where('date', isLessThanOrEqualTo: endTimestamp)
              .orderBy('date')
              .get();

      final entries =
          querySnapshot.docs
              .map(
                (doc) => MoodEntry.fromSnapshot(
                  doc as DocumentSnapshot<Map<String, dynamic>>,
                ),
              )
              .where((entry) => entry.userId.isNotEmpty)
              .toList();

      _logger.i(
        'Fetched ${entries.length} mood entries for user $userId in date range',
      );
      return entries;
    } catch (e, s) {
      _logger.e(
        'Error fetching mood entries for date range',
        error: e,
        stackTrace: s,
      );
      throw 'Failed to fetch mood data for the specified period.';
    }
  }

  // Fetch mood entry for a specific date
  Future<MoodEntry?> fetchMoodEntryByDate(String userId, DateTime date) async {
    try {
      final dateStart = DateTime(date.year, date.month, date.day);
      final dateEnd = DateTime(date.year, date.month, date.day, 23, 59, 59);

      final startTimestamp = Timestamp.fromDate(dateStart);
      final endTimestamp = Timestamp.fromDate(dateEnd);

      final querySnapshot =
          await _getUserMoodCollection(userId)
              .where('date', isGreaterThanOrEqualTo: startTimestamp)
              .where('date', isLessThanOrEqualTo: endTimestamp)
              .limit(1)
              .get();

      if (querySnapshot.docs.isNotEmpty) {
        return MoodEntry.fromSnapshot(
          querySnapshot.docs.first as DocumentSnapshot<Map<String, dynamic>>,
        );
      }

      return null;
    } catch (e, s) {
      _logger.e(
        'Error fetching mood entry for date $date',
        error: e,
        stackTrace: s,
      );
      throw 'Failed to fetch mood entry for the specified date.';
    }
  }

  // Update or create a mood entry
  Future<void> updateMoodEntry(String userId, MoodEntry entry) async {
    try {
      _logger.d('Updating mood entry: ${entry.id}');

      // Use date-based ID for consistency
      final dateKey = MoodEntry.generateId(userId, entry.date);

      await _getUserMoodCollection(userId)
          .doc(dateKey)
          .set(entry.toJson(forFirebase: true), SetOptions(merge: true));

      _logger.i('Successfully updated mood entry: $dateKey');
    } catch (e, s) {
      _logger.e(
        'Error updating mood entry: ${entry.id}',
        error: e,
        stackTrace: s,
      );
      throw 'Failed to save mood entry. Please try again.';
    }
  }

  // Bulk update mood entries (for batch operations)
  Future<void> updateBulkMoodEntries(
    String userId,
    List<MoodEntry> entries,
  ) async {
    try {
      _logger.d(
        'Bulk updating ${entries.length} mood entries for user $userId',
      );

      final batch = _db.batch();
      final collection = _getUserMoodCollection(userId);

      for (final entry in entries) {
        final dateKey = MoodEntry.generateId(userId, entry.date);
        final docRef = collection.doc(dateKey);
        batch.set(
          docRef,
          entry.toJson(forFirebase: true),
          SetOptions(merge: true),
        );
      }

      await batch.commit();
      _logger.i('Successfully bulk updated ${entries.length} mood entries');
    } catch (e, s) {
      _logger.e('Error bulk updating mood entries', error: e, stackTrace: s);
      throw 'Failed to save mood entries. Please try again.';
    }
  }

  // Delete a mood entry
  Future<void> deleteMoodEntry(String userId, String dateKey) async {
    try {
      _logger.d('Deleting mood entry: $dateKey');

      await _getUserMoodCollection(userId).doc(dateKey).delete();

      _logger.i('Successfully deleted mood entry: $dateKey');
    } catch (e, s) {
      _logger.e('Error deleting mood entry: $dateKey', error: e, stackTrace: s);
      throw 'Failed to delete mood entry. Please try again.';
    }
  }

  // Bulk delete mood entries
  Future<void> deleteBulkMoodEntries(
    String userId,
    List<String> dateKeys,
  ) async {
    try {
      _logger.d(
        'Bulk deleting ${dateKeys.length} mood entries for user $userId',
      );

      final batch = _db.batch();
      final collection = _getUserMoodCollection(userId);

      for (final dateKey in dateKeys) {
        final docRef = collection.doc(dateKey);
        batch.delete(docRef);
      }

      await batch.commit();
      _logger.i('Successfully bulk deleted ${dateKeys.length} mood entries');
    } catch (e, s) {
      _logger.e('Error bulk deleting mood entries', error: e, stackTrace: s);
      throw 'Failed to delete mood entries. Please try again.';
    }
  }

  // Delete all mood data for a user (for account deletion)
  Future<void> deleteAllUserMoodData(String userId) async {
    try {
      _logger.w('Deleting ALL mood data for user: $userId');

      final collection = _getUserMoodCollection(userId);
      final querySnapshot = await collection.get();

      final batch = _db.batch();
      for (final doc in querySnapshot.docs) {
        batch.delete(doc.reference);
      }

      await batch.commit();
      _logger.i('Successfully deleted all mood data for user $userId');
    } catch (e, s) {
      _logger.e(
        'Error deleting all mood data for user $userId',
        error: e,
        stackTrace: s,
      );
      throw 'Failed to delete mood data.';
    }
  }
}
