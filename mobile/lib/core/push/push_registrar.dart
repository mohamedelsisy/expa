import '../api/api_client.dart';
import '../api/api_exception.dart';
import '../routes.dart';
import '../storage/secure_store.dart';
import 'push_service.dart';

enum PushEnableResult { enabled, unavailable, permissionDenied, consentRequired, failed }

/// Device-token lifecycle against the EXPA API:
/// `POST /devices {token, platform}` (needs the `push_notifications` consent, else 403 `consent_required`)
/// and `DELETE /devices {token}` (needs an authenticated request, so it must run BEFORE the session token is revoked).
class PushRegistrar {
  PushRegistrar({required this.service, required this.api, required this.session});
  final PushService service;
  final ApiClient api;
  final SessionStore session;

  Future<PushPermission> permission() => service.permission();

  /// Call only after the user accepted the in-app rationale.
  Future<PushEnableResult> enable() async {
    if (!service.isAvailable) return PushEnableResult.unavailable;
    try {
      var p = await service.permission();
      if (p != PushPermission.granted) p = await service.requestPermission();
      if (p != PushPermission.granted) return PushEnableResult.permissionDenied;
      final token = await service.token();
      if (token == null || token.length < 8) return PushEnableResult.failed;
      final r = await _register(token);
      if (r == PushEnableResult.enabled) await session.savePushEnabled(true);
      return r;
    } catch (_) {
      return PushEnableResult.failed;
    }
  }

  Future<PushEnableResult> _register(String token) async {
    try {
      await api.post('/devices', body: {'token': token, 'platform': service.platform});
      await session.savePushToken(token);
      return PushEnableResult.enabled;
    } on ForbiddenException catch (e) {
      return e.consentRequired ? PushEnableResult.consentRequired : PushEnableResult.failed;
    } on ApiException {
      return PushEnableResult.failed;
    }
  }

  /// Silent re-registration after login / app start (never prompts). No-op unless the user opted in on this device.
  Future<void> syncIfEnabled() async {
    if (!service.isAvailable || !await session.readPushEnabled()) return;
    try {
      if (await service.permission() != PushPermission.granted) return;
      final token = await service.token();
      if (token != null && token.length >= 8) await _register(token);
    } catch (_) {}
  }

  /// Token-refresh hook: register the rotated token and forget the old one.
  Future<void> onTokenRefreshed(String token) async {
    if (token.length < 8 || !await session.readPushEnabled()) return;
    final old = await session.readPushToken();
    if (await _register(token) == PushEnableResult.enabled && old != null && old != token) {
      try {
        await api.delete('/devices', body: {'token': old});
      } catch (_) {}
    }
  }

  /// User turned notifications off, or the user logs out. With [serverCall] the device is removed from the
  /// account first (requires the session token, so call this BEFORE `/auth/logout`).
  Future<void> disable({bool serverCall = true}) async {
    try {
      final token = await session.readPushToken() ?? (service.isAvailable ? await service.token() : null);
      if (serverCall && token != null) {
        try {
          await api.delete('/devices', body: {'token': token});
        } catch (_) {}
      }
      if (service.isAvailable) await service.deleteToken();
    } catch (_) {}
    await session.clearPushToken();
    await session.savePushEnabled(false);
  }

  /// Tap/foreground payload to an in-app route, only through the allow-list. Null = ignore.
  static String? routeFor(PushMessage m) {
    final target = m.data['target'] ?? m.data['route'] ?? '';
    return routeForTarget(m.data['type'] ?? 'route', target);
  }
}
