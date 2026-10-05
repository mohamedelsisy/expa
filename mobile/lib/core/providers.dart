import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api/api_client.dart';
import 'config.dart';
import 'push/push_service.dart';
import 'storage/secure_store.dart';
import '../features/auth/auth_controller.dart';

/// Default (and fallback) locale: Arabic, right-to-left.
const Locale defaultLocale = Locale('ar');
const supportedLocaleCodes = ['ar', 'en', 'it'];

/// Secrets live in the platform keystore. Overridden with an in-memory fake in tests.
final secureStoreProvider = Provider<SecureStore>((ref) => FlutterSecureStore());
final sessionStoreProvider = Provider<SessionStore>((ref) => SessionStore(ref.watch(secureStoreProvider)));
final pushServiceProvider = Provider<PushService>((ref) => const NoopPushService());

class LocaleController extends Notifier<Locale> {
  @override
  Locale build() => defaultLocale;

  Future<void> restore() async {
    final code = await ref.read(sessionStoreProvider).readLocale();
    if (code != null && supportedLocaleCodes.contains(code)) state = Locale(code);
  }

  Future<void> set(String code) async {
    if (!supportedLocaleCodes.contains(code)) return;
    state = Locale(code);
    await ref.read(sessionStoreProvider).saveLocale(code);
  }
}

final localeProvider = NotifierProvider<LocaleController, Locale>(LocaleController.new);

TextDirection directionFor(Locale l) => l.languageCode == 'ar' ? TextDirection.rtl : TextDirection.ltr;

final apiClientProvider = Provider<ApiClient>((ref) {
  final session = ref.watch(sessionStoreProvider);
  return ApiClient(
    baseUrl: AppConfig.apiBaseUrl,
    readToken: session.readToken,
    readLocale: () => ref.read(localeProvider).languageCode,
    onUnauthorized: () => ref.read(authControllerProvider.notifier).handleUnauthorized(),
  );
});
