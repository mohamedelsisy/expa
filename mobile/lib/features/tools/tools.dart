import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' show NumberFormat;

import '../../core/providers.dart';
import '../../core/routes.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

String formatEur(BuildContext context, num n) {
  final locale = Localizations.localeOf(context).languageCode;
  try {
    return NumberFormat.currency(locale: locale, symbol: '€', decimalDigits: 2).format(n);
  } catch (_) {
    return '€${n.toStringAsFixed(2)}';
  }
}

// ------------------------------------------------------------------ recommendations (GET /recommendations)

final recommendationsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/recommendations')).map;
});

/// "Recommended for you": guides, lessons, services, reminders. Every item carries the server's explainable reason.
/// Without the personalization consent the API answers universal items and `personalization.enabled=false`; we say so.
class RecommendationsScreen extends ConsumerWidget {
  const RecommendationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.recoTitle)),
      body: AsyncBody<Map<String, dynamic>>(
        value: ref.watch(recommendationsProvider),
        onRetry: () => ref.invalidate(recommendationsProvider),
        data: (d) {
          final personalized = (d['personalization'] as Map?)?['enabled'] == true;
          final sections = <(String, IconData, List<Map<String, dynamic>>)>[
            (l.recoGuides, Icons.menu_book_outlined, _maps(d['guides'])),
            (l.recoLessons, Icons.translate, _maps(d['lessons'])),
            (l.recoServices, Icons.handshake_outlined, _maps(d['services'])),
            (l.recoReminders, Icons.alarm, _maps(d['reminders'])),
          ];
          final empty = sections.every((s) => s.$3.isEmpty);
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(recommendationsProvider.future),
            child: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
              Notice(
                key: const ValueKey('reco-personalization'),
                text: personalized ? l.recoPersonalized : l.recoNotPersonalized,
                kind: personalized ? NoticeKind.info : NoticeKind.warning,
                trailing: personalized ? null : TextButton(key: const ValueKey('reco-consent'), onPressed: () => context.push('/privacy'), child: Text(l.recoManageConsent)),
              ),
              const SizedBox(height: Tokens.s3),
              if (empty) EmptyView(message: l.recoEmpty, icon: Icons.auto_awesome_outlined),
              for (final s in sections)
                if (s.$3.isNotEmpty) ...[
                  Padding(padding: const EdgeInsets.only(top: Tokens.s4, bottom: Tokens.s2), child: Text(s.$1, style: theme.textTheme.titleMedium)),
                  for (final it in s.$3) _RecoCard(item: it, icon: s.$2),
                ],
            ]),
          );
        },
      ),
    );
  }
}

class _RecoCard extends StatelessWidget {
  const _RecoCard({required this.item, required this.icon});
  final Map<String, dynamic> item;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final route = item['route'] == null ? null : routeForTarget('route', '${item['route']}');
    final reason = (item['reason'] as Map?)?['text'] as String?;
    return Card(
      child: ListTile(
        minVerticalPadding: Tokens.s3,
        leading: Icon(icon, color: Tokens.primary),
        title: Text('${item['title'] ?? ''}'),
        subtitle: Text([
          if (reason != null && reason.isNotEmpty) '${l.recoWhy}: $reason',
          if (item['label'] == 'third_party') l.recoThirdParty,
        ].join('\n')),
        isThreeLine: reason != null && reason.length > 40,
        trailing: route == null ? null : const Icon(Icons.chevron_right),
        onTap: route == null ? null : () => context.push(route),
      ),
    );
  }
}

// ------------------------------------------------------------------ net salary (POST /money/net-salary)

/// Request/response contract for `POST /money/net-salary` (stateless: nothing is stored server side).
class NetSalaryApi {
  NetSalaryApi(this._post);
  final Future<Map<String, dynamic>> Function(Map<String, dynamic> body) _post;
  Future<Map<String, dynamic>> estimate({required num grossAnnual, int months = 12}) => _post({'gross_annual': grossAnnual, 'months': months});
}

final netSalaryApiProvider = Provider<NetSalaryApi>((ref) {
  final api = ref.watch(apiClientProvider);
  return NetSalaryApi((body) async => (await api.post('/money/net-salary', body: body)).map);
});

class NetSalaryScreen extends ConsumerStatefulWidget {
  const NetSalaryScreen({super.key});
  @override
  ConsumerState<NetSalaryScreen> createState() => _NetSalaryState();
}

class _NetSalaryState extends ConsumerState<NetSalaryScreen> {
  final _gross = TextEditingController();
  int _months = 12;
  bool _busy = false;
  String? _fieldError;
  Object? _error;
  Map<String, dynamic>? _result;

  @override
  void dispose() {
    _gross.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    final l = AppL10n.of(context);
    final v = double.tryParse(_gross.text.trim().replaceAll(',', '.'));
    if (v == null || v < 0 || v > 10000000) {
      setState(() => _fieldError = l.netInvalid);
      return;
    }
    setState(() {
      _busy = true;
      _fieldError = null;
      _error = null;
    });
    try {
      final r = await ref.read(netSalaryApiProvider).estimate(grossAnnual: v, months: _months);
      if (mounted) setState(() => _result = r);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final r = _result;
    final available = r?['available'] == true;
    final est = r?['estimate'] is Map ? Map<String, dynamic>.from(r!['estimate'] as Map) : null;
    final table = r?['table'] is Map ? Map<String, dynamic>.from(r!['table'] as Map) : null;
    String eur(Object? x) => formatEur(context, (x as num?) ?? 0);
    return Scaffold(
      appBar: AppBar(title: Text(l.netTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Text(l.netIntro),
        const SizedBox(height: Tokens.s3),
        TextField(
          key: const ValueKey('net-gross'),
          controller: _gross,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l.netGross, errorText: _fieldError, prefixText: '€ '),
          onSubmitted: (_) => _run(),
        ),
        const SizedBox(height: Tokens.s3),
        Text(l.netMonths, style: theme.textTheme.labelLarge),
        const SizedBox(height: Tokens.s1),
        Wrap(spacing: Tokens.s2, children: [
          for (final m in const [12, 13, 14])
            ChoiceChip(key: ValueKey('net-months-$m'), label: Text(formatNumberPlain(context, m)), selected: _months == m, onSelected: (_) => setState(() => _months = m)),
        ]),
        const SizedBox(height: Tokens.s4),
        FilledButton(key: const ValueKey('net-run'), onPressed: _busy ? null : _run, child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.netCalculate)),
        const SizedBox(height: Tokens.s4),
        if (_error != null) Notice(key: const ValueKey('net-error'), text: errorMessage(l, _error), kind: NoticeKind.danger),
        if (r != null && !available) Notice(key: const ValueKey('net-unavailable'), title: l.netUnavailableTitle, text: (r['message'] as String?) ?? l.netUnavailable, kind: NoticeKind.warning),
        if (r != null && available && est != null) ...[
          Card(
            key: const ValueKey('net-result'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(l.netMonthly, style: theme.textTheme.labelLarge),
                Text(eur(est['net_monthly']), style: theme.textTheme.headlineSmall, textDirection: TextDirection.ltr),
                const SizedBox(height: Tokens.s3),
                _row(context, l.netAnnual, eur(est['net_annual'])),
                _row(context, l.netGrossLine, eur(est['gross_annual'])),
                _row(context, l.netContributions, '- ${eur(est['contributions'])}'),
                if (((est['deduction'] as num?) ?? 0) > 0) _row(context, l.netDeduction, eur(est['deduction'])),
                _row(context, l.netTaxable, eur(est['taxable_income'])),
                _row(context, l.netIncomeTax, '- ${eur(est['income_tax'])}'),
              ]),
            ),
          ),
          if (table != null) ...[
            const SizedBox(height: Tokens.s3),
            Text(l.netTable('${table['name'] ?? ''}', '${r['tax_year'] ?? ''}'), style: theme.textTheme.bodySmall),
            const SizedBox(height: Tokens.s2),
            if (SourceInfo.fromJson(table['source']) case final s?) SourceBlock(source: s),
          ],
          const SizedBox(height: Tokens.s3),
          Notice(key: const ValueKey('net-disclaimer'), text: (r['disclaimer'] as String?) ?? l.netDisclaimer, kind: NoticeKind.warning),
        ],
      ]),
    );
  }

  Widget _row(BuildContext context, String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(children: [
          Expanded(child: Text(label)),
          const SizedBox(width: Tokens.s2),
          Text(value, textDirection: TextDirection.ltr),
        ]),
      );
}

String formatNumberPlain(BuildContext context, num n) {
  final locale = Localizations.localeOf(context).languageCode;
  try {
    return NumberFormat.decimalPattern(locale).format(n);
  } catch (_) {
    return '$n';
  }
}

// ------------------------------------------------------------------ travel (GET /travel/requirements)

class TravelApi {
  TravelApi(this._get);
  final Future<Map<String, dynamic>> Function(Map<String, dynamic> query) _get;
  Future<Map<String, dynamic>> lookup({required String nationality, required String destination}) =>
      _get({'nationality': nationality.toUpperCase(), 'destination': destination.toUpperCase()});
}

final travelApiProvider = Provider<TravelApi>((ref) {
  final api = ref.watch(apiClientProvider);
  return TravelApi((q) async => (await api.get('/travel/requirements', query: q)).map);
});

final isoCodePattern = RegExp(r'^[A-Za-z]{2}$');

/// Travel requirements lookup. The inputs are typed here only and sent as query parameters: nothing is read
/// from the profile and nothing is stored. "No entry" means "no verified information", never "allowed".
class TravelScreen extends ConsumerStatefulWidget {
  const TravelScreen({super.key});
  @override
  ConsumerState<TravelScreen> createState() => _TravelState();
}

class _TravelState extends ConsumerState<TravelScreen> {
  final _nat = TextEditingController();
  final _dest = TextEditingController(text: 'IT');
  bool _busy = false;
  String? _natError, _destError;
  Object? _error;
  Map<String, dynamic>? _result;

  @override
  void dispose() {
    _nat.dispose();
    _dest.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    final l = AppL10n.of(context);
    final nat = _nat.text.trim(), dest = _dest.text.trim();
    setState(() {
      _natError = isoCodePattern.hasMatch(nat) ? null : l.travelCodeInvalid;
      _destError = isoCodePattern.hasMatch(dest) ? null : l.travelCodeInvalid;
    });
    if (_natError != null || _destError != null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(travelApiProvider).lookup(nationality: nat, destination: dest);
      if (mounted) setState(() => _result = r);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final r = _result;
    final items = _maps(r?['items']);
    return Scaffold(
      appBar: AppBar(title: Text(l.travelTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Text(l.travelIntro),
        const SizedBox(height: Tokens.s3),
        Notice(text: l.travelPrivacy),
        const SizedBox(height: Tokens.s3),
        TextField(
          key: const ValueKey('travel-nat'),
          controller: _nat,
          textCapitalization: TextCapitalization.characters,
          maxLength: 2,
          textDirection: TextDirection.ltr,
          decoration: InputDecoration(labelText: l.travelNationality, hintText: 'EG', helperText: l.travelCodeHelp, errorText: _natError),
        ),
        TextField(
          key: const ValueKey('travel-dest'),
          controller: _dest,
          textCapitalization: TextCapitalization.characters,
          maxLength: 2,
          textDirection: TextDirection.ltr,
          decoration: InputDecoration(labelText: l.travelDestination, hintText: 'IT', helperText: l.travelCodeHelp, errorText: _destError),
          onSubmitted: (_) => _run(),
        ),
        const SizedBox(height: Tokens.s3),
        FilledButton(key: const ValueKey('travel-run'), onPressed: _busy ? null : _run, child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.travelSearch)),
        const SizedBox(height: Tokens.s4),
        if (_error != null) Notice(key: const ValueKey('travel-error'), text: errorMessage(l, _error), kind: NoticeKind.danger),
        if (r != null && r['available'] != true) Notice(key: const ValueKey('travel-none'), title: l.travelNoneTitle, text: (r['message'] as String?) ?? l.travelNone, kind: NoticeKind.warning),
        for (final it in items)
          Card(
            key: ValueKey('travel-${it['slug']}'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${it['title'] ?? ''}', style: theme.textTheme.titleMedium),
                if (it['summary'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${it['summary']}')),
                if ('${it['requirements'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${it['requirements']}')),
                if ('${it['notes'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${it['notes']}', style: theme.textTheme.bodySmall)),
                const SizedBox(height: Tokens.s3),
                if (SourceInfo.fromJson(it['source']) case final s?) SourceBlock(source: s),
              ]),
            ),
          ),
        if (r != null) ...[
          const SizedBox(height: Tokens.s3),
          Notice(key: const ValueKey('travel-disclaimer'), text: (r['disclaimer'] as String?) ?? l.travelDisclaimer, kind: NoticeKind.warning),
        ],
      ]),
    );
  }
}
