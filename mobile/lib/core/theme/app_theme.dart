import 'package:flutter/material.dart';

/// Single source of design tokens. Mirrors web/assets/css/tokens.css (docs/DESIGN_SYSTEM.md).
/// Change brand values here only.
class Tokens {
  const Tokens._();

  // Surfaces & lines
  static const canvas = Color(0xFFF7F5F2);
  static const surface = Color(0xFFFFFFFF);
  static const sunken = Color(0xFFEFECE7);
  static const line = Color(0xFFE2DED7);
  static const lineStrong = Color(0xFF807A70);
  // Text
  static const ink = Color(0xFF1C1B19);
  static const inkSoft = Color(0xFF3F3B36);
  static const muted = Color(0xFF625C54);
  // Brand
  static const primary = Color(0xFF0F6B5C);
  static const primaryStrong = Color(0xFF0B5448);
  static const primarySoft = Color(0xFFE6F2EF);
  static const onPrimary = Color(0xFFFFFFFF);
  static const accent = Color(0xFFD9622B);
  static const accentStrong = Color(0xFF943610);
  static const accentSoft = Color(0xFFFCEBE2);
  static const onAccent = Color(0xFF1C1B19);
  // Semantic
  static const success = Color(0xFF246E28);
  static const successSoft = Color(0xFFE8F3E8);
  static const warning = Color(0xFF8F5200);
  static const warningSoft = Color(0xFFFFF3DC);
  static const danger = Color(0xFFB3261E);
  static const dangerSoft = Color(0xFFFCE8E6);
  static const info = Color(0xFF1565C0);
  static const infoSoft = Color(0xFFE3EEFC);

  // Radius (8 / 12 / 20)
  static const radiusSm = 8.0;
  static const radiusMd = 12.0;
  static const radiusLg = 20.0;

  /// Minimum touch target.
  static const touchMin = 48.0;

  // 4px spacing scale
  static const s1 = 4.0, s2 = 8.0, s3 = 12.0, s4 = 16.0, s5 = 20.0, s6 = 24.0, s8 = 32.0;
}

class AppTheme {
  const AppTheme._();

  /// Arabic text needs more leading (docs/DESIGN_SYSTEM.md: 1.8 vs 1.6). The platform font stack is used;
  /// bundling IBM Plex Sans Arabic / Inter is a follow-up (needs font files in the repo).
  static ThemeData of(Locale locale) {
    final arabic = locale.languageCode == 'ar';
    final height = arabic ? 1.8 : 1.6;
    final base = arabic ? 17.0 : 16.0;

    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: Tokens.primary,
      onPrimary: Tokens.onPrimary,
      primaryContainer: Tokens.primarySoft,
      onPrimaryContainer: Tokens.primaryStrong,
      secondary: Tokens.accent,
      onSecondary: Tokens.onAccent,
      secondaryContainer: Tokens.accentSoft,
      onSecondaryContainer: Tokens.accentStrong,
      error: Tokens.danger,
      onError: Tokens.onPrimary,
      errorContainer: Tokens.dangerSoft,
      onErrorContainer: Tokens.danger,
      surface: Tokens.surface,
      onSurface: Tokens.ink,
      onSurfaceVariant: Tokens.muted,
      outline: Tokens.lineStrong,
      outlineVariant: Tokens.line,
      surfaceContainerHighest: Tokens.sunken,
    );

    TextStyle t(double size, FontWeight w) => TextStyle(fontSize: size, fontWeight: w, height: height, color: Tokens.ink);
    final text = TextTheme(
      headlineSmall: t(base + 7, FontWeight.w700),
      titleLarge: t(base + 4, FontWeight.w700),
      titleMedium: t(base + 1, FontWeight.w600),
      bodyLarge: t(base, FontWeight.w400),
      bodyMedium: t(base - 1, FontWeight.w400),
      bodySmall: TextStyle(fontSize: base - 3, height: height, color: Tokens.muted),
      labelLarge: t(base, FontWeight.w600),
    );

    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(Tokens.radiusMd));
    const minSize = Size(Tokens.touchMin, Tokens.touchMin);

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: Tokens.canvas,
      textTheme: text,
      appBarTheme: AppBarTheme(
        backgroundColor: Tokens.surface,
        foregroundColor: Tokens.ink,
        elevation: 0,
        scrolledUnderElevation: 1,
        titleTextStyle: text.titleMedium,
      ),
      cardTheme: CardThemeData(
        color: Tokens.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tokens.radiusMd),
          side: const BorderSide(color: Tokens.line),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(minimumSize: minSize, shape: shape, textStyle: text.labelLarge),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: minSize,
          shape: shape,
          foregroundColor: Tokens.primaryStrong,
          side: const BorderSide(color: Tokens.lineStrong),
          textStyle: text.labelLarge,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(minimumSize: minSize, foregroundColor: Tokens.primaryStrong, textStyle: text.labelLarge),
      ),
      iconButtonTheme: IconButtonThemeData(style: IconButton.styleFrom(minimumSize: minSize)),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Tokens.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: Tokens.s4, vertical: Tokens.s3),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(Tokens.radiusMd), borderSide: const BorderSide(color: Tokens.lineStrong)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Tokens.radiusMd), borderSide: const BorderSide(color: Tokens.lineStrong)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Tokens.radiusMd), borderSide: const BorderSide(color: Tokens.accent, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Tokens.radiusMd), borderSide: const BorderSide(color: Tokens.danger)),
        focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(Tokens.radiusMd), borderSide: const BorderSide(color: Tokens.danger, width: 2)),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Tokens.radiusSm)),
        side: const BorderSide(color: Tokens.line),
        labelStyle: text.bodyMedium,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Tokens.surface,
        indicatorColor: Tokens.primarySoft,
        height: 68,
        labelTextStyle: WidgetStatePropertyAll(TextStyle(fontSize: 12, height: 1.4, color: Tokens.ink, fontWeight: FontWeight.w600)),
      ),
      materialTapTargetSize: MaterialTapTargetSize.padded,
      dividerColor: Tokens.line,
    );
  }
}
