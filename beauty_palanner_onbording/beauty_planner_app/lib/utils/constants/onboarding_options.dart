import '../../data/models/physical_activities_model.dart';
import '../../data/models/user_info_model.dart';

class OnboardingOptions {
  static List<UserInfoModel> goals() => [
    UserInfoModel(id: '1', title: 'Build Healthy Activities', isActive: false),
    UserInfoModel(id: '2', title: 'Boost Productivity', isActive: false),
    UserInfoModel(id: '3', title: 'Achieve Personal Goals', isActive: false),
    UserInfoModel(id: '4', title: 'Manage Stress & Anxiety', isActive: false),
  ];

  static List<UserInfoModel> skinProblems() => [
    UserInfoModel(id: '1', title: 'Dark Circle', isActive: false),
    UserInfoModel(id: '2', title: 'Blackheads', isActive: false),
    UserInfoModel(id: '3', title: 'Pigmented Spot', isActive: false),
    UserInfoModel(id: '4', title: 'Couperose', isActive: false),
    UserInfoModel(id: '5', title: 'Acne', isActive: false),
    UserInfoModel(id: '6', title: 'Wrinkles', isActive: false),
    UserInfoModel(id: '7', title: 'Let AI analyze', isActive: false),
  ];

  static List<UserInfoModel> hairProblems() => [
    UserInfoModel(id: '1', title: 'Baldness', isActive: false),
    UserInfoModel(id: '2', title: 'Dandruff', isActive: false),
    UserInfoModel(id: '3', title: 'Hair Loss', isActive: false),
    UserInfoModel(id: '4', title: 'Oily Hair', isActive: false),
    UserInfoModel(id: '5', title: 'Dry Hair', isActive: false),
    UserInfoModel(id: '6', title: 'Split Hair', isActive: false),
    UserInfoModel(id: '7', title: 'Let AI analyze', isActive: false),
  ];

  static List<PhysicalActivitiesModel> physicalActivities() => [
    PhysicalActivitiesModel(
      id: '1',
      title: 'Gym Workouts',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '2',
      title: 'Running',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '3',
      title: 'Yoga',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '4',
      title: 'Pilates',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '5',
      title: 'Cycling',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '6',
      title: 'Swimming',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '7',
      title: 'Martial Arts',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '8',
      title: 'Dancing',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '9',
      title: 'Walking',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '10',
      title: 'Hiking',
      isActive: false,
      frequency: '',
    ),
    PhysicalActivitiesModel(
      id: '11',
      title: 'Other',
      isActive: false,
      frequency: '',
    ),
  ];

  static List<UserInfoModel> diet() => [
    UserInfoModel(id: '1', title: 'Keto', isActive: false),
    UserInfoModel(id: '2', title: 'Paleo', isActive: false),
    UserInfoModel(id: '3', title: 'Vegetarian', isActive: false),
    UserInfoModel(id: '4', title: 'Vegan', isActive: false),
    UserInfoModel(id: '5', title: 'Mediterranean', isActive: false),
    UserInfoModel(id: '6', title: 'Raw', isActive: false),
    UserInfoModel(id: '7', title: 'Low Carb', isActive: false),
    UserInfoModel(id: '8', title: 'No Sugar', isActive: false),
  ];

  static List<UserInfoModel> influence() => [
    UserInfoModel(id: '1', title: 'Lack of motivation', isActive: false),
    UserInfoModel(id: '2', title: 'Work Overload', isActive: false),
    UserInfoModel(id: '3', title: 'Cluttered Environment', isActive: false),
    UserInfoModel(id: '4', title: 'Digital distractions', isActive: false),
    UserInfoModel(id: '5', title: 'Lack of time management', isActive: false),
  ];
}
