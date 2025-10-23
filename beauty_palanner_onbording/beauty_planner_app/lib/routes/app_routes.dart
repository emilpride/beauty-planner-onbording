import 'package:get/get.dart';

import '../features/authentication/screens/login/login.dart';
import '../features/authentication/screens/password_config/forgot_password.dart';
import '../features/authentication/screens/schedule_screen/create_schedule_screen.dart';
import '../navigation_menu.dart';
import 'routes.dart';

class AppRoutes {
  static final pages = [
    // GetPage(name: Routes.home, page: () => const HomeScreen()),
    GetPage(name: Routes.signIn, page: () => const LoginScreen()),
    GetPage(name: Routes.forgotPassword, page: () => const ForgotPassword()),
    GetPage(name: Routes.app, page: () => const NavigationMenu()),
    GetPage(
      name: Routes.createSchedule,
      page: () => const CreateScheduleScreen(),
    ),
  ];
}
