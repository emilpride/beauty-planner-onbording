import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../../../utils/helpers/helper_functions.dart';

class UpdateTaskModel {
  final String activityId;
  final DateTime updateTime;
  final DateTime previousDate;
  final DateTime? newDate;
  final TimeOfDay? previousTime;
  final TimeOfDay? newTime;
  final String status;

  UpdateTaskModel({
    required this.activityId,
    required this.updateTime,
    required this.previousDate,
    this.newDate,
    this.previousTime,
    this.newTime,
    required this.status,
  });

  static UpdateTaskModel empty() => UpdateTaskModel(
    activityId: '',
    updateTime: DateTime.now(),
    previousDate: DateTime.now(),
    newDate: DateTime.now(),
    previousTime: TimeOfDay.now(),
    newTime: TimeOfDay.now(),
    status: '',
  );

  Map<String, dynamic> toJson() {
    return {
      'ActivitId': activityId,
      'UpdateTime': updateTime.toIso8601String(),
      'PreviousDate': previousDate.toIso8601String(),
      'NewDate': newDate?.toIso8601String(),
      'PreviousTime':
          previousTime != null
              ? MyHelperFunctions.timeOfDayToFirebase(previousTime!)
              : null,
      'NewTime':
          newTime != null
              ? MyHelperFunctions.timeOfDayToFirebase(newTime!)
              : null,
      'Status': status,
    };
  }

  // prepare for uploading to firestore database change the dates to timestamp
  Map<String, dynamic> toFirestore() {
    return {
      'ActivitId': activityId,
      'UpdateTime': Timestamp.fromDate(updateTime),
      'PreviousDate': Timestamp.fromDate(previousDate),
      'NewDate': newDate != null ? Timestamp.fromDate(newDate!) : null,
      'PreviousTime':
          previousTime != null
              ? MyHelperFunctions.timeOfDayToFirebase(previousTime!)
              : null,
      'NewTime':
          newTime != null
              ? MyHelperFunctions.timeOfDayToFirebase(newTime!)
              : null,
      'Status': status,
    };
  }

  //from json
  factory UpdateTaskModel.fromJson(Map<String, dynamic> data) {
    return UpdateTaskModel(
      activityId: data['ActivitId'],
      updateTime: DateTime.parse(data['UpdateTime']),
      previousDate: DateTime.parse(data['PreviousDate']),
      newDate: data['NewDate'] != null ? DateTime.parse(data['NewDate']) : null,
      previousTime:
          data['PreviousTime'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['PreviousTime'])
              : null,
      newTime:
          data['NewTime'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['NewTime'])
              : null,
      status: data['Status'],
    );
  }

  factory UpdateTaskModel.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> snapshot,
  ) {
    if (snapshot.data() == null) {
      return UpdateTaskModel.empty();
    } else {
      final data = snapshot.data()!;
      return UpdateTaskModel(
        activityId: data['ActivitId'] ?? '',
        updateTime: data['UpdateTime'].toDate(),
        previousDate: data['PreviousDate'].toDate(),
        newDate: data['NewDate']?.toDate(),
        previousTime:
            data['PreviousTime'] != null
                ? MyHelperFunctions.firebaseToTimeOfDay(data['PreviousTime'])
                : null,
        newTime:
            data['NewTime'] != null
                ? MyHelperFunctions.firebaseToTimeOfDay(data['NewTime'])
                : null,
        status: data['Status'] ?? '',
      );
    }
  }
}
