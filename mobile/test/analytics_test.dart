import 'dart:io';

import 'package:dio/dio.dart';
import 'package:expa_mobile/core/analytics/analytics.dart';
import 'package:expa_mobile/core/api/api_client.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/util/safe_url.dart';
import 'package:expa_mobile/core/widgets/content_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

class _HeaderSpy extends FakeBackend {
  final List<Map<String, dynamic>> headers = [];
  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<dynamic>? s, Future<void>? c) {
    headers.add(Map<String, dynamic>.from(o.headers));
    return super.fetch(o, null, c);
  }
}

ApiClient clientWith(FakeBackend b, {required bool Function() consent}) => ApiClient(
      baseUrl: 'https://api.test/api/v1',
      readToken: () async => 't',
      readLocale: () => 'en',
      readAnalyticsConsent: consent,
      clientName: 'android',
      dio: Dio()..httpClientAdapter = b,
    );

void main() {
  test('X-Client is ios or android (the API records anything else as "api"); consent header only when granted', () async {
    final b = _HeaderSpy()..ok('GET /x', {});
    var consent = false;
    final api = clientWith(b, consent: () => consent);
    await api.get('/x');
    consent = true;
    await api.get('/x');
    expect(b.headers[0].containsKey('X-Analytics-Consent'), isFalse);
    expect(b.headers[1]['X-Analytics-Consent'], 'granted');
    expect(['ios', 'android'], contains(platformClientName()));
  });

  group('AnalyticsService', () {
    test('sends nothing without consent', () async {
      final b = FakeBackend()..on('POST /analytics/events', null, status: 204);
      final s = AnalyticsService(clientWith(b, consent: () => false), () => false);
      await s.appointmentClicked('questura-roma');
      expect(b.calls, isEmpty);
    });

    test('with consent: one appointment_clicked with only the slug; a repeat within the window is not double counted', () async {
      final b = FakeBackend()..on('POST /analytics/events', null, status: 204);
      var now = DateTime(2026, 10, 7, 10);
      final s = AnalyticsService(clientWith(b, consent: () => true), () => true, now: () => now);
      await s.appointmentClicked('questura-roma');
      await s.appointmentClicked('questura-roma');
      expect(b.where('POST', '/analytics/events').single.body, {'name': 'appointment_clicked', 'subject': 'questura-roma'});
      now = now.add(const Duration(seconds: 11));
      await s.appointmentClicked('questura-roma');
      await s.appointmentClicked('other-office');
      expect(b.where('POST', '/analytics/events'), hasLength(3));
    });

    test('an invalid slug is dropped instead of sent; network failure never throws', () async {
      final b = FakeBackend()..offline = true;
      final s = AnalyticsService(clientWith(b, consent: () => true), () => true);
      await s.appointmentClicked('bad slug!');
      expect(b.calls.single.body, {'name': 'appointment_clicked'});
    });

    test('no code posts server-counted events (guide_view, job_view, lesson_started): they would be double counted', () {
      final offenders = <String>[];
      for (final f in Directory('lib').listSync(recursive: true).whereType<File>().where((f) => f.path.endsWith('.dart'))) {
        final src = f.readAsStringSync();
        if (src.contains('/analytics/events') && !f.path.endsWith('analytics.dart')) offenders.add(f.path);
        for (final n in ['guide_view', 'job_view', 'lesson_started']) {
          if (src.contains("'$n'") || src.contains('"$n"')) offenders.add('${f.path}:$n');
        }
      }
      expect(offenders, isEmpty);
    });
  });

  test('syncAnalyticsConsent mirrors the server ledger and fails closed', () async {
    final b = FakeBackend()..ok('GET /profile/consents', {'consents': {'analytics': {'granted': true}}});
    bool? v;
    await syncAnalyticsConsent(clientWith(b, consent: () => false), (x) => v = x);
    expect(v, isTrue);
    final off = FakeBackend()..offline = true;
    await syncAnalyticsConsent(clientWith(off, consent: () => false), (x) => v = x);
    expect(v, isFalse);
  });

  testWidgets('tapping the official booking button reports appointment_clicked once, only with consent, and still opens the URL', (tester) async {
    final opened = <Uri>[];
    final old = urlOpener;
    urlOpener = (u) async {
      opened.add(u);
      return true;
    };
    addTearDown(() => urlOpener = old);
    final office = {'slug': 'questura-roma', 'name': 'Questura', 'booking': {'method_label': 'Online', 'url': 'https://prenotazioni.example/'}};

    final env = TestEnv();
    env.backend.on('POST /analytics/events', null, status: 204);
    await pumpScreen(tester, Scaffold(body: OfficeCard(office: office)), env, size: const Size(360, 900), extra: [analyticsConsentProvider.overrideWith((ref) => false)]);
    await tester.tap(find.byKey(const ValueKey('office-booking')));
    await tester.pumpAndSettle();
    expect(opened, hasLength(1));
    expect(env.backend.where('POST', '/analytics/events'), isEmpty, reason: 'no consent -> nothing sent');

    final env2 = TestEnv();
    env2.backend.on('POST /analytics/events', null, status: 204);
    await pumpScreen(tester, Scaffold(body: OfficeCard(office: office)), env2, size: const Size(360, 900), extra: [analyticsConsentProvider.overrideWith((ref) => true)]);
    await tester.tap(find.byKey(const ValueKey('office-booking')));
    await tester.pumpAndSettle();
    expect(env2.backend.where('POST', '/analytics/events').single.body, {'name': 'appointment_clicked', 'subject': 'questura-roma'});
    expect(opened, hasLength(2));
  });
}
