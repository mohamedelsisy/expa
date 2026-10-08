import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../core/providers.dart';

class AppUser {
  const AppUser({required this.id, required this.name, required this.email, required this.emailVerified, this.locale, this.roles = const []});
  final int id;
  final String name;
  final String email;
  final bool emailVerified;
  final String? locale;

  /// Role keys from `/auth/me` (display gating only; the API enforces every permission).
  final List<String> roles;
  bool get isProvider => roles.contains('provider');

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: (j['id'] as num).toInt(),
        name: (j['name'] ?? '').toString(),
        email: (j['email'] ?? '').toString(),
        emailVerified: j['email_verified'] == true,
        locale: j['locale'] as String?,
        roles: [for (final r in (j['roles'] as List? ?? const [])) '$r'],
      );

  /// Only what a cold start without network needs (no tokens, no documents).
  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email, 'email_verified': emailVerified, 'locale': locale, 'roles': roles};
}

class AuthResult {
  const AuthResult(this.user, this.token);
  final AppUser user;
  final String token;
}

/// Boundary between the controller and the network so tests can use a fake.
abstract class AuthRepository {
  Future<AuthResult> login(String email, String password);
  Future<AuthResult> register({required String name, required String email, required String password, required String locale});
  Future<AppUser> me();
  Future<void> logout();
  Future<void> forgotPassword(String email);
  Future<void> resendVerification();
  Future<void> resetPassword({required String token, required String email, required String password});

  /// Completes e-mail verification with the signed link parameters (`expires`, `signature`).
  Future<void> verifyEmail({required int id, required String hash, required Map<String, String> signedQuery});
}

class ApiAuthRepository implements AuthRepository {
  ApiAuthRepository(this._api);
  final ApiClient _api;

  AuthResult _result(Map<String, dynamic> d) =>
      AuthResult(AppUser.fromJson(Map<String, dynamic>.from(d['user'] as Map)), d['token'] as String);

  @override
  Future<AuthResult> login(String email, String password) async =>
      _result((await _api.post('/auth/login', body: {'email': email, 'password': password, 'device_name': 'expa-mobile'})).map);

  @override
  Future<AuthResult> register({required String name, required String email, required String password, required String locale}) async =>
      _result((await _api.post('/auth/register', body: {
        'name': name,
        'email': email,
        'password': password,
        'password_confirmation': password,
        'accept_terms': true,
        'accept_privacy': true,
        'locale': locale,
        'device_name': 'expa-mobile',
      }))
          .map);

  @override
  Future<AppUser> me() async => AppUser.fromJson((await _api.get('/auth/me')).map);

  @override
  Future<void> logout() async {
    await _api.post('/auth/logout');
  }

  @override
  Future<void> forgotPassword(String email) async {
    await _api.post('/auth/forgot-password', body: {'email': email});
  }

  @override
  Future<void> resendVerification() async {
    await _api.post('/auth/resend-verification');
  }

  @override
  Future<void> resetPassword({required String token, required String email, required String password}) async {
    await _api.post('/auth/reset-password', body: {'token': token, 'email': email, 'password': password, 'password_confirmation': password});
  }

  @override
  Future<void> verifyEmail({required int id, required String hash, required Map<String, String> signedQuery}) async {
    // `lang` is omitted on purpose: the URL is signed and any extra query parameter invalidates the signature.
    await _api.get('/auth/verify-email/$id/${Uri.encodeComponent(hash)}', query: signedQuery, includeLang: false);
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) => ApiAuthRepository(ref.watch(apiClientProvider)));

enum AuthStatus { unknown, unauthenticated, authenticated }

class AuthState {
  const AuthState({this.status = AuthStatus.unknown, this.user, this.busy = false, this.error, this.sessionExpired = false, this.fromCache = false});
  final AuthStatus status;
  final AppUser? user;
  final bool busy;
  final ApiException? error;
  final bool sessionExpired;

  /// Signed in with the profile cached on this device because the server could not be reached at start.
  final bool fromCache;

  AuthState copyWith({AuthStatus? status, AppUser? user, bool? busy, ApiException? error, bool clearError = false, bool? sessionExpired, bool clearUser = false, bool? fromCache}) =>
      AuthState(
        status: status ?? this.status,
        user: clearUser ? null : (user ?? this.user),
        busy: busy ?? this.busy,
        error: clearError ? null : (error ?? this.error),
        sessionExpired: sessionExpired ?? this.sessionExpired,
        fromCache: fromCache ?? this.fromCache,
      );
}

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  AuthRepository get _repo => ref.read(authRepositoryProvider);

  /// Restores a session from the stored token. Never throws and never leaves the status `unknown`:
  /// * keystore unreadable/corrupt (MOB-2) -> signed out, token wiped;
  /// * 401 -> signed out, token wiped;
  /// * offline/timeout/5xx with a cached profile -> stays signed in from the cache (MOB-9);
  /// * anything else -> signed out without wiping the token.
  Future<void> bootstrap() async {
    final session = ref.read(sessionStoreProvider);
    try {
      await ref.read(localeProvider.notifier).restore();
      final token = await session.readToken();
      if (token == null) {
        state = const AuthState(status: AuthStatus.unauthenticated);
        return;
      }
      try {
        final user = await _repo.me();
        await session.saveUser(user.toJson());
        state = AuthState(status: AuthStatus.authenticated, user: user);
      } on UnauthorizedException {
        await session.clearToken();
        state = const AuthState(status: AuthStatus.unauthenticated);
      } on ApiException catch (e) {
        final cached = (e is NetworkException || e is TimeoutApiException || e is ServerException) ? await session.readUser() : null;
        if (cached != null) {
          try {
            state = AuthState(status: AuthStatus.authenticated, user: AppUser.fromJson(cached), fromCache: true);
            return;
          } catch (_) {}
        }
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    } catch (_) {
      // e.g. PlatformException from a broken keystore: recover to a clean signed-out state.
      await session.clearToken();
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<bool> login(String email, String password) => _authenticate(() => _repo.login(email.trim().toLowerCase(), password));

  Future<bool> register({required String name, required String email, required String password}) =>
      _authenticate(() => _repo.register(
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            locale: ref.read(localeProvider).languageCode,
          ));

  Future<bool> _authenticate(Future<AuthResult> Function() call) async {
    state = state.copyWith(busy: true, clearError: true, sessionExpired: false);
    try {
      final r = await call();
      final session = ref.read(sessionStoreProvider);
      await session.saveToken(r.token);
      await session.saveUser(r.user.toJson());
      state = AuthState(status: AuthStatus.authenticated, user: r.user);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(busy: false, error: e);
      return false;
    } catch (_) {
      state = state.copyWith(busy: false, error: const UnknownApiException(''));
      return false;
    }
  }

  Future<void> refreshUser() async {
    try {
      final user = await _repo.me();
      await ref.read(sessionStoreProvider).saveUser(user.toJson());
      state = state.copyWith(user: user, fromCache: false);
    } catch (_) {
      // keep the current user; 401 is handled by the client callback
    }
  }

  /// Local sign-out always happens, even if the server call fails (offline logout must still work).
  /// Order matters (MOB-6): the push device is removed while the bearer token is still valid, then the
  /// token is revoked, then local state is wiped.
  Future<void> logout() async {
    try {
      await ref.read(pushRegistrarProvider).disable();
    } catch (_) {}
    try {
      await _repo.logout();
    } catch (_) {
      // best effort
    }
    try {
      await ref.read(localCacheProvider).clear();
    } catch (_) {}
    await _clear(expired: false, pushAlreadyHandled: true);
  }

  /// Called by the API client on 401 of an authenticated request (token already revoked: no server calls).
  Future<void> handleUnauthorized() => _clear(expired: true);

  Future<void> _clear({required bool expired, bool pushAlreadyHandled = false}) async {
    await ref.read(sessionStoreProvider).clearToken();
    if (!pushAlreadyHandled) {
      try {
        await ref.read(pushRegistrarProvider).disable(serverCall: false);
      } catch (_) {}
    }
    state = AuthState(status: AuthStatus.unauthenticated, sessionExpired: expired);
  }

  Future<bool> forgotPassword(String email) async {
    state = state.copyWith(busy: true, clearError: true);
    try {
      await _repo.forgotPassword(email.trim().toLowerCase());
      state = state.copyWith(busy: false);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(busy: false, error: e);
      return false;
    } catch (_) {
      state = state.copyWith(busy: false, error: const UnknownApiException(''));
      return false;
    }
  }

  /// Completes a password reset from the e-mailed link. Returns null on success or the error to show.
  Future<ApiException?> resetPassword({required String token, required String email, required String password}) async {
    try {
      await _repo.resetPassword(token: token, email: email.trim().toLowerCase(), password: password);
      return null;
    } on ApiException catch (e) {
      return e;
    } catch (_) {
      return const UnknownApiException('');
    }
  }

  /// Completes e-mail verification from the e-mailed link and refreshes the signed-in user (if any).
  Future<ApiException?> verifyEmail({required int id, required String hash, required Map<String, String> signedQuery}) async {
    try {
      await _repo.verifyEmail(id: id, hash: hash, signedQuery: signedQuery);
      if (state.status == AuthStatus.authenticated) await refreshUser();
      return null;
    } on ApiException catch (e) {
      return e;
    } catch (_) {
      return const UnknownApiException('');
    }
  }

  Future<bool> resendVerification() async {
    try {
      await _repo.resendVerification();
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(error: e);
      return false;
    } catch (_) {
      state = state.copyWith(error: const UnknownApiException(''));
      return false;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
