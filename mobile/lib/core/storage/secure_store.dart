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
      : _storage = storage ?? const FlutterSecureStorage();
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
class SessionStore {
  SessionStore(this._store);
  final SecureStore _store;
  static const _tokenKey = 'expa.token';
  static const _localeKey = 'expa.locale';

  Future<String?> readToken() => _store.read(_tokenKey);
  Future<void> saveToken(String token) => _store.write(_tokenKey, token);
  Future<void> clearToken() => _store.delete(_tokenKey);
  Future<String?> readLocale() => _store.read(_localeKey);
  Future<void> saveLocale(String code) => _store.write(_localeKey, code);
}
