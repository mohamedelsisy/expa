import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/push/push_service.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/profile/profile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'push_registrar_test.dart' show FakePush;
import 'session_resilience_test.dart' show Repo;
import 'support.dart';

class SignedIn extends AuthController {
  @override
  AuthState build() => const AuthState(status: AuthStatus.authenticated, user: demoUser);
}

Future<void> open(WidgetTester tester, Widget w, TestEnv env, {String lang = 'en', List<Override> extra = const [], Size size = const Size(360, 1400), double scale = 1}) =>
    pumpScreen(tester, w, env, lang: lang, size: size, textScale: scale, extra: [authControllerProvider.overrideWith(SignedIn.new), ...extra]);

void main() {
  group('push settings', () {
    testWidgets('no provider in this build: explains honestly and offers no switch', (tester) async {
      await open(tester, const ProfileScreen(), TestEnv());
      expect(find.byKey(const ValueKey('push-switch')), findsNothing);
      expect(find.text((await l10n('en')).pushNote), findsOneWidget);
    });

    testWidgets('opt-in shows the localized rationale first, then prompts and registers', (tester) async {
      final env = TestEnv();
      env.backend.ok('POST /devices', {'registered': true});
      final push = FakePush();
      await open(tester, const ProfileScreen(), env, lang: 'ar', extra: [pushServiceProvider.overrideWithValue(push)]);
      final l = await l10n('ar');
      await tester.tap(find.byKey(const ValueKey('push-switch')));
      await tester.pumpAndSettle();
      expect(find.text(l.pushRationaleBody), findsOneWidget);
      expect(push.prompts, 0, reason: 'OS prompt only after the rationale is accepted');
      await tester.tap(find.byKey(const ValueKey('push-allow')));
      await tester.pumpAndSettle();
      expect(push.prompts, 1);
      expect(env.backend.where('POST', '/devices'), hasLength(1));
      expect(find.text(l.pushEnabledNote), findsOneWidget);
    });

    testWidgets('cancelling the rationale does nothing', (tester) async {
      final env = TestEnv();
      final push = FakePush();
      await open(tester, const ProfileScreen(), env, extra: [pushServiceProvider.overrideWithValue(push)]);
      await tester.tap(find.byKey(const ValueKey('push-switch')));
      await tester.pumpAndSettle();
      await tester.tap(find.text((await l10n('en')).cancel));
      await tester.pumpAndSettle();
      expect(push.prompts, 0);
      expect(env.backend.calls, isEmpty);
    });

    testWidgets('consent_required offers a one-tap grant, then registers', (tester) async {
      final env = TestEnv();
      var first = true;
      env.backend.onHandler('POST /devices', (_) {
        if (first) {
          first = false;
          return (status: 403, body: {'error': {'code': 'consent_required', 'message': 'x'}});
        }
        return (status: 201, body: {'data': {'registered': true}});
      });
      env.backend.ok('PUT /profile/consents', {});
      await open(tester, const ProfileScreen(), env, extra: [pushServiceProvider.overrideWithValue(FakePush())]);
      final l = await l10n('en');
      await tester.tap(find.byKey(const ValueKey('push-switch')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('push-allow')));
      await tester.pumpAndSettle();
      expect(find.text(l.consentRequired), findsOneWidget);
      await tester.tap(find.text(l.grantConsent));
      await tester.pumpAndSettle();
      expect(env.backend.where('PUT', '/profile/consents').single.body, {'consents': {'push_notifications': true}});
      expect(env.backend.where('POST', '/devices'), hasLength(2));
      expect(find.text(l.pushEnabledNote), findsOneWidget);
    });

    testWidgets('OS permission denied is explained', (tester) async {
      final push = FakePush()..afterPrompt = PushPermission.denied;
      await open(tester, const ProfileScreen(), TestEnv(), extra: [pushServiceProvider.overrideWithValue(push)]);
      await tester.tap(find.byKey(const ValueKey('push-switch')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('push-allow')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).pushDenied), findsOneWidget);
    });
  });

  testWidgets('logout asks for confirmation first', (tester) async {
    final repo = Repo([]);
    await open(tester, const ProfileScreen(), TestEnv(), extra: [authRepositoryProvider.overrideWithValue(repo)]);
    final l = await l10n('en');
    await tester.scrollUntilVisible(find.byKey(const ValueKey('logout')), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.byKey(const ValueKey('logout')));
    await tester.pumpAndSettle();
    expect(find.text(l.logoutConfirmBody), findsOneWidget);
    expect(repo.events, isEmpty);
    await tester.tap(find.text(l.cancel));
    await tester.pumpAndSettle();
    expect(repo.events, isEmpty);
  });

  group('privacy screen (MOB-10 export, delete friction)', () {
    TestEnv env() {
      final e = TestEnv();
      e.backend.ok('GET /privacy/purposes', {
        'purposes': [
          {'key': 'terms', 'title': 'Terms', 'why': 'w', 'required': true},
          {'key': 'push_notifications', 'title': 'Push', 'why': 'w', 'required': false},
        ],
      });
      e.backend.ok('GET /profile/consents', {'consents': {'terms': {'granted': true}}});
      e.backend.ok('GET /profile/export', {'user': {'name': 'M'}, 'documents': [{}, {}], 'consents': []});
      return e;
    }

    testWidgets('export shows a summary only; sharing needs an explicit confirm and goes through the share sheet', (tester) async {
      final shared = <String>[];
      await open(tester, const PrivacyScreen(), env(), extra: [shareTextProvider.overrideWithValue((t, {subject}) async => shared.add(t))], size: const Size(360, 2400));
      final l = await l10n('en');
      await tester.tap(find.text(l.exportRequest));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('export-summary')), findsOneWidget);
      expect(find.textContaining('documents (2)'), findsOneWidget);
      expect(shared, isEmpty, reason: 'nothing is shared or written without a user action');
      await tester.tap(find.byKey(const ValueKey('export-share')));
      await tester.pumpAndSettle();
      expect(find.text(l.exportShareConfirmBody), findsOneWidget);
      expect(shared, isEmpty);
      await tester.tap(find.byKey(const ValueKey('export-share-confirm')));
      await tester.pumpAndSettle();
      expect(shared, hasLength(1));
      expect(shared.single, contains('"documents"'));
    });

    testWidgets('declining the share confirmation shares nothing', (tester) async {
      final shared = <String>[];
      await open(tester, const PrivacyScreen(), env(), extra: [shareTextProvider.overrideWithValue((t, {subject}) async => shared.add(t))], size: const Size(360, 2400));
      await tester.tap(find.text((await l10n('en')).exportRequest));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('export-share')));
      await tester.pumpAndSettle();
      await tester.tap(find.text((await l10n('en')).cancel));
      await tester.pumpAndSettle();
      expect(shared, isEmpty);
    });

    testWidgets('export rate limit shows the localized error', (tester) async {
      final e = env();
      e.backend.error('GET /profile/export', 429, 'rate_limited');
      await open(tester, const PrivacyScreen(), e, lang: 'it', size: const Size(360, 2400));
      await tester.tap(find.text((await l10n('it')).exportRequest));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('it')).errorRateLimited), findsOneWidget);
    });

    testWidgets('account deletion needs the password AND a confirmation dialog', (tester) async {
      final e = env();
      e.backend.on('DELETE /profile', null, status: 204);
      await open(tester, const PrivacyScreen(), e, extra: [authRepositoryProvider.overrideWithValue(Repo([]))], size: const Size(360, 2400));
      final l = await l10n('en');
      await tester.tap(find.text(l.deleteAccountConfirm));
      await tester.pumpAndSettle();
      expect(find.text(l.fieldRequired), findsWidgets);
      expect(e.backend.where('DELETE', '/profile'), isEmpty);
      await tester.enterText(find.byKey(const ValueKey('delete-password')), 'secret');
      await tester.tap(find.text(l.deleteAccountConfirm));
      await tester.pumpAndSettle();
      expect(find.text(l.deleteConfirmBody), findsOneWidget);
      expect(e.backend.where('DELETE', '/profile'), isEmpty);
      await tester.tap(find.byKey(const ValueKey('delete-confirm')));
      await tester.pumpAndSettle();
      expect(e.backend.where('DELETE', '/profile').single.body, {'password': 'secret'});
    });

    testWidgets('required consents cannot be toggled; optional can', (tester) async {
      final e = env();
      e.backend.ok('PUT /profile/consents', {});
      await open(tester, const PrivacyScreen(), e, size: const Size(360, 2400));
      final switches = tester.widgetList<SwitchListTile>(find.byType(SwitchListTile)).toList();
      expect(switches[0].onChanged, isNull);
      expect(switches[1].onChanged, isNotNull);
      await tester.tap(find.widgetWithText(SwitchListTile, 'Push'));
      await tester.pumpAndSettle();
      expect(e.backend.where('PUT', '/profile/consents').single.body, {'consents': {'push_notifications': true}});
    });
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name profile renders without overflow', (tester) async {
        await open(tester, const ProfileScreen(), TestEnv(), lang: lang, size: size, scale: scale);
        expect(tester.takeException(), isNull);
        expect(find.text('Mohamed'), findsOneWidget);
      });
    }
  }
}
