/// Push notifications abstraction. FCM is blocked (task T-016b: needs Firebase project credentials),
/// so the only implementation is [NoopPushService]. A real one will register the device token via
/// `POST /devices` (needs the `push_notifications` consent) and unregister on logout.
abstract class PushService {
  /// Asks the OS for permission and returns the device token, or null when unavailable.
  Future<String?> register();
  Future<void> unregister();
  bool get isAvailable;
}

class NoopPushService implements PushService {
  const NoopPushService();
  @override
  Future<String?> register() async => null;
  @override
  Future<void> unregister() async {}
  @override
  bool get isAvailable => false;
}
