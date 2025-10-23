import 'package:firebase_ai/firebase_ai.dart';

import '../../data/models/height_model.dart';
import '../../data/models/mood_model.dart';
import '../../data/models/physical_activities_model.dart';
import '../../data/models/user_info_model.dart';
import '../../data/models/user_model.dart';
import '../../data/models/weight_model.dart';

class Prompt {
  static String getAIReviewPrompt(
    UserModel user,
    HeightModel height,
    WeightModel weight,
    MoodEntry mood,
  ) {
    final prompt = """
      You are a holistic health and beauty expert, AI. Based on the following user profile and photos, provide a detailed analysis of the user's overall condition, including physical health, mental well-being, skin and hair condition. Then, suggest personalized improvements in skincare, haircare, lifestyle, and daily habits. Your advice should be clear, friendly, and practical.
      User Profile:

      Gender: ${user.gender == 1 ? 'Male' : 'Female'}
      Age: ${user.age}
      Height: ${height.toString()}
      Weight: ${weight.toString()}

      Ethnic group: ${user.ethnicity}
      Rhytm of life: ${getLifeStyle(user.lifeStyle)}

    Sleep habits:
     Usually sleeps at night for: ${getSleepTime(user.sleepDuration)}
     Wake-up time: ${user.wakeUp.toString()}
     End of daytime: ${user.endDay.toString()}

    Frequency of stress: ${getStressFrequency(user.stress)}

    Work environment: ${user.workEnv == 1
        ? 'In Office'
        : user.workEnv == 2
        ? 'Remote'
        : user.workEnv == 3
        ? 'Part-Time'
        : 'Jobless'}

    Skin type: ${user.skinType == 1
        ? 'Dry skin'
        : user.skinType == 2
        ? 'Normal skin'
        : user.skinType == 3
        ? 'Oily Skin'
        : user.skinType == 4
        ? 'Combination skin'
        : user.skinType == 5
        ? 'Let AI analyze, Based on the photos provided determine user skin type'
        : 'Not specified'}

    Skin problems (if any): ${getSkinProblems(user.skinProblems)}
    If the user chooses "Let AI analyze", you should analyze the skin type based on the photos provided.

    Hair type:  ${user.hairType == 1
        ? 'Straight'
        : user.hairType == 2
        ? 'Slight waves'
        : user.hairType == 3
        ? 'Soft waves'
        : user.hairType == 4
        ? 'Defined waves'
        : user.hairType == 5
        ? 'Classic Curls'
        : user.hairType == 6
        ? 'Soft spiral curls'
        : user.hairType == 7
        ? 'Corkscrew Curls'
        : user.hairType == 8
        ? 'Slightly coiled'
        : user.hairType == 9
        ? 'Kinky'
        : user.hairType == 10
        ? 'Super kinky'
        : user.hairType == 11
        ? 'Let AI analyze, Based on the photos provided determine user hair type'
        : 'Not specified'}

    Hair problems (if any): ${getHairProblems(user.hairProblems)}
    If the user chooses "Let AI analyze", you should analyze the hair type based on the photos provided.

    Physical activity:
     Activity and Frequency: ${getPhysicalActivitiesWithFrequency(user.physicalActivities)}

    Diet description: ${getDiet(user.diet)}

    Mood in the past month: ${mood.mood == 1
        ? 'mostly great'
        : mood.mood == 2
        ? 'mostly good'
        : mood.mood == 3
        ? 'mostly okay'
        : mood.mood == 4
        ? 'mostly sad'
        : mood.mood == 5
        ? 'mostly bad'
        : 'Unknown'} 

    Daily energy level: ${user.energyLevel} [number from 0 to 5]

    Procrastination frequency: ${user.procrastination == 1
        ? 'Always'
        : user.procrastination == 2
        ? 'Sometimes'
        : user.procrastination == 3
        ? 'Rarely'
        : user.procrastination == 4
        ? 'Never'
        : 'Unknown'} 

    Difficulty focusing: ${user.focus == 1
        ? 'Always'
        : user.focus == 2
        ? 'Sometimes'
        : user.focus == 3
        ? 'Rarely'
        : user.focus == 4
        ? 'Never'
        : 'Unknown'}

    Things that help with organization and motivation: ${getInfluence(user.influence)}

  Instructions:
    Analyze skin and hair condition using the photos and described problems.

    Evaluate their physical and mental balance based on energy, mood, stress, and focus.

    Provide a personalized improvement plan covering:

    Beauty (skincare & haircare)

    Health (sleep, diet, physical activity)

    Mind (stress management, motivation, productivity)

    Give a 0-10 Beauty Mirror Score (BMS) reflecting the overall balance and wellness state, and briefly explain it.


  Metrics to Calculate:
    BMI - Calculate based on gender, age, height, weight, body photo, and ethnic group. Adjust the interpretation according to known ethnic-specific health guidelines (e.g., Asian populations may have increased health risks at lower BMI thresholds). There should be two measures here, a standard BMI score and separately a 10 point scale score, below in BMS we will take the 10 point scale score.
    BMI table:
    < 16.0 - Short description: Severely Underweight
    16.0 - 18.4 - Short description: Underweight
    18.5 - 24.9 - Short description: Normal Weight
    25.0 - 29.9 - Short description: Overweight
    30.0 - 34.9 - Short description: Obesity (Class I)
    35.0 - 39.9 - Short description: Obesity (Class II)
    ≥ 40.0 - Short description: Obesity (Class III)


  BMI Score (0-10) - Based on the standard BMI, where 0 is severely bad for the user and 10 is perfect based on the BMI table above, their height, weight, gender, age, ethnic group, and body photo. The score should be rounded to the nearest integer.
  Skin condition (0-10) - Based on skin type, skin issues, and face photo. Recommendations for women: ✅ Cleanse & Hydrate, 💧 Deep Hydration, 🔄 Exfoliate, 💆‍♀️ Face Massage, 💋 Lip & Eye Care, 🛡 SPF Protection
  Recommendations for men: ✅ Cleanse & Hydrate, 🔄 Exfoliate, 🧔 Beard & Shave Care, 💆‍♂️ Face Massage, 🛡 SPF Protection, 🌙 Night Care Routine
  Hair condition (0-10) - Based on hair type, hair problems, and hair photo.
  Recommendations for women: 🧴 Wash & Care, 🧖‍♀️ Deep Nourishment, 🌀 Scalp Detox, 💧 Leave-in Care, 🔥 Heat Protection, 💆‍♀️ Scalp Massage, ✂️ Trim Split Ends, 🎨 Post-Color Care
  Recommendations for men: 🧴 Wash & Care, 💆‍♂️ Scalp Massage, 🔥 Heat Protection, 👨‍🦱 Haircut, 🧪 Hair Loss Support
  Physical condition (0-10) - Based on frequency of physical activity, diet, energy level, and body photo.
  Recommendations for women: 🌅 Morning Stretch, 🏃‍♀️ Cardio Boost, 🏋️ Strength Training, 🧘 Yoga & Flexibility, 💃 Dance It Out, 🏊‍♀️ Swimming Time, 🚴 Cycling, 📏 Posture Fix, 🌙 Evening Stretch
  Recommendations for men: 🌅 Morning Stretch, 🏃 Cardio Boost, 🏋️ Strength Training, 🧘‍♂️ Yoga & Flexibility, 🧎 Posture Fix, 🔁 Quick Workouts, 🌙 Evening Stretch, 🏊‍♀️ Swimming, 🚴 Cycling

  Mental condition (0-10) - Based on sleep patterns, stress levels, ability to focus, procrastination, and general mood.
  Recommendations for women: 🧘‍♀️ Mindful Meditation, 💨 Breathing Exercises, 📖 Gratitude Journal, 📊 Mood Check-In, 📚 Learn & Grow, 📵 Social Media Detox, 😊 Positive Affirmations, 🗣️ Talk It Out, 🌿 Stress Relief
  Recommendations for men: 🧘‍♂️ Mindful Meditation, 🌬 Breathing Exercises, 📊 Mood Check-In, 🧠 Daily Focus Statement, 📚 Learn & Grow, 📵 Screen Discipline, 🗣 Talk It Out, 🌿 Stress Relief

  BMS Score (Beauty Mirror Score) - Custom metric calculated as the average of BMI, Skin, Hair, Physical, and Mental scores (rounded to the nearest 0.1).
  BMS score table:
  0 - 3.9 - Short description: Needs Attention)
  4.0 - 5.9 - Short description: Getting There
  6.0 - 7.9 - Short description: Balanced
  8.0 - 10 - Short description: Radiant

  For Each Category, Return:
  Score (0-10)

  Short explanation (2-3 sentences)

  Recommendations (list of 3-5 personalized activities or habits based on gender)
  Recommended actions from this list:[Cleanse & Hydrate,
  Deep Hydration,
  Exfoliate,
  Face Massage,
  Lip & Eye Care,
  SPF Protection,
  Wash & Care,
  Deep Nourishment,
  Scalp Detox,
  Leave-in Care,
  Heat Protection,
  Scalp Massage,
  Trim Split Ends,
  Post-Color Care,
  Morning Stretch,
  Cardio Boost,
  Strength Training,
  Yoga & Flexibility,
  Dance It Out,
  Swimming Time,
  Cycling,
  Posture Fix,
  Evening Stretch,
  Mindful Meditation,
  Breathing Exercises,
  Gratitude Journal,
  Mood Check-In,
  Learn & Grow,
  Social Media Detox,
  Positive Affirmations,
  Talk It Out,
  Stress Relief,
  Beard & Shave Care,
  Night Care Routine,
  Haircut,
  Hair Loss Support,
  Quick Workouts,
  Swimming,
  Daily Focus Statement,
  Screen Discipline];

  Suggested frequency (e.g. daily, 3x/week, monthly)
    """;

    return prompt;
  }

  static String getLifeStyle(int lifeStyle) {
    switch (lifeStyle) {
      case 1:
        return 'Sedentary lifestyle';
      case 2:
        return 'Active Lifestyle';
      case 3:
        return 'Sports Lifestyle';
      default:
        return 'Unknown lifestyle';
    }
  }

  static String getSleepTime(int sleepTime) {
    switch (sleepTime) {
      case 1:
        return 'Less than 6 hours';
      case 2:
        return '6-7 hours';
      case 3:
        return '7-8 hours';
      case 4:
        return '8-9 hours';
      case 5:
        return 'More than 9 hours';
      default:
        return 'Unknown sleep time';
    }
  }

  static String getStressFrequency(int stressFrequency) {
    switch (stressFrequency) {
      case 1:
        return 'Rarely';
      case 2:
        return 'Sometimes';
      case 3:
        return 'Often';
      case 4:
        return 'Always';
      default:
        return 'Unknown stress frequency';
    }
  }

  static String getSkinProblems(List<UserInfoModel> skinProblems) {
    String problems = skinProblems
        .where((problem) => problem.isActive)
        .map((problem) => problem.title)
        .join(', ');
    return problems.isEmpty ? 'No skin problems' : problems;
  }

  static String getHairProblems(List<UserInfoModel> hairProblems) {
    String problems = hairProblems
        .where((problem) => problem.isActive)
        .map((problem) => problem.title)
        .join(', ');
    return problems.isEmpty ? 'No hair problems' : problems;
  }

  static String getDiet(List<UserInfoModel> diet) {
    String dietDescription = diet
        .where((item) => item.isActive)
        .map((item) => item.title)
        .join(', ');
    return dietDescription.isEmpty ? 'No specific diet' : dietDescription;
  }

  static String getPhysicalActivitiesWithFrequency(
    List<PhysicalActivitiesModel> physicalActivities,
  ) {
    return physicalActivities
        .where((activity) => activity.isActive)
        .map((activity) => '${activity.title} / ${activity.frequency}')
        .join(', ');
  }

  static String getInfluence(List<UserInfoModel> influence) {
    return influence
        .where((item) => item.isActive)
        .map((item) => item.title)
        .join(', ');
  }

  static Schema jsonSchema = Schema.object(
    properties: {
      'bmi': Schema.number(
        minimum: 0,
        maximum: 45.0,
        description:
            'Body Mass Index calculated based on user\'s height and weight.',
      ),
      'bmi_score': Schema.number(
        minimum: 0,
        maximum: 10,
        description: 'BMI score on a scale from 0 to 10',
      ),

      'skin_condition_score': Schema.number(
        minimum: 0,
        maximum: 10,
        description:
            'Score for skin condition based on skin type, issues, and photos.',
      ),
      'skin_condition_explanation': Schema.string(
        description: 'Short explanation of the skin condition score.',
      ),
      'hair_condition_score': Schema.number(
        minimum: 0,
        maximum: 10,
        description:
            'Score for hair condition based on hair type, issues, and photos.',
      ),
      'hair_condition_explanation': Schema.string(
        description: 'Short explanation of the hair condition score.',
      ),
      'physical_condition_score': Schema.number(
        minimum: 0,
        maximum: 10,
        description:
            'Score for physical condition based on activity, diet, and energy level.',
      ),
      'physical_condition_explanation': Schema.string(
        description: 'Short explanation of the physical condition score.',
      ),
      'mental_condition_score': Schema.number(
        minimum: 0,
        maximum: 10,
        description:
            'Score for mental condition based on sleep, stress, focus, and mood.',
      ),
      'mental_condition_explanation': Schema.string(
        description: 'Short explanation of the mental condition score.',
      ),
      'bms_score': Schema.number(
        minimum: 0,
        maximum: 10,
        description: 'Beauty Mirror Score, average of all condition scores.',
      ),
      'recommended_activities': Schema.array(
        items: Schema.string(),
        description:
            'List of recommended activities based on the analysis, e.g., "Cleanse & Hydrate, Deep Nourishment, Morning Stretch, etc."',
      ),
    },
  );
}
