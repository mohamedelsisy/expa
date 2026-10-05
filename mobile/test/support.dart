import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:expa_mobile/core/api/api_client.dart';
import 'package:expa_mobile/core/cache/local_cache.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/l10n/app_localizations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

class Recorded {
  Recorded(this.method, this.path, this.query, this.body);
  final String method;
  final String path;
  final Map<String, dynamic> query;
  final Object? body;
}

typedef Handler = ({int status, Object? body}) Function(Recorded r);

/// Routes (`"GET /guides"`, regex-free exact path match, or a prefix with `*`) to canned responses.
/// Anything not registered answers 404 so a screen calling an unexpected endpoint fails loudly.
class FakeBackend implements HttpClientAdapter {
  final Map<String, Handler> routes = {};
  final List<Recorded> calls = [];
  bool offline = false;

  void on(String key, Object? body, {int status = 200}) => routes[key] = (_) => (status: status, body: body);
  void onHandler(String key, Handler h) => routes[key] = h;
  void ok(String key, Object? data, {Map<String, dynamic>? meta}) => on(key, {'data': data, 'meta': meta ?? {}});
  void error(String key, int status, String code, {String message = 'x', Map<String, dynamic>? details}) =>
      on(key, {'error': {'code': code, 'message': message, 'details': ?details}}, status: status);

  Iterable<Recorded> where(String method, String path) => calls.where((c) => c.method == method && c.path == path);

  @override
  void close({bool force = false}) {}

  @override
  Future<ResponseBody> fetch(RequestOptions o, Stream<Uint8List>? requestStream, Future<void>? cancelFuture) async {
    final path = o.path;
    final body = o.data is FormData ? 'multipart' : o.data;
    final rec = Recorded(o.method, path, Map<String, dynamic>.from(o.queryParameters), body);
    calls.add(rec);
    if (offline) throw DioException(requestOptions: o, type: DioExceptionType.connectionError);
    final h = routes['${o.method} $path'] ?? routes.entries.where((e) => e.key.endsWith('*') && '${o.method} $path'.startsWith(e.key.substring(0, e.key.length - 1))).map((e) => e.value).firstOrNull;
    final res = h == null ? (status: 404, body: {'error': {'code': 'not_found', 'message': 'nf'}}) : h(rec);
    if (res.status == 204) return ResponseBody.fromString('', 204);
    return ResponseBody.fromString(jsonEncode(res.body), res.status, headers: {Headers.contentTypeHeader: ['application/json']});
  }
}

class TestEnv {
  TestEnv({FakeBackend? backend, this.token = 'tok'}) : backend = backend ?? FakeBackend();
  final FakeBackend backend;
  final String? token;
  final store = InMemorySecureStore();
  final blobs = MemoryBlobStore();
  late final cache = LocalCache(blobs);

  ApiClient get api => ApiClient(
        baseUrl: 'https://api.test/api/v1',
        readToken: () async => token,
        readLocale: () => 'en',
        dio: Dio()..httpClientAdapter = backend,
      );

  List<Override> overrides({List<Override> extra = const [], bool signedIn = true}) => [
        secureStoreProvider.overrideWithValue(store),
        localCacheProvider.overrideWithValue(cache),
        apiClientProvider.overrideWith((ref) => ApiClient(
              baseUrl: 'https://api.test/api/v1',
              readToken: () async => token,
              readLocale: () => ref.read(localeProvider).languageCode,
              onNetworkResult: (ok) {
                final n = ref.read(offlineProvider.notifier);
                if (n.state == ok) n.state = !ok;
              },
              dio: Dio()..httpClientAdapter = backend,
            )),
        ...extra,
      ];
}

/// Pumps [child] in a Material app with the three EXPA locales and a given phone size / text scale.
Future<void> pumpScreen(
  WidgetTester tester,
  Widget child,
  TestEnv env, {
  String lang = 'en',
  Size size = const Size(360, 700),
  double textScale = 1.0,
  List<Override> extra = const [],
  GoRouter? router,
}) async {
  tester.view.physicalSize = size * 3;
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(const SizedBox()); // drop any previous ProviderScope so state never leaks between pumps
  final delegates = const [AppL10n.delegate, GlobalMaterialLocalizations.delegate, GlobalWidgetsLocalizations.delegate, GlobalCupertinoLocalizations.delegate];
  await tester.pumpWidget(ProviderScope(
    overrides: [...env.overrides(extra: extra), localeProvider.overrideWith(() => _FixedLocale(Locale(lang)))],
    child: router != null
        ? MaterialApp.router(routerConfig: router, locale: Locale(lang), supportedLocales: AppL10n.supportedLocales, localizationsDelegates: delegates)
        : MaterialApp(
            locale: Locale(lang),
            supportedLocales: AppL10n.supportedLocales,
            localizationsDelegates: delegates,
            builder: (c, w) => MediaQuery(data: MediaQuery.of(c).copyWith(textScaler: TextScaler.linear(textScale)), child: w!),
            home: child,
          ),
  ));
  await tester.pumpAndSettle();
}

class _FixedLocale extends LocaleController {
  _FixedLocale(this._l);
  final Locale _l;
  @override
  Locale build() => _l;
}

/// Wraps a screen into a tiny router so `context.push/go` work; extra routes record navigation.
GoRouter routerFor(Widget home, {List<String> record = const [], List<RouteBase> more = const []}) => GoRouter(
      routes: [
        GoRoute(path: '/', builder: (_, _) => home),
        ...more,
        GoRoute(path: '/:rest(.*)', builder: (c, s) => Scaffold(body: Text('ROUTE:${s.uri}'))),
      ],
    );

const demoUser = AppUser(id: 1, name: 'Mohamed', email: 'm@example.com', emailVerified: true);

const sizes = [('phone 360', Size(360, 700), 1.0), ('small 320 @1.5x', Size(320, 568), 1.5)];
const langs = ['ar', 'en', 'it'];

Future<AppL10n> l10n(String code) => AppL10n.delegate.load(Locale(code));
