import 'package:expa_mobile/app.dart';
import 'package:expa_mobile/core/widgets/common.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/auth/auth_screens.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'session_resilience_test.dart' show Repo;
import 'support.dart';

final _hash = 'a' * 40;
final _sig = 'b' * 64;

void main() {
  group('reset-password screen', () {
    for (final lang in langs) {
      testWidgets('[$lang] submits token+email+new password to POST /auth/reset-password and confirms', (tester) async {
        final env = TestEnv();
        env.backend.ok('POST /auth/reset-password', {'message': 'ok'});
        await pumpScreen(tester, const ResetPasswordScreen(token: 'tok123', email: 'Mo@Example.com'), env, lang: lang);
        final l = await l10n(lang);
        await tester.enterText(find.byKey(const ValueKey('reset-password')), 'CorrectHorse12');
        await tester.enterText(find.byKey(const ValueKey('reset-confirm')), 'CorrectHorse12');
        await tester.tap(find.byKey(const ValueKey('reset-submit')));
        await tester.pumpAndSettle();
        final call = env.backend.where('POST', '/auth/reset-password').single;
        expect(call.body, {'token': 'tok123', 'email': 'mo@example.com', 'password': 'CorrectHorse12', 'password_confirmation': 'CorrectHorse12'});
        expect(find.byKey(const ValueKey('reset-done')), findsOneWidget);
        expect(find.text(l.resetDone), findsOneWidget);
      });
    }

    testWidgets('validates length and confirmation before calling the API', (tester) async {
      final env = TestEnv();
      await pumpScreen(tester, const ResetPasswordScreen(token: 't', email: 'a@b.co'), env);
      final l = await l10n('en');
      await tester.enterText(find.byKey(const ValueKey('reset-password')), 'short');
      await tester.enterText(find.byKey(const ValueKey('reset-confirm')), 'different');
      await tester.tap(find.byKey(const ValueKey('reset-submit')));
      await tester.pumpAndSettle();
      expect(find.text(l.passwordTooShort), findsOneWidget);
      expect(find.text(l.passwordsMismatch), findsOneWidget);
      expect(env.backend.calls, isEmpty);
    });

    testWidgets('an invalid/expired token shows the server message and no success state', (tester) async {
      final env = TestEnv();
      env.backend.error('POST /auth/reset-password', 422, 'invalid_reset_token', message: 'Token expired');
      await pumpScreen(tester, const ResetPasswordScreen(token: 't', email: 'a@b.co'), env);
      await tester.enterText(find.byKey(const ValueKey('reset-password')), 'CorrectHorse12');
      await tester.enterText(find.byKey(const ValueKey('reset-confirm')), 'CorrectHorse12');
      await tester.tap(find.byKey(const ValueKey('reset-submit')));
      await tester.pumpAndSettle();
      expect(find.text('Token expired'), findsOneWidget);
      expect(find.byKey(const ValueKey('reset-done')), findsNothing);
    });

    testWidgets('a link without token/email shows the invalid-link state and never calls the API', (tester) async {
      final env = TestEnv();
      await pumpScreen(tester, const ResetPasswordScreen(), env, lang: 'ar');
      expect(find.byKey(const ValueKey('reset-invalid')), findsOneWidget);
      expect(find.text((await l10n('ar')).resetInvalidLink), findsOneWidget);
      expect(env.backend.calls, isEmpty);
    });

    for (final (name, size, scale) in sizes) {
      testWidgets('renders without overflow: $name, RTL', (tester) async {
        await pumpScreen(tester, const ResetPasswordScreen(token: 't', email: 'a@b.co'), TestEnv(), lang: 'ar', size: size, textScale: scale);
        expect(tester.takeException(), isNull);
        expect(Directionality.of(tester.element(find.byType(ResetPasswordScreen))), TextDirection.rtl);
      });
    }
  });

  group('verify-email link screen', () {
    testWidgets('calls the signed URL WITHOUT an added lang parameter (it would break the signature)', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/verify-email/7/$_hash', {'verified': true});
      await pumpScreen(tester, VerifyEmailLinkScreen(url: 'https://api.example/api/v1/auth/verify-email/7/$_hash?expires=1893456000&signature=$_sig'), env);
      final call = env.backend.where('GET', '/auth/verify-email/7/$_hash').single;
      expect(call.query, {'expires': '1893456000', 'signature': _sig});
      expect(call.query.containsKey('lang'), isFalse);
      expect(find.byKey(const ValueKey('verify-ok')), findsOneWidget);
    });

    testWidgets('an expired/invalid link shows the server error', (tester) async {
      final env = TestEnv();
      env.backend.error('GET /auth/verify-email/7/$_hash', 403, 'invalid_signature', message: 'Link expired');
      await pumpScreen(tester, VerifyEmailLinkScreen(url: 'https://api.example/api/v1/auth/verify-email/7/$_hash?expires=1&signature=$_sig'), env, lang: 'it');
      expect(find.byKey(const ValueKey('verify-error')), findsOneWidget);
    });

    testWidgets('a malformed url never reaches the network', (tester) async {
      final env = TestEnv();
      await pumpScreen(tester, const VerifyEmailLinkScreen(url: 'https://evil.example/steal'), env, lang: 'ar');
      expect(find.byKey(const ValueKey('verify-invalid')), findsOneWidget);
      expect(env.backend.calls, isEmpty);
    });
  });

  group('app links open the right screen through go_router (signed in and signed out)', () {
    Future<ProviderContainer> boot(WidgetTester tester, TestEnv env, {required bool signedIn, required String location}) async {
      if (signedIn) env.store.values['expa.token'] = 't';
      final container = ProviderContainer(overrides: [
        ...env.overrides(),
        authRepositoryProvider.overrideWithValue(Repo([])),
      ]);
      addTearDown(container.dispose);
      await container.read(authControllerProvider.notifier).bootstrap();
      container.read(routerProvider).go(location);
      await tester.pumpWidget(UncontrolledProviderScope(container: container, child: const ExpaApp()));
      await tester.pumpAndSettle();
      return container;
    }

    testWidgets('signed out: /ar/reset-password?token&email shows the reset form (not the login redirect)', (tester) async {
      await boot(tester, TestEnv(), signedIn: false, location: '/ar/reset-password?token=abc&email=a%40b.co');
      expect(find.byType(ResetPasswordScreen), findsOneWidget);
      expect(find.byKey(const ValueKey('reset-password')), findsOneWidget);
    });

    testWidgets('signed in: /en/verify-email?url=... runs verification', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/verify-email/7/$_hash', {'verified': true});
      final u = Uri.encodeQueryComponent('https://api.example/api/v1/auth/verify-email/7/$_hash?expires=1&signature=$_sig');
      await boot(tester, env, signedIn: true, location: '/en/verify-email?url=$u');
      expect(find.byType(VerifyEmailLinkScreen), findsOneWidget);
      expect(find.byKey(const ValueKey('verify-ok')), findsOneWidget);
    });

    testWidgets('an unknown link path shows the localized not-found screen with a way home', (tester) async {
      await boot(tester, TestEnv(), signedIn: true, location: '/totally/unknown');
      final l = await l10n('ar');
      expect(find.text(l.errorNotFound), findsOneWidget);
      expect(find.text(l.continueToApp), findsOneWidget);
    });
  });

  testWidgets('error notices are live regions (screen readers announce them)', (tester) async {
    await pumpScreen(tester, const Scaffold(body: Notice(text: 'boom', kind: NoticeKind.danger)), TestEnv());
    expect(tester.getSemantics(find.text('boom')).flagsCollection.isLiveRegion, isTrue);
  });
}
