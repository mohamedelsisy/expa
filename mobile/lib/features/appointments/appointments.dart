import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/content_view.dart';
import '../../l10n/app_localizations.dart';

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
    final offices = [for (final o in (_hub?['offices'] as List? ?? const [])) if (o is Map) Map<String, dynamic>.from(o)];
    final guide = _hub?['guide'] is Map ? Map<String, dynamic>.from(_hub!['guide'] as Map) : null;
    // The API's notice wins (it is the authoritative "EXPA does not book" statement); the local text is the fallback.
    final notice = (_hub?['notice'] as String?) ?? l.apptNotice;
    return Scaffold(
      appBar: AppBar(title: Text(l.apptTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Notice(key: const ValueKey('appt-notice'), text: notice, kind: NoticeKind.warning),
        const SizedBox(height: Tokens.s4),
        DropdownButtonFormField<String>(
          isExpanded: true,
          decoration: InputDecoration(labelText: l.apptOfficeType),
          initialValue: _type,
          items: [for (final t in officeTypes) DropdownMenuItem(value: t, child: Text(officeTypeLabel(l, t)))],
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
        TextButton.icon(onPressed: () => context.push('/appointments/guides'), icon: const Icon(Icons.menu_book_outlined), label: Text(l.apptGuidesTitle)),
        const SizedBox(height: Tokens.s2),
        if (_error != null) Notice(text: errorMessage(l, _error), kind: NoticeKind.danger),
        if (_busy) const LoadingView(),
        if (_hub != null && !_busy) ...[
          if (guide != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(Tokens.s4),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${guide['title'] ?? ''}', style: Theme.of(context).textTheme.titleMedium),
                  if (guide['summary'] != null) Text('${guide['summary']}'),
                  ContentSection(title: l.secSteps, value: guide['steps']),
                  ContentSection(title: l.secTips, value: guide['tips']),
                  ContentSection(title: l.secCautions, value: guide['cautions']),
                ]),
              ),
            ),
            const SizedBox(height: Tokens.s3),
          ],
          if (offices.isEmpty) Text(l.apptEmpty),
          for (final o in offices) Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: OfficeCard(office: o)),
        ],
      ]),
    );
  }
}
