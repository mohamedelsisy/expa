import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../core/providers.dart';

class AppUser {
  const AppUser({required this.id, required this.name, required this.email, required this.emailVerified, this.locale});
  final int id;
  final String name;
  final String email;
  final bool emailVerified;
  final String? locale;

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: (j['id'] as num).toInt(),
        name: (j['name'] ?? '').toString(),
        email: (j['email'] ?? '').toString(),
        emailVerified: j['email_verified'] == true,
        locale: j['locale'] as String?,
      );
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
}

final authRepositoryProvider = Provider<AuthRepository>((ref) => ApiAuthRepository(ref.watch(apiClientProvider)));

enum AuthStatus { unknown, unauthenticated, authenticated }

class AuthState {
  const AuthState({this.status = AuthStatus.unknown, this.user, this.busy = false, this.error, this.sessionExpired = false});
  final AuthStatus status;
  final AppUser? user;
  final bool busy;
  final ApiException? error;
  final bool sessionExpired;

  AuthState copyWith({AuthStatus? status, AppUser? user, bool? busy, ApiException? error, bool clearError = false, bool? sessionExpired, bool clearUser = false}) =>
      AuthState(
        status: status ?? this.status,
        user: clearUser ? null : (user ?? this.user),
        busy: busy ?? this.busy,
        error: clearError ? null : (error ?? this.error),
        sessionExpired: sessionExpired ?? this.sessionExpired,
      );
}

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  AuthRepository get _repo => ref.read(authRepositoryProvider);

  /// Restores a session from the stored token. Any failure other than a hard 401 keeps the user out
  /// rather than guessing (we do not trust an unverified token).
  Future<void> bootstrap() async {
    await ref.read(localeProvider.notifier).restore();
    final session = ref.read(sessionStoreProvider);
    final token = await session.readToken();
    if (token == null) {
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }
    try {
      final user = await _repo.me();
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } on UnauthorizedException {
      await session.clearToken();
      state = const AuthState(status: AuthStatus.unauthenticated);
    } on ApiException {
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
      await ref.read(sessionStoreProvider).saveToken(r.token);
      state = AuthState(status: AuthStatus.authenticated, user: r.user);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(busy: false, error: e);
      return false;
    }
  }

  Future<void> refreshUser() async {
    try {
      final user = await _repo.me();
      state = state.copyWith(user: user);
    } on ApiException {
      // keep the current user; 401 is handled by the client callback
    }
  }

  /// Local sign-out always happens, even if the server call fails (offline logout must still work).
  Future<void> logout() async {
    try {
      await _repo.logout();
    } on ApiException {
      // best effort
    }
    await _clear(expired: false);
  }

  /// Called by the API client on 401 of an authenticated request.
  Future<void> handleUnauthorized() => _clear(expired: true);

  Future<void> _clear({required bool expired}) async {
    await ref.read(sessionStoreProvider).clearToken();
    try {
      await ref.read(pushServiceProvider).unregister();
    } catch (_) {}
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
    }
  }

  Future<bool> resendVerification() async {
    try {
      await _repo.resendVerification();
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(error: e);
      return false;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
