import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';

import '../../models/height_model.dart';

class HeightRepository extends GetxController {
  static HeightRepository get instance => Get.find();

  final _db = FirebaseFirestore.instance;

  Future<List<HeightModel>> fetchAllHeights(String userId) async {
    try {
      final result =
          await _db.collection('Users').doc(userId).collection('Heights').get();
      return result.docs.map((doc) => HeightModel.fromSnapshot(doc)).toList();
    } catch (e) {
      throw 'Something went wrong while fetching Height Information. Try again later.';
    }
  }

  Future<List<HeightModel>> fetchHeights(
    DateTime start,
    DateTime end,
    String userId,
  ) async {
    try {
      final startDate = Timestamp.fromDate(start);
      final endDate = Timestamp.fromDate(end);
      final result =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('Heights')
              .orderBy('Date')
              .startAt([startDate])
              .endAt([endDate])
              .get();
      final heights =
          result.docs.map((doc) => HeightModel.fromSnapshot(doc)).toList();
      heights.sort((a, b) => a.date.compareTo(b.date));
      return heights;
    } catch (e) {
      throw 'Something went wrong while fetching Mood Information. Try again later.';
    }
  }

  Future<HeightModel> fetchHeightByDate(DateTime date, String userId) async {
    try {
      final result =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('Heights')
              .where('Date', isEqualTo: Timestamp.fromDate(date))
              .get();
      final mood =
          result.docs.map((doc) => HeightModel.fromSnapshot(doc)).first;
      return mood;
    } catch (e) {
      throw 'Something went wrong while fetching Mood Information. Try again later.';
    }
  }

  Future updateHeight(
    String userId,
    String heightId,
    double height,
    double inch,
  ) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('Heights')
          .doc(heightId)
          .update({'Height': height, 'Inch': inch});
    } catch (e) {
      throw 'Unable to update your selected Height. Try again later.';
    }
  }

  Future<void> addHeights(String userId, HeightModel height) async {
    try {
      // Calculate the start and end of the month for the given height date
      final date = height.date;
      final startOfMonth = Timestamp.fromDate(
        DateTime(date.year, date.month, 1),
      );
      // Calculate the start of the next month. Handles year change automatically.
      final startOfNextMonth = Timestamp.fromDate(
        (date.month < 12)
            ? DateTime(date.year, date.month + 1, 1)
            : DateTime(date.year + 1, 1, 1),
      );

      // Query for existing weight entries within that month
      final querySnapshot =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('Heights')
              .where('Date', isGreaterThanOrEqualTo: startOfMonth)
              .where('Date', isLessThan: startOfNextMonth)
              .limit(1) // We only need one document to confirm existence
              .get();

      if (querySnapshot.docs.isNotEmpty) {
        // Entry exists for the month, update it
        final existingDocId = querySnapshot.docs.first.id;
        await _db
            .collection('Users')
            .doc(userId)
            .collection('Heights')
            .doc(existingDocId)
            .update({
              'Height': height.height,
              'Inch': height.inch,
              // 'Date':
              //     Timestamp.fromDate(height.date) // Update date to the specific day
            });
      } else {
        // No entry exists for the month, create a new one
        await _db
            .collection('Users')
            .doc(userId)
            .collection('Heights')
            .doc(height.id) // Use the provided ID for the new document
            .set(height.toJson());
      }
    } catch (e) {
      // Consider more specific error messages if needed
      throw 'Unable to add or update height. Please try again later. Error: $e';
    }
  }
}
