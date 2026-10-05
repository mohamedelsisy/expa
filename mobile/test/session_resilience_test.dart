import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/push/push_registrar.dart';
import 'package:expa_mobile/core/push/push_service.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

class ThrowingStore implements SecureStore {
  int deletes = 0;
  @override
  Future<String?> read(String key) async => throw StateError('keystore broken');
  @override
  Future<void> write(String key, String value) async => throw StateError('keystore broken');
  @override
  Future<void> delete(String key) async {
    deletes++;
    throw StateError('keystore broken');
  }
}

class Repo implements AuthRepository {
  Object? meError;
  Object? loginError;
  final List<String> events;
  Repo(this.events);
  @override
  Future<AuthResult> login(String email, String password) async {
    if (loginError != null) throw loginError!;
    return const AuthResult(demoUser, 'tok1');
  }

  @override
  Future<AuthResult> register({required String name, required String email, required String password, required String locale}) async => const AuthResult(demoUser, 'tok2');
  @override
  Future<AppUser> me() async {
    if (meError != null) throw meError!;
    return demoUser;
  }

  @override
  Future<void> logout() async => events.add('repo.logout');
  @override
  Future<void> forgotPassword(String email) async {}
  @override
  Future<void> resendVerification() async {}
  @override
  Future<void> resetPassword({required String token, required String email, required String password}) async {}
  @override
  Future<void> verifyEmail({required int id, required String hash, required Map<String, String> signedQuery}) async {}
}

class RecordingRegistrar extends PushRegistrar {
  RecordingRegistrar(this.events, TestEnv env) : super(service: const NoopPushService(), api: env.api, session: SessionStore(env.store));
  final List<String> events;
  @override
  Future<void> disable({bool serverCall = true}) async => events.add('push.disable(server=$serverCall)');
}

ProviderContainer make(TestEnv env, Repo repo, List<String> events) {
  final c = ProviderContainer(overrides: [
    ...env.overrides(),
    authRepositoryProvider.overrideWithValue(repo),
    pushRegistrarProvider.overrideWithValue(RecordingRegistrar(events, env)),
  ]);
  addTearDown(c.dispose);
  return c;
}

void main() {
  test('MOB-2: a throwing keystore recovers to signed-out instead of hanging on the splash', () async {
    final c = ProviderContainer(overrides: [secureStoreProvider.overrideWithValue(ThrowingStore()), authRepositoryProvider.overrideWithValue(Repo([]))]);
    addTearDown(c.dispose);
    await c.read(authControllerProvider.notifier).bootstrap();
    expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
  });

  test('MOB-2: an unexpected (non-ApiException) error from /me also ends signed-out, never "unknown"', () async {
    final env = TestEnv()..store.values['expa.token'] = 't';
    final repo = Repo([])..meError = StateError('boom');
    final c = make(env, repo, []);
    await c.read(authControllerProvider.notifier).bootstrap();
    expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
    expect(env.store.values.containsKey('expa.token'), isFalse);
  });

  group('MOB-9 offline cold start', () {
    for (final e in <Object>[const NetworkException(), const TimeoutApiException(), const ServerException('x', statusCode: 503)]) {
      test('stays signed in from the cached profile on ${e.runtimeType}', () async {
        final env = TestEnv();
        env.store.values['expa.token'] = 't';
        await SessionStore(env.store).saveUser(demoUser.toJson());
        final c = make(env, Repo([])..meError = e, []);
        await c.read(authControllerProvider.notifier).bootstrap();
        final s = c.read(authControllerProvider);
        expect(s.status, AuthStatus.authenticated);
        expect(s.fromCache, isTrue);
        expect(s.user?.name, 'Mohamed');
        expect(env.store.values['expa.token'], 't', reason: 'token must be kept');
      });
    }

    test('offline without a cached profile does not guess: signed-out but token kept for next start', () async {
      final env = TestEnv()..store.values['expa.token'] = 't';
      final c = make(env, Repo([])..meError = const NetworkException(), []);
      await c.read(authControllerProvider.notifier).bootstrap();
      expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
      expect(env.store.values['expa.token'], 't');
    });

    test('a 401 still signs out and wipes token and cached profile', () async {
      final env = TestEnv();
      env.store.values['expa.token'] = 't';
      await SessionStore(env.store).saveUser(demoUser.toJson());
      final c = make(env, Repo([])..meError = const UnauthorizedException('x'), []);
      await c.read(authControllerProvider.notifier).bootstrap();
      expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
      expect(env.store.values.keys.where((k) => k == 'expa.token' || k == 'expa.user'), isEmpty);
    });

    test('refreshUser after reconnecting clears the cached-profile flag', () async {
      final env = TestEnv();
      env.store.values['expa.token'] = 't';
      await SessionStore(env.store).saveUser(demoUser.toJson());
      final repo = Repo([])..meError = const NetworkException();
      final c = make(env, repo, []);
      await c.read(authControllerProvider.notifier).bootstrap();
      repo.meError = null;
      await c.read(authControllerProvider.notifier).refreshUser();
      expect(c.read(authControllerProvider).fromCache, isFalse);
    });
  });

  test('MOB-6: logout removes the push device BEFORE the session token is revoked, then wipes local state', () async {
    final env = TestEnv();
    final events = <String>[];
    await env.cache.write('saved:index:guide', {'slugs': ['a']});
    final c = make(env, Repo(events), events);
    await c.read(authControllerProvider.notifier).login('a@b.c', 'pw');
    await c.read(authControllerProvider.notifier).logout();
    expect(events, ['push.disable(server=true)', 'repo.logout']);
    expect(env.store.values.containsKey('expa.token'), isFalse);
    expect(await env.cache.read('saved:index:guide'), isNull, reason: 'saved copies are removed on explicit logout');
    expect(c.read(authControllerProvider).status, AuthStatus.unauthenticated);
  });

  test('MOB-6: a 401 (token already revoked) only forgets the device locally, no server calls', () async {
    final env = TestEnv();
    final events = <String>[];
    final c = make(env, Repo(events), events);
    await c.read(authControllerProvider.notifier).login('a@b.c', 'pw');
    await c.read(authControllerProvider.notifier).handleUnauthorized();
    expect(events, ['push.disable(server=false)']);
    expect(c.read(authControllerProvider).sessionExpired, isTrue);
  });

  test('MOB-8: an unexpected error during login ends the busy state with a generic error', () async {
    final env = TestEnv();
    final c = make(env, Repo([])..loginError = StateError('parse'), []);
    final ok = await c.read(authControllerProvider.notifier).login('a@b.c', 'pw');
    final s = c.read(authControllerProvider);
    expect(ok, isFalse);
    expect(s.busy, isFalse);
    expect(s.error, isA<UnknownApiException>());
  });
}
