class UserInfoModel {
  String id;
  String title;
  bool isActive;

  UserInfoModel({
    required this.id,
    required this.title,
    required this.isActive,
  });

  static UserInfoModel empty() =>
      UserInfoModel(id: '', title: '', isActive: false);

  Map<String, dynamic> toJson() {
    return {'id': id, 'title': title, 'isActive': isActive};
  }

  factory UserInfoModel.fromJson(Map<String, dynamic> json) {
    return UserInfoModel(
      id: json['id'],
      title: json['title'],
      isActive: json['isActive'],
    );
  }

  @override
  String toString() {
    return 'UserInfoModel(id: $id, title: $title, isActive: $isActive)';
  }
}
