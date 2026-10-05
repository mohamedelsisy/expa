import 'package:expa_mobile/app.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/auth/auth_screens.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'auth_controller_test.dart' show FakeAuthRepo;

void main() {
  testWidgets('app starts in Arabic/RTL and sends signed-out users to the login screen', (tester) async {
    final container = ProviderContainer(overrides: [
      secureStoreProvider.overrideWithValue(InMemorySecureStore()),
      authRepositoryProvider.overrideWithValue(FakeAuthRepo()),
    ]);
    addTearDown(container.dispose);
    await container.read(authControllerProvider.notifier).bootstrap();
    await tester.pumpWidget(UncontrolledProviderScope(container: container, child: const ExpaApp()));
    await tester.pumpAndSettle();
    expect(find.byType(LoginScreen), findsOneWidget);
    expect(Directionality.of(tester.element(find.byType(LoginScreen))), TextDirection.rtl);
    expect(Localizations.localeOf(tester.element(find.byType(LoginScreen))).languageCode, 'ar');
  });
}
