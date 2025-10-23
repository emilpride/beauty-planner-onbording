import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:get/get.dart';

import '../../../features/app/models/updated_task_model.dart';
import '../../models/user_model.dart';

class UpdateTaskRepository extends GetxController {
  static UpdateTaskRepository get instance => Get.find();

  final _db = FirebaseFirestore.instanceFor(
    app: Firebase.app(),
    databaseId: 'petcaredb',
  );

  Future<List<UpdateTaskModel>> fetchAllUpdatedTasks(UserModel user) async {
    try {
      List<UpdateTaskModel> allUpdates = [];
      final result =
          await _db
              .collection('Users')
              .doc(user.id)
              .collection('Updates')
              .get();
      allUpdates.addAll(
        result.docs.map((doc) => UpdateTaskModel.fromSnapshot(doc)).toList(),
      );

      //sort the list by date
      allUpdates.sort((a, b) => a.updateTime.compareTo(b.updateTime));
      return allUpdates;
    } catch (e) {
      // throw 'Something went wrong while fetching Tasks. Try again later.';
      throw e.toString();
    }
  }

  Future<List<UpdateTaskModel>> fetchUpdatedTasks(
    DateTime start,
    DateTime end,
    String userId,
  ) async {
    try {
      final startTimestamp = Timestamp.fromDate(start);
      final endTimestamp = Timestamp.fromDate(end);
      final result =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('Updates')
              .where('UpdateTime', isGreaterThan: startTimestamp)
              .where('UpdateTime', isLessThanOrEqualTo: endTimestamp)
              .orderBy('UpdateTime', descending: false)
              .get();

      final updates =
          result.docs.map((doc) => UpdateTaskModel.fromSnapshot(doc)).toList();
      updates.sort((a, b) => a.updateTime.compareTo(b.updateTime));
      return updates;
    } catch (e) {
      throw 'Something went wrong while fetching updated tasks. Try again later.';
    }
  }

  // Future<UpdateTaskModel> fetchUpdatedTaskByDate(DateTime date, String petId) async {
  //   try {
  //     final result = await _db
  //         .collection('Pets')
  //         .doc(petId)
  //         .collection('Updates')
  //         .where('UpdateTime', isEqualTo: Timestamp.fromDate(date))
  //         .get();
  //     final mood =
  //         result.docs.map((doc) => UpdateTaskModel.fromSnapshot(doc)).first;
  //     return mood;
  //   } catch (e) {
  //     throw 'Something went wrong while fetching Mood Information. Try again later.';
  //   }
  // }

  // Future updateTask(String petId, String taskId, double weight) async {
  //   try {
  //     await _db
  //         .collection('Pets')
  //         .doc(petId)
  //         .collection('CompletedTasks')
  //         .doc(taskId)
  //         .update({'Weight': weight});
  //   } catch (e) {
  //     throw 'Unable to update your selected Weight. Try again later.';
  //   }
  // }

  Future addTask(String userId, UpdateTaskModel task) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('Updates')
          .add(task.toFirestore());
    } catch (e) {
      throw 'Unable to update your selected task. Try again later.';
    }
  }
}
