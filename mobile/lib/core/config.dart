/// Build-time configuration. Override with `--dart-define=EXPA_API_BASE_URL=https://api.example.com/api/v1`.
class AppConfig {
  const AppConfig._();

  /// 10.0.2.2 is the Android emulator's alias for the host machine's localhost.
  static const String apiBaseUrl = String.fromEnvironment(
    'EXPA_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api/v1',
  );

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
