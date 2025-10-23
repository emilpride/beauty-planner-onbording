import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../../utils/constants/categories.dart';
import 'activity_model.dart';
import '../../utils/constants/onboarding_options.dart';
import '../../utils/helpers/helper_functions.dart';
import 'category_model.dart';
import 'physical_activities_model.dart';
import 'user_info_model.dart';

class UserModel {
  final String id;
  String name;
  int gender;
  int age;
  String ethnicity;
  final String email;
  String profilePicture;
  DateTime? dateOfBirth;
  String? currency;

  int assistant;

  bool accountDeactivated;

  bool dailyMoodReminder;
  bool activityReminder;

  String languageCode;
  int lifeStyle;
  int sleepDuration;

  TimeOfDay wakeUp;
  TimeOfDay endDay;

  List<UserInfoModel> goals;

  int stress;
  int workEnv;
  int skinType;

  List<UserInfoModel> skinProblems;

  int hairType;
  List<UserInfoModel> hairProblems;

  List<PhysicalActivitiesModel> physicalActivities;
  List<UserInfoModel> diet;

  int procrastination;
  int focus;
  List<UserInfoModel> influence;

  int energyLevel;

  List<ActivityModel> activities;
  List<ActivityModel> deletedActivities;
  List<CategoryModel> categories;
  bool onboarding2Completed;

  TimeOfDay morningStartsAt;
  TimeOfDay afternoonStartsAt;
  TimeOfDay eveningStartsAt;

  String firstDayOfWeek;
  bool vacationMode;

  bool dailyReminder;
  TimeOfDay reminderTime;

  Map<String, bool> keepActivityHistory;

  int theme;

  bool biometricEnabled;
  bool faceIdEnabled;

  UserModel({
    this.theme = 1,
    this.assistant = 2,
    required this.id,
    required this.name,
    this.gender = 0,
    required this.age,
    required this.ethnicity,
    required this.email,
    required this.profilePicture,
    this.dateOfBirth,
    required this.lifeStyle,
    this.languageCode = 'en',
    this.currency,
    required this.dailyMoodReminder,
    this.activityReminder = false,
    required this.activities,
    this.deletedActivities = const [],
    required this.categories,
    required this.goals,
    required this.sleepDuration,
    required this.wakeUp,
    required this.endDay,
    required this.stress,
    required this.workEnv,
    required this.skinType,
    required this.skinProblems,
    required this.hairType,
    required this.hairProblems,
    required this.physicalActivities,
    required this.diet,
    required this.procrastination,
    required this.focus,
    required this.influence,
    required this.energyLevel,
    this.onboarding2Completed = false,
    this.accountDeactivated = false,
    this.morningStartsAt = const TimeOfDay(hour: 6, minute: 0),
    this.afternoonStartsAt = const TimeOfDay(hour: 12, minute: 0),
    this.eveningStartsAt = const TimeOfDay(hour: 18, minute: 0),
    this.firstDayOfWeek = 'Monday',
    required this.vacationMode,
    this.dailyReminder = true,
    this.reminderTime = const TimeOfDay(hour: 7, minute: 0),
    this.keepActivityHistory = const {},
    this.biometricEnabled = false,
    this.faceIdEnabled = false,
  });

  static List<String> nameParts(fullName) => fullName.split(" ");

  static String generateUsername(fullName) {
    List<String> nameParts = fullName.split(" ");
    String firstName = nameParts[0].toLowerCase();
    String lastName = nameParts.length > 1 ? nameParts[1].toLowerCase() : "";

    String camelCaseUsername = "$firstName$lastName";
    String usernameWithPrefix = "_$camelCaseUsername";

    return usernameWithPrefix;
  }

  static UserModel empty() => UserModel(
    id: '',
    name: '',
    assistant: 2,
    gender: 0,
    age: 0,
    ethnicity: '',
    email: '',
    profilePicture: '',
    dateOfBirth: null,
    currency: null,
    languageCode: 'en',
    dailyMoodReminder: false,
    activityReminder: false,
    lifeStyle: 0,
    goals: OnboardingOptions.goals(),
    sleepDuration: 0,
    wakeUp: const TimeOfDay(hour: 7, minute: 0),
    endDay: const TimeOfDay(hour: 22, minute: 0),
    stress: 0,
    workEnv: 0,
    skinType: 0,
    skinProblems: OnboardingOptions.skinProblems(),
    hairType: 0,
    hairProblems: OnboardingOptions.hairProblems(),
    physicalActivities: OnboardingOptions.physicalActivities(),
    diet: OnboardingOptions.diet(),
    procrastination: 0,
    focus: 0,
    influence: OnboardingOptions.influence(),
    energyLevel: 0,
    activities: [],
    categories: Categories.allCategories,
    onboarding2Completed: false,
    vacationMode: false,
    theme: 1,
    biometricEnabled: false,
    faceIdEnabled: false,
  );

  Map<String, dynamic> toJson() {
    return {
      'Id': id,
      'Name': name,
      'Gender': gender,
      'Assistant': assistant,
      'Age': age,
      'Ethnicity': ethnicity,
      'Email': email,
      'ProfilePicture': profilePicture,
      'DateOfBirth': dateOfBirth?.toIso8601String(),
      'DailyMoodReminder': dailyMoodReminder,
      'ActivityReminder': activityReminder,
      'Currency': currency,
      'LanguageCode': languageCode,
      'LifeStyle': lifeStyle,
      'Goals': goals.map((goal) => goal.toJson()).toList(),
      'SleepDuration': sleepDuration,
      'WakeUp': MyHelperFunctions.timeOfDayToFirebase(wakeUp),
      'EndDay': MyHelperFunctions.timeOfDayToFirebase(endDay),
      'Stress': stress,
      'WorkEnv': workEnv,
      'SkinType': skinType,
      'SkinProblems': skinProblems.map((problem) => problem.toJson()).toList(),
      'HairType': hairType,
      'HairProblems': hairProblems.map((problem) => problem.toJson()).toList(),
      'PhysicalActivities':
          physicalActivities.map((activity) => activity.toJson()).toList(),
      'Diet': diet.map((item) => item.toJson()).toList(),
      'Procrastination': procrastination,
      'Focus': focus,
      'Influence': influence.map((item) => item.toJson()).toList(),
      'EnergyLevel': energyLevel,
      'Activities':
          activities.isNotEmpty
              ? activities.map((e) => e.toJson()).toList()
              : [],
      'DeletedActivities':
          deletedActivities.isNotEmpty
              ? deletedActivities.map((e) => e.toJson()).toList()
              : [],
      'Categories': categories.map((category) => category.toJson()).toList(),
      'Onboarding2Completed': onboarding2Completed,
      'AccountDeactivated': accountDeactivated,
      'MorningStartsAt': MyHelperFunctions.timeOfDayToFirebase(morningStartsAt),
      'AfternoonStartsAt': MyHelperFunctions.timeOfDayToFirebase(
        afternoonStartsAt,
      ),
      'EveningStartsAt': MyHelperFunctions.timeOfDayToFirebase(eveningStartsAt),
      'FirstDayOfWeek': firstDayOfWeek,
      'VacationMode': vacationMode,
      'DailyReminder': dailyReminder,
      'ReminderTime': MyHelperFunctions.timeOfDayToFirebase(reminderTime),
      'KeepActivityHistory': keepActivityHistory,
      'Theme': theme,
      'BiometricEnabled': biometricEnabled,
      'FaceIdEnabled': faceIdEnabled,
    };
  }

  //from json
  factory UserModel.fromJson(Map<String, dynamic> data) {
    return UserModel(
      id: data['Id'],
      name: data['Name'],
      gender: data['Gender'],
      assistant: data['Assistant'] ?? 2,
      age: data['Age'] ?? 0,
      ethnicity: data['Ethnicity'] ?? '',
      email: data['Email'],
      profilePicture: data['ProfilePicture'],
      dateOfBirth:
          data['DateOfBirth'] != null
              ? DateTime.parse(data['DateOfBirth'])
              : null,
      dailyMoodReminder: data['DailyMoodReminder'] ?? false,
      activityReminder: data['ActivityReminder'] ?? false,
      currency: data['Currency'],
      languageCode: data['LanguageCode'] ?? 'en',
      lifeStyle: data['LifeStyle'] ?? 0,
      goals:
          (data['Goals'] as List<dynamic>?)
              ?.map(
                (goal) => UserInfoModel.fromJson(goal as Map<String, dynamic>),
              )
              .toList() ??
          [],
      sleepDuration: data['SleepDuration'] ?? 0,
      wakeUp:
          data['WakeUp'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['WakeUp'])
              : const TimeOfDay(hour: 7, minute: 0),
      endDay:
          data['EndDay'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['EndDay'])
              : const TimeOfDay(hour: 22, minute: 0),
      stress: data['Stress'] ?? 0,
      workEnv: data['WorkEnv'] ?? 0,
      skinType: data['SkinType'] ?? 0,
      skinProblems:
          (data['SkinProblems'] as List<dynamic>?)
              ?.map(
                (problem) =>
                    UserInfoModel.fromJson(problem as Map<String, dynamic>),
              )
              .toList() ??
          [],
      hairType: data['HairType'] ?? 0,
      hairProblems:
          (data['HairProblems'] as List<dynamic>?)
              ?.map(
                (problem) =>
                    UserInfoModel.fromJson(problem as Map<String, dynamic>),
              )
              .toList() ??
          [],
      physicalActivities:
          (data['PhysicalActivities'] as List<dynamic>?)
              ?.map(
                (activity) => PhysicalActivitiesModel.fromJson(
                  activity as Map<String, dynamic>,
                ),
              )
              .toList() ??
          [],
      diet:
          (data['Diet'] as List<dynamic>?)
              ?.map(
                (item) => UserInfoModel.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          [],
      procrastination: data['Procrastination'] ?? 0,
      focus: data['Focus'] ?? 0,
      influence:
          (data['Influence'] as List<dynamic>?)
              ?.map(
                (item) => UserInfoModel.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          [],
      energyLevel: data['EnergyLevel'] ?? 0,
      activities:
          (data['Activities'] as List<dynamic>?)
              ?.map(
                (activity) =>
                    ActivityModel.fromJson(activity as Map<String, dynamic>),
              )
              .toList() ??
          [],
      deletedActivities:
          (data['DeletedActivities'] as List<dynamic>?)
              ?.map(
                (activity) =>
                    ActivityModel.fromJson(activity as Map<String, dynamic>),
              )
              .toList() ??
          [],
      categories:
          (data['Categories'] as List<dynamic>?)
              ?.map(
                (category) =>
                    CategoryModel.fromJson(category as Map<String, dynamic>),
              )
              .toList() ??
          Categories.allCategories,
      onboarding2Completed: data['Onboarding2Completed'] ?? false,
      accountDeactivated: data['AccountDeactivated'] ?? false,
      morningStartsAt:
          data['MorningStartsAt'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['MorningStartsAt'])
              : const TimeOfDay(hour: 6, minute: 0),
      afternoonStartsAt:
          data['AfternoonStartsAt'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['AfternoonStartsAt'])
              : const TimeOfDay(hour: 12, minute: 0),
      eveningStartsAt:
          data['EveningStartsAt'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['EveningStartsAt'])
              : const TimeOfDay(hour: 18, minute: 0),
      firstDayOfWeek: data['FirstDayOfWeek'] ?? 'Monday',
      vacationMode: data['VacationMode'] ?? false,
      dailyReminder: data['DailyReminder'] ?? true,
      reminderTime:
          data['ReminderTime'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['ReminderTime'])
              : const TimeOfDay(hour: 7, minute: 0),
      keepActivityHistory:
          (data['KeepActivityHistory'] as Map<String, dynamic>?)?.map(
            (key, value) => MapEntry(key, value as bool),
          ) ??
          {},
      theme: data['Theme'] ?? 1,
      biometricEnabled: data['BiometricEnabled'] ?? false,
      faceIdEnabled: data['FaceIdEnabled'] ?? false,
    );
  }

  /// Creates a [UserModel] instance from a Firestore [DocumentSnapshot].
  factory UserModel.fromSnapshot(
    DocumentSnapshot<Map<String, dynamic>> document,
  ) {
    final data = document.data();
    if (data == null) {
      return UserModel.empty();
    }
    return UserModel(
      id: document.id,
      name: data['Name'] ?? '',
      gender: data['Gender'] ?? 0,
      assistant: data['Assistant'] ?? 2,
      age: data['Age'] ?? 0,
      ethnicity: data['Ethnicity'] ?? '',
      email: data['Email'] ?? '',
      profilePicture: data['ProfilePicture'] ?? '',
      dateOfBirth:
          data['DateOfBirth'] != null
              ? DateTime.parse(data['DateOfBirth'])
              : null,
      dailyMoodReminder: data['DailyMoodReminder'] ?? false,
      activityReminder: data['ActivityReminder'] ?? false,
      currency: data['Currency'],
      languageCode: data['LanguageCode'] ?? 'en',
      lifeStyle: data['LifeStyle'] ?? 0,
      goals:
          (data['Goals'] as List<dynamic>?)
              ?.map(
                (goal) => UserInfoModel.fromJson(goal as Map<String, dynamic>),
              )
              .toList() ??
          OnboardingOptions.goals(),
      sleepDuration: data['SleepDuration'] ?? 0,
      wakeUp:
          data['WakeUp'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['WakeUp'])
              : const TimeOfDay(hour: 7, minute: 0),
      endDay:
          data['EndDay'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['EndDay'])
              : const TimeOfDay(hour: 22, minute: 0),
      stress: data['Stress'] ?? 0,
      workEnv: data['WorkEnv'] ?? 0,
      skinType: data['SkinType'] ?? 0,
      skinProblems:
          (data['SkinProblems'] as List<dynamic>?)
              ?.map(
                (problem) =>
                    UserInfoModel.fromJson(problem as Map<String, dynamic>),
              )
              .toList() ??
          OnboardingOptions.skinProblems(),
      hairType: data['HairType'] ?? 0,
      hairProblems:
          (data['HairProblems'] as List<dynamic>?)
              ?.map(
                (problem) =>
                    UserInfoModel.fromJson(problem as Map<String, dynamic>),
              )
              .toList() ??
          OnboardingOptions.hairProblems(),
      physicalActivities:
          (data['PhysicalActivities'] as List<dynamic>?)
              ?.map(
                (activity) => PhysicalActivitiesModel.fromJson(
                  activity as Map<String, dynamic>,
                ),
              )
              .toList() ??
          OnboardingOptions.physicalActivities(),
      diet:
          (data['Diet'] as List<dynamic>?)
              ?.map(
                (item) => UserInfoModel.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          OnboardingOptions.diet(),
      procrastination: data['Procrastination'] ?? 0,
      focus: data['Focus'] ?? 0,
      influence:
          (data['Influence'] as List<dynamic>?)
              ?.map(
                (item) => UserInfoModel.fromJson(item as Map<String, dynamic>),
              )
              .toList() ??
          OnboardingOptions.influence(),
      energyLevel: data['EnergyLevel'] ?? 0,
      activities:
          (data['Activities'] as List<dynamic>?)
              ?.map(
                (activity) =>
                    ActivityModel.fromJson(activity as Map<String, dynamic>),
              )
              .toList() ??
          [],
      categories:
          (data['Categories'] as List<dynamic>?)
              ?.map(
                (category) =>
                    CategoryModel.fromJson(category as Map<String, dynamic>),
              )
              .toList() ??
          Categories.allCategories,
      onboarding2Completed: data['Onboarding2Completed'] ?? false,
      accountDeactivated: data['AccountDeactivated'] ?? false,
      morningStartsAt:
          data['MorningStartsAt'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['MorningStartsAt'])
              : const TimeOfDay(hour: 6, minute: 0),
      afternoonStartsAt:
          data['AfternoonStartsAt'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['AfternoonStartsAt'])
              : const TimeOfDay(hour: 12, minute: 0),
      eveningStartsAt:
          data['EveningStartsAt'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['EveningStartsAt'])
              : const TimeOfDay(hour: 18, minute: 0),
      firstDayOfWeek: data['FirstDayOfWeek'] ?? 'Monday',
      vacationMode: data['VacationMode'] ?? false,
      dailyReminder: data['DailyReminder'] ?? true,
      reminderTime:
          data['ReminderTime'] != null
              ? MyHelperFunctions.firebaseToTimeOfDay(data['ReminderTime'])
              : const TimeOfDay(hour: 7, minute: 0),
      keepActivityHistory:
          (data['KeepActivityHistory'] as Map<String, dynamic>?)?.map(
            (key, value) => MapEntry(key, value as bool),
          ) ??
          {},
      deletedActivities:
          (data['DeletedActivities'] as List<dynamic>?)
              ?.map(
                (activity) =>
                    ActivityModel.fromJson(activity as Map<String, dynamic>),
              )
              .toList() ??
          [],
      theme: data['Theme'] ?? 1,
      biometricEnabled: data['BiometricEnabled'] ?? false,
      faceIdEnabled: data['FaceIdEnabled'] ?? false,
    );
  }

  //copyWith method
  UserModel copyWith({
    String? id,
    String? name,
    int? gender,
    int? assistant,
    int? age,
    String? ethnicity,
    String? email,
    String? profilePicture,
    DateTime? dateOfBirth,
    String? currency,
    bool? dailyNotification,
    bool? monthlyReminder,
    bool? birthdayReminder,
    String? languageCode,
    int? lifeStyle,
    int? sleepDuration,
    TimeOfDay? wakeUp,
    TimeOfDay? endDay,
    List<UserInfoModel>? goals,
    int? stress,
    int? workEnv,
    int? skinType,
    List<UserInfoModel>? skinProblems,
    int? hairType,
    List<UserInfoModel>? hairProblems,
    List<PhysicalActivitiesModel>? physicalActivities,
    List<UserInfoModel>? diet,
    int? procrastination,
    int? focus,
    List<UserInfoModel>? influence,
    int? energyLevel,
    List<ActivityModel>? activities,
    List<String>? recommendedActivities,
    bool? onboarding2Completed,
    bool? dailyReminder,
    TimeOfDay? reminderTime,
    bool? dailyMoodReminder,
    bool? activityReminder,
    bool? accountDeactivated,
    TimeOfDay? morningStartsAt,
    TimeOfDay? afternoonStartsAt,
    TimeOfDay? eveningStartsAt,
    String? firstDayOfWeek,
    bool? vacationMode,
    Map<String, bool>? keepActivityHistory,
    List<CategoryModel>? categories,
    List<ActivityModel>? deletedActivities,
    int? theme,
    bool? biometricEnabled,
    bool? faceIdEnabled,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      gender: gender ?? this.gender,
      assistant: assistant ?? this.assistant,
      age: age ?? this.age,
      ethnicity: ethnicity ?? this.ethnicity,
      email: email ?? this.email,
      profilePicture: profilePicture ?? this.profilePicture,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      currency: currency ?? this.currency,
      dailyMoodReminder: dailyMoodReminder ?? this.dailyMoodReminder,
      activityReminder: activityReminder ?? this.activityReminder,
      languageCode: languageCode ?? this.languageCode,
      lifeStyle: lifeStyle ?? this.lifeStyle,
      sleepDuration: sleepDuration ?? this.sleepDuration,
      wakeUp: wakeUp ?? this.wakeUp,
      endDay: endDay ?? this.endDay,
      goals: goals ?? this.goals,
      stress: stress ?? this.stress,
      workEnv: workEnv ?? this.workEnv,
      skinType: skinType ?? this.skinType,
      skinProblems: skinProblems ?? this.skinProblems,
      hairType: hairType ?? this.hairType,
      hairProblems: hairProblems ?? this.hairProblems,
      physicalActivities: physicalActivities ?? this.physicalActivities,
      diet: diet ?? this.diet,
      procrastination: procrastination ?? this.procrastination,
      focus: focus ?? this.focus,
      influence: influence ?? this.influence,
      energyLevel: energyLevel ?? this.energyLevel,
      activities: activities ?? this.activities,
      categories: categories ?? this.categories,
      onboarding2Completed: onboarding2Completed ?? this.onboarding2Completed,
      accountDeactivated: accountDeactivated ?? this.accountDeactivated,
      morningStartsAt: morningStartsAt ?? this.morningStartsAt,
      afternoonStartsAt: afternoonStartsAt ?? this.afternoonStartsAt,
      eveningStartsAt: eveningStartsAt ?? this.eveningStartsAt,
      firstDayOfWeek: firstDayOfWeek ?? this.firstDayOfWeek,
      vacationMode: vacationMode ?? this.vacationMode,
      dailyReminder: dailyReminder ?? this.dailyReminder,
      reminderTime: reminderTime ?? this.reminderTime,
      keepActivityHistory: keepActivityHistory ?? this.keepActivityHistory,
      deletedActivities: deletedActivities ?? this.deletedActivities,
      theme: theme ?? this.theme,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      faceIdEnabled: faceIdEnabled ?? this.faceIdEnabled,
    );
  }

  @override
  String toString() {
    return 'UserModel(id: $id, name: $name, gender: $gender, age: $age, ethnicity: $ethnicity, email: $email, profilePicture: $profilePicture, dailyMoodReminder: $dailyMoodReminder, activityReminder: $activityReminder, currency: $currency, languageCode: $languageCode, lifeStyle: $lifeStyle, sleepDuration: $sleepDuration, wakeUp: $wakeUp, endDay: $endDay, goals: $goals, stress: $stress, workEnv: $workEnv, skinType: $skinType, skinProblems: $skinProblems, hairType: $hairType, hairProblems: $hairProblems, physicalActivities: $physicalActivities, diet: $diet, procrastination: $procrastination, focus: $focus, influence: $influence, energyLevel: $energyLevel, activities: $activities, onboarding2Completed: $onboarding2Completed)';
  }
}
