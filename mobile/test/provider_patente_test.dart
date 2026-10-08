import 'dart:typed_data';
import 'package:expa_mobile/core/cache/content_repository.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/notifications/notifications.dart';
import 'package:expa_mobile/features/patente/patente_topic.dart';
import 'package:expa_mobile/features/provider/provider_portal.dart';
import 'package:expa_mobile/features/scanner/scanner_screen.dart' show imageCaptureProvider;
import 'package:expa_mobile/features/scanner/scanner_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'scanner_test.dart' show FakeCapture;
import 'support.dart';

class _SignedIn extends AuthController {
  @override
  AuthState build() => const AuthState(status: AuthStatus.authenticated, user: demoUser);
}

final _profile = {
  'id': 7, 'status': 'draft', 'category': 'caf', 'display_name': 'CAF Roma', 'serves_online': true, 'contact_email': 'a@b.it', 'contact_phone': null, 'website': null,
  'verification_status': 'none', 'effective_verification': 'none', 'has_pending_changes': false,
  'translations': {'en': {'headline': 'Tax help', 'description': 'We help'}},
  'publish_problems': [{'message': 'Add at least one service'}],
};

TestEnv providerEnv() {
  final env = TestEnv();
  env.backend.ok('GET /provider/profile', _profile);
  env.backend.ok('GET /provider/verification/documents', []);
  env.backend.ok('GET /provider/leads', [
    {'id': 5, 'status': 'new', 'message': 'Need help', 'contact': {'name': 'Ali', 'email': 'ali@x.it', 'phone': null}, 'created_at': '2026-10-01T10:00:00+00:00'}
  ], meta: {'page': 1, 'last_page': 1, 'total': 1});
  env.backend.ok('GET /provider/reviews', [
    {'id': 9, 'rating': 4, 'body': 'Good', 'created_at': '2026-10-01', 'reply': null, 'reply_status': null}
  ]);
  env.backend.ok('GET /providers/meta', {'categories': [{'value': 'caf', 'label': 'CAF'}]});
  return env;
}

void main() {
  test('AppUser parses roles; isProvider gates the portal entry only', () {
    final u = AppUser.fromJson({'id': 1, 'name': 'A', 'email': 'a@b.c', 'email_verified': true, 'roles': ['user', 'provider']});
    expect(u.isProvider, true);
    expect(AppUser.fromJson({'id': 1, 'name': 'A', 'email': 'a@b.c'}).isProvider, false);
    expect(AppUser.fromJson(u.toJson()).roles, ['user', 'provider']);
  });

  group('provider portal', () {
    testWidgets('no listing (403 provider_account_required) shows the apply form; apply posts and requires fields', (tester) async {
      final env = TestEnv();
      env.backend.error('GET /provider/profile', 403, 'provider_account_required');
      env.backend.ok('GET /providers/meta', {'categories': [{'value': 'caf', 'label': 'CAF'}]});
      env.backend.ok('POST /provider/apply', {'id': 1}, meta: {});
      await pumpScreen(tester, const ProviderPortalScreen(), env, size: const Size(360, 1800), extra: [authControllerProvider.overrideWith(_SignedIn.new)]);
      expect(find.byKey(const ValueKey('prov-apply')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('prov-apply')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('prov-apply-error')), findsOneWidget);
      expect(env.backend.where('POST', '/provider/apply'), isEmpty);
    });

    testWidgets('unverified e-mail cannot apply', (tester) async {
      final env = TestEnv();
      env.backend.error('GET /provider/profile', 403, 'provider_account_required');
      await pumpScreen(tester, const ProviderPortalScreen(), env, extra: [authControllerProvider.overrideWith(_Unverified.new)]);
      expect(find.byKey(const ValueKey('prov-verify-email')), findsOneWidget);
    });

    testWidgets('profile tab: status, problems, save sends PATCH with current-locale translation, submit', (tester) async {
      final env = providerEnv();
      env.backend.ok('PATCH /provider/profile', {..._profile, 'status': 'draft'});
      env.backend.ok('POST /provider/profile/submit', {..._profile, 'status': 'review'});
      await pumpScreen(tester, const ProviderPortalScreen(), env, size: const Size(360, 2400), extra: [authControllerProvider.overrideWith(_SignedIn.new)]);
      expect(find.byKey(const ValueKey('prov-status')), findsOneWidget);
      expect(find.byKey(const ValueKey('prov-problems')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('prov-save')));
      await tester.pumpAndSettle();
      final body = env.backend.where('PATCH', '/provider/profile').single.body as Map;
      expect((body['translations'] as Map)['en']['headline'], 'Tax help');
      expect(body['display_name'], 'CAF Roma');
      await tester.tap(find.byKey(const ValueKey('prov-submit')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/provider/profile/submit'), hasLength(1));
    });

    testWidgets('verification tab: uploads a picked image as multipart and refreshes; requests verification', (tester) async {
      final env = providerEnv();
      env.backend.ok('POST /provider/verification/documents', {'id': 1});
      env.backend.ok('POST /provider/verification/request', _profile);
      final cap = FakeCapture();
      await pumpScreen(tester, const ProviderPortalScreen(), env, size: const Size(360, 1800), extra: [authControllerProvider.overrideWith(_SignedIn.new), imageCaptureProvider.overrideWithValue(cap)]);
      await tester.tap(find.byKey(const ValueKey('prov-tab-verification')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('prov-evidence-note')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('prov-upload')));
      await tester.pumpAndSettle();
      expect(cap.captures, 1);
      expect(env.backend.where('POST', '/provider/verification/documents').single.body, 'multipart');
      await tester.tap(find.byKey(const ValueKey('prov-request-verification')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/provider/verification/request'), hasLength(1));
    });

    testWidgets('leads: mark seen patches status; reviews: reply posts body', (tester) async {
      final env = providerEnv();
      env.backend.ok('PATCH /provider/leads/5', {'id': 5, 'status': 'seen'});
      env.backend.ok('POST /provider/reviews/9/reply', {'id': 9, 'reply_status': 'pending'});
      await pumpScreen(tester, const ProviderPortalScreen(), env, size: const Size(360, 1800), extra: [authControllerProvider.overrideWith(_SignedIn.new)]);
      await tester.ensureVisible(find.byKey(const ValueKey('prov-tab-leads')));
      await tester.tap(find.byKey(const ValueKey('prov-tab-leads')));
      await tester.pumpAndSettle();
      expect(find.text('Ali'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('lead-seen-5')));
      await tester.pumpAndSettle();
      expect((env.backend.where('PATCH', '/provider/leads/5').single.body as Map)['status'], 'seen');
      await tester.ensureVisible(find.byKey(const ValueKey('prov-tab-reviews')));
      await tester.tap(find.byKey(const ValueKey('prov-tab-reviews')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('review-reply-9')));
      await tester.pumpAndSettle();
      await tester.enterText(find.byKey(const ValueKey('reply-text')), 'Thank you');
      await tester.tap(find.byKey(const ValueKey('reply-send')));
      await tester.pumpAndSettle();
      expect((env.backend.where('POST', '/provider/reviews/9/reply').single.body as Map)['body'], 'Thank you');
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name portal tabs render without overflow', (tester) async {
          final env = providerEnv();
          await pumpScreen(tester, const ProviderPortalScreen(), env, lang: lang, size: Size(size.width, 1800), textScale: scale, extra: [authControllerProvider.overrideWith(_SignedIn.new)]);
          for (final t in ['verification', 'leads', 'reviews', 'profile']) {
            await tester.ensureVisible(find.byKey(ValueKey('prov-tab-$t')));
            await tester.tap(find.byKey(ValueKey('prov-tab-$t')));
            await tester.pumpAndSettle();
            expect(tester.takeException(), isNull, reason: t);
          }
        });
      }
    }
  });

  group('patente topic + AI teacher + offline', () {
    final topic = {'slug': 'segnali', 'title': 'Road signs', 'summary': 'About signs', 'body': 'Body', 'progress': {'status': 'done'}, 'source': {'name': 'MIT', 'type': 'official', 'last_verified_at': '2026-09-01', 'freshness': 'fresh'}};

    TestEnv topicEnv() {
      final env = TestEnv();
      env.backend.ok('GET /patente/topics/segnali', topic);
      env.backend.ok('POST /ai/ask', {
        'conversation_id': 3,
        'message': {'content': 'Signs explained', 'label': 'ai_explanation', 'sources': [{'n': 1, 'title': 'Segnali', 'source': {'name': 'MIT', 'type': 'official', 'freshness': 'fresh'}}], 'actions': [], 'disclaimer': 'Study aid.'},
        'usage': {'remaining': 4},
      });
      return env;
    }

    testWidgets('AI teacher sends patente_topic and shows label, sources, disclaimer', (tester) async {
      final env = topicEnv();
      await pumpScreen(tester, const PatenteTopicScreen(slug: 'segnali'), env, size: const Size(360, 2400), extra: [authControllerProvider.overrideWith(_SignedIn.new)]);
      await tester.ensureVisible(find.byKey(const ValueKey('teacher-explain')));
      await tester.tap(find.byKey(const ValueKey('teacher-explain')));
      await tester.pumpAndSettle();
      final body = env.backend.where('POST', '/ai/ask').single.body as Map;
      expect(body['patente_topic'], 'segnali');
      expect(body.containsKey('patente_question'), false);
      expect(find.byKey(const ValueKey('ask-label')), findsOneWidget);
      expect(find.byKey(const ValueKey('ask-disclaimer')), findsOneWidget);
      expect(find.text('[1] Segnali'), findsOneWidget);
    });

    testWidgets('AI failure shows a localized error, not a broken screen', (tester) async {
      final env = topicEnv();
      env.backend.error('POST /ai/ask', 500, 'server_error');
      await pumpScreen(tester, const PatenteTopicScreen(slug: 'segnali'), env, size: const Size(360, 2400));
      await tester.ensureVisible(find.byKey(const ValueKey('teacher-explain')));
      await tester.tap(find.byKey(const ValueKey('teacher-explain')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('teacher-error')), findsOneWidget);
    });

    testWidgets('save for offline stores the topic WITHOUT personal progress; saved copy opens offline with stale/verified labels', (tester) async {
      final env = topicEnv();
      await pumpScreen(tester, const PatenteTopicScreen(slug: 'segnali'), env, size: const Size(360, 2400));
      await tester.tap(find.byKey(const ValueKey('save-offline')));
      await tester.pumpAndSettle();
      final cached = await env.cache.read('content:patente_topic:en:segnali');
      expect(cached, isNotNull);
      expect(cached!.payload.containsKey('progress'), false);
      expect(cached.payload['title'], 'Road signs');

      env.backend.offline = true;
      await pumpScreen(tester, const PatenteTopicScreen(slug: 'segnali'), env, size: const Size(360, 2400));
      expect(find.byKey(const ValueKey('cached-copy')), findsOneWidget);
      expect(find.text('Road signs'), findsWidgets);
      expect(find.byKey(const ValueKey('teacher-offline')), findsOneWidget);
    });

    test('publicOnly strips personal keys', () {
      expect(ContentRepository.publicOnly({'title': 'x', 'progress': {}, 'user': 1, 'bookmarked': true}), {'title': 'x'});
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name topic screen renders without overflow', (tester) async {
          await pumpScreen(tester, const PatenteTopicScreen(slug: 'segnali'), topicEnv(), lang: lang, size: Size(size.width, 2400), textScale: scale);
          expect(tester.takeException(), isNull);
        });
      }
    }
  });

  group('scanner OCR architecture', () {
    test('ManualEntryOcrEngine is the unavailable fallback', () async {
      const e = ManualEntryOcrEngine();
      expect([e.id, e.isAvailable], ['manual', false]);
      expect(await e.recognize(CapturedImage(bytes: Uint8List(0), filename: 'a.png', mimeType: 'image/png')), isNull);
    });

    test('detectSensitive finds IBAN, codice fiscale, e-mail and long numbers without returning values', () {
      expect(detectSensitive('IBAN IT60 X054 2811 1010 0000 0123 456'), contains(SensitiveKind.iban));
      expect(detectSensitive('CF RSSMRA85T10A562S'), contains(SensitiveKind.fiscalCode));
      expect(detectSensitive('scrivi a mario@example.com'), contains(SensitiveKind.email));
      expect(detectSensitive('numero 123456789012'), contains(SensitiveKind.longNumber));
      expect(detectSensitive('Gentile signore, la scadenza è il 18 novembre.'), isEmpty);
    });
  });

  group('notifications', () {
    testWidgets('delete calls DELETE /notifications/{id}; settings icon present', (tester) async {
      final env = TestEnv();
      const id = '11111111-1111-1111-1111-111111111111';
      env.backend.ok('GET /notifications', [
        {'id': id, 'title': 'Permit', 'body': 'Soon', 'read': false, 'created_at': '2026-10-01T10:00:00+00:00'}
      ], meta: {'page': 1, 'last_page': 1});
      env.backend.on('DELETE /notifications/$id', null, status: 204);
      await pumpScreen(tester, const NotificationsScreen(), env, size: const Size(360, 900));
      expect(find.byKey(const ValueKey('notif-settings')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('notif-delete-$id')));
      await tester.pumpAndSettle();
      expect(env.backend.where('DELETE', '/notifications/$id'), hasLength(1));
    });
  });
}

class _Unverified extends AuthController {
  @override
  AuthState build() => const AuthState(status: AuthStatus.authenticated, user: AppUser(id: 1, name: 'M', email: 'm@x.it', emailVerified: false));
}
