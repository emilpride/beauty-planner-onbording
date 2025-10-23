import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

import '../../../utils/constants/enums.dart';

class TaskInstance {
  final String activityId;
  final DateTime date; // Date only, time is ignored for regular tasks
  final TaskStatus status;
  final DateTime updatedAt; // Timestamp of when this status was set.
  final TimeOfDay? time; // NEW: Optional time component for one-time tasks

  TaskInstance({
    required this.activityId,
    required this.date,
    required this.status,
    required this.updatedAt,
    this.time, // NEW: Optional time parameter
  }) {
    // Validation
    if (activityId.isEmpty) {
      throw ArgumentError('ActivityId cannot be empty');
    }
    if (updatedAt.isAfter(DateTime.now().add(const Duration(minutes: 5)))) {
      throw ArgumentError('UpdatedAt cannot be in the future');
    }
  }

  /// A stable, composite key based on activity, date, and optionally time.
  /// This is CRITICAL for preventing duplicate entries.
  String get id => generateId(activityId, date, time);

  /// Normalized date (removes time component)
  DateTime get normalizedDate => DateTime(date.year, date.month, date.day);

  /// Static method to ensure ID generation is consistent everywhere.
  /// UPDATED: Now includes optional time component
  static String generateId(
    String activityId,
    DateTime date, [
    TimeOfDay? time,
  ]) {
    // Normalizes the date to YYYY-MM-DD format, ignoring time.
    final normalizedDate = DateTime(date.year, date.month, date.day);
    final dateString = normalizedDate.toIso8601String().substring(
      0,
      10,
    ); // YYYY-MM-DD

    // If time is provided, append it to make unique IDs for one-time tasks
    if (time != null) {
      final timeString =
          '${time.hour.toString().padLeft(2, '0')}${time.minute.toString().padLeft(2, '0')}';
      return '$activityId-$dateString-$timeString';
    }

    return '$activityId-$dateString';
  }

  /// Deserializes a JSON map into a TaskInstance.
  factory TaskInstance.fromJson(Map<String, dynamic> json) {
    TimeOfDay? time;
    if (json['time'] != null) {
      final timeData = json['time'] as Map<String, dynamic>;
      time = TimeOfDay(
        hour: timeData['hour'] as int,
        minute: timeData['minute'] as int,
      );
    }

    // Handle both Timestamp and string formats for updatedAt
    DateTime updatedAt;
    final updatedAtValue = json['updatedAt'];
    if (updatedAtValue is Timestamp) {
      updatedAt = updatedAtValue.toDate();
    } else if (updatedAtValue is String) {
      updatedAt = DateTime.parse(updatedAtValue);
    } else if (updatedAtValue is int) {
      // Handle milliseconds since epoch (sometimes happens with JSON)
      updatedAt = DateTime.fromMillisecondsSinceEpoch(updatedAtValue);
    } else {
      throw ArgumentError('Invalid updatedAt format: $updatedAtValue');
    }

    return TaskInstance(
      activityId: json['activityId'] as String? ?? '',
      date: DateTime.parse(json['date'] as String),
      status: TaskStatus.values.byName(json['status'] as String),
      updatedAt: updatedAt,
      time: time,
    );
  }

  /// Creates a TaskInstance from a Firestore DocumentSnapshot.
  factory TaskInstance.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> snapshot,
  ) {
    final data = snapshot.data();
    if (data == null) {
      throw ArgumentError('Document snapshot data is null');
    }

    TimeOfDay? time;
    if (data['time'] != null) {
      final timeData = data['time'] as Map<String, dynamic>;
      time = TimeOfDay(
        hour: timeData['hour'] as int,
        minute: timeData['minute'] as int,
      );
    }

    // FIXED: Handle both Timestamp and string formats for updatedAt
    DateTime updatedAt;
    final updatedAtValue = data['updatedAt'];
    if (updatedAtValue is Timestamp) {
      updatedAt = updatedAtValue.toDate();
    } else if (updatedAtValue is String) {
      updatedAt = DateTime.parse(updatedAtValue);
    } else {
      throw ArgumentError('Invalid updatedAt format: $updatedAtValue');
    }

    return TaskInstance(
      activityId: data['activityId'] as String? ?? '',
      date: DateTime.parse(data['date'] as String),
      status: TaskStatus.values.byName(data['status'] as String),
      updatedAt: updatedAt,
      time: time,
    );
  }

  /// Serializes the TaskInstance into a JSON map.
  Map<String, dynamic> toJson({required bool forFirebase}) {
    final Map<String, dynamic> json = {
      'activityId': activityId,
      'date': date.toIso8601String(), // This can stay as string
      'status': status.name,
      'updatedAt':
          forFirebase
              ? Timestamp.fromDate(updatedAt) // Use Timestamp for Firebase
              : updatedAt.toIso8601String(),
    };

    if (time != null) {
      json['time'] = {'hour': time!.hour, 'minute': time!.minute};
    }

    return json;
  }

  /// Creates a copy of the instance with updated values.
  TaskInstance copyWith({
    String? activityId,
    DateTime? date,
    TaskStatus? status,
    DateTime? updatedAt,
    TimeOfDay? time, // NEW: Include time in copyWith
  }) {
    return TaskInstance(
      activityId: activityId ?? this.activityId,
      date: date ?? this.date,
      status: status ?? this.status,
      updatedAt: updatedAt ?? this.updatedAt,
      time: time ?? this.time, // NEW: Handle time copying
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TaskInstance &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

// --- models/task.dart (UPDATED) ---

/// A temporary, UI-facing model that combines an Activity with its status for a given day.
/// This object is generated on-the-fly and is NOT persisted.
class Task {
  final String id;
  final String activityId;
  final String categoryId;
  final String name;
  final Color color;
  final TimeOfDay time;
  final DateTime date;
  final TaskStatus status;
  final bool isOneTime; // NEW: Flag to distinguish one-time tasks

  Task({
    String? id,
    required this.activityId,
    required this.categoryId,
    required this.name,
    required this.color,
    required this.time,
    required this.date,
    required this.status,
    this.isOneTime = false, // NEW: Default to false for regular tasks
  }) : id = id ?? const Uuid().v4();

  /// UPDATED: Added missing categoryId and isOneTime
  Task copyWith({
    String? id,
    String? activityId,
    String? categoryId,
    String? name,
    Color? color,
    TimeOfDay? time,
    DateTime? date,
    TaskStatus? status,
    bool? isOneTime,
  }) {
    return Task(
      id: id ?? this.id,
      activityId: activityId ?? this.activityId,
      categoryId: categoryId ?? this.categoryId,
      name: name ?? this.name,
      color: color ?? this.color,
      time: time ?? this.time,
      date: date ?? this.date,
      status: status ?? this.status,
      isOneTime: isOneTime ?? this.isOneTime, // NEW: Include isOneTime
    );
  }
}
