import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:expa_mobile/l10n/app_localizations.dart';

Future<ProviderContainer> noop() async => ProviderContainer();

Widget harness(Widget child, {Locale locale = const Locale('ar'), List<Override> overrides = const []}) {
  return ProviderScope(
    overrides: [secureStoreProvider.overrideWithValue(InMemorySecureStore()), ...overrides],
    child: MaterialApp(
      locale: locale,
      supportedLocales: AppL10n.supportedLocales,
      localizationsDelegates: const [AppL10n.delegate, GlobalMaterialLocalizations.delegate, GlobalWidgetsLocalizations.delegate, GlobalCupertinoLocalizations.delegate],
      home: child,
    ),
  );
}
