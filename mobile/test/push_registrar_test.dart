import 'dart:async';

import 'package:expa_mobile/core/push/push_registrar.dart';
import 'package:expa_mobile/core/push/push_service.dart';
import 'package:expa_mobile/core/storage/secure_store.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

class FakePush implements PushService {
  FakePush({this.available = true, this.perm = PushPermission.unknown, this.deviceToken = 'fcm-token-123'});
  bool available;
  PushPermission perm;
  String? deviceToken;
  PushPermission afterPrompt = PushPermission.granted;
  int prompts = 0;
  bool deleted = false;
  final refresh = StreamController<String>.broadcast();
  @override
  bool get isAvailable => available;
  @override
  String get platform => 'android';
  @override
  Future<PushPermission> permission() async => perm;
  @override
  Future<PushPermission> requestPermission() async {
    prompts++;
    return perm = afterPrompt;
  }

  @override
  Future<String?> token() async => deviceToken;
  @override
  Stream<String> get onTokenRefresh => refresh.stream;
  @override
  Stream<PushMessage> get onForeground => const Stream.empty();
  @override
  Stream<PushMessage> get onTap => const Stream.empty();
  @override
  Future<PushMessage?> initialMessage() async => null;
  @override
  Future<void> deleteToken() async => deleted = true;
}

(PushRegistrar, FakePush, TestEnv) make({FakePush? push}) {
  final env = TestEnv();
  final p = push ?? FakePush();
  return (PushRegistrar(service: p, api: env.api, session: SessionStore(env.store)), p, env);
}

void main() {
  test('NoopPushService is unavailable and inert', () async {
    const n = NoopPushService();
    expect(n.isAvailable, isFalse);
    expect(await n.requestPermission(), PushPermission.unsupported);
    expect(await n.token(), isNull);
    final env = TestEnv();
    final r = PushRegistrar(service: n, api: env.api, session: SessionStore(env.store));
    expect(await r.enable(), PushEnableResult.unavailable);
    await r.disable();
    expect(env.backend.calls, isEmpty, reason: 'no network without a provider');
  });

  test('enable: prompts, registers POST /devices {token, platform}, remembers token and opt-in', () async {
    final (r, push, env) = make();
    env.backend.ok('POST /devices', {'registered': true});
    expect(await r.enable(), PushEnableResult.enabled);
    expect(push.prompts, 1);
    final call = env.backend.where('POST', '/devices').single;
    expect(call.body, {'token': 'fcm-token-123', 'platform': 'android'});
    expect(await SessionStore(env.store).readPushToken(), 'fcm-token-123');
    expect(await SessionStore(env.store).readPushEnabled(), isTrue);
  });

  test('enable: does not prompt again when permission is already granted', () async {
    final (r, push, env) = make(push: FakePush(perm: PushPermission.granted));
    env.backend.ok('POST /devices', {'registered': true});
    await r.enable();
    expect(push.prompts, 0);
  });

  test('enable: OS permission denied -> no registration, no opt-in', () async {
    final push = FakePush()..afterPrompt = PushPermission.denied;
    final (r, _, env) = make(push: push);
    expect(await r.enable(), PushEnableResult.permissionDenied);
    expect(env.backend.calls, isEmpty);
    expect(await SessionStore(env.store).readPushEnabled(), isFalse);
  });

  test('enable: 403 consent_required is surfaced (not a generic failure) and is not stored as enabled', () async {
    final (r, _, env) = make();
    env.backend.error('POST /devices', 403, 'consent_required');
    expect(await r.enable(), PushEnableResult.consentRequired);
    expect(await SessionStore(env.store).readPushEnabled(), isFalse);
    expect(await SessionStore(env.store).readPushToken(), isNull);
  });

  test('enable: server or network failure -> failed; missing/short token -> failed', () async {
    var (r, _, env) = make();
    env.backend.error('POST /devices', 500, 'server_error');
    expect(await r.enable(), PushEnableResult.failed);
    (r, _, env) = make(push: FakePush(deviceToken: null));
    expect(await r.enable(), PushEnableResult.failed);
    (r, _, env) = make(push: FakePush(deviceToken: 'short'));
    expect(await r.enable(), PushEnableResult.failed);
    (r, _, env) = make();
    env.backend.offline = true;
    expect(await r.enable(), PushEnableResult.failed);
  });

  test('disable: DELETE /devices with the stored token, deletes the provider token, clears opt-in', () async {
    final (r, push, env) = make();
    env.backend.ok('POST /devices', {'registered': true});
    env.backend.on('DELETE /devices', null, status: 204);
    await r.enable();
    await r.disable();
    expect(env.backend.where('DELETE', '/devices').single.body, {'token': 'fcm-token-123'});
    expect(push.deleted, isTrue);
    expect(await SessionStore(env.store).readPushToken(), isNull);
    expect(await SessionStore(env.store).readPushEnabled(), isFalse);
  });

  test('disable(serverCall: false) (session already revoked) never calls the API but still forgets locally', () async {
    final (r, push, env) = make();
    env.backend.ok('POST /devices', {'registered': true});
    await r.enable();
    env.backend.calls.clear();
    await r.disable(serverCall: false);
    expect(env.backend.calls, isEmpty);
    expect(push.deleted, isTrue);
    expect(await SessionStore(env.store).readPushEnabled(), isFalse);
  });

  test('disable never throws when the server call fails (offline logout must work)', () async {
    final (r, _, env) = make();
    env.backend.ok('POST /devices', {'registered': true});
    await r.enable();
    env.backend.offline = true;
    await r.disable();
    expect(await SessionStore(env.store).readPushEnabled(), isFalse);
  });

  test('token refresh: registers the new token and removes the old one, only when opted in', () async {
    final (r, _, env) = make();
    env.backend.ok('POST /devices', {'registered': true});
    env.backend.on('DELETE /devices', null, status: 204);
    await r.onTokenRefreshed('new-token-9999');
    expect(env.backend.calls, isEmpty, reason: 'not opted in');
    await r.enable();
    env.backend.calls.clear();
    await r.onTokenRefreshed('new-token-9999');
    expect(env.backend.where('POST', '/devices').single.body, {'token': 'new-token-9999', 'platform': 'android'});
    expect(env.backend.where('DELETE', '/devices').single.body, {'token': 'fcm-token-123'});
    expect(await SessionStore(env.store).readPushToken(), 'new-token-9999');
  });

  test('syncIfEnabled re-registers silently after login and never prompts', () async {
    final (r, push, env) = make(push: FakePush(perm: PushPermission.granted));
    env.backend.ok('POST /devices', {'registered': true});
    await r.syncIfEnabled();
    expect(env.backend.calls, isEmpty, reason: 'user never opted in');
    await SessionStore(env.store).savePushEnabled(true);
    await r.syncIfEnabled();
    expect(env.backend.where('POST', '/devices'), hasLength(1));
    expect(push.prompts, 0);
    push.perm = PushPermission.denied;
    env.backend.calls.clear();
    await r.syncIfEnabled();
    expect(env.backend.calls, isEmpty);
  });

  group('tap/foreground routing goes through the allow-list', () {
    test('known targets map to routes', () {
      expect(PushRegistrar.routeFor(const PushMessage(data: {'type': 'route', 'target': 'my-documents'})), '/documents');
      expect(PushRegistrar.routeFor(const PushMessage(data: {'type': 'guide', 'target': 'rinnovo'})), '/guides/rinnovo');
      expect(PushRegistrar.routeFor(const PushMessage(data: {'route': 'notifications'})), '/notifications');
    });
    test('unsafe or missing targets are ignored', () {
      for (final d in [<String, String>{}, {'target': 'https://evil.example'}, {'target': '//evil'}, {'target': '../x'}, {'type': 'route', 'target': 'admin/users'}]) {
        expect(PushRegistrar.routeFor(PushMessage(data: d)), isNull, reason: '$d');
      }
    });
  });
}
