import 'package:cloud_firestore/cloud_firestore.dart';

/// Represents the user's achievement progress
class AchievementProgress {
  final int totalCompletedActivities;
  final int currentLevel;
  final DateTime lastUpdated;
  final Map<int, DateTime> levelUnlockDates;
  final int lastSeenLevel;

  AchievementProgress({
    this.totalCompletedActivities = 0,
    this.currentLevel = 1,
    DateTime? lastUpdated,
    this.levelUnlockDates = const {},
    this.lastSeenLevel = 0, // NEW
  }) : lastUpdated = lastUpdated ?? DateTime.now();

  /// Calculate progress percentage to next level
  double get progressToNextLevel {
    final currentThreshold = AchievementLevel.getThreshold(currentLevel);
    final nextThreshold = AchievementLevel.getThreshold(currentLevel + 1);

    if (nextThreshold == currentThreshold) return 1.0; // Max level

    final progress =
        (totalCompletedActivities - currentThreshold) /
        (nextThreshold - currentThreshold);
    return progress.clamp(0.0, 1.0);
  }

  /// Get next level threshold
  int get nextLevelThreshold => AchievementLevel.getThreshold(currentLevel + 1);

  /// Check if user has unseen level up
  bool get hasUnseenLevelUp => currentLevel > lastSeenLevel;

  factory AchievementProgress.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>?;
    if (data == null) return AchievementProgress();

    // Parse level unlock dates
    final levelUnlockDatesData =
        data['levelUnlockDates'] as Map<String, dynamic>?;
    final levelUnlockDates = <int, DateTime>{};
    if (levelUnlockDatesData != null) {
      levelUnlockDatesData.forEach((key, value) {
        final level = int.tryParse(key);
        if (level != null && value is Timestamp) {
          levelUnlockDates[level] = value.toDate();
        }
      });
    }

    // Parse lastUpdated
    DateTime lastUpdated = DateTime.now();
    if (data['lastUpdated'] is Timestamp) {
      lastUpdated = (data['lastUpdated'] as Timestamp).toDate();
    }

    return AchievementProgress(
      totalCompletedActivities: data['totalCompletedActivities'] as int? ?? 0,
      currentLevel: data['currentLevel'] as int? ?? 1,
      lastUpdated: lastUpdated,
      levelUnlockDates: levelUnlockDates,
      lastSeenLevel: data['lastSeenLevel'] as int? ?? 0,
    );
  }

  factory AchievementProgress.fromJson(Map<String, dynamic> json) {
    // Parse level unlock dates
    final levelUnlockDatesData =
        json['levelUnlockDates'] as Map<String, dynamic>?;
    final levelUnlockDates = <int, DateTime>{};
    if (levelUnlockDatesData != null) {
      levelUnlockDatesData.forEach((key, value) {
        final level = int.tryParse(key);
        if (level != null && value is String) {
          levelUnlockDates[level] = DateTime.parse(value);
        }
      });
    }

    return AchievementProgress(
      totalCompletedActivities: json['totalCompletedActivities'] as int? ?? 0,
      currentLevel: json['currentLevel'] as int? ?? 1,
      lastUpdated:
          DateTime.tryParse(json['lastUpdated'] as String? ?? '') ??
          DateTime.now(),
      levelUnlockDates: levelUnlockDates,
      lastSeenLevel: json['lastSeenLevel'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    final levelUnlockDatesMap = <String, String>{};
    levelUnlockDates.forEach((level, date) {
      levelUnlockDatesMap[level.toString()] = date.toIso8601String();
    });

    return {
      'totalCompletedActivities': totalCompletedActivities,
      'currentLevel': currentLevel,
      'lastUpdated': lastUpdated.toIso8601String(),
      'levelUnlockDates': levelUnlockDatesMap,
      'lastSeenLevel': lastSeenLevel,
    };
  }

  Map<String, dynamic> toFirestore() {
    final levelUnlockDatesMap = <String, Timestamp>{};
    levelUnlockDates.forEach((level, date) {
      levelUnlockDatesMap[level.toString()] = Timestamp.fromDate(date);
    });

    return {
      'totalCompletedActivities': totalCompletedActivities,
      'currentLevel': currentLevel,
      'lastUpdated': FieldValue.serverTimestamp(),
      'levelUnlockDates': levelUnlockDatesMap,
      'lastSeenLevel': lastSeenLevel,
    };
  }

  AchievementProgress copyWith({
    int? totalCompletedActivities,
    int? currentLevel,
    DateTime? lastUpdated,
    Map<int, DateTime>? levelUnlockDates,
    int? lastSeenLevel,
  }) {
    return AchievementProgress(
      totalCompletedActivities:
          totalCompletedActivities ?? this.totalCompletedActivities,
      currentLevel: currentLevel ?? this.currentLevel,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      levelUnlockDates: levelUnlockDates ?? this.levelUnlockDates,
      lastSeenLevel: lastSeenLevel ?? this.lastSeenLevel,
    );
  }
}

/// Configuration for each achievement level
class AchievementLevel {
  final int level;
  final int requiredActivities;
  final String title;
  final bool isUnlocked;

  const AchievementLevel({
    required this.level,
    required this.requiredActivities,
    required this.title,
    this.isUnlocked = false,
  });

  /// All achievement levels configuration
  static const List<AchievementLevel> allLevels = [
    AchievementLevel(level: 1, requiredActivities: 500, title: 'Level 1'),
    AchievementLevel(level: 2, requiredActivities: 1000, title: 'Level 2'),
    AchievementLevel(level: 3, requiredActivities: 1500, title: 'Level 3'),
    AchievementLevel(level: 4, requiredActivities: 2000, title: 'Level 4'),
    AchievementLevel(level: 5, requiredActivities: 2500, title: 'Level 5'),
    AchievementLevel(level: 6, requiredActivities: 3000, title: 'Level 6'),
    AchievementLevel(level: 7, requiredActivities: 3500, title: 'Level 7'),
    AchievementLevel(level: 8, requiredActivities: 4000, title: 'Level 8'),
    AchievementLevel(level: 9, requiredActivities: 4500, title: 'Level 9'),
    AchievementLevel(level: 10, requiredActivities: 5000, title: 'Level 10'),
    AchievementLevel(level: 11, requiredActivities: 5500, title: 'Level 11'),
    AchievementLevel(level: 12, requiredActivities: 6000, title: 'Level 12'),
  ];

  /// Get threshold for a specific level
  static int getThreshold(int level) {
    if (level <= 0) return 0;
    if (level > allLevels.length) return allLevels.last.requiredActivities;
    return allLevels[level - 1].requiredActivities;
  }

  /// Calculate level from completed activities count
  static int calculateLevel(int completedActivities) {
    for (int i = allLevels.length - 1; i >= 0; i--) {
      if (completedActivities >= allLevels[i].requiredActivities) {
        return allLevels[i].level;
      }
    }
    return 1;
  }

  /// Get achievement level by level number
  static AchievementLevel? getByLevel(int level) {
    try {
      return allLevels.firstWhere((l) => l.level == level);
    } catch (e) {
      return null;
    }
  }

  AchievementLevel copyWith({bool? isUnlocked}) {
    return AchievementLevel(
      level: level,
      requiredActivities: requiredActivities,
      title: title,
      isUnlocked: isUnlocked ?? this.isUnlocked,
    );
  }
}
