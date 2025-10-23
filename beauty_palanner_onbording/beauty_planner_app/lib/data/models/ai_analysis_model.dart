import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

class AIAnalysisModel {
  String id;
  double bmi;
  double bmiScore;
  final double skinConditionScore;
  final String skinConditionExplanation;
  final double hairConditionScore;
  final String hairConditionExplanation;
  final double physicalConditionScore;
  final String physicalConditionExplanation;
  final double mentalConditionScore;
  final String mentalConditionExplanation;
  double bmsScore;
  final List<String> recommendedActivities;
  final DateTime date;

  AIAnalysisModel({
    required this.id,
    required this.bmi,
    required this.bmiScore,
    required this.skinConditionScore,
    required this.skinConditionExplanation,
    required this.hairConditionScore,
    required this.hairConditionExplanation,
    required this.physicalConditionScore,
    required this.physicalConditionExplanation,
    required this.mentalConditionScore,
    required this.mentalConditionExplanation,
    required this.bmsScore,
    required this.recommendedActivities,
    required this.date,
  });

  //empty
  factory AIAnalysisModel.empty() {
    return AIAnalysisModel(
      id: const Uuid().v4(),
      bmi: 0.0,
      bmiScore: 0.0,
      skinConditionScore: 0.0,
      skinConditionExplanation: '',
      hairConditionScore: 0.0,
      hairConditionExplanation: '',
      physicalConditionScore: 0.0,
      physicalConditionExplanation: '',
      mentalConditionScore: 0.0,
      mentalConditionExplanation: '',
      bmsScore: 0.0,
      recommendedActivities: [],
      date: DateTime.now().toUtc(),
    );
  }

  factory AIAnalysisModel.fromJson(Map<String, dynamic> json) {
    return AIAnalysisModel(
      id: json['id'] ?? const Uuid().v4(),
      bmi: (json['bmi'] as num).toDouble(),
      bmiScore: (json['bmi_score'] as num).toDouble(),
      skinConditionScore: (json['skin_condition_score'] as num).toDouble(),
      skinConditionExplanation: json['skin_condition_explanation'],
      hairConditionScore: (json['hair_condition_score'] as num).toDouble(),
      hairConditionExplanation: json['hair_condition_explanation'],
      physicalConditionScore:
          (json['physical_condition_score'] as num).toDouble(),
      physicalConditionExplanation: json['physical_condition_explanation'],
      mentalConditionScore: (json['mental_condition_score'] as num).toDouble(),
      mentalConditionExplanation: json['mental_condition_explanation'],
      bmsScore: (json['bms_score'] as num).toDouble(),
      recommendedActivities: List<String>.from(
        json['recommended_activities'] ?? [],
      ),
      date:
          json['date'] != null
              ? (json['date'] as Timestamp).toDate()
              : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bmi': bmi,
      'bmi_score': bmiScore,
      'skin_condition_score': skinConditionScore,
      'skin_condition_explanation': skinConditionExplanation,
      'hair_condition_score': hairConditionScore,
      'hair_condition_explanation': hairConditionExplanation,
      'physical_condition_score': physicalConditionScore,
      'physical_condition_explanation': physicalConditionExplanation,
      'mental_condition_score': mentalConditionScore,
      'mental_condition_explanation': mentalConditionExplanation,
      'bms_score': bmsScore,
      'recommended_activities': recommendedActivities,
      'date': Timestamp.fromDate(date),
    };
  }
}
