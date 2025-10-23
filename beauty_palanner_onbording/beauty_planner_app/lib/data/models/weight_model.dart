import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class WeightModel {
  double weight;
  String weightUnit;
  final String id;
  final DateTime date;

  TextEditingController weightTextController = TextEditingController();

  WeightModel({
    required this.weight,
    required this.weightUnit,
    required this.date,
    required this.id,
  });

  static WeightModel empty() => WeightModel(
    id: const Uuid().v4(),
    weight: 0,
    weightUnit: 'lbs',
    date: DateTime(DateTime.now().year, DateTime.now().month, 1).toUtc(),
  );

  factory WeightModel.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> document,
  ) {
    if (document.data() != null) {
      final data = document.data();
      return WeightModel(
        id: document.id,
        weightUnit: data!['WeightUnit'],
        weight: double.parse((data['Weight'] ?? 0.0).toString()),
        date: data['Date'].toDate(),
      );
    } else {
      return WeightModel.empty();
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'Id': id,
      'Weight': weight,
      'WeightUnit': weightUnit,
      'Date': Timestamp.fromDate(date),
    };
  }

  //from json
  factory WeightModel.fromJson(Map<String, dynamic> data) {
    return WeightModel(
      id: data['Id'],
      weightUnit: data['WeightUnit'] ?? 'lbs',
      weight: double.parse((data['Weight'] ?? 0.0).toString()),
      date: data['Date'].toDate(),
    );
  }

  @override
  String toString() {
    return '$weight $weightUnit';
  }
}
