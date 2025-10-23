// import 'dart:io';

// import 'package:firebase_remote_config/firebase_remote_config.dart';
// import 'package:get/get.dart';

// class RemoteConfigService extends GetxController {
//   static RemoteConfigService get instance => Get.find();

//   final FirebaseRemoteConfig _remoteConfig = FirebaseRemoteConfig.instance;

//   Future<void> initialize() async {
//     await _remoteConfig.setConfigSettings(RemoteConfigSettings(
//       fetchTimeout: const Duration(seconds: 10),
//       minimumFetchInterval: const Duration(hours: 1),
//     ));

//     await _remoteConfig.fetchAndActivate();
//   }

//   String getAiApiKey() {
//     return _remoteConfig.getString('OPENAI_API_KEY');
//   }

//   String revenuecatApiKey() {
//     return Platform.isIOS
//         ? _remoteConfig.getString('IOS_REVENUECAT_API_KEY')
//         : _remoteConfig.getString('ANDROID_REVENUECAT_API_KEY');
//   }
// }
