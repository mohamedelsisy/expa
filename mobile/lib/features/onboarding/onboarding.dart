import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import '../appointments/appointments.dart' show citiesProvider;
import '../dashboard/dashboard.dart';
import '../documents/documents.dart' show grantConsent;

final profileOptionsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/profile/options')).map;
});

final profileProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/profile')).map;
});

/// Collects only what personalization needs; everything but the status is skippable.
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});
  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingState();
}

class _OnboardingState extends ConsumerState<OnboardingScreen> {
  String? _segment, _residence, _italian, _english, _age;
  int? _cityId;
  final _nationality = TextEditingController();
  final Set<String> _goals = {};
  bool _busy = false, _seeded = false, _segmentMissing = false;
  Object? _error;

  @override
  void dispose() {
    _nationality.dispose();
    super.dispose();
  }

  void _seed(Map<String, dynamic> p) {
    if (_seeded) return;
    _seeded = true;
    _segment = p['segment'] as String?;
    _residence = p['residence_type'] as String?;
    _italian = p['italian_level'] as String?;
    _english = p['english_level'] as String?;
    _age = p['age_range'] as String?;
    _nationality.text = (p['nationality'] as String?) ?? '';
    _cityId = ((p['city'] as Map?)?['id'] as num?)?.toInt();
    _goals.addAll([for (final g in (p['goals'] as List? ?? const [])) '$g']);
  }

  Future<void> _save() async {
    final l = AppL10n.of(context);
    if (_segment == null) {
      setState(() => _segmentMissing = true);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
      _segmentMissing = false;
    });
    final nat = _nationality.text.trim().toUpperCase();
    try {
      final api = ref.read(apiClientProvider);
      await api.patch('/profile', body: {
        'segment': _segment,
        'nationality': nat.length == 2 ? nat : null,
        'city_id': _cityId,
        'residence_type': _residence,
        'italian_level': _italian,
        'english_level': _english,
        'age_range': _age,
        'goals': _goals.toList(),
      });
      await api.post('/profile/onboarding/complete');
      ref.invalidate(dashboardProvider);
      ref.invalidate(profileProvider);
      if (mounted) {
        showSnack(context, l.saved);
        context.canPop() ? context.pop() : context.go('/home');
      }
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _choice(String label, List<dynamic> options, String? value, ValueChanged<String?> onChanged, {bool optional = true}) {
    final l = AppL10n.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: Tokens.s4),
      child: DropdownButtonFormField<String>(
        isExpanded: true,
        decoration: InputDecoration(labelText: optional ? '$label (${l.optional})' : label),
        initialValue: options.any((o) => o is Map && o['value'] == value) ? value : null,
        items: [for (final o in options) if (o is Map) DropdownMenuItem(value: '${o['value']}', child: Text('${o['label']}', overflow: TextOverflow.ellipsis))],
        onChanged: onChanged,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final options = ref.watch(profileOptionsProvider);
    final profile = ref.watch(profileProvider);
    final cities = ref.watch(citiesProvider).valueOrNull ?? const [];
    final consentErr = _error is ForbiddenException && (_error as ForbiddenException).consentRequired;
    return Scaffold(
      appBar: AppBar(title: Text(l.onboardingTitle), actions: [TextButton(onPressed: () => context.canPop() ? context.pop() : context.go('/home'), child: Text(l.skip))]),
      body: AsyncBody<Map<String, dynamic>>(
        value: options,
        onRetry: () => ref.invalidate(profileOptionsProvider),
        data: (o) {
          profile.whenData(_seed);
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Text(l.onboardingIntro),
            const SizedBox(height: Tokens.s4),
            if (_error != null) ...[
              Notice(
                text: errorMessage(l, _error),
                kind: NoticeKind.danger,
                trailing: consentErr
                    ? TextButton(
                        onPressed: () async {
                          try {
                            await grantConsent(ref, 'profile_personalization');
                            if (mounted) setState(() => _error = null);
                          } catch (e) {
                            if (mounted) setState(() => _error = e);
                          }
                        },
                        child: Text(l.grantConsent))
                    : null,
              ),
              const SizedBox(height: Tokens.s3),
            ],
            if (_segmentMissing) ...[Notice(text: l.onboardingSegmentRequired, kind: NoticeKind.warning), const SizedBox(height: Tokens.s3)],
            _choice(l.fieldSegment, o['segment'] as List? ?? const [], _segment, (v) => setState(() => _segment = v), optional: false),
            Padding(
              padding: const EdgeInsets.only(bottom: Tokens.s4),
              child: TextField(controller: _nationality, maxLength: 2, textCapitalization: TextCapitalization.characters, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: '${l.fieldNationality} (${l.optional})', counterText: '')),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: Tokens.s4),
              child: DropdownButtonFormField<int>(
                isExpanded: true,
                decoration: InputDecoration(labelText: '${l.fieldCity} (${l.optional})'),
                initialValue: cities.any((c) => c['id'] == _cityId) ? _cityId : null,
                items: [for (final c in cities) DropdownMenuItem(value: (c['id'] as num).toInt(), child: Text('${c['name']}'))],
                onChanged: (v) => setState(() => _cityId = v),
              ),
            ),
            _choice(l.fieldResidence, o['residence_type'] as List? ?? const [], _residence, (v) => setState(() => _residence = v)),
            _choice(l.fieldItalian, o['cefr_level'] as List? ?? const [], _italian, (v) => setState(() => _italian = v)),
            _choice(l.fieldEnglish, o['cefr_level'] as List? ?? const [], _english, (v) => setState(() => _english = v)),
            _choice(l.fieldAge, o['age_range'] as List? ?? const [], _age, (v) => setState(() => _age = v)),
            Text('${l.fieldGoals} (${l.optional})', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: Tokens.s2),
            Wrap(spacing: Tokens.s2, runSpacing: Tokens.s2, children: [
              for (final g in (o['goals'] as List? ?? const []))
                if (g is Map)
                  FilterChip(
                    label: Text('${g['label']}'),
                    selected: _goals.contains('${g['value']}'),
                    onSelected: (s) => setState(() => s ? _goals.add('${g['value']}') : _goals.remove('${g['value']}')),
                  ),
            ]),
            const SizedBox(height: Tokens.s6),
            FilledButton(onPressed: _busy ? null : _save, child: Text(l.completeOnboarding)),
          ]);
        },
      ),
    );
  }
}
