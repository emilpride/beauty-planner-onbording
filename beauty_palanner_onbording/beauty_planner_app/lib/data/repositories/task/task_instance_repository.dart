import 'dart:developer';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';
import '../../../features/app/models/task_model.dart';
import '../../models/user_model.dart';

class TaskInstanceRepository extends GetxController {
  static TaskInstanceRepository get instance => Get.find();

  final _db = FirebaseFirestore.instance;

  Future<List<TaskInstance>> fetchAllTaskInstances(UserModel user) async {
    try {
      List<TaskInstance> allUpdates = [];
      final result =
          await _db
              .collection('Users')
              .doc(user.id)
              .collection('Updates')
              .get();
      allUpdates.addAll(
        result.docs.map((doc) => TaskInstance.fromSnapshot(doc)).toList(),
      );

      //sort the list by date
      allUpdates.sort((a, b) => a.updatedAt.compareTo(b.updatedAt));
      return allUpdates;
    } catch (e) {
      // throw 'Something went wrong while fetching Tasks. Try again later.';
      throw e.toString();
    }
  }

  Future<void> deleteTaskInstance(String userId, String instanceId) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('Updates')
          .doc(instanceId)
          .delete();
    } catch (e) {
      throw Exception('Failed to delete task instance: $e');
    }
  }

  Future<List<TaskInstance>> fetchTaskInstancesSince(
    DateTime start,
    String userId,
  ) async {
    try {
      final startTimestamp = Timestamp.fromDate(start);
      final endTimestamp = Timestamp.fromDate(DateTime.now());

      log(
        "Querying updates since: $start (${startTimestamp.seconds})",
      ); // Debug log

      final result =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('Updates')
              .where('updatedAt', isGreaterThan: startTimestamp)
              .where('updatedAt', isLessThanOrEqualTo: endTimestamp)
              .orderBy('updatedAt', descending: false)
              .get();

      log("Found ${result.docs.length} updates since $start"); // Debug log

      final updates =
          result.docs.map((doc) {
            log("Processing doc: ${doc.id}, data: ${doc.data()}"); // Debug log
            return TaskInstance.fromSnapshot(doc);
          }).toList();

      updates.sort((a, b) => a.updatedAt.compareTo(b.updatedAt));
      return updates;
    } catch (e) {
      log("Error in fetchTaskInstancesSince: $e"); // Debug log
      throw 'Something went wrong while fetching updated tasks: $e';
    }
  }

  //update a task instance
  Future<void> updateTaskInstance(
    String userId,
    TaskInstance updatedInstance,
  ) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('Updates')
          .doc(updatedInstance.id)
          .set(
            updatedInstance.toJson(forFirebase: true),
            SetOptions(merge: true),
          );
    } catch (e) {
      throw 'Unable to update your selected task. Try again later.';
    }
  }

  Future addTaskInstance(String userId, TaskInstance task) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('Updates')
          .doc(task.id) // Use the TaskInstance's generated ID
          .set(task.toJson(forFirebase: true));
    } catch (e) {
      throw 'Unable to add your task. Try again later.';
    }
  }

  Future<void> deleteBulkTaskInstances(
    String userId,
    List<String> instanceIds,
  ) async {
    try {
      WriteBatch batch = _db.batch();

      for (String instanceId in instanceIds) {
        DocumentReference docRef = _db
            .collection('Users')
            .doc(userId)
            .collection('Updates')
            .doc(instanceId);
        batch.delete(docRef);
      }

      await batch.commit();
    } catch (e) {
      throw Exception('Failed to delete task instances: $e');
    }
  }
}
