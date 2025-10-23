import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';

import '../../utils/helpers/date_time_helper.dart';

class ActivityModel {
  final String id;
  String? name;
  String? illustration;
  String? category;
  String? categoryId;
  String? note;
  bool isRecommended;
  String type;

  DateTime? lastModifiedAt;

  Rx<TimeOfDay>? time;
  String frequency;
  List<int> selectedDays;
  int weeksInterval;
  List<int> selectedMonthDays;

  String notifyBefore = '';
  bool activeStatus;
  double cost;
  Color? color;
  DateTime? enabledAt;

  RxInt x = 0.obs;
  RxBool isExpanded = false.obs;
  RxBool notifyBeforeActive = false.obs;
  RxBool endBeforeActive = false.obs;

  TextEditingController taskNameController = TextEditingController();
  TextEditingController noteController = TextEditingController();

  String? selectedNotifyBeforeUnit;
  String? selectedNotifyBeforeFrequency;

  String? endBeforeUnit;
  String endBeforeType = 'date'; // 'date' or 'days'
  DateTime? selectedEndBeforeDate;

  ActivityModel({
    required this.id,
    this.name,
    this.illustration,
    this.category,
    this.categoryId,
    this.note,
    this.isRecommended = false,
    this.type = 'regular',
    this.time,
    this.frequency = '',
    this.weeksInterval = 1,
    List<int>? selectedDays,
    List<int>? selectedMonthDays,
    this.notifyBefore = '',
    this.activeStatus = false,
    this.cost = 0.0,
    this.color,
    this.selectedNotifyBeforeUnit,
    this.selectedNotifyBeforeFrequency,
    this.enabledAt,
    this.lastModifiedAt,
    this.endBeforeUnit,
    this.endBeforeType = 'date',
    this.selectedEndBeforeDate,
  }) : selectedDays = selectedDays != null ? List<int>.from(selectedDays) : [],
       selectedMonthDays =
           selectedMonthDays != null ? List<int>.from(selectedMonthDays) : [];

  List<DateTime> get scheduledEvents =>
      frequency.isNotEmpty
          ? DateTimeHelper.generateAllTaskDatesForActivity(this)
          : [DateTime.now().subtract(const Duration(days: 100000))];

  static ActivityModel empty() => ActivityModel(
    id: const Uuid().v4(),
    name: '',
    category: '',
    categoryId: '',
    note: '',
    isRecommended: false,
    activeStatus: false,
    selectedNotifyBeforeUnit: null,
    selectedNotifyBeforeFrequency: null,
    enabledAt: DateTime.now(),
    lastModifiedAt: DateTime.now(),
    time: const TimeOfDay(hour: 7, minute: 0).obs,
  );

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['Id'] ?? '',
      name: json['Name'] ?? '',
      illustration: json['Illustration'] ?? '',
      category: json['Category'] ?? '',
      categoryId: json['CategoryId'] ?? '',
      note: json['Note'] ?? '',
      isRecommended: json['IsRecommended'] ?? false,
      type: json['Type'] ?? 'regular',
      activeStatus: json['ActiveStatus'] ?? false,
      time: json['Time'] != null ? firebaseToTimeOfDay(json['Time']) : null,
      frequency: json['Frequency'] ?? '',
      selectedDays:
          json['SelectedDays'] != null
              ? List<int>.from(json['SelectedDays'])
              : [],
      weeksInterval:
          json['WeeksInterval'] != null
              ? int.parse(json['WeeksInterval'].toString())
              : 1,
      selectedMonthDays:
          json['SelectedMonthDays'] != null
              ? List<int>.from(json['SelectedMonthDays'])
              : [],
      notifyBefore: json['NotifyBefore'] ?? '',
      cost: double.parse((json['Cost'] ?? 0.0).toString()),
      selectedNotifyBeforeUnit: json['SelectedNotifyBeforeUnit'] ?? '',
      selectedNotifyBeforeFrequency:
          json['SelectedNotifyBeforeFrequency'] != null
              ? json['SelectedNotifyBeforeFrequency'].trim()
              : '',
      color: Color(int.parse(json['Color'].replaceFirst('#', ''), radix: 16)),
      enabledAt:
          json['EnabledAt'] != null
              ? DateTime.parse(json['EnabledAt'])
              : DateTime.now(),
      lastModifiedAt:
          json['LastModifiedAt'] != null
              ? DateTime.parse(json['LastModifiedAt'])
              : null,
      endBeforeUnit: json['EndBeforeUnit'] ?? '',
      endBeforeType: json['EndBeforeType'] ?? 'date',
      selectedEndBeforeDate:
          json['SelectedEndBeforeDate'] != null
              ? DateTime.parse(json['SelectedEndBeforeDate'])
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'Id': id,
      'Name': name,
      'Illustration': illustration,
      'Category': category,
      'CategoryId': categoryId,
      'Note': note,
      'IsRecommended': isRecommended,
      'Type': type,
      'ActiveStatus': activeStatus,
      'Time': time != null ? timeOfDayToFirebase(time!.value) : null,
      'Frequency': frequency,
      'SelectedDays': selectedDays.toList(),
      'WeeksInterval': weeksInterval,
      'SelectedMonthDays': selectedMonthDays.toList(),
      'NotifyBefore': notifyBefore,
      'Cost': cost,
      'SelectedNotifyBeforeUnit': selectedNotifyBeforeUnit,
      'SelectedNotifyBeforeFrequency': selectedNotifyBeforeFrequency,
      'Color': '#${color!.value.toRadixString(16).padLeft(8, '0')}',
      'EnabledAt':
          enabledAt != null
              ? enabledAt!.toIso8601String()
              : DateTime.now().toIso8601String(),
      'LastModifiedAt':
          lastModifiedAt != null
              ? lastModifiedAt!.toIso8601String()
              : DateTime.now().toIso8601String(),
      'EndBeforeUnit': endBeforeUnit,
      'EndBeforeType': endBeforeType,
      'SelectedEndBeforeDate': selectedEndBeforeDate?.toIso8601String(),
    };
  }

  static Map timeOfDayToFirebase(TimeOfDay timeOfDay) {
    return {'Hour': timeOfDay.hour, 'Minute': timeOfDay.minute};
  }

  static Rx<TimeOfDay> firebaseToTimeOfDay(Map time) {
    return TimeOfDay(hour: time['Hour'], minute: time['Minute']).obs;
  }

  String get monthlyDaysText {
    if (selectedMonthDays.isEmpty) {
      return 'Select days';
    }
    return 'Every month on ${selectedMonthDays.join(', ')}';
  }

  /// Creates a copy of the instance with updated values.
  ActivityModel copyWith({
    String? id,
    String? name,
    String? illustration,
    String? category,
    String? categoryId,
    String? note,
    bool? isRecommended,
    String? type,
    DateTime? lastModifiedAt,
    Rx<TimeOfDay>? time,
    String? frequency,
    List<int>? selectedDays,
    int? weeksInterval,
    List<int>? selectedMonthDays,
    String? notifyBefore,
    bool? activeStatus,
    double? cost,
    Color? color,
    String? selectedNotifyBeforeUnit,
    String? selectedNotifyBeforeFrequency,
    DateTime? enabledAt,
    String? endBeforeUnit,
    String? endBeforeType,
    DateTime? selectedEndBeforeDate,
  }) {
    return ActivityModel(
      id: id ?? this.id,
      name: name ?? this.name,
      illustration: illustration ?? this.illustration,
      category: category ?? this.category,
      categoryId: categoryId ?? this.categoryId,
      note: note ?? this.note,
      isRecommended: isRecommended ?? this.isRecommended,
      type: type ?? this.type,
      lastModifiedAt: lastModifiedAt ?? this.lastModifiedAt,
      time: time ?? this.time,
      frequency: frequency ?? this.frequency,
      selectedDays: selectedDays ?? List<int>.from(this.selectedDays),
      weeksInterval: weeksInterval ?? this.weeksInterval,
      selectedMonthDays:
          selectedMonthDays ?? List<int>.from(this.selectedMonthDays),
      notifyBefore: notifyBefore ?? this.notifyBefore,
      activeStatus: activeStatus ?? this.activeStatus,
      cost: cost ?? this.cost,
      color: color ?? this.color,
      selectedNotifyBeforeUnit:
          selectedNotifyBeforeUnit ?? this.selectedNotifyBeforeUnit,
      selectedNotifyBeforeFrequency:
          selectedNotifyBeforeFrequency ?? this.selectedNotifyBeforeFrequency,
      enabledAt: enabledAt ?? this.enabledAt,
      endBeforeUnit: endBeforeUnit ?? this.endBeforeUnit,
      endBeforeType: endBeforeType ?? this.endBeforeType,
      selectedEndBeforeDate:
          selectedEndBeforeDate ?? this.selectedEndBeforeDate,
    );
  }
}
