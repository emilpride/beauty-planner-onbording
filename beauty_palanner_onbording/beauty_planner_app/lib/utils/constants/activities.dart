import 'package:get/get.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter/material.dart';
import '../../data/models/activity_model.dart';
import '../helpers/helper_functions.dart';
import 'image_strings.dart';

class Activities {
  // Define common TimeOfDay instances
  static final Rx<TimeOfDay>? _morning =
      null; //const TimeOfDay(hour: 7, minute: 0).obs;
  static final Rx<TimeOfDay>? _midMorning = null;
  // const TimeOfDay(hour: 9, minute: 0).obs;
  static final Rx<TimeOfDay>? _afternoon = null;
  // const TimeOfDay(hour: 14, minute: 0).obs;
  static final Rx<TimeOfDay>? _evening = null;
  // const TimeOfDay(hour: 20, minute: 0).obs;
  static final Rx<TimeOfDay>? _bedtime = null;
  // const TimeOfDay(hour: 22, minute: 0).obs;
  static final Rx<TimeOfDay>? _anytime = null;
  // const TimeOfDay(hour: 12, minute: 0).obs;
  static final Rx<TimeOfDay>? _workoutTime = null;
  // const TimeOfDay(hour: 17, minute: 0).obs;

  static List<ActivityModel> getWomanActivities() => [
    // Skin
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Cleanse & Hydrate',
      illustration: AppImages.cleanseAndHydrate,
      category: 'Skin',
      categoryId: '1',
      note:
          'Cleansing and moisturizing are the foundation of your skincare routine. Wash your face with a gentle cleanser to remove dirt and oil. Follow with toner and a hydrating moisturizer to restore balance. In the morning, always finish with SPF to protect your skin from environmental damage and premature aging.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Deep Hydration',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.deepHydration,
      note:
          'Deep hydration helps restore moisture levels, especially for dry or dull skin. Use sheet masks or eye patches infused with hyaluronic acid or nourishing ingredients to boost elasticity and leave your skin feeling plump and refreshed.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Exfoliate',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.exfoliate,
      note:
          'Exfoliating once or twice a week removes dead skin cells and unclogs pores. Choose a gentle physical scrub or a chemical exfoliant like AHAs or BHAs to smooth skin texture and support natural cell renewal.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Face Massage',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.faceMassage,
      note:
          'Facial massage improves circulation, reduces puffiness, and supports skin firmness. Use a jade roller or gua sha tool for a relaxing self-care ritual that promotes a healthy glow.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Lip & Eye Care',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.lipEyeCare,
      note:
          'These delicate areas need special attention. Apply a nourishing lip balm to prevent dryness and a lightweight eye cream to hydrate, brighten, and protect from early signs of aging.',
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'SPF Protection',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.spfProtection,
      note:
          'Daily sunscreen is non-negotiable. Use SPF 30 or higher, even on cloudy days, to defend against sun damage, dark spots, and fine lines.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),

    // Hair
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Wash & Care',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.washCare,
      note:
          'Use a shampoo and conditioner that suit your hair type to cleanse, balance, and maintain scalp health. Regular washing keeps hair fresh and manageable.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Deep Nourishment',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.deepNourishment,
      note:
          'Deep conditioning masks or balms should be used 1–2 times a week to restore softness, repair damage, and strengthen hair from within.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Scalp Detox',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.scalpDetox,
      note:
          'Detox your scalp weekly with a scrub or clarifying treatment to remove buildup, excess oil, and improve scalp health—essential for strong hair growth.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Heat Protection',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.heatProtection,
      note:
          'Always use a heat protectant before styling to shield your hair from high temperatures and prevent breakage and dryness.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Scalp Massage',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.scalpMassage,
      note:
          'Massaging your scalp improves blood flow, boosts nutrient delivery to hair follicles, and may support hair growth over time.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Trim Split Ends',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.trimSplitEnds,
      note:
          'Regular trims every 6–8 weeks prevent split ends from spreading and keep your hair looking healthy and polished.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime, // This would be appointment based
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Post-Color Care',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.postColorCare,
      note:
          'Colored hair needs extra care. Use color-protecting products and nourishing masks to maintain vibrancy and hydration after dyeing.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),

    // Physical health
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Morning Stretch',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.morningStretch,
      note:
          'A short morning stretch helps wake up your body, release stiffness, and set a positive tone for the day ahead.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Cardio Boost',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.cardioBoost,
      note:
          'Cardiovascular activities like walking, jogging, or jump rope energize your body, improve heart health, and support overall fitness.',
      color: MyHelperFunctions.getRandomColor(),
      time: _workoutTime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Strength Training',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.strengthTraining,
      note:
          'Incorporate resistance exercises using your body weight or equipment to build lean muscle, enhance posture, and boost metabolism.',
      color: MyHelperFunctions.getRandomColor(),
      time: _workoutTime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Yoga & Flexibility',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.yogaFlexibility,
      note:
          'Daily flexibility exercises or yoga sequences relieve tension, improve alignment, and support both physical and mental well-being.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Dance It Out',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.danceItOut,
      note:
          'Dancing is a joyful, fun way to stay fit. It combines cardio with creativity and is a great stress-reliever too.',
      color: MyHelperFunctions.getRandomColor(),
      time: _workoutTime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Swimming Time',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.swimmingTime,
      note:
          'Swimming is a low-impact, full-body workout that strengthens muscles and improves endurance without stressing joints.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Cycling',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.cycling,
      note:
          'Great for building lower-body strength and cardiovascular fitness. Ride indoors or outdoors to stay active and explore movement.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Posture Fix',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.postureFix,
      note:
          'Work on your core and back muscles with posture-focused routines to reduce tension, increase stability, and enhance body awareness.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Evening Stretch',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.eveningStretch,
      note:
          'End your day with gentle stretches to release tightness and improve sleep quality through relaxation.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),

    // Mental wellness
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Mindful Meditation',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.mindfulMeditation,
      note:
          'Spend 5–10 minutes in mindfulness or guided meditation to ground yourself, clear your thoughts, and reduce stress levels.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Breathing Exercises',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.breathingExercises,
      note:
          'Use intentional breathing techniques to calm your nervous system, improve focus, and reconnect with your body.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Gratitude Journal',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.gratitudeJournal,
      note:
          'Writing down a few things you\'re grateful for daily cultivates optimism, emotional balance, and mindfulness.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Mood Check-In',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.moodCheckIn,
      note:
          'Regularly tracking your mood helps you become more self-aware and detect emotional patterns over time.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Learn & Grow',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.learnGrow,
      note:
          'Dedicate time to personal development—read a book, listen to a podcast, or try something new that inspires your growth.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Social Media Detox',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.socialMediaDetox,
      note:
          'Unplug from digital noise by taking a break from screens. It helps restore mental clarity and reduce comparison fatigue.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Positive Affirmations',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.positiveAffirmations,
      note:
          'Reinforce self-belief by repeating kind, empowering statements about yourself. This practice helps shift mindset and build confidence.',
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Talk It Out',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.talkItOut,
      note:
          'Express your thoughts through journaling or conversations. Processing emotions can bring clarity, relief, and perspective.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Stress Relief',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.stressRelief,
      note:
          'Find your personal stress-relievers—whether it\'s walking, creating art, music, or anything that helps you decompress and reset.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
  ];

  static List<ActivityModel> getManActivities() => [
    // Skin
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Cleanse & Hydrate',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.cleanseAndHydrate,
      note:
          'Wash your face with a gentle cleanser in the morning and evening to remove dirt, oil, and sweat. Follow with a lightweight moisturizer to prevent dryness and keep skin balanced. In the morning, choose a product with SPF for added protection.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Exfoliate',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.exfoliate,
      note:
          'Use a scrub or exfoliating cleanser 1–2 times a week to remove dead skin cells, smooth rough texture, and prevent clogged pores and ingrown hairs — especially important if you shave.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Beard & Shave Care',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.deepHydration,
      note:
          'Keep your beard clean and soft with proper washing and oil or balm. If you shave, use shaving gel for glide and apply a soothing aftershave to reduce irritation and razor bumps.',
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Face Massage',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.faceMassage,
      note:
          'Massage your face with your fingertips or a tool to improve circulation, reduce puffiness, and relax facial tension. Great for mornings or after workouts.',
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'SPF Protection',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.spfProtection,
      note:
          'Apply sunscreen with SPF 30 or higher every morning — even on cloudy days. It protects against sunburn, wrinkles, and long-term skin damage.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Night Care Routine',
      category: 'Skin',
      categoryId: '1',
      illustration: AppImages.lipEyeCare,
      note:
          'Cleanse your face before bed and apply a night cream or light serum to support skin repair while you sleep. Add spot treatment for breakouts or dry areas.',
      color: MyHelperFunctions.getRandomColor(),
      time: _bedtime,
    ),

    // Hair
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Wash & Care',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.washCare,
      note:
          'Use shampoo suited to your scalp type (dry, oily, sensitive) 2–4 times per week. If your hair is longer, follow with conditioner to reduce frizz and improve manageability.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Scalp Massage',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.scalpMassage,
      note:
          'Massage your scalp 2–3 minutes during or after washing. It improves blood flow to hair follicles, supports growth, and reduces tension.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Heat Protection',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.heatProtection,
      note:
          'If you use a blow dryer or hot tools, apply a heat protectant to prevent dryness, breakage, and damage from high temperatures.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Haircut Reminder',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.trimSplitEnds,
      note:
          'Trim your hair or beard every 4–6 weeks to maintain a clean, healthy look and avoid split ends or uneven growth.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime, // Appointment based
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Hair Loss Support',
      category: 'Hair',
      categoryId: '2',
      illustration: AppImages.deepNourishment,
      note:
          'If you’re experiencing thinning, apply scalp serums or use strengthening shampoos to support fuller, stronger hair.',
      color: MyHelperFunctions.getRandomColor(),
      time: _morning, // Can also be evening depending on product
    ),

    // Physical Health
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Morning Stretch',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.morningStretch,
      note:
          'Wake up your body with 5–10 minutes of light stretching to improve blood flow, mobility, and posture — especially helpful after sleep stiffness.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Cardio Boost',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.cardioBoost,
      note:
          'Add 15–30 minutes of cardio 3–4 times a week — walking, jogging, cycling, or jump rope — to support heart health, endurance, and mental clarity.',
      color: MyHelperFunctions.getRandomColor(),
      time: _workoutTime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Strength Training',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.strengthTraining,
      note:
          'Do resistance exercises 2–4 times a week: bodyweight (push-ups, squats) or weights to build muscle, support metabolism, and improve overall strength.',
      color: MyHelperFunctions.getRandomColor(),
      time: _workoutTime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Yoga & Flexibility',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.yogaFlexibility,
      note:
          'Daily flexibility exercises or yoga sequences relieve tension, improve alignment, and support both physical and mental well-being.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Posture Fix',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.postureFix,
      note:
          'Incorporate core and back-focused exercises to improve posture, reduce back pain, and counteract sitting or screen time.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Quick Workouts',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.danceItOut,
      note:
          'When time is short, do 5–10 minute routines: high-intensity intervals, core circuits, or simple compound movements to stay consistent.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Evening Stretch',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.eveningStretch,
      note:
          'Do gentle stretching in the evening to relieve tension and relax your body before sleep — helps reduce tightness in hips, back, and shoulders.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Swimming',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.swimmingTime,
      note:
          'Swimming is a low-impact, full-body workout that strengthens muscles and improves endurance without stressing joints.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Cycling',
      category: 'Physical health',
      categoryId: '3',
      illustration: AppImages.cycling,
      note:
          'Great for building lower-body strength and cardiovascular fitness. Ride indoors or outdoors to stay active and explore movement.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),

    // Mental wellness
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Mindful Meditation',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.mindfulMeditation,
      note:
          'Spend 5–10 minutes daily in quiet breathing or guided meditation to reduce stress, clear your mind, and build mental resilience.',
      isRecommended: false,
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Breathing Exercises',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.breathingExercises,
      note:
          'Use structured breathing (e.g. box breathing or 4-7-8) during stressful moments, before meetings, or to reset your energy during the day.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Mood Check-In',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.moodCheckIn,
      note:
          'Track how you feel daily to identify emotional patterns and make more informed decisions about habits, work, and lifestyle.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Gratitude Exercises',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.gratitudeJournal,
      note:
          'Write down 1–3 things you’re grateful for each day. This simple practice shifts your focus to the positive, improves mood, and builds resilience.',
      color: MyHelperFunctions.getRandomColor(),
      time: _morning,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Learn & Grow',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.learnGrow,
      note:
          'Read a few pages, listen to a podcast, or explore a new topic daily. Keeps your mind engaged, inspired, and growing.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Screen Discipline',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.socialMediaDetox,
      note:
          'Limit screen time, especially at night. Set app timers, use "do not disturb" modes, and take breaks to reduce fatigue and improve attention.',
      color: MyHelperFunctions.getRandomColor(),
      time: _evening,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Talk It Out',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.talkItOut,
      note:
          'Use journaling, voice notes, or conversations to process your thoughts. Don’t carry mental clutter — express it, then let it go.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
    ActivityModel(
      id: const Uuid().v4(),
      name: 'Stress Relief',
      category: 'Mental wellness',
      categoryId: '4',
      illustration: AppImages.stressRelief,
      note:
          'Find what resets you: a walk, music, physical activity, or solo time. Prioritize stress relief as part of your daily performance plan.',
      color: MyHelperFunctions.getRandomColor(),
      time: _anytime,
    ),
  ];
}
