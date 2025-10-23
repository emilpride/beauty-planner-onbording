import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // App theme colors
  static const Color primary = Color(0xFFA385E9);
  static const Color secondary = Color(0xFFEDEAFF);
  static const Color accent = Color(0xFFD3F0FF);

  // Text colors
  static const Color textPrimary = Color(0xFF5C4688);
  static const Color textSecondary = Color(0xFF969AB7);
  static const Color textWhite = Colors.white;

  // Background colors
  static const Color light = Color(0xFFF6F6F6);
  static const Color dark = Color(0xFF272727);
  static const Color primaryBackground = Color(0x00ffffff);

  // Background Container colors
  static const Color lightContainer = Color(0xFFF8F8F8);
  static Color darkContainer = AppColors.white.withOpacity(0.1);
  static const Color textfieldFill = Color(0xFFF7F7F7);

  // Button colors
  static const Color buttonPrimary = Color(0xFFF79829);
  static const Color buttonSecondary = Color(0xFF6C757D);
  static const Color buttonDisabled = Color(0xFFC4C4C4);

  // Border colors
  static const Color borderPrimary = Color(0xFFD9D9D9);
  static const Color borderSecondary = Color(0xFFE6E6E6);

  // Error and validation colors
  static const Color error = Color(0xFFF75555);
  static const Color success = Color(0xFF2BAE70);
  static const Color warning = Color(0xFFF57C00);
  static const Color info = Color(0xFF1976D2);

  // Neutral Shades
  static const Color black = Color(0xFF232323);
  static const Color darkerGrey = Color(0xFF4F4F4F);
  static const Color darkGrey = Color(0xFF939393);
  static const Color grey = Color(0xFFE0E0E0);
  static const Color softGrey = Color(0xFFF4F4F4);
  static const Color lightGrey = Color(0xFFF9F9F9);
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightOrange = Color(0xFFFEE0CA);

  static const Map<String, Color> colorMap = {
    'red': Colors.red,
    'pink': Colors.pink,
    'purple': Colors.purple,
    'deepPurple': Colors.deepPurple,
    'indigo': Colors.indigo,
    'blue': Colors.blue,
    'lightBlue': Colors.lightBlue,
    'cyan': Colors.cyan,
    'teal': Colors.teal,
    'green': Colors.green,
    'lightGreen': Colors.lightGreen,
    'lime': Colors.lime,
    'yellow': Colors.yellow,
    'amber': Colors.amber,
    'orange': Colors.orange,
    'deepOrange': Colors.deepOrange,
    'brown': Colors.brown,
    'grey': Colors.grey,
    'blueGrey': Colors.blueGrey,
  };
}
