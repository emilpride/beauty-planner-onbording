import 'dart:ui';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

import '../../utils/constants/image_strings.dart';

class CategoryModel {
  final String id;
  String name;
  String? illustration;
  Color? color;

  CategoryModel({
    required this.id,
    required this.name,
    this.illustration,
    this.color,
  });

  //empty model
  CategoryModel.empty()
    : id = const Uuid().v4(),
      name = '',
      illustration = AppImages.physics,
      color = const Color(0xFF8A60FF);

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['Id'] as String,
      name: json['Name'] as String,
      illustration: json['Illustration'] as String,
      color: Color(int.parse(json['Color'].replaceFirst('#', ''), radix: 16)),
    );
  }

  /// Creates a CategoryModel from a Firestore DocumentSnapshot.
  factory CategoryModel.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> snapshot,
  ) {
    final data = snapshot.data()!;
    return CategoryModel(
      id: data['Id'] ?? '',
      name: data['Name'] ?? '',
      illustration: data['Illustration'] ?? '',
      color: Color(int.parse(data['Color'].replaceFirst('#', ''), radix: 16)),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'Id': id,
      'Name': name,
      'Illustration': illustration,
      'Color': '#${color!.value.toRadixString(16).padLeft(8, '0')}',
    };
  }
}
