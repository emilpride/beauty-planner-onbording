class PhysicalActivitiesModel {
  final String id;
  final String title;
  String frequency;
  bool isActive;

  PhysicalActivitiesModel({
    required this.title,
    required this.frequency,
    required this.id,
    required this.isActive,
  });

  static PhysicalActivitiesModel empty() => PhysicalActivitiesModel(
    title: '',
    frequency: '',
    id: '',
    isActive: false,
  );

  Map<String, dynamic> toJson() {
    return {
      'Title': title,
      'Frequency': frequency,
      'Id': id,
      'IsActive': isActive,
    };
  }

  factory PhysicalActivitiesModel.fromJson(Map<String, dynamic> json) {
    return PhysicalActivitiesModel(
      title: json['Title'] ?? '',
      frequency: json['Frequency'] ?? '',
      id: json['Id'] ?? '',
      isActive: json['IsActive'] ?? false,
    );
  }

  @override
  String toString() {
    return 'PhysicalActivitiesModel(title: $title, frequency: $frequency, id: $id, isActive: $isActive)';
  }
}
