import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../constants/colors.dart';

class MyOutlinedButtonTheme {
  MyOutlinedButtonTheme._();

  static final lightOutlinedButtonTheme = OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
    elevation: 0,
    foregroundColor: Colors.black,
    side: const BorderSide(color: AppColors.grey),
    textStyle: TextStyle(
        fontFamily: GoogleFonts.comicNeue().fontFamily,
        fontFamilyFallback: [
          GoogleFonts.comicNeue().fontFamily!,
          GoogleFonts.roboto().fontFamily!,
          GoogleFonts.getFont('Noto Sans Symbols') // Currency & symbol block
              .fontFamily!,
        ],
        fontSize: 16,
        color: Colors.black,
        fontWeight: FontWeight.w600),
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(13)),
  ));

  static final darkOutlinedButtonTheme = OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
    elevation: 0,
    foregroundColor: Colors.white,
    side: const BorderSide(color: Colors.blueAccent),
    textStyle: const TextStyle(
        fontSize: 16, color: Colors.white, fontWeight: FontWeight.w600),
    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(13)),
  ));
}
