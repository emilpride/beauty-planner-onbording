import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

class MoodEntry {
  final String id;
  final String userId;
  final DateTime date;
  int mood; // 1 = sad, 2 = neutral, 3 = happy (or your preferred scale)
  final String feeling; // Optional text description
  final DateTime updatedAt;

  MoodEntry({
    required this.id,
    required this.userId,
    required this.date,
    required this.mood,
    required this.feeling,
    required this.updatedAt,
  });

  // Create empty mood entry
  static MoodEntry empty() => MoodEntry(
    id: const Uuid().v4(),
    userId: '',
    date: DateTime.now(),
    mood: 0,
    feeling: '',
    updatedAt: DateTime.now(),
  );

  // Copy with method for updates
  MoodEntry copyWith({
    String? id,
    String? userId,
    DateTime? date,
    int? mood,
    String? feeling,
    DateTime? updatedAt,
  }) {
    return MoodEntry(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      date: date ?? this.date,
      mood: mood ?? this.mood,
      feeling: feeling ?? this.feeling,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Generate unique ID for mood entry (date-based for consistency)
  static String generateId(String userId, DateTime date) {
    final dateKey =
        '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    return '${userId}_$dateKey';
  }

  // Create from Firestore snapshot
  factory MoodEntry.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> document,
  ) {
    if (document.data() != null) {
      final data = document.data()!;
      return MoodEntry(
        id: document.id,
        userId: data['userId'] ?? '',
        date: (data['date'] as Timestamp).toDate(),
        mood: data['mood'] ?? 0,
        feeling: data['feeling'] ?? '',
        updatedAt:
            data['updatedAt'] != null
                ? (data['updatedAt'] as Timestamp).toDate()
                : DateTime.now(),
      );
    } else {
      return MoodEntry.empty();
    }
  }

  // Convert to JSON for Firestore
  Map<String, dynamic> toJson({bool forFirebase = true}) {
    if (forFirebase) {
      return {
        'userId': userId,
        'date': Timestamp.fromDate(date),
        'mood': mood,
        'feeling': feeling,
        'updatedAt': Timestamp.fromDate(updatedAt),
      };
    } else {
      // For local storage - use ISO strings instead of Timestamps
      return {
        'id': id,
        'userId': userId,
        'date': date.toIso8601String(),
        'mood': mood,
        'feeling': feeling,
        'updatedAt': updatedAt.toIso8601String(),
      };
    }
  }

  // Create from JSON (for local storage)
  factory MoodEntry.fromJson(Map<String, dynamic> data) {
    return MoodEntry(
      id: data['id'] ?? '',
      userId: data['userId'] ?? '',
      date:
          data['date'] is String
              ? DateTime.parse(data['date'])
              : (data['date'] as Timestamp).toDate(),
      mood: data['mood'] ?? 0,
      feeling: data['feeling'] ?? '',
      updatedAt:
          data['updatedAt'] is String
              ? DateTime.parse(data['updatedAt'])
              : data['updatedAt'] != null
              ? (data['updatedAt'] as Timestamp).toDate()
              : DateTime.now(),
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MoodEntry &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          userId == other.userId &&
          date == other.date &&
          mood == other.mood &&
          feeling == other.feeling;

  @override
  int get hashCode =>
      id.hashCode ^
      userId.hashCode ^
      date.hashCode ^
      mood.hashCode ^
      feeling.hashCode;

  @override
  String toString() {
    return 'MoodEntry{id: $id, userId: $userId, date: $date, mood: $mood, feeling: $feeling, updatedAt: $updatedAt}';
  }
}
