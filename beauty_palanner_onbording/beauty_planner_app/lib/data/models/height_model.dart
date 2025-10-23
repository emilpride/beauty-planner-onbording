import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class HeightModel {
  double height;
  String heightUnit;
  double inch;
  final String id;
  final DateTime date;

  TextEditingController heightController = TextEditingController();

  HeightModel({
    required this.height,
    required this.inch,
    required this.heightUnit,
    required this.date,
    required this.id,
  });

  static HeightModel empty() => HeightModel(
    id: const Uuid().v4(),
    height: 0,
    inch: 0,
    heightUnit: 'cm',
    date: DateTime(DateTime.now().year, DateTime.now().month, 1).toUtc(),
  );

  factory HeightModel.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> document,
  ) {
    if (document.data() != null) {
      final data = document.data();
      return HeightModel(
        id: document.id,
        heightUnit: data!['HeightUnit'] ?? 'cm',
        height: double.parse((data['Height'] ?? 0.0).toString()),
        inch: double.parse((data['Inch'] ?? 0.0).toString()),
        date: data['Date'].toDate(),
      );
    } else {
      return HeightModel.empty();
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'Id': id,
      'Height': height,
      'Inch': inch,
      'HeightUnit': heightUnit,
      'Date': Timestamp.fromDate(date),
    };
  }

  //from json
  factory HeightModel.fromJson(Map<String, dynamic> data) {
    return HeightModel(
      id: data['Id'],
      heightUnit: data['HeightUnit'] ?? 'cm',
      height: double.parse((data['Height'] ?? 0.0).toString()),
      inch: double.parse((data['Inch'] ?? 0.0).toString()),
      date: data['Date'].toDate(),
    );
  }

  @override
  String toString() {
    return heightUnit == 'ft&in'
        ? '${(height + (inch / 12)).toStringAsFixed(2)} ft'
        : '${height.toStringAsFixed(2)} cm';
  }
}
