// Helper class for mood data
import '../constants/image_strings.dart';

class MoodDataHelper {
  static const Map<int, String> moodLabels = {
    1: 'Great',
    2: 'Good',
    3: 'Okay',
    4: 'Not Good',
    5: 'Bad',
  };

  static const Map<int, String> moodEmojis = {
    1: AppImages.great,
    2: AppImages.good,
    3: AppImages.okay,
    4: AppImages.notGood,
    5: AppImages.bad,
  };

  static const Map<String, List<String>> feelingsByMood = {
    'Great': [
      'Happy',
      'Brave',
      'Motivated',
      'Creative',
      'Confident',
      'Calm',
      'Grateful',
      'Peaceful',
      'Excited',
      'Loved',
      'Hopeful',
      'Inspired',
      'Proud',
      'Euphoric',
      'Nostalgic',
    ],
    'Good': [
      'Happy',
      'Motivated',
      'Creative',
      'Confident',
      'Calm',
      'Grateful',
      'Peaceful',
      'Excited',
      'Loved',
      'Hopeful',
      'Inspired',
      'Proud',
    ],
    'Okay': ['Calm', 'Peaceful', 'Hopeful', 'Content', 'Fine', 'Relaxed'],
    'Not Good': ['Sad', 'Tired', 'Anxious', 'Stressed', 'Lonely', 'Insecure'],
    'Bad': [
      'Angry',
      'Frustrated',
      'Overwhelmed',
      'Worried',
      'Disappointed',
      'Hurt',
    ],
  };

  static String getLabel(int mood) => moodLabels[mood] ?? '';
  static String getEmoji(int mood) => moodEmojis[mood] ?? '';
  static List<String> getFeelings(String moodLabel) =>
      feelingsByMood[moodLabel] ?? feelingsByMood['Great']!; // Default to great
}
