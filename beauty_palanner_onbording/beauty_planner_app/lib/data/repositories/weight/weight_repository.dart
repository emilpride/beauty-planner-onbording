import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';

import '../../models/weight_model.dart';

class WeightRepository extends GetxController {
  static WeightRepository get instance => Get.find();

  final _db = FirebaseFirestore.instance;

  Future<List<WeightModel>> fetchAllWeights(String userId) async {
    try {
      final result =
          await _db.collection('Users').doc(userId).collection('Weights').get();
      return result.docs.map((doc) => WeightModel.fromSnapshot(doc)).toList();
    } catch (e) {
      throw 'Something went wrong while fetching Weight Information. Try again later.';
    }
  }

  Future<List<WeightModel>> fetchWeights(
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
              .collection('Weights')
              .orderBy('Date')
              .startAt([startDate])
              .endAt([endDate])
              .get();
      final weights =
          result.docs.map((doc) => WeightModel.fromSnapshot(doc)).toList();
      weights.sort((a, b) => a.date.compareTo(b.date));
      return weights;
    } catch (e) {
      throw 'Something went wrong while fetching Mood Information. Try again later.';
    }
  }

  Future<WeightModel> fetchWeightByDate(DateTime date, String userId) async {
    try {
      final result =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('Weights')
              .where('Date', isEqualTo: Timestamp.fromDate(date))
              .get();
      final mood =
          result.docs.map((doc) => WeightModel.fromSnapshot(doc)).first;
      return mood;
    } catch (e) {
      throw 'Something went wrong while fetching Mood Information. Try again later.';
    }
  }

  Future updateWeight(String userId, String weightId, double weight) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('Weights')
          .doc(weightId)
          .update({'Weight': weight});
    } catch (e) {
      throw 'Unable to update your selected Weight. Try again later.';
    }
  }

  Future<void> addWeights(String userId, WeightModel weight) async {
    try {
      // Calculate the start and end of the month for the given weight date
      final date = weight.date;
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
              .collection('Weights')
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
            .collection('Weights')
            .doc(existingDocId)
            .update({
              'Weight': weight.weight,
              // 'Date':
              //     Timestamp.fromDate(weight.date) // Update date to the specific day
            });
      } else {
        // No entry exists for the month, create a new one
        await _db
            .collection('Users')
            .doc(userId)
            .collection('Weights')
            .doc(weight.id) // Use the provided ID for the new document
            .set(weight.toJson());
      }
    } catch (e) {
      // Consider more specific error messages if needed
      throw 'Unable to add or update weight. Please try again later. Error: $e';
    }
  }
}
