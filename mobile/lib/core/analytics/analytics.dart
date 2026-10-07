import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../providers.dart';

/// Privacy-conscious product analytics (docs/API_SPEC.md "Analytics").
///
/// * Only the user's own `analytics` consent enables anything: without it NOTHING is sent from here.
/// * The only client-reported event is `appointment_clicked` (the redirect to the official booking page happens
///   on the device). `guide_view`, `job_view` and `lesson_started` are counted by the API itself (it sees the
///   `X-Analytics-Consent: granted` header the client sends), so the app must never also POST them (double count).
/// * No person identifier, no query text; at most a content slug. Failures are swallowed (the API always answers 204).
class AnalyticsService {
  AnalyticsService(this._api, this._consent, {DateTime Function()? now}) : _now = now ?? DateTime.now;
  final ApiClient _api;
  final bool Function() _consent;
  final DateTime Function() _now;
  final Map<String, DateTime> _recent = {};

  /// A repeated tap on the same booking link within this window counts once.
  static const dedupeWindow = Duration(seconds: 10);

  Future<void> appointmentClicked([String? subject]) => _send('appointment_clicked', subject);

  Future<void> _send(String name, String? subject) async {
    if (!_consent()) return;
    final key = '$name|${subject ?? ''}';
    final now = _now();
    final last = _recent[key];
    if (last != null && now.difference(last) < dedupeWindow) return;
    _recent[key] = now;
    try {
      await _api.post('/analytics/events', body: {'name': name, if (subject != null && RegExp(r'^[a-z0-9][a-z0-9\-_/]*$', caseSensitive: false).hasMatch(subject)) 'subject': subject});
    } catch (_) {
      // analytics never affects the user's flow
    }
  }
}

final analyticsServiceProvider = Provider<AnalyticsService>((ref) => AnalyticsService(ref.watch(apiClientProvider), () => ref.read(analyticsConsentProvider)));

/// Keeps [analyticsConsentProvider] in step with the server ledger after sign-in (one silent GET) and clears it on sign-out.
Future<void> syncAnalyticsConsent(ApiClient api, void Function(bool) set) async {
  try {
    final r = await api.get('/profile/consents');
    set(((r.map['consents'] as Map?)?['analytics'] as Map?)?['granted'] == true);
  } catch (_) {
    set(false);
  }
}
