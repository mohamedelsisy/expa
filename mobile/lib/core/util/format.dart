import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

/// Locale-aware formatting through intl (Arabic uses the locale's digits/month names).
/// Falls back to ISO output if locale data is unavailable (e.g. before initialization in tests).
String formatDate(BuildContext context, String? iso) {
  final d = iso == null ? null : DateTime.tryParse(iso);
  if (d == null) return iso ?? '';
  final locale = Localizations.localeOf(context).languageCode;
  try {
    return DateFormat.yMMMd(locale).format(d.toLocal());
  } catch (_) {
    return d.toIso8601String().split('T').first;
  }
}

String formatNumber(BuildContext context, num n) {
  final locale = Localizations.localeOf(context).languageCode;
  try {
    return NumberFormat.decimalPattern(locale).format(n);
  } catch (_) {
    return n.toString();
  }
}
