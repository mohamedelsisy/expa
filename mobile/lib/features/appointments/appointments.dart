import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/safe_url.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';

const _officeTypes = ['questura', 'comune', 'anagrafe', 'asl', 'inps', 'agenzia_entrate', 'poste', 'prefettura', 'motorizzazione'];

final citiesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  final r = await ref.watch(apiClientProvider).get('/cities');
  return [for (final e in r.list) if (e is Map) Map<String, dynamic>.from(e)];
});

/// Appointment hub. EXPA never books: this screen only lists offices and sends the user to the official
/// booking destination, always repeating the API's notice.
class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});
  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsState();
}

class _AppointmentsState extends ConsumerState<AppointmentsScreen> {
  String _type = 'questura';
  String? _city;
  Map<String, dynamic>? _hub;
  Object? _error;
  bool _busy = false;

  Future<void> _search() async {
    if (_city == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).get('/appointments/hub', query: {'type': _type, 'city': _city});
      if (mounted) setState(() => _hub = r.map);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final cities = ref.watch(citiesProvider);
    final offices = [for (final o in (_hub?['offices'] as List? ?? const [])) if (o is Map) o];
    return Scaffold(
      appBar: AppBar(title: Text(l.apptTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Notice(text: l.apptNotice, kind: NoticeKind.warning),
        const SizedBox(height: Tokens.s4),
        DropdownButtonFormField<String>(
          isExpanded: true,
          decoration: InputDecoration(labelText: l.apptOfficeType),
          initialValue: _type,
          items: [for (final t in _officeTypes) DropdownMenuItem(value: t, child: Text(t, textDirection: TextDirection.ltr))],
          onChanged: (v) => setState(() => _type = v ?? _type),
        ),
        const SizedBox(height: Tokens.s3),
        cities.when(
          loading: () => const LinearProgressIndicator(),
          error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(citiesProvider)),
          data: (list) => DropdownButtonFormField<String>(
            isExpanded: true,
            decoration: InputDecoration(labelText: l.apptCity),
            initialValue: _city,
            items: [for (final c in list) DropdownMenuItem(value: '${c['slug']}', child: Text('${c['name']}'))],
            onChanged: (v) => setState(() => _city = v),
          ),
        ),
        const SizedBox(height: Tokens.s3),
        FilledButton(onPressed: (_city == null || _busy) ? null : _search, child: Text(l.apptSearch)),
        const SizedBox(height: Tokens.s4),
        if (_error != null) Notice(text: errorMessage(l, _error), kind: NoticeKind.danger),
        if (_busy) const LoadingView(),
        if (_hub != null && !_busy) ...[
          if (offices.isEmpty) Text(l.apptEmpty),
          for (final o in offices)
            Padding(
              padding: const EdgeInsets.only(bottom: Tokens.s3),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s4),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${o['name']}', style: Theme.of(context).textTheme.titleMedium),
                    if (o['address'] != null) Text('${o['address']}'),
                    if (o['opening_hours'] != null) Text('${o['opening_hours']}', style: Theme.of(context).textTheme.bodySmall),
                    if (o['booking'] is Map) ...[
                      const SizedBox(height: Tokens.s2),
                      Pill(text: '${(o['booking'] as Map)['method_label'] ?? ''}'),
                      if (safeHttpsUri((o['booking'] as Map)['url'] as String?) != null)
                        Padding(
                          padding: const EdgeInsets.only(top: Tokens.s2),
                          child: FilledButton.icon(
                            onPressed: () => openUrlWithFeedback(context, (o['booking'] as Map)['url'] as String?),
                            icon: const Icon(Icons.open_in_new),
                            label: Text(l.apptGoOfficial),
                          ),
                        )
                      else
                        Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.apptNoUrl, style: Theme.of(context).textTheme.bodySmall)),
                    ],
                    if (o['source'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: FreshnessBadge(freshness: (o['source'] as Map)['freshness'] as String?)),
                  ]),
                ),
              ),
            ),
        ],
      ]),
    );
  }
}
