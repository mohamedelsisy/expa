import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Key/value storage for secrets (Sanctum token) and small settings.
/// Production: Keychain/Keystore via flutter_secure_storage. Tests use [InMemorySecureStore].
abstract class SecureStore {
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
}

class FlutterSecureStore implements SecureStore {
  FlutterSecureStore([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              // Items are bound to this device: never migrated through backups / device transfer (MOB-23).
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
              aOptions: AndroidOptions(),
            );
  final FlutterSecureStorage _storage;

  @override
  Future<String?> read(String key) => _storage.read(key: key);
  @override
  Future<void> write(String key, String value) => _storage.write(key: key, value: value);
  @override
  Future<void> delete(String key) => _storage.delete(key: key);
}

class InMemorySecureStore implements SecureStore {
  final Map<String, String> values = {};
  @override
  Future<String?> read(String key) async => values[key];
  @override
  Future<void> write(String key, String value) async => values[key] = value;
  @override
  Future<void> delete(String key) async => values.remove(key);
}

/// Thin typed wrapper so the key names live in one place.
/// Reads never throw: a broken keystore (e.g. after a restore or OS upgrade) is treated as "nothing stored"
/// so the app can recover to the signed-out state instead of hanging (MOB-2).
class SessionStore {
  SessionStore(this._store);
  final SecureStore _store;
  static const _tokenKey = 'expa.token';
  static const _localeKey = 'expa.locale';
  static const _userKey = 'expa.user';
  static const _pushTokenKey = 'expa.push_token';
  static const _pushEnabledKey = 'expa.push_enabled';

  Future<String?> _safeRead(String key) async {
    try {
      return await _store.read(key);
    } catch (_) {
      return null;
    }
  }

  Future<String?> readToken() async {
    // Used by the HTTP client: a failing keystore means "no token", never an exception on every request.
    return _safeRead(_tokenKey);
  }

  Future<void> saveToken(String token) => _store.write(_tokenKey, token);

  /// Best effort wipe of everything session-bound; never throws.
  Future<void> clearToken() async {
    for (final k in [_tokenKey, _userKey]) {
      try {
        await _store.delete(k);
      } catch (_) {}
    }
  }

  Future<String?> readLocale() => _safeRead(_localeKey);
  Future<void> saveLocale(String code) async {
    try {
      await _store.write(_localeKey, code);
    } catch (_) {}
  }

  /// Minimal profile (id, name, email, verified, locale) kept so a cold start without network can stay signed in.
  Future<Map<String, dynamic>?> readUser() async {
    final raw = await _safeRead(_userKey);
    if (raw == null) return null;
    try {
      final j = jsonDecode(raw);
      return j is Map ? Map<String, dynamic>.from(j) : null;
    } catch (_) {
      return null;
    }
  }

  Future<void> saveUser(Map<String, dynamic> json) async {
    try {
      await _store.write(_userKey, jsonEncode(json));
    } catch (_) {}
  }

  Future<String?> readPushToken() => _safeRead(_pushTokenKey);
  Future<void> savePushToken(String token) async {
    try {
      await _store.write(_pushTokenKey, token);
    } catch (_) {}
  }

  Future<void> clearPushToken() async {
    try {
      await _store.delete(_pushTokenKey);
    } catch (_) {}
  }

  /// The user's push opt-in on this device (distinct from the server-side consent).
  Future<bool> readPushEnabled() async => (await _safeRead(_pushEnabledKey)) == '1';
  Future<void> savePushEnabled(bool v) async {
    try {
      if (v) {
        await _store.write(_pushEnabledKey, '1');
      } else {
        await _store.delete(_pushEnabledKey);
      }
    } catch (_) {}
  }
}
