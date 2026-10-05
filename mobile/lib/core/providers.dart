import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api/api_client.dart';
import 'cache/content_repository.dart';
import 'cache/local_cache.dart';
import 'config.dart';
import 'push/push_registrar.dart';
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

/// True while the last network call failed with a connection error/timeout (drives the offline banner).
final offlineProvider = StateProvider<bool>((ref) => false);

/// Local cache for content the user chose to keep offline (public guides/lessons only).
final localCacheProvider = Provider<LocalCache>((ref) => LocalCache(FileBlobStore()));

typedef ContentKind = ({String kind, String endpoint});
const guideKind = (kind: 'guide', endpoint: '/guides');
const lessonKind = (kind: 'lesson', endpoint: '/italian/lessons');

final contentRepositoryProvider = Provider.family<ContentRepository, ContentKind>((ref, k) => ContentRepository(
      api: ref.watch(apiClientProvider),
      cache: ref.watch(localCacheProvider),
      kind: k.kind,
      endpoint: k.endpoint,
      lang: ref.watch(localeProvider).languageCode,
    ));

final pushRegistrarProvider = Provider<PushRegistrar>((ref) => PushRegistrar(
      service: ref.watch(pushServiceProvider),
      api: ref.watch(apiClientProvider),
      session: ref.watch(sessionStoreProvider),
    ));

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
    baseUrl: AppConfig.checkedApiBaseUrl(),
    readToken: session.readToken,
    readLocale: () => ref.read(localeProvider).languageCode,
    onUnauthorized: () => ref.read(authControllerProvider.notifier).handleUnauthorized(),
    onNetworkResult: (reachable) {
      final n = ref.read(offlineProvider.notifier);
      if (n.state == reachable) n.state = !reachable;
    },
  );
});
