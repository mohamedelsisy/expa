import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/providers.dart';
import 'auth_controller.dart';

class TwoFactorStatus {
  const TwoFactorStatus({this.enabled = false, this.setupPending = false, this.recoveryCodesRemaining = 0, this.required = false, this.setupRequired = false});
  final bool enabled;
  final bool setupPending;
  final int recoveryCodesRemaining;
  final bool required;
  final bool setupRequired;

  factory TwoFactorStatus.fromJson(Map<String, dynamic> j) => TwoFactorStatus(
        enabled: j['enabled'] == true,
        setupPending: j['setup_pending'] == true,
        recoveryCodesRemaining: (j['recovery_codes_remaining'] as num?)?.toInt() ?? 0,
        required: j['required'] == true,
        setupRequired: j['setup_required'] == true,
      );
}

/// Shown once; never persisted.
class TwoFactorSetup {
  const TwoFactorSetup({required this.secret, required this.otpauthUri});
  final String secret;
  final String otpauthUri;
}

abstract class TwoFactorRepository {
  Future<AuthResult> challenge(String challengeToken, {String? code, String? recoveryCode});
  Future<TwoFactorStatus> status();
  Future<TwoFactorSetup> setup();

  /// Returns the 10 recovery codes (shown once).
  Future<List<String>> confirm(String code);
  Future<void> disable({required String password, String? code, String? recoveryCode});
  Future<List<String>> regenerateRecoveryCodes({required String password, String? code, String? recoveryCode});
}

class ApiTwoFactorRepository implements TwoFactorRepository {
  ApiTwoFactorRepository(this._api);
  final ApiClient _api;

  static Map<String, dynamic> _proof(String? code, String? recoveryCode) => {'code': ?code, 'recovery_code': ?recoveryCode};
  static List<String> _codes(Map<String, dynamic> d) => [for (final c in (d['recovery_codes'] as List? ?? const [])) '$c'];

  @override
  Future<AuthResult> challenge(String challengeToken, {String? code, String? recoveryCode}) async {
    final d = (await _api.post('/auth/2fa/challenge', body: {'challenge_token': challengeToken, ..._proof(code, recoveryCode)})).map;
    return AuthResult(AppUser.fromJson(Map<String, dynamic>.from(d['user'] as Map)), d['token'] as String);
  }

  @override
  Future<TwoFactorStatus> status() async => TwoFactorStatus.fromJson((await _api.get('/auth/2fa/status')).map);

  @override
  Future<TwoFactorSetup> setup() async {
    final d = (await _api.post('/auth/2fa/setup')).map;
    return TwoFactorSetup(secret: '${d['secret']}', otpauthUri: '${d['otpauth_uri']}');
  }

  @override
  Future<List<String>> confirm(String code) async => _codes((await _api.post('/auth/2fa/confirm', body: {'code': code})).map);

  @override
  Future<void> disable({required String password, String? code, String? recoveryCode}) async {
    await _api.post('/auth/2fa/disable', body: {'password': password, ..._proof(code, recoveryCode)});
  }

  @override
  Future<List<String>> regenerateRecoveryCodes({required String password, String? code, String? recoveryCode}) async =>
      _codes((await _api.post('/auth/2fa/recovery-codes', body: {'password': password, ..._proof(code, recoveryCode)})).map);
}

final twoFactorRepositoryProvider = Provider<TwoFactorRepository>((ref) => ApiTwoFactorRepository(ref.watch(apiClientProvider)));
