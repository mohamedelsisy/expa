import 'package:flutter/foundation.dart';

/// Build-time configuration. Override with `--dart-define=EXPA_API_BASE_URL=https://api.example.com/api/v1`.
class AppConfig {
  const AppConfig._();

  /// 10.0.2.2 is the Android emulator's alias for the host machine's localhost. It is a DEBUG default only:
  /// release builds refuse to start with a non-https URL (see [baseUrlProblem]).
  static const String apiBaseUrl = String.fromEnvironment(
    'EXPA_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api/v1',
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  /// Returns a human-readable problem with [url] or null when it is acceptable.
  /// Release builds require an absolute `https` URL with a host; debug builds also accept `http`
  /// (local development against the emulator host).
  static String? baseUrlProblem(String url, {bool release = kReleaseMode}) {
    final uri = Uri.tryParse(url.trim());
    if (uri == null || !uri.hasScheme || uri.host.isEmpty) return 'EXPA_API_BASE_URL is not an absolute URL.';
    if (uri.userInfo.isNotEmpty) return 'EXPA_API_BASE_URL must not contain credentials.';
    if (uri.scheme == 'https') return null;
    if (!release && uri.scheme == 'http') return null;
    return 'EXPA_API_BASE_URL must use https in release builds (got "${uri.scheme}"). '
        'Pass --dart-define=EXPA_API_BASE_URL=https://<api-host>/api/v1.';
  }

  /// The validated base URL. Throws [StateError] with an actionable message when it is not acceptable.
  static String checkedApiBaseUrl({String url = apiBaseUrl, bool release = kReleaseMode}) {
    final problem = baseUrlProblem(url, release: release);
    if (problem != null) throw StateError(problem);
    return url;
  }
}
