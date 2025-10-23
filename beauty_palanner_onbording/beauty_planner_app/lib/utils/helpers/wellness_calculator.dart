import '../../../data/models/mood_model.dart';
import '../../../data/models/user_model.dart';
import '../../data/models/height_model.dart';
import '../../data/models/weight_model.dart';
import '../../features/authentication/models/wellness_model.dart';

// The calculator class
class WellnessCalculator {
  static WellnessAnalysis analyze(
    UserModel user,
    MoodEntry mood,
    WeightModel weightModel,
    HeightModel heightModel,
  ) {
    final List<String> positives = [];
    final List<String> negatives = [];
    // 8. Lifestyle
    switch (user.lifeStyle) {
      case 1: // Sedentary
        negatives.add('Sedentary lifestyle');
        break;
      case 2: // Active
        positives.add('Active lifestyle');
        break;
      case 3: // Sports
        positives.add('Sports-oriented lifestyle');
        break;
    }

    // 9. Sleep
    switch (user.sleepDuration) {
      case 1: // < 6
      case 2: // 6-7
        negatives.add('Insufficient sleep duration');
        break;
      case 3: // 7-8
      case 4: // 8-9
        positives.add('Optimal sleep duration (7-9 hours)');
        break;
      case 5: // > 9
        negatives.add('Excessive sleep duration');
        break;
    }

    // 12. Stress
    switch (user.stress) {
      case 1: // Rarely
      case 2: // Sometimes
        positives.add('Low to moderate stress levels');
        break;
      case 3: // Often
      case 4: // Always
        negatives.add('Frequent or constant stress');
        break;
    }

    // 22. Energy Level
    if (user.energyLevel <= 2) {
      negatives.add('Low daily energy level');
    } else {
      positives.add('Sufficient daily energy level');
    }

    // 23. Procrastination
    switch (user.procrastination) {
      case 1: // Always
      case 2: // Sometimes
        negatives.add('Tendency to procrastinate');
        break;
      case 3: // Rarely
      case 4: // Never
        positives.add('High level of self-discipline');
        break;
    }

    // 24. Focus
    switch (user.focus) {
      case 1: // Always
      case 2: // Sometimes
        negatives.add('Difficulty concentrating');
        break;
      case 3: // Rarely
      case 4: // Never
        positives.add('Good ability to concentrate');
        break;
    }

    // 15. Skin Problems
    final activeSkinProblems =
        user.skinProblems.where((p) => p.isActive).toList();
    if (activeSkinProblems.isEmpty) {
      positives.add('No active skin problems');
    } else {
      for (var problem in activeSkinProblems) {
        if (problem.title != 'Let AI analyze') {
          negatives.add('Skin concern: ${problem.title}');
        }
      }
    }

    // 17. Hair Problems
    final activeHairProblems =
        user.hairProblems.where((p) => p.isActive).toList();
    if (activeHairProblems.isEmpty) {
      positives.add('No active hair problems');
    } else {
      for (var problem in activeHairProblems) {
        if (problem.title != 'Let AI analyze') {
          negatives.add('Hair concern: ${problem.title}');
        }
      }
    }

    // 21. Mood
    switch (mood.mood) {
      case 1: // Great
      case 2: // Good
      case 3: // Okay
        positives.add('Generally positive mood');
        break;
      case 4: // Not Good
      case 5: // Bad
        negatives.add('Predominantly suppressed mood');
        break;
    }

    double bmi = calculateBMI(
      weight: weightModel.weight,
      weightUnit: weightModel.weightUnit,
      height: heightModel.height,
      heightUnit: heightModel.heightUnit,
      inches: heightModel.inch,
    );

    return WellnessAnalysis(
      bmi: bmi,
      bmiScore: _getBmiScore(bmi),
      bms: _getBmsScore(
        positives.length / (positives.length + negatives.length),
      ),
      positiveFactors: positives,
      negativeFactors: negatives,
    );
  }

  //bms score out of 10
  static double _getBmsScore(double ratio) {
    ratio = (ratio * 10) * 1.3; //scale to 10 and boost a bit
    return ratio.clamp(1.0, 10.0);
  }

  //bmi score out of 10
  static double _getBmiScore(double bmi) {
    if (bmi < 16) return 4.0;
    if (bmi < 18.5) return 6.0;
    if (bmi < 25) return 9.0;
    if (bmi < 30) return 6.5;
    if (bmi < 35) return 6.0;
    if (bmi < 40) return 4.0;
    return 1.0;
  }

  static double calculateBMI({
    required double weight,
    required String weightUnit,
    required double height,
    required String heightUnit,
    double inches = 0.0,
  }) {
    // 1. Convert weight to kilograms (kg) if it's in pounds.
    double weightInKg = weight;
    if (weightUnit == 'lbs') {
      weightInKg = weight * 0.453592;
    }
    // 2. Convert height to meters (m).
    double heightInMeters = height;
    if (heightUnit == 'cm') {
      heightInMeters = height / 100;
    } else if (heightUnit == 'ft&in') {
      double totalInches = (height * 12) + inches;
      heightInMeters = totalInches * 0.0254;
    }

    // 3. Check if height is zero to avoid division by zero.
    if (heightInMeters <= 0) {
      return 0.0;
    }

    // 4. Calculate BMI using the standard formula.
    // Formula: weight(kg) / (height(m) * height(m))
    double bmi = weightInKg / (heightInMeters * heightInMeters);

    // Round to one decimal place for convenience.
    return double.parse(bmi.toStringAsFixed(1));
  }
}
