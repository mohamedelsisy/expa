import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeAuthRepo implements AuthRepository {
  ApiException? loginError;
  ApiException? meError;
  bool logoutThrows = false;
  int logoutCalls = 0;
  String? lastRegisterLocale;
  static const user = AppUser(id: 1, name: 'Mohamed', email: 'm@example.com', emailVerified: false);

  @override
  Future<AuthResult> login(String email, String password) async {
    if (loginError != null) throw loginError!;
    return const AuthResult(user, 'token-1');
  }

  @override
  Future<AuthResult> register({required String name, required String email, required String password, required String locale}) async {
    lastRegisterLocale = locale;
    return const AuthResult(user, 'token-2');
  }

  @override
  Future<AppUser> me() async {
    if (meError != null) throw meError!;
    return user;
  }

  @override
  Future<void> logout() async {
    logoutCalls++;
    if (logoutThrows) throw const NetworkException();
  }

  @override
  Future<void> forgotPassword(String email) async {}
  @override
  Future<void> resendVerification() async {}
}

(ProviderContainer, FakeAuthRepo, InMemorySecureStore) make() {
  final repo = FakeAuthRepo();
  final store = InMemorySecureStore();
  final c = ProviderContainer(overrides: [secureStoreProvider.overrideWithValue(store), authRepositoryProvider.overrideWithValue(repo)]);
  addTearDown(c.dispose);
  return (c, repo, store);
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bootstrap without a stored token is unauthenticated', () async {
    final (c, _, _) = make();
    await c.read(authControllerProvider.notifier).bootstrap();
    expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
  });

  test('bootstrap with a valid token restores the user', () async {
    final (c, _, store) = make();
    store.values['expa.token'] = 'abc';
    await c.read(authControllerProvider.notifier).bootstrap();
    final s = c.read(authControllerProvider);
    expect(s.status, AuthStatus.authenticated);
    expect(s.user?.name, 'Mohamed');
  });

  test('bootstrap with a rejected token clears it', () async {
    final (c, repo, store) = make();
    store.values['expa.token'] = 'stale';
    repo.meError = const UnauthorizedException('x', code: 'unauthenticated');
    await c.read(authControllerProvider.notifier).bootstrap();
    expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
    expect(store.values.containsKey('expa.token'), isFalse);
  });

  test('login success stores the token in the secure store', () async {
    final (c, _, store) = make();
    final ok = await c.read(authControllerProvider.notifier).login(' M@Example.com ', 'password123');
    expect(ok, isTrue);
    expect(c.read(authControllerProvider).status, AuthStatus.authenticated);
    expect(store.values['expa.token'], 'token-1');
  });

  test('login failure keeps the typed error and stores nothing', () async {
    final (c, repo, store) = make();
    repo.loginError = const UnauthorizedException('bad', code: 'invalid_credentials');
    final ok = await c.read(authControllerProvider.notifier).login('a@b.c', 'x');
    expect(ok, isFalse);
    final s = c.read(authControllerProvider);
    expect(s.error, isA<UnauthorizedException>());
    expect(s.busy, isFalse);
    expect(store.values, isEmpty);
  });

  test('register sends the current UI locale and authenticates', () async {
    final (c, repo, _) = make();
    await c.read(localeProvider.notifier).set('it');
    final ok = await c.read(authControllerProvider.notifier).register(name: 'A B', email: 'a@b.c', password: 'password123');
    expect(ok, isTrue);
    expect(repo.lastRegisterLocale, 'it');
  });

  test('logout clears the token even if the server call fails', () async {
    final (c, repo, store) = make();
    final n = c.read(authControllerProvider.notifier);
    await n.login('a@b.c', 'pw');
    repo.logoutThrows = true;
    await n.logout();
    expect(repo.logoutCalls, 1);
    expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
    expect(store.values.containsKey('expa.token'), isFalse);
  });

  test('401 handling logs out and flags the expired session', () async {
    final (c, _, store) = make();
    final n = c.read(authControllerProvider.notifier);
    await n.login('a@b.c', 'pw');
    await n.handleUnauthorized();
    final s = c.read(authControllerProvider);
    expect(s.status, AuthStatus.unauthenticated);
    expect(s.sessionExpired, isTrue);
    expect(store.values.containsKey('expa.token'), isFalse);
  });

  test('default locale is Arabic and RTL; en/it are LTR', () {
    final (c, _, _) = make();
    expect(c.read(localeProvider), const Locale('ar'));
    expect(directionFor(c.read(localeProvider)), TextDirection.rtl);
    expect(directionFor(const Locale('en')), TextDirection.ltr);
    expect(directionFor(const Locale('it')), TextDirection.ltr);
  });

  test('locale choice is persisted and restored; unknown codes are ignored', () async {
    final (c, _, store) = make();
    await c.read(localeProvider.notifier).set('en');
    await c.read(localeProvider.notifier).set('xx');
    expect(c.read(localeProvider), const Locale('en'));
    expect(store.values['expa.locale'], 'en');
    final c2 = ProviderContainer(overrides: [secureStoreProvider.overrideWithValue(store)]);
    addTearDown(c2.dispose);
    await c2.read(localeProvider.notifier).restore();
    expect(c2.read(localeProvider), const Locale('en'));
  });
}
