import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_web_plugins/url_strategy.dart';
import 'app.dart';
import 'data/repositories/authentication/authentication_repository.dart';
import 'data/repositories/authentication/biometric_repository.dart';
import 'firebase_options.dart';
import 'utils/constants/colors.dart';
import 'utils/theme/theme_controller.dart';

Future<void> main() async {
  final WidgetsBinding widgetsBinding =
      WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent, // Make status bar transparent
      statusBarIconBrightness:
          Brightness.dark, // Dark icons on light background
      systemNavigationBarColor: AppColors.light, // Navigation bar color
      systemNavigationBarIconBrightness:
          Brightness.dark, // Dark icons on light background
    ),
  );

  await GetStorage.init();

  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  // Use clean path-based URLs on web (no # in the URL)
  if (kIsWeb) {
    usePathUrlStrategy();
  }

  // Ensure ThemeController is available before building the app
  Get.put(ThemeController());

  // Enable offline persistence for Firestore
  // FirebaseFirestore.instance.settings = Settings(
  // persistenceEnabled: true,;
  //   cacheSizeBytes: Settings.CACHE_SIZE_UNLIMITED,
  // );

  // await Future.wait([
  //   WorkManagerService().initWorkManager(),a
  // ]);

  // Avoid initializing local_auth on web where it's unsupported
  if (!kIsWeb) {
    Get.put(BiometricRepository());
  }

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  ).then((FirebaseApp value) => Get.put(AuthenticationRepository()));
  runApp(const App());
}
