import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../constants/colors.dart';

class MyElevatedButtonTheme {
  MyElevatedButtonTheme._();

  static final lightElevatedButtonTheme = ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      elevation: 0,
      foregroundColor: Colors.white,
      backgroundColor: AppColors.primary,
      disabledForegroundColor: Colors.grey,
      disabledBackgroundColor: Colors.grey,
      // side: const BorderSide(color: AppColors.primary),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(vertical: 18),
      textStyle: TextStyle(
        fontFamily: GoogleFonts.comicNeue().fontFamily,
        fontFamilyFallback: [
          GoogleFonts.comicNeue().fontFamily!,
          GoogleFonts.roboto().fontFamily!,
          GoogleFonts.getFont('Noto Sans Symbols') // Currency & symbol block
          .fontFamily!,
        ],
        fontSize: 16,
        color: Colors.white,
        fontWeight: FontWeight.w600,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
  );

  static final darkElevatedButtonTheme = ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      elevation: 0,
      foregroundColor: Colors.white,
      backgroundColor: AppColors.primary,
      disabledForegroundColor: Colors.grey,
      disabledBackgroundColor: Colors.grey,
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(vertical: 18),
      textStyle: TextStyle(
        fontFamily: GoogleFonts.comicNeue().fontFamily,
        fontFamilyFallback: [
          GoogleFonts.comicNeue().fontFamily!,
          GoogleFonts.roboto().fontFamily!,
          GoogleFonts.getFont('Noto Sans Symbols') // Currency & symbol block
          .fontFamily!,
        ],
        fontSize: 16,
        color: Colors.white,
        fontWeight: FontWeight.w600,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
  );
}
