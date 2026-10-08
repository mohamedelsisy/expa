import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:expa_mobile/core/widgets/common.dart';
import 'package:expa_mobile/features/ask/ask_models.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/auth/auth_screens.dart';
import 'package:expa_mobile/features/auth/two_factor_screens.dart';
import 'package:expa_mobile/features/patente/patente.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'support.dart';

const _user = {'id': 1, 'name': 'Mo', 'email': 'm@example.com', 'email_verified': true, 'roles': [], 'two_factor_enabled': true};

TestEnv loginEnv({int expiresIn = 300}) {
  final env = TestEnv(token: null);
  env.backend.ok('POST /auth/login', {'two_factor_required': true, 'challenge_token': 'tfc_secret', 'expires_in': expiresIn});
  env.backend.ok('POST /auth/2fa/challenge', {'user': _user, 'token': 'new-token', 'recovery_codes_remaining': 9});
  return env;
}

GoRouter loginRouter() => GoRouter(initialLocation: '/login', routes: [
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/login/2fa', builder: (_, _) => const TwoFactorChallengeScreen()),
    ]);

ProviderContainer containerOf(WidgetTester tester) => ProviderScope.containerOf(tester.element(find.byType(Scaffold).first));

Future<void> signInToChallenge(WidgetTester tester) async {
  await tester.enterText(find.byKey(const ValueKey('login-email')), 'm@example.com');
  await tester.enterText(find.byKey(const ValueKey('login-password')), 'password123');
  await tester.tap(find.byKey(const ValueKey('login-submit')));
  await tester.pumpAndSettle();
}

class RecAsk implements AskRepository {
  final calls = <Map<String, String?>>[];
  @override
  Future<AskReply> ask(String message, {int? conversationId, String? patenteTopic, String? patenteQuestion}) async {
    calls.add({'message': message, 'topic': patenteTopic, 'question': patenteQuestion});
    return const AskReply(conversationId: 1, message: AskMessage(content: 'Because of the rule.', label: 'general_guidance', disclaimer: 'd'));
  }

  @override
  Future<AskUsage> usage() async => const AskUsage();
}

void main() {
  group('login challenge', () {
    testWidgets('login with 2FA opens the code screen; the code is sent with the in-memory challenge token', (tester) async {
      final env = loginEnv();
      await pumpScreen(tester, const SizedBox(), env, router: loginRouter());
      await signInToChallenge(tester);
      final l = await l10n('en');
      expect(find.text(l.tfChallengeTitle), findsWidgets);
      expect(await SessionStore(env.store).readToken(), isNull, reason: 'no session before the second step');
      await tester.enterText(find.byKey(const ValueKey('tf-code')), '123456');
      await tester.tap(find.byKey(const ValueKey('tf-submit')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/auth/2fa/challenge').single.body, {'challenge_token': 'tfc_secret', 'code': '123456'});
      expect(await SessionStore(env.store).readToken(), 'new-token');
      final c = containerOf(tester);
      expect(c.read(authControllerProvider).status, AuthStatus.authenticated);
      expect(c.read(authControllerProvider).challenge, isNull);
    });

    testWidgets('wrong code keeps the challenge and shows the message; recovery code alternative works', (tester) async {
      final env = loginEnv();
      env.backend.error('POST /auth/2fa/challenge', 422, 'invalid_two_factor_code');
      await pumpScreen(tester, const SizedBox(), env, router: loginRouter());
      await signInToChallenge(tester);
      await tester.enterText(find.byKey(const ValueKey('tf-code')), '000000');
      await tester.tap(find.byKey(const ValueKey('tf-submit')));
      await tester.pumpAndSettle();
      final l = await l10n('en');
      expect(find.text(l.tfInvalidCode), findsOneWidget);
      expect(containerOf(tester).read(authControllerProvider).challenge, isNotNull);

      env.backend.ok('POST /auth/2fa/challenge', {'user': _user, 'token': 't2', 'recovery_codes_remaining': 8});
      await tester.tap(find.byKey(const ValueKey('tf-toggle')));
      await tester.pump();
      expect(find.text(l.tfInvalidCode), findsNothing, reason: 'error cleared when switching mode');
      await tester.enterText(find.byKey(const ValueKey('tf-recovery')), 'abcde-12345');
      await tester.tap(find.byKey(const ValueKey('tf-submit')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/auth/2fa/challenge').last.body, {'challenge_token': 'tfc_secret', 'recovery_code': 'abcde-12345'});
      expect(containerOf(tester).read(authControllerProvider).status, AuthStatus.authenticated);
    });

    testWidgets('code must be 6 digits before any request is made', (tester) async {
      final env = loginEnv();
      await pumpScreen(tester, const SizedBox(), env, router: loginRouter());
      await signInToChallenge(tester);
      await tester.enterText(find.byKey(const ValueKey('tf-code')), '123');
      await tester.tap(find.byKey(const ValueKey('tf-submit')));
      await tester.pump();
      expect(find.text((await l10n('en')).tfCodeInvalid), findsOneWidget);
      expect(env.backend.where('POST', '/auth/2fa/challenge'), isEmpty);
    });

    testWidgets('invalid_challenge returns to the login form with an explanation', (tester) async {
      final env = loginEnv();
      env.backend.error('POST /auth/2fa/challenge', 401, 'invalid_challenge');
      await pumpScreen(tester, const SizedBox(), env, router: loginRouter());
      await signInToChallenge(tester);
      await tester.enterText(find.byKey(const ValueKey('tf-code')), '123456');
      await tester.tap(find.byKey(const ValueKey('tf-submit')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('login-submit')), findsOneWidget);
      expect(find.text((await l10n('en')).tfChallengeExpired), findsOneWidget);
      expect(containerOf(tester).read(authControllerProvider).challenge, isNull);
      expect(await SessionStore(env.store).readToken(), isNull, reason: 'an unauthenticated 401 never touches a session');
    });

    testWidgets('429 shows the too-many-attempts message and keeps the form usable', (tester) async {
      final env = loginEnv();
      env.backend.error('POST /auth/2fa/challenge', 429, 'too_many_requests');
      await pumpScreen(tester, const SizedBox(), env, router: loginRouter());
      await signInToChallenge(tester);
      await tester.enterText(find.byKey(const ValueKey('tf-code')), '123456');
      await tester.tap(find.byKey(const ValueKey('tf-submit')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).tfTooManyAttempts), findsOneWidget);
      expect(find.byKey(const ValueKey('tf-submit')), findsOneWidget);
    });

    testWidgets('expiry disables the form and offers the way back', (tester) async {
      final env = loginEnv(expiresIn: 2);
      await pumpScreen(tester, const SizedBox(), env, router: loginRouter());
      await signInToChallenge(tester);
      await tester.pump(const Duration(seconds: 3));
      expect(find.byKey(const ValueKey('tf-expired')), findsOneWidget);
      expect(tester.widget<FilledButton>(find.byKey(const ValueKey('tf-submit'))).onPressed, isNull);
      await tester.tap(find.byKey(const ValueKey('tf-back')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('login-submit')), findsOneWidget);
      expect(containerOf(tester).read(authControllerProvider).challenge, isNull);
    });

    for (final lang in ['ar', 'en', 'it']) {
      testWidgets('challenge screen [$lang] 320px at 1.5x text has no overflow and keeps direction', (tester) async {
        final env = loginEnv();
        await pumpScreen(tester, const SizedBox(), env, router: loginRouter(), lang: lang, size: const Size(320, 568), textScale: 1.5);
        await signInToChallenge(tester);
        expect(tester.takeException(), isNull);
        expect(Directionality.of(tester.element(find.byKey(const ValueKey('tf-code')))), lang == 'ar' ? TextDirection.rtl : TextDirection.ltr);
        await tester.tap(find.byKey(const ValueKey('tf-toggle')));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      });
    }
  });

  test('errorMessage maps the 2FA codes', () async {
    final l = await l10n('en');
    expect(errorMessage(l, const ForbiddenException('x', code: 'two_factor_setup_required')), l.tfSetupRequired);
    expect(errorMessage(l, const ForbiddenException('x', code: 'other')), l.errorForbidden);
    expect(errorMessage(l, const UnknownApiException('x', code: 'two_factor_already_enabled', statusCode: 409)), l.tfAlreadyEnabled);
  });

  group('security settings', () {
    Map<String, dynamic> status({bool enabled = false, int left = 0, bool setupRequired = false}) =>
        {'enabled': enabled, 'confirmed_at': null, 'setup_pending': false, 'recovery_codes_remaining': left, 'required': setupRequired, 'setup_required': setupRequired};

    testWidgets('off -> setup (secret, QR, copy) -> confirm -> 10 codes once with warning -> overview', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/2fa/status', status());
      env.backend.ok('POST /auth/2fa/setup', {'secret': 'JBSWY3DPEHPK3PXP', 'otpauth_uri': 'otpauth://totp/EXPA:m?secret=JBSWY3DPEHPK3PXP', 'issuer': 'EXPA', 'account': 'm'});
      env.backend.ok('POST /auth/2fa/confirm', {'enabled': true, 'recovery_codes': [for (var i = 0; i < 10; i++) 'code$i-abcde']});
      String? clipboard;
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (call) async {
        if (call.method == 'Clipboard.setData') clipboard = (call.arguments as Map)['text'] as String?;
        return null;
      });
      addTearDown(() => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, null));
      await pumpScreen(tester, const SecurityScreen(), env, size: const Size(360, 1400));
      final l = await l10n('en');
      expect(find.text(l.tfStatusOff), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('sec-enable')));
      await tester.pumpAndSettle();
      expect(find.text('JBSWY3DPEHPK3PXP'), findsOneWidget);
      expect(find.byKey(const ValueKey('sec-qr')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('sec-copy-secret')));
      await tester.pumpAndSettle();
      expect(find.text(l.tfCopied), findsOneWidget);
      expect(clipboard, 'JBSWY3DPEHPK3PXP');
      await tester.enterText(find.byKey(const ValueKey('sec-confirm-code')), '12');
      await tester.tap(find.byKey(const ValueKey('sec-confirm')));
      await tester.pump();
      expect(find.text(l.tfCodeInvalid), findsOneWidget);
      expect(env.backend.where('POST', '/auth/2fa/confirm'), isEmpty);
      await tester.enterText(find.byKey(const ValueKey('sec-confirm-code')), '123456');
      await tester.tap(find.byKey(const ValueKey('sec-confirm')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/auth/2fa/confirm').single.body, {'code': '123456'});
      expect(find.byKey(const ValueKey('sec-codes-warning')), findsOneWidget);
      expect(find.textContaining('-abcde'), findsNWidgets(10));
      env.backend.ok('GET /auth/2fa/status', status(enabled: true, left: 10));
      await tester.tap(find.byKey(const ValueKey('sec-codes-saved')));
      await tester.pumpAndSettle();
      expect(find.textContaining('-abcde'), findsNothing, reason: 'codes are shown once');
      expect(find.text(l.tfStatusOn), findsOneWidget);
      expect(find.text(l.tfRecoveryRemaining('10')), findsOneWidget);
    });

    testWidgets('wrong confirm code shows the message and stays on setup', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/2fa/status', status());
      env.backend.ok('POST /auth/2fa/setup', {'secret': 'S', 'otpauth_uri': 'otpauth://totp/x?secret=S'});
      env.backend.error('POST /auth/2fa/confirm', 422, 'invalid_two_factor_code');
      await pumpScreen(tester, const SecurityScreen(), env, size: const Size(360, 1400));
      await tester.tap(find.byKey(const ValueKey('sec-enable')));
      await tester.pumpAndSettle();
      await tester.enterText(find.byKey(const ValueKey('sec-confirm-code')), '123456');
      await tester.tap(find.byKey(const ValueKey('sec-confirm')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).tfInvalidCode), findsOneWidget);
      expect(find.byKey(const ValueKey('sec-confirm')), findsOneWidget);
    });

    testWidgets('disable: wrong password is explained in the dialog, then success refreshes the status', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/2fa/status', status(enabled: true, left: 7));
      env.backend.error('POST /auth/2fa/disable', 422, 'validation_failed', details: {'password': ['bad']});
      await pumpScreen(tester, const SecurityScreen(), env, size: const Size(360, 900));
      final l = await l10n('en');
      await tester.tap(find.byKey(const ValueKey('sec-disable')));
      await tester.pumpAndSettle();
      await tester.enterText(find.byKey(const ValueKey('proof-password')), 'nope');
      await tester.enterText(find.byKey(const ValueKey('proof-code')), '123456');
      await tester.tap(find.byKey(const ValueKey('proof-submit')));
      await tester.pumpAndSettle();
      expect(find.text(l.tfPasswordWrong), findsOneWidget);
      expect(env.backend.where('POST', '/auth/2fa/disable').single.body, {'password': 'nope', 'code': '123456'});

      env.backend.on('POST /auth/2fa/disable', null, status: 204);
      env.backend.ok('GET /auth/2fa/status', status());
      await tester.tap(find.byKey(const ValueKey('proof-submit')));
      await tester.pumpAndSettle();
      expect(find.text(l.tfStatusOff), findsOneWidget);
      expect(find.text(l.tfDisabledDone), findsOneWidget);
    });

    testWidgets('regenerate with a recovery code shows the new codes', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/2fa/status', status(enabled: true, left: 1));
      env.backend.ok('POST /auth/2fa/recovery-codes', {'recovery_codes': [for (var i = 0; i < 10; i++) 'new$i-zzzzz']});
      await pumpScreen(tester, const SecurityScreen(), env, size: const Size(360, 1400));
      await tester.tap(find.byKey(const ValueKey('sec-regenerate')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('proof-toggle')));
      await tester.pump();
      await tester.enterText(find.byKey(const ValueKey('proof-password')), 'pw');
      await tester.enterText(find.byKey(const ValueKey('proof-code')), 'abcde-12345');
      await tester.tap(find.byKey(const ValueKey('proof-submit')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/auth/2fa/recovery-codes').single.body, {'password': 'pw', 'recovery_code': 'abcde-12345'});
      expect(find.textContaining('-zzzzz'), findsNWidgets(10));
    });

    testWidgets('setup_required shows the notice; load failure offers retry', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /auth/2fa/status', status(setupRequired: true));
      await pumpScreen(tester, const SecurityScreen(), env);
      expect(find.text((await l10n('en')).tfRequiredNotice), findsOneWidget);
      final off = TestEnv()..backend.offline = true;
      await pumpScreen(tester, const SecurityScreen(), off);
      expect(find.text((await l10n('en')).retry), findsOneWidget);
    });

    for (final lang in ['ar', 'en', 'it']) {
      testWidgets('security [$lang] 320px at 1.5x text: overview, setup and codes lay out without overflow', (tester) async {
        final env = TestEnv();
        env.backend.ok('GET /auth/2fa/status', status());
        env.backend.ok('POST /auth/2fa/setup', {'secret': 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', 'otpauth_uri': 'otpauth://totp/EXPA:m?secret=X'});
        env.backend.ok('POST /auth/2fa/confirm', {'recovery_codes': [for (var i = 0; i < 10; i++) 'abcde-1234$i']});
        await pumpScreen(tester, const SecurityScreen(), env, lang: lang, size: const Size(320, 2200), textScale: 1.5); // narrow width at 1.5x text; tall so the lazy list builds every row
        expect(tester.takeException(), isNull);
        expect(Directionality.of(tester.element(find.byKey(const ValueKey('sec-enable')))), lang == 'ar' ? TextDirection.rtl : TextDirection.ltr);
        await tester.tap(find.byKey(const ValueKey('sec-enable')));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        await tester.enterText(find.byKey(const ValueKey('sec-confirm-code')), '123456');
        await tester.tap(find.byKey(const ValueKey('sec-confirm')));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        expect(find.byKey(const ValueKey('sec-codes-warning')), findsOneWidget);
      });
    }
  });

  group('Patente: explain this question', () {
    testWidgets('practice feedback offers it when the question has a slug and sends patente_question', (tester) async {
      final ask = RecAsk();
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/5', {
        'id': 5, 'mode': 'practice', 'finished': false, 'max_errors': 3,
        'questions': [
          {'id': 1, 'slug': 'q-abc', 'statement': 'S1', 'statement_it': 'Affermazione 1'},
          {'id': 2, 'statement': 'S2', 'statement_it': 'Affermazione 2'},
        ],
      });
      env.backend.ok('POST /patente/exams/5/check', {'correct': true, 'correct_answer': true, 'explanations': {'en': 'Because.'}});
      await pumpScreen(tester, const ExamScreen(id: 5), env, size: const Size(360, 1400), extra: [askRepositoryProvider.overrideWithValue(ask)]);
      expect(find.byKey(const ValueKey('explain-q-abc')), findsNothing, reason: 'not before the answer is revealed');
      await tester.tap(find.byKey(const ValueKey('q1-true')));
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('check-1')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('explain-q-abc')));
      await tester.pumpAndSettle();
      expect(ask.calls.single['question'], 'q-abc');
      expect(ask.calls.single['topic'], isNull);
      expect(find.textContaining('Because of the rule.'), findsOneWidget);
    });

    testWidgets('review items: button only for items with a slug; AI error is shown', (tester) async {
      final env = TestEnv();
      await pumpScreen(
        tester,
        const SingleChildScrollViewHost(),
        env,
        size: const Size(360, 1400),
        extra: [askRepositoryProvider.overrideWithValue(_FailingAsk())],
      );
      await tester.tap(find.byKey(const ValueKey('explain-q-1')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('explain-error-q-1')), findsOneWidget);
      expect(find.byKey(const ValueKey('explain-q-2')), findsNothing);
    });
  });
}

class _FailingAsk extends RecAsk {
  @override
  Future<AskReply> ask(String message, {int? conversationId, String? patenteTopic, String? patenteQuestion}) async => throw const ServerException('x', statusCode: 500);
}

class SingleChildScrollViewHost extends StatelessWidget {
  const SingleChildScrollViewHost({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        body: ExamResultView(result: const {
          'mode': 'practice', 'finished': true, 'correct': 1, 'total': 2,
          'review': [
            {'question_id': 1, 'slug': 'q-1', 'statement': 'S1', 'statement_it': 'A1', 'your_answer': true, 'correct_answer': true, 'correct': true, 'explanation': 'E'},
            {'question_id': 2, 'statement': 'S2', 'statement_it': 'A2', 'your_answer': null, 'correct_answer': null, 'correct': false},
          ],
        }),
      );
}
