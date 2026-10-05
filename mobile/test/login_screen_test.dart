import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/features/auth/auth_screens.dart';
import 'package:expa_mobile/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers.dart';

void main() {
  for (final code in ['ar', 'en', 'it']) {
    for (final (name, size, scale) in [('phone', const Size(360, 640), 1.0), ('small phone, 1.5x text', const Size(320, 568), 1.5)]) {
      testWidgets('login screen [$code] $name renders without overflow', (tester) async {
        tester.view.physicalSize = size * 3;
        tester.view.devicePixelRatio = 3;
        addTearDown(tester.view.reset);
        await tester.pumpWidget(harness(
          MediaQuery(data: MediaQueryData(size: size, textScaler: TextScaler.linear(scale)), child: const LoginScreen()),
          locale: Locale(code),
        ));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        final l = await AppL10n.delegate.load(Locale(code));
        expect(find.text(l.loginTitle), findsWidgets);
        expect(find.widgetWithText(FilledButton, l.loginButton), findsOneWidget);
        expect(find.byKey(const ValueKey('login-email')), findsOneWidget);
        final dir = Directionality.of(tester.element(find.byType(LoginScreen)));
        expect(dir, directionFor(Locale(code)));
        // tap targets: the submit button is at least 48dp tall
        expect(tester.getSize(find.byKey(const ValueKey('login-submit'))).height, greaterThanOrEqualTo(48));
      });
    }
  }

  testWidgets('empty submit shows localized validation errors', (tester) async {
    await tester.pumpWidget(harness(const LoginScreen(), locale: const Locale('en')));
    await tester.tap(find.byKey(const ValueKey('login-submit')));
    await tester.pump();
    final l = await AppL10n.delegate.load(const Locale('en'));
    expect(find.text(l.invalidEmail), findsOneWidget);
    expect(find.text(l.fieldRequired), findsOneWidget);
  });
}
