import 'package:expa_mobile/core/config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('API base URL guard (MOB-4)', () {
    test('release builds accept only absolute https URLs', () {
      expect(AppConfig.baseUrlProblem('https://api.expa.example/api/v1', release: true), isNull);
      for (final bad in ['http://10.0.2.2:8000/api/v1', 'http://api.expa.example/api/v1', 'ftp://x.example', 'api.expa.example', '', 'https://user:pw@api.example/x']) {
        expect(AppConfig.baseUrlProblem(bad, release: true), isNotNull, reason: bad);
      }
    });

    test('debug builds may use http for local development', () {
      expect(AppConfig.baseUrlProblem('http://10.0.2.2:8000/api/v1', release: false), isNull);
      expect(AppConfig.baseUrlProblem('ftp://x.example', release: false), isNotNull);
    });

    test('checkedApiBaseUrl throws a StateError that names the fix', () {
      expect(() => AppConfig.checkedApiBaseUrl(url: 'http://x.example/api', release: true), throwsA(isA<StateError>().having((e) => e.message, 'message', contains('EXPA_API_BASE_URL'))));
      expect(AppConfig.checkedApiBaseUrl(url: 'https://x.example/api', release: true), 'https://x.example/api');
    });

    test('the built-in default is cleartext, so a release build without --dart-define is refused', () {
      expect(AppConfig.baseUrlProblem(AppConfig.apiBaseUrl, release: true), isNotNull);
    });
  });

  group('EXPA_ENV guard', () {
    test('unknown environment names are refused', () {
      expect(AppConfig.environmentProblem('prod', 'https://api.expa.app/api/v1', release: true), isNotNull);
    });

    test('release needs staging or production; local only for debug', () {
      expect(AppConfig.environmentProblem('local', 'http://10.0.2.2:8000/api/v1', release: false), isNull);
      expect(AppConfig.environmentProblem('local', 'https://api.expa.app/api/v1', release: true), isNotNull);
    });

    test('staging/production require an https non-local host', () {
      for (final env in ['staging', 'production']) {
        expect(AppConfig.environmentProblem(env, 'https://api.expa.app/api/v1', release: true), isNull);
        for (final bad in ['http://api.expa.app/api/v1', 'https://localhost/api/v1', 'https://10.0.2.2/api/v1', 'https://api.example/x', 'https://x.invalid/x', '']) {
          expect(AppConfig.environmentProblem(env, bad, release: true), isNotNull, reason: '$env $bad');
        }
      }
    });

    test('default build (no dart-define) is local, so a release build without EXPA_ENV is refused', () {
      expect(AppConfig.environment, 'local');
      expect(AppConfig.startupProblem(release: true), isNotNull);
      expect(AppConfig.startupProblem(env: 'production', url: 'https://api.expa.app/api/v1', release: true), isNull);
    });
  });
}
