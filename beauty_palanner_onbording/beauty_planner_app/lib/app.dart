import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'bindings/general_bindings.dart';
import 'routes/app_routes.dart';
import 'utils/theme/theme_controller.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ThemeController>(
      builder: (tc) => GetMaterialApp(
        debugShowCheckedModeBanner: false,
        themeMode: tc.themeMode,
        title: 'Beauty Mirror',
        theme: tc.buildLightTheme(),
        darkTheme: tc.buildDarkTheme(),
        getPages: AppRoutes.pages,
        initialRoute: '/sign-in',
      // darkTheme: AppTheme.darkTheme,
      // localizationsDelegates: [
      //   AppLocalizations.delegate,
      //   GlobalMaterialLocalizations.delegate,
      //   GlobalWidgetsLocalizations.delegate,
      //   GlobalCupertinoLocalizations.delegate,
      // ],
      // supportedLocales: L10n.supportedLocales,
      // locale: L10n.defaultLocale,
      initialBinding: GeneralBindings(),
      // getPages: AppRoutes.pages,
        builder: (context, child) {
          return MediaQuery(
            data: MediaQuery.of(
              context,
            ).copyWith(textScaler: TextScaler.noScaling),
            child: child!,
          );
        },
        // No explicit home: rely on initialRoute and Get.offAll flows
      ),
    );
  }
}
