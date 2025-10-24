import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'theme.dart';

class ThemeController extends GetxController {
  static ThemeController get instance => Get.find();

  // 0=system, 1=light, 2=dark
  final RxInt _themeId = 1.obs;
  final Rx<Color> _accent = const Color(0xFFA385E9).obs; // default existing

  final _box = GetStorage();
  static const _kThemeKey = 'theme_id';
  static const _kAccentKey = 'accent_color';

  ThemeMode get themeMode =>
      _themeId.value == 0 ? ThemeMode.system : _themeId.value == 1 ? ThemeMode.light : ThemeMode.dark;
  int get themeId => _themeId.value;
  Color get accent => _accent.value;

  @override
  void onInit() {
    super.onInit();
    _themeId.value = _box.read(_kThemeKey) ?? 1;
    final savedAccent = _box.read(_kAccentKey);
    if (savedAccent is int) {
      _accent.value = Color(savedAccent);
    }
  }

  void setThemeId(int id) {
    _themeId.value = id.clamp(0, 2);
    _box.write(_kThemeKey, _themeId.value);
    update();
  }

  void setAccent(Color color) {
    _accent.value = color;
    _box.write(_kAccentKey, color.value);
    update();
  }

  ThemeData buildLightTheme() {
    final base = AppTheme.lightTheme;
    
    // Update ColorScheme with accent color
    final colorScheme = base.colorScheme.copyWith(
      primary: _accent.value,
      secondary: _accent.value,
    );
    
    final ButtonStyle? originalStyle = base.elevatedButtonTheme.style;
    return base.copyWith(
      primaryColor: _accent.value,
      colorScheme: colorScheme,
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: originalStyle?.copyWith(
          backgroundColor: WidgetStatePropertyAll<Color>(_accent.value),
        ),
      ),
    );
  }

  ThemeData buildDarkTheme() {
    final base = AppTheme.darkTheme;
    
    // Update ColorScheme with accent color
    final colorScheme = base.colorScheme.copyWith(
      primary: _accent.value,
      secondary: _accent.value,
    );
    
    final ButtonStyle? originalStyle = base.elevatedButtonTheme.style;
    return base.copyWith(
      primaryColor: _accent.value,
      colorScheme: colorScheme,
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: originalStyle?.copyWith(
          backgroundColor: WidgetStatePropertyAll<Color>(_accent.value),
        ),
      ),
    );
  }
}
