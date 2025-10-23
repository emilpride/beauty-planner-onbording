import 'dart:math';
import 'dart:developer' as dev;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../data/models/activity_model.dart';
import '../../data/models/mood_model.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/mood/mood_repository.dart';
import '../../features/app/models/task_model.dart';
import '../constants/activities.dart';
import '../constants/enums.dart';
import '../helpers/date_time_helper.dart';

class DummyDataGenerator extends GetxController {
  static DummyDataGenerator get instance => Get.find();

  Future<void> runGeneration(
    UserModel user,
    List<ActivityModel>? activities,
  ) async {
    dev.log("Starting dummy task instance generation for user: ${user.id}");
    final startDate = DateTime.now().subtract(
      const Duration(days: 365),
    ); // Last year
    final endDate = DateTime.now();

    List<ActivityModel> activitiesToUse = activities ?? [];
    if (activitiesToUse.isEmpty) {
      dev.log(
        "No activities provided or found. Generating dummy activities first.",
      );
      activitiesToUse = _generateDummyActivities(
        user.id,
      ); // Placeholder activity generator
    }

    dev.log("Found ${activitiesToUse.length} activities to generate data for.");

    // Generate the list of TaskInstance objects
    final taskInstances = await generateHistoricalTaskInstances(
      user,
      activitiesToUse,
      startDate,
      endDate,
      completionRate: 0.75,
      skipRate: 0.15,
      deleteRate: 0.1,
    );

    dev.log(
      "Generated ${taskInstances.length} task instances. Now uploading...",
    );

    // Upload the generated instances
    await uploadHistoricalTaskInstances(taskInstances, user.id);

    dev.log("Dummy task instance generation completed.");
  }

  // Core logic to generate instances based on activities and probabilities
  Future<List<TaskInstance>> generateHistoricalTaskInstances(
    UserModel user,
    List<ActivityModel> activities,
    DateTime startDate,
    DateTime endDate, {
    double completionRate = 0.7,
    double skipRate = 0.2,
    double deleteRate = 0.1,
  }) async {
    dev.log("Generating task instances for date range: $startDate to $endDate");

    // Ensure probabilities sum up to 1.0 or less
    final totalProb = completionRate + skipRate + deleteRate;
    assert(totalProb <= 1.0, "Probabilities must sum to 1.0 or less.");

    final random = Random();
    final List<TaskInstance> allInstances = [];

    for (final activity in activities) {
      dev.log("Processing activity: ${activity.name} (ID: ${activity.id})");

      // Generate all possible dates for this activity within the range
      final scheduledDates = DateTimeHelper.generateTaskDatesInRangeDummy(
        activity,
        startDate,
        endDate,
      );

      dev.log(
        "  Found ${scheduledDates.length} scheduled dates for activity ${activity.name}.",
      );

      for (final date in scheduledDates) {
        // Determine the status for this specific date
        final status = _randomStatus(
          random,
          completionRate,
          skipRate,
          deleteRate,
        );

        // Generate a plausible updatedAt time for this status update
        // It should be after the task date but before or equal to the current simulation time (or now)
        // For historical data, updatedAt can be anytime after the task date up to now
        final updatedAt =
            DateTime.now(); //_randomUpdatedAt(random, date, endDate);
        // dev.log("  Generated status: $status, updatedAt: $updatedAt");

        final taskInstance = TaskInstance(
          activityId: activity.id,
          date: date,
          status: status,
          updatedAt: updatedAt,
        );

        allInstances.add(taskInstance);
      }
    }

    dev.log("Generated ${allInstances.length} TaskInstance objects.");
    return allInstances;
  }

  // Helper to assign a random TaskStatus based on probabilities
  TaskStatus _randomStatus(
    Random random,
    double completionRate,
    double skipRate,
    double deleteRate,
  ) {
    final roll = random.nextDouble(); // Generates a number between 0.0 and 1.0
    if (roll < completionRate) {
      return TaskStatus.completed;
    } else if (roll < completionRate + skipRate) {
      return TaskStatus.skipped;
    } else if (roll < completionRate + skipRate + deleteRate) {
      return TaskStatus.deleted;
    }
    // If probabilities don't sum to 1, default to 'completed' or handle as needed
    // For this implementation, we assert they sum to <= 1.0, so this should not happen.
    return TaskStatus.completed; // Fallback
  }

  // Helper to generate a random updatedAt time after the task date
  DateTime _randomUpdatedAt(
    Random random,
    DateTime taskDate,
    DateTime maxDate,
  ) {
    // Ensure maxDate is not before taskDate
    final effectiveMaxDate = maxDate.isBefore(taskDate) ? taskDate : maxDate;

    // Calculate the range in milliseconds
    final minTimeMs = taskDate.millisecondsSinceEpoch;
    final maxTimeMs = effectiveMaxDate.millisecondsSinceEpoch;

    if (minTimeMs >= maxTimeMs) {
      // If the task date is at or after the max date, return the task date
      return taskDate;
    }

    // Generate a random time within the range
    final randomTimeMs = random.nextInt(maxTimeMs - minTimeMs) + minTimeMs;
    var randomDateTime = DateTime.fromMillisecondsSinceEpoch(randomTimeMs);

    // Ensure the generated time is still on or after the task date (ignoring time)
    // This is likely already true due to the range calculation, but a check doesn't hurt
    if (randomDateTime.year < taskDate.year ||
        (randomDateTime.year == taskDate.year &&
            randomDateTime.month < taskDate.month) ||
        (randomDateTime.year == taskDate.year &&
            randomDateTime.month == taskDate.month &&
            randomDateTime.day < taskDate.day)) {
      randomDateTime = taskDate;
    }

    // Ensure it's not in the future relative to the simulation end date (or now)
    if (randomDateTime.isAfter(maxDate)) {
      randomDateTime = maxDate;
    }

    return randomDateTime;
  }

  // Handle the Firestore upload, preferably using batches for efficiency.
  Future<void> uploadHistoricalTaskInstances(
    List<TaskInstance> instances,
    String userId,
  ) async {
    dev.log("Uploading ${instances.length} task instances to Firestore...");

    const batchSize = 500; // Firestore allows up to 500 operations per batch
    final db = FirebaseFirestore.instance;
    int totalUploaded = 0;

    for (int i = 0; i < instances.length; i += batchSize) {
      final batch = db.batch();
      final endIndex =
          (i + batchSize < instances.length) ? i + batchSize : instances.length;
      final batchList = instances.sublist(i, endIndex);

      for (final instance in batchList) {
        batch.set(
          db
              .collection('Users')
              .doc(userId)
              .collection('Updates')
              .doc(instance.id),
          instance.toJson(forFirebase: true),
        );
      }

      try {
        await batch.commit();
        totalUploaded += batchList.length;
        dev.log(
          "  Uploaded batch: ${i ~/ batchSize + 1}, Instances: ${batchList.length}, Total: $totalUploaded",
        );
      } catch (e) {
        dev.log("Error uploading batch starting at index $i: $e");
        // Depending on requirements, you might want to re-throw or handle the error differently
        rethrow;
      }
    }

    dev.log("Successfully uploaded $totalUploaded task instances.");
  }

  List<ActivityModel> _generateDummyActivities(String userId) {
    dev.log("Generating dummy activities for user $userId");
    final allActivities = Activities.getWomanActivities();
    final List<ActivityModel> dummyActivities = [
      allActivities
          .elementAt(Random().nextInt(allActivities.length))
          .copyWith(
            activeStatus: true,
            frequency: 'daily',
            time: const TimeOfDay(hour: 9, minute: 0).obs,
            enabledAt: DateTime.now().subtract(
              const Duration(days: 365),
            ), // Enabled 1 year ago
            type: 'regular',
          ),
      allActivities
          .elementAt(Random().nextInt(allActivities.length))
          .copyWith(
            activeStatus: true,
            frequency: 'weekly',
            selectedDays: [6], // Saturday
            enabledAt: DateTime.now().subtract(
              const Duration(days: 200),
            ), // Enabled ~6 months ago
            type: 'regular',
          ),
      allActivities
          .elementAt(Random().nextInt(allActivities.length))
          .copyWith(
            activeStatus: true,
            frequency: 'weekly',
            selectedDays: [1, 3, 5], // Mon, Wed, Fri
            enabledAt: DateTime.now().subtract(
              const Duration(days: 100),
            ), // Enabled ~3 months ago
            type: 'regular',
          ),
    ];
    return dummyActivities;
  }

  // Mood descriptions for more realistic data
  final List<String> _moodDescriptions = [
    "Had a great day!",
    "Feeling good today",
    "Everything is fine",
    "Not bad, not great",
    "Could be better",
    "Having a tough day",
    "Feeling down",
    "Stressed but managing",
    "Productive day",
    "Relaxed and peaceful",
    "Excited about something",
    "Anxious about upcoming events",
    "Grateful for what I have",
    "Overwhelmed with work",
    "Enjoying the weekend",
    "Missing someone",
    "Achieved a small goal",
    "Feeling creative",
    "Need some rest",
    "Looking forward to tomorrow",
    "Disappointed with results",
    "Proud of my progress",
    "Worried about the future",
    "Happy with life right now",
    "Feeling motivated",
    "Need some self-care",
    "Social day with friends",
    "Quiet day at home",
    "Learning something new",
    "Feeling nostalgic",
    "Celebrating a win!",
    "Just getting by today",
    "Felt like crying but pushed through",
    "Angry about something",
    "Calm and centered",
    "Energetic and ready to go",
    "Exhausted but satisfied",
    "Bored out of my mind",
    "Hopeful for better days",
    "Grumpy but functional",
    "On top of the world!",
    "Meh... it is what it is",
    "Struggling but not giving up",
    "In a zen state",
    "Feeling accomplished",
    "Need a break badly",
  ];

  // Generate mood data for the past year
  Future<void> generateMoodDataForPastYear({
    required String userId,
    int moodDistribution =
        3, // 1=sad-heavy, 2=neutral-heavy, 3=balanced, 4=happy-heavy
  }) async {
    dev.log('Starting mood data generation for user: $userId');

    try {
      final List<MoodEntry> entries = [];
      final DateTime now = DateTime.now();
      final DateTime oneYearAgo = now.subtract(const Duration(days: 365));

      DateTime currentDate = oneYearAgo;
      final random = Random();

      while (currentDate.isBefore(now)) {
        // Skip some days to make it more realistic (not everyone tracks every day)
        if (random.nextDouble() > 0.1) {
          // 90% chance to create an entry for each day
          final mood = _generateMoodBasedOnDistribution(moodDistribution);
          final feeling = _randomDescription();

          final entry = MoodEntry(
            id: MoodEntry.generateId(userId, currentDate),
            userId: userId,
            date: DateTime(
              currentDate.year,
              currentDate.month,
              currentDate.day,
            ),
            mood: mood,
            feeling: feeling,
            updatedAt: DateTime.now(),
          );

          entries.add(entry);
        }

        currentDate = currentDate.add(const Duration(days: 1));
      }

      dev.log('Generated ${entries.length} mood entries for past year');

      // Upload to Firebase in batches to avoid rate limits
      await _uploadMoodEntriesInBatches(userId, entries);

      dev.log('Successfully uploaded mood data for user: $userId');
    } catch (e) {
      dev.log('Error generating mood data: $e');
      rethrow;
    }
  }

  // Generate mood based on distribution preference (now 5 levels)
  int _generateMoodBasedOnDistribution(int distribution) {
    final random = Random();
    switch (distribution) {
      case 1: // Sad-heavy: Bad(30%), Not Good(30%), Okay(20%), Good(15%), Great(5%)
        final rand = random.nextDouble();
        if (rand < 0.3) return 5; // Bad
        if (rand < 0.6) return 4; // Not Good
        if (rand < 0.8) return 3; // Okay
        if (rand < 0.95) return 2; // Good
        return 1; // Great

      case 2: // Neutral-heavy: Bad(10%), Not Good(20%), Okay(40%), Good(20%), Great(10%)
        final rand = random.nextDouble();
        if (rand < 0.1) return 5; // Bad
        if (rand < 0.3) return 4; // Not Good
        if (rand < 0.7) return 3; // Okay
        if (rand < 0.9) return 2; // Good
        return 1; // Great

      case 4: // Happy-heavy: Bad(5%), Not Good(10%), Okay(20%), Good(30%), Great(35%)
        final rand = random.nextDouble();
        if (rand < 0.05) return 5; // Bad
        if (rand < 0.15) return 4; // Not Good
        if (rand < 0.35) return 3; // Okay
        if (rand < 0.65) return 2; // Good
        return 1; // Great

      case 3: // Balanced: All ~20%
      default:
        final rand = random.nextDouble();
        if (rand < 0.2) return 1; // Great
        if (rand < 0.4) return 2; // Good
        if (rand < 0.6) return 3; // Okay
        if (rand < 0.8) return 4; // Not Good
        return 5; // Bad
    }
  }

  // Get random mood description
  String _randomDescription() {
    final random = Random();
    return _moodDescriptions[random.nextInt(_moodDescriptions.length)];
  }

  // Upload mood entries in batches to avoid Firestore limits
  Future<void> _uploadMoodEntriesInBatches(
    String userId,
    List<MoodEntry> entries,
  ) async {
    const batchSize = 500; // Firestore batch limit is 500
    final moodRepo = Get.find<MoodRepository>();

    for (int i = 0; i < entries.length; i += batchSize) {
      final batchEnd =
          (i + batchSize < entries.length) ? i + batchSize : entries.length;
      final batchEntries = entries.sublist(i, batchEnd);

      dev.log(
        'Uploading batch ${i ~/ batchSize + 1} of ${entries.length ~/ batchSize + 1}',
      );

      await moodRepo.updateBulkMoodEntries(userId, batchEntries);

      // Small delay between batches to avoid rate limiting
      await Future.delayed(const Duration(milliseconds: 100));
    }
  }

  // Generate mood data for a specific date range
  Future<void> generateMoodDataForDateRange({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
    int moodDistribution = 3,
    double trackingFrequency =
        0.9, // 0.0 to 1.0, probability of tracking each day
  }) async {
    dev.log(
      'Generating mood data from $startDate to $endDate for user: $userId',
    );

    try {
      final List<MoodEntry> entries = [];
      DateTime currentDate = startDate;
      final random = Random();

      while (!currentDate.isAfter(endDate)) {
        if (random.nextDouble() <= trackingFrequency) {
          final mood = _generateMoodBasedOnDistribution(moodDistribution);
          final feeling = _randomDescription();

          final entry = MoodEntry(
            id: MoodEntry.generateId(userId, currentDate),
            userId: userId,
            date: DateTime(
              currentDate.year,
              currentDate.month,
              currentDate.day,
            ),
            mood: mood,
            feeling: feeling,
            updatedAt: DateTime.now(),
          );

          entries.add(entry);
        }

        currentDate = currentDate.add(const Duration(days: 1));
      }

      dev.log('Generated ${entries.length} mood entries for date range');

      await _uploadMoodEntriesInBatches(userId, entries);

      dev.log('Successfully uploaded mood data for date range');
    } catch (e) {
      dev.log('Error generating mood data for date range: $e');
      rethrow;
    }
  }

  // Generate mood data with weekly patterns (weekends vs weekdays)
  Future<void> generateMoodDataWithPatterns({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
    double weekendMoodBias = 0.1, // Higher values make weekends happier
  }) async {
    dev.log('Generating mood data with patterns for user: $userId');

    try {
      final List<MoodEntry> entries = [];
      DateTime currentDate = startDate;
      final random = Random();

      while (!currentDate.isAfter(endDate)) {
        if (random.nextDouble() <= 0.9) {
          // 90% tracking rate
          int mood = _generateMoodWithDayOfWeekBias(
            currentDate,
            weekendMoodBias,
          );
          final feeling = _randomDescription();

          final entry = MoodEntry(
            id: MoodEntry.generateId(userId, currentDate),
            userId: userId,
            date: DateTime(
              currentDate.year,
              currentDate.month,
              currentDate.day,
            ),
            mood: mood,
            feeling: feeling,
            updatedAt: DateTime.now(),
          );

          entries.add(entry);
        }

        currentDate = currentDate.add(const Duration(days: 1));
      }

      dev.log('Generated ${entries.length} mood entries with patterns');

      await _uploadMoodEntriesInBatches(userId, entries);

      dev.log('Successfully uploaded mood data with patterns');
    } catch (e) {
      dev.log('Error generating mood data with patterns: $e');
      rethrow;
    }
  }

  // Generate mood with bias based on day of week
  int _generateMoodWithDayOfWeekBias(DateTime date, double weekendBias) {
    final dayOfWeek = date.weekday; // 1 = Monday, 7 = Sunday

    // Weekend days (Saturday = 6, Sunday = 7) get mood bias
    final isWeekend = dayOfWeek == 6 || dayOfWeek == 7;

    // Base mood generation
    int baseMood = _generateMoodBasedOnDistribution(3); // balanced
    final random = Random();

    // Apply weekend bias if applicable
    if (isWeekend && weekendBias > 0) {
      if (random.nextDouble() <= weekendBias) {
        baseMood = max(
          1,
          baseMood - 1,
        ); // Make mood happier (lower number = better mood)
      }
    } else if (!isWeekend && weekendBias < 0) {
      // Apply weekday bias if weekendBias is negative
      if (random.nextDouble() <= (-weekendBias)) {
        baseMood = min(
          5,
          baseMood + 1,
        ); // Make mood sadder (higher number = worse mood)
      }
    }

    return baseMood;
  }

  // Generate mood data with seasonal patterns
  Future<void> generateMoodDataWithSeasonalPatterns({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    dev.log('Generating mood data with seasonal patterns for user: $userId');

    try {
      final List<MoodEntry> entries = [];
      DateTime currentDate = startDate;
      final random = Random();

      while (!currentDate.isAfter(endDate)) {
        if (random.nextDouble() <= 0.9) {
          // 90% tracking rate
          int mood = _generateMoodWithSeasonalBias(currentDate);
          final feeling = _randomDescription();

          final entry = MoodEntry(
            id: MoodEntry.generateId(userId, currentDate),
            userId: userId,
            date: DateTime(
              currentDate.year,
              currentDate.month,
              currentDate.day,
            ),
            mood: mood,
            feeling: feeling,
            updatedAt: DateTime.now(),
          );

          entries.add(entry);
        }

        currentDate = currentDate.add(const Duration(days: 1));
      }

      dev.log(
        'Generated ${entries.length} mood entries with seasonal patterns',
      );

      await _uploadMoodEntriesInBatches(userId, entries);

      dev.log('Successfully uploaded mood data with seasonal patterns');
    } catch (e) {
      dev.log('Error generating mood data with seasonal patterns: $e');
      rethrow;
    }
  }

  // Generate mood with seasonal bias (e.g., winter blues, summer happiness)
  int _generateMoodWithSeasonalBias(DateTime date) {
    final month = date.month;
    final random = Random();

    // Winter months (Dec, Jan, Feb) might be sadder on average
    if (month == 12 || month == 1 || month == 2) {
      if (random.nextDouble() < 0.2) return 1; // Great
      if (random.nextDouble() < 0.4) return 2; // Good
      if (random.nextDouble() < 0.6) return 3; // Okay
      if (random.nextDouble() < 0.8) return 4; // Not Good
      return 5; // Bad
    }
    // Summer months (Jun, Jul, Aug) might be happier
    else if (month >= 6 && month <= 8) {
      if (random.nextDouble() < 0.3) return 1; // Great
      if (random.nextDouble() < 0.6) return 2; // Good
      if (random.nextDouble() < 0.8) return 3; // Okay
      if (random.nextDouble() < 0.9) return 4; // Not Good
      return 5; // Bad
    }
    // Other months - balanced
    else {
      if (random.nextDouble() < 0.2) return 1; // Great
      if (random.nextDouble() < 0.4) return 2; // Good
      if (random.nextDouble() < 0.6) return 3; // Okay
      if (random.nextDouble() < 0.8) return 4; // Not Good
      return 5; // Bad
    }
  }

  // Clear all mood data for a user (utility method for testing)
  Future<void> clearMoodDataForUser(String userId) async {
    dev.log('Clearing mood data for user: $userId');
    final moodRepo = Get.find<MoodRepository>();
    await moodRepo.deleteAllUserMoodData(userId);
    dev.log('Successfully cleared mood data for user: $userId');
  }

  // Generate sample data for multiple users
  Future<void> generateSampleDataForMultipleUsers({
    required List<String> userIds,
    int moodDistribution = 3,
  }) async {
    dev.log('Generating sample data for ${userIds.length} users');

    for (int i = 0; i < userIds.length; i++) {
      dev.log('Processing user ${i + 1}/${userIds.length}: ${userIds[i]}');
      await generateMoodDataForPastYear(
        userId: userIds[i],
        moodDistribution: moodDistribution,
      );

      // Small delay between users to avoid rate limiting
      await Future.delayed(const Duration(seconds: 1));
    }

    dev.log('Completed generating sample data for all users');
  }

  // Generate mood streaks (periods of similar moods)
  Future<void> generateMoodDataWithStreaks({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
    int streakLength = 3, // Average streak length
  }) async {
    dev.log('Generating mood data with streaks for user: $userId');

    try {
      final List<MoodEntry> entries = [];
      DateTime currentDate = startDate;
      final random = Random();

      int currentStreakMood = _generateMoodBasedOnDistribution(3);
      int streakCounter = 0;
      int targetStreakLength =
          random.nextInt(streakLength * 2) + 1; // 1 to 2*streakLength

      while (!currentDate.isAfter(endDate)) {
        if (random.nextDouble() <= 0.9) {
          // 90% tracking rate
          // Check if we should change mood based on streak
          if (streakCounter >= targetStreakLength) {
            currentStreakMood = _generateMoodBasedOnDistribution(3);
            streakCounter = 0;
            targetStreakLength = random.nextInt(streakLength * 2) + 1;
          }

          final feeling = _randomDescription();

          final entry = MoodEntry(
            id: MoodEntry.generateId(userId, currentDate),
            userId: userId,
            date: DateTime(
              currentDate.year,
              currentDate.month,
              currentDate.day,
            ),
            mood: currentStreakMood,
            feeling: feeling,
            updatedAt: DateTime.now(),
          );

          entries.add(entry);
          streakCounter++;
        } else {
          // If we skip a day, reset streak logic slightly
          if (random.nextDouble() < 0.3) {
            // 30% chance to reset streak when skipping
            streakCounter = 0;
          }
        }

        currentDate = currentDate.add(const Duration(days: 1));
      }

      dev.log('Generated ${entries.length} mood entries with streaks');

      await _uploadMoodEntriesInBatches(userId, entries);

      dev.log('Successfully uploaded mood data with streaks');
    } catch (e) {
      dev.log('Error generating mood data with streaks: $e');
      rethrow;
    }
  }
}
