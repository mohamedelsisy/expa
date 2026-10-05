/// Push notification provider abstraction (FCM on Android, FCM/APNs on iOS).
///
/// The only implementation shipped in this repository is [NoopPushService]: a real provider needs a Firebase
/// project (`google-services.json` / `GoogleService-Info.plist`, APNs key), which are external credentials.
/// The FCM adapter is kept as a ready-to-drop-in template in `tool/fcm/fcm_push_service.dart.template`
/// (see docs/MOBILE_SETUP.md). Everything above this interface (consent, registration, logout ordering,
/// routing) is implemented and tested against fakes.
enum PushPermission { unknown, granted, denied, unsupported }

/// A received notification. `data` is the provider's custom payload; EXPA sends `type` + `target`
/// (same shape as notification CTAs) and they are routed ONLY through the route allow-list.
class PushMessage {
  const PushMessage({this.title, this.body, this.data = const {}});
  final String? title;
  final String? body;
  final Map<String, String> data;
}

abstract class PushService {
  /// False when no provider is configured in this build.
  bool get isAvailable;

  /// `android` | `ios` (value of `POST /devices` `platform`).
  String get platform;

  Future<PushPermission> permission();

  /// Shows the OS permission prompt. Callers must show their own localized rationale first.
  Future<PushPermission> requestPermission();

  /// The current device token, or null when unavailable.
  Future<String?> token();

  /// Fires when the provider rotates the token; the new token must be registered again.
  Stream<String> get onTokenRefresh;

  /// A notification arrived while the app is in the foreground.
  Stream<PushMessage> get onForeground;

  /// The user tapped a notification (app in background).
  Stream<PushMessage> get onTap;

  /// The notification that launched the app from a terminated state, if any.
  Future<PushMessage?> initialMessage();

  /// Invalidates the provider token (used on logout so the old token can never reach the next user).
  Future<void> deleteToken();
}

class NoopPushService implements PushService {
  const NoopPushService();
  @override
  bool get isAvailable => false;
  @override
  String get platform => 'android';
  @override
  Future<PushPermission> permission() async => PushPermission.unsupported;
  @override
  Future<PushPermission> requestPermission() async => PushPermission.unsupported;
  @override
  Future<String?> token() async => null;
  @override
  Stream<String> get onTokenRefresh => const Stream.empty();
  @override
  Stream<PushMessage> get onForeground => const Stream.empty();
  @override
  Stream<PushMessage> get onTap => const Stream.empty();
  @override
  Future<PushMessage?> initialMessage() async => null;
  @override
  Future<void> deleteToken() async {}
}
