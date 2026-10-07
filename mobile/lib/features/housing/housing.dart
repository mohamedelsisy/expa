import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import '../documents/documents.dart' show grantConsent;

/// `POST /housing/check` (auth, verified e-mail, consent `housing_analysis`, quota `housing_check`).
/// Mobile never sets `save`: the pasted text is analysed and not stored. Contract: docs/API_SPEC.md.
class HousingApi {
  HousingApi(this._api);
  final ApiClient _api;

  Future<Map<String, dynamic>> check(String text, {bool explain = false, Map<String, num> extra = const {}}) async =>
      (await _api.post('/housing/check', body: {'text': text, 'explain': explain, 'save': false, if (extra.isNotEmpty) 'extra': extra})).map;

  Future<int?> remaining() async {
    try {
      final m = (await _api.get('/housing/usage')).map;
      return (m['remaining'] as num?)?.toInt() ?? ((m['usage'] as Map?)?['remaining'] as num?)?.toInt();
    } catch (_) {
      return null;
    }
  }
}

final housingApiProvider = Provider<HousingApi>((ref) => HousingApi(ref.watch(apiClientProvider)));
final housingRemainingProvider = FutureProvider.autoDispose<int?>((ref) => ref.watch(housingApiProvider).remaining());

String confidenceLabel(AppL10n l, String? c) => switch (c) { 'high' => l.confHigh, 'medium' => l.confMedium, 'low' => l.confLow, _ => c ?? '' };

class HousingCheckerScreen extends ConsumerStatefulWidget {
  const HousingCheckerScreen({super.key});
  @override
  ConsumerState<HousingCheckerScreen> createState() => _HousingState();
}

class _HousingState extends ConsumerState<HousingCheckerScreen> {
  final _text = TextEditingController();
  final _extra = {'rent_monthly': TextEditingController(), 'utilities_monthly': TextEditingController(), 'condo_fees_monthly': TextEditingController(), 'internet_monthly': TextEditingController()};
  bool _explain = false, _busy = false;
  Object? _error;
  Map<String, dynamic>? _result;

  @override
  void dispose() {
    _text.dispose();
    for (final c in _extra.values) {
      c.dispose();
    }
    super.dispose();
  }

  bool get _consentMissing => _error is ForbiddenException && (_error as ForbiddenException).consentRequired;

  Future<void> _send() async {
    final l = AppL10n.of(context);
    if (_text.text.trim().length < 20) {
      setState(() => _error = ValidationException(l.housingTextTooShort));
      return;
    }
    final extra = <String, num>{};
    _extra.forEach((k, c) {
      final v = num.tryParse(c.text.trim().replaceAll(',', '.'));
      if (v != null && v >= 0) extra[k] = v;
    });
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(housingApiProvider).check(_text.text.trim(), explain: _explain, extra: extra);
      ref.invalidate(housingRemainingProvider);
      if (mounted) setState(() => _result = r);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _grant() async {
    final l = AppL10n.of(context);
    try {
      await grantConsent(ref, 'housing_analysis');
      if (!mounted) return;
      setState(() => _error = null);
      showSnack(context, l.housingConsentGranted);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    }
  }

  String _errorText(AppL10n l) {
    final e = _error;
    if (_consentMissing) return l.housingConsentNeeded;
    if (e is RateLimitedException && e.code == 'quota_reached') return l.housingQuotaReached;
    return errorMessage(l, e);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.housingTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        if (_error != null) ...[
          Notice(
            key: const ValueKey('housing-error'),
            text: _errorText(l),
            kind: _consentMissing ? NoticeKind.warning : NoticeKind.danger,
            trailing: _consentMissing ? TextButton(key: const ValueKey('housing-grant'), onPressed: _grant, child: Text(l.grantConsent)) : null,
          ),
          const SizedBox(height: Tokens.s3),
        ],
        if (_result == null) ..._form(context, l) else ..._resultView(context, l, _result!),
      ]),
    );
  }

  List<Widget> _form(BuildContext context, AppL10n l) {
    final remaining = ref.watch(housingRemainingProvider).valueOrNull;
    final labels = {'rent_monthly': l.housingRent, 'utilities_monthly': l.housingUtilities, 'condo_fees_monthly': l.housingCondo, 'internet_monthly': l.housingInternet};
    return [
      Text(l.housingIntro),
      if (remaining != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.housingQuotaLeft(formatNumber(context, remaining)), key: const ValueKey('housing-quota'), style: Theme.of(context).textTheme.bodySmall)),
      const SizedBox(height: Tokens.s3),
      TextField(
        key: const ValueKey('housing-text'),
        controller: _text,
        minLines: 6,
        maxLines: 14,
        maxLength: 12000,
        decoration: InputDecoration(labelText: l.housingTextLabel, hintText: l.housingTextHint, alignLabelWithHint: true),
      ),
      const SizedBox(height: Tokens.s2),
      Text(l.housingExtraTitle, style: Theme.of(context).textTheme.titleSmall),
      const SizedBox(height: Tokens.s2),
      for (final e in _extra.entries)
        Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s2),
          child: TextField(key: ValueKey('housing-${e.key}'), controller: e.value, keyboardType: const TextInputType.numberWithOptions(decimal: true), textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: labels[e.key], suffixText: '€')),
        ),
      SwitchListTile(contentPadding: EdgeInsets.zero, value: _explain, onChanged: (v) => setState(() => _explain = v), title: Text(l.housingExplain)),
      const SizedBox(height: Tokens.s2),
      FilledButton(
        key: const ValueKey('housing-send'),
        onPressed: _busy ? null : _send,
        child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.housingSend),
      ),
    ];
  }

  String _money(BuildContext context, num v, String? currency) => '${formatNumber(context, v)} ${currency ?? 'EUR'}';

  List<Widget> _resultView(BuildContext context, AppL10n l, Map<String, dynamic> r) {
    final theme = Theme.of(context);
    List<Map<String, dynamic>> maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];
    final facts = (r['facts'] as Map?) ?? const {};
    final flags = maps(r['red_flags']);
    final questions = maps(r['questions']);
    final missing = maps(r['could_not_detect']);
    final cost = (r['cost'] as Map?) ?? const {};
    final currency = cost['currency'] as String?;
    final comps = maps(cost['components']);
    final assumptions = maps(cost['assumptions']);
    final oneTime = maps(cost['one_time']);
    final notes = [for (final n in (r['notes'] as List? ?? const [])) n is Map ? '${n['text'] ?? ''}' : '$n'].where((e) => e.isNotEmpty).toList();
    final explanation = r['explanation'] is Map ? Map<String, dynamic>.from(r['explanation'] as Map) : null;
    final total = cost['monthly_total'] as num?;
    final factLines = <String>[
      if (facts['rent_monthly'] is num) l.housingFactRent(_money(context, facts['rent_monthly'] as num, currency)),
      if (facts['deposit_amount'] is num) l.housingFactDeposit(_money(context, facts['deposit_amount'] as num, currency)),
      if (facts['deposit_months'] is num) l.housingFactDepositMonths(formatNumber(context, facts['deposit_months'] as num)),
      if (facts['utilities'] == 'included') l.housingFactUtilitiesIncluded,
      if (facts['utilities'] == 'excluded') l.housingFactUtilitiesExcluded,
      if (facts['expenses_monthly'] is num) l.housingFactExpenses(_money(context, facts['expenses_monthly'] as num, currency)),
    ];
    String oneLabel(String? k) => switch (k) { 'deposit' => l.housingOneDeposit, 'agency_fee' => l.housingOneAgencyFee, _ => k ?? '' };
    String compLabel(String? k) => switch (k) { 'rent' => l.housingCompRent, 'utilities' => l.housingCompUtilities, 'condo_fees' || 'condo' => l.housingCompCondo, 'internet' => l.housingCompInternet, _ => k ?? '' };
    Widget section(String title, List<Widget> children) => Padding(
          padding: const EdgeInsets.only(top: Tokens.s5),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: theme.textTheme.titleMedium), const SizedBox(height: Tokens.s2), ...children]),
        );
    Widget bullet(String t) => Padding(padding: const EdgeInsets.only(bottom: Tokens.s1), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('•  '), Expanded(child: Text(t))]));
    return [
      if (r['confidence'] != null) Text(l.housingConfidence(confidenceLabel(l, '${r['confidence']}')), key: const ValueKey('housing-confidence'), style: theme.textTheme.titleSmall),
      if (factLines.isNotEmpty) section(l.housingFacts, [for (final f in factLines) bullet(f)]),
      section(l.housingRedFlags, [
        if (flags.isEmpty) Text(l.housingNoRedFlags, key: const ValueKey('housing-no-flags')),
        for (final f in flags)
          Card(
            key: ValueKey('flag-${f['id']}'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s3),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
                  Pill(
                    text: switch (f['severity']) { 'warning' => l.housingSevWarning, 'caution' => l.housingSevCaution, 'info' => l.housingSevInfo, _ => '${f['severity'] ?? ''}' },
                    bg: f['severity'] == 'warning' ? Tokens.dangerSoft : (f['severity'] == 'info' ? Tokens.infoSoft : Tokens.warningSoft),
                    fg: f['severity'] == 'warning' ? Tokens.danger : (f['severity'] == 'info' ? Tokens.info : Tokens.warning),
                    icon: Icons.flag_outlined,
                  ),
                  Pill(text: f['basis'] == 'sourced' ? l.housingBasisSourced : l.housingBasisGeneral),
                ]),
                const SizedBox(height: Tokens.s1),
                Text('${f['title'] ?? ''}', style: theme.textTheme.titleSmall),
                if (f['explanation'] != null) Text('${f['explanation']}'),
                if (f['source'] is Map && safeSourceName(f['source']) != null) Text(safeSourceName(f['source'])!, style: theme.textTheme.bodySmall),
              ]),
            ),
          ),
      ]),
      if (questions.isNotEmpty) section(l.housingQuestions, [for (final q in questions) bullet('${q['question'] ?? q['title'] ?? ''}')]),
      if (missing.isNotEmpty) section(l.housingCouldNotDetect, [for (final m in missing) bullet('${m['label'] ?? m['key'] ?? ''}')]),
      section(l.housingCost, [
        Text(total == null ? l.housingCostUnknown : l.housingCostTotal(_money(context, total, currency)), key: const ValueKey('housing-cost-total')),
        for (final c in comps) bullet('${compLabel(c['key'] as String?)}: ${_money(context, (c['amount'] as num?) ?? 0, currency)} (${c['source'] == 'user' ? l.housingSourceUser : l.housingSourceText})'),
        if (oneTime.isNotEmpty) ...[const SizedBox(height: Tokens.s2), Text(l.housingOneTime, style: theme.textTheme.titleSmall), for (final o in oneTime) bullet('${oneLabel(o['key'] as String?)}${o['amount'] is num ? ': ${_money(context, o['amount'] as num, currency)}' : ''}')],
        if (assumptions.isNotEmpty) ...[const SizedBox(height: Tokens.s2), Text(l.housingAssumptions, style: theme.textTheme.titleSmall), for (final a in assumptions) bullet('${a['text'] ?? ''}')],
      ]),
      if (notes.isNotEmpty) section(l.housingNotes, [for (final n in notes) bullet(n)]),
      if (explanation != null && '${explanation['text'] ?? ''}'.isNotEmpty) section(l.housingAiExplanation, [Text('${explanation['text']}', key: const ValueKey('housing-explanation'))]),
      const SizedBox(height: Tokens.s4),
      // Separate, always-visible statement: the checker never gives a legal conclusion.
      Notice(key: const ValueKey('housing-disclaimer'), title: l.housingDisclaimerTitle, text: (r['disclaimer'] as String?)?.trim().isNotEmpty == true ? r['disclaimer'] as String : l.housingFallbackDisclaimer, kind: NoticeKind.warning),
      const SizedBox(height: Tokens.s3),
      OutlinedButton(onPressed: () => setState(() => _result = null), child: Text(l.housingAnother)),
    ];
  }
}

String? safeSourceName(Object? source) {
  if (source is! Map) return null;
  final n = source['name'] ?? source['title'];
  return n == null || '$n'.isEmpty ? null : '$n';
}
