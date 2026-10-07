import 'package:expa_mobile/app.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/auth/auth_screens.dart';
import 'package:expa_mobile/features/legal/legal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'session_resilience_test.dart' show Repo;
import 'support.dart';

Map<String, dynamic> doc(String slug) => {
      'slug': slug,
      'title': 'Privacy policy (server)',
      'body': '# Who we are\n\nEXPA processes **data**.\n\n- item one\n- item two <b>x</b>',
      'format': 'markdown',
      'version': '2026-10',
      'published_at': '2026-10-01T00:00:00Z',
      'locale': 'en',
      'fallback': false,
    };

void main() {
  testWidgets('published document: title, version/date and markdown body (markup is not interpreted)', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /legal/privacy', doc('privacy'));
    await pumpScreen(tester, const LegalDocumentScreen(slug: 'privacy'), env);
    expect(find.text('Privacy policy (server)'), findsOneWidget);
    expect(find.text('Who we are'), findsOneWidget);
    expect(find.textContaining('EXPA processes data.'), findsOneWidget);
    expect(find.byKey(const ValueKey('legal-version')), findsOneWidget);
    expect(find.textContaining('<b>'), findsOneWidget, reason: 'HTML is shown as plain text, never rendered');
  });

  for (final lang in langs) {
    testWidgets('[$lang] 404 is an honest "not published yet" state, not an error', (tester) async {
      final env = TestEnv();
      env.backend.error('GET /legal/terms', 404, 'not_found');
      await pumpScreen(tester, const LegalDocumentScreen(slug: 'terms'), env, lang: lang);
      expect(find.byKey(const ValueKey('legal-not-published')), findsOneWidget);
      expect(find.text((await l10n(lang)).legalNotPublished), findsOneWidget);
      expect(find.text((await l10n(lang)).errorNotFound), findsNothing);
    });
  }

  testWidgets('a server failure (500) is still an error with retry', (tester) async {
    final env = TestEnv();
    env.backend.error('GET /legal/cookies', 500, 'server_error');
    await pumpScreen(tester, const LegalDocumentScreen(slug: 'cookies'), env);
    expect(find.byKey(const ValueKey('legal-not-published')), findsNothing);
    expect(find.text((await l10n('en')).retry), findsOneWidget);
  });

  testWidgets('index lists the three documents', (tester) async {
    await pumpScreen(tester, const LegalIndexScreen(), TestEnv());
    for (final s in ['privacy', 'terms', 'cookies']) {
      expect(find.byKey(ValueKey('legal-$s')), findsOneWidget);
    }
  });

  testWidgets('register screen links to terms and privacy', (tester) async {
    final router = routerFor(const RegisterScreen());
    await pumpScreen(tester, const SizedBox(), TestEnv(), router: router, size: const Size(360, 1400));
    await tester.ensureVisible(find.byKey(const ValueKey('register-read-terms')));
    await tester.tap(find.byKey(const ValueKey('register-read-terms')));
    await tester.pumpAndSettle();
    expect(find.text('ROUTE:/legal/terms'), findsOneWidget);
  });

  testWidgets('signed out: /legal/privacy opens (not redirected to login)', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /legal/privacy', doc('privacy'));
    final container = ProviderContainer(overrides: [...env.overrides(), authRepositoryProvider.overrideWithValue(Repo([]))]);
    addTearDown(container.dispose);
    await container.read(authControllerProvider.notifier).bootstrap();
    container.read(routerProvider).go('/legal/privacy');
    await tester.pumpWidget(UncontrolledProviderScope(container: container, child: const ExpaApp()));
    await tester.pumpAndSettle();
    expect(find.byType(LegalDocumentScreen), findsOneWidget);
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name legal document renders without overflow', (tester) async {
        final env = TestEnv();
        env.backend.ok('GET /legal/privacy', doc('privacy'));
        await pumpScreen(tester, const LegalDocumentScreen(slug: 'privacy'), env, lang: lang, size: size, textScale: scale);
        expect(tester.takeException(), isNull);
      });
    }
  }
}
