import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/util/safe_url.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import '../tools/tools.dart' show formatEur;

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

/// Contract: `GET /billing/plans` (public, `meta.billing_available`), `GET /billing/subscription`,
/// `POST /billing/checkout {plan}` -> `{checkout_url}`, `POST /billing/cancel` (at period end), `GET /billing/invoices`.
/// The app never handles card data: checkout, when offered, is opened in the external browser.
class BillingApi {
  BillingApi(this._api);
  final ApiClient _api;

  Future<({List<Map<String, dynamic>> plans, bool available})> plans() async {
    final r = await _api.get('/billing/plans');
    return (plans: _maps(r.data), available: r.meta['billing_available'] == true);
  }

  Future<Map<String, dynamic>> subscription() async => (await _api.get('/billing/subscription')).map;
  Future<List<Map<String, dynamic>>> invoices() async => _maps((await _api.get('/billing/invoices')).data);
  Future<String?> checkout(String plan) async => (await _api.post('/billing/checkout', body: {'plan': plan})).map['checkout_url'] as String?;
  Future<Map<String, dynamic>> cancel() async => (await _api.post('/billing/cancel')).map;
}

final billingApiProvider = Provider<BillingApi>((ref) => BillingApi(ref.watch(apiClientProvider)));

final billingPlansProvider = FutureProvider.autoDispose<({List<Map<String, dynamic>> plans, bool available})>((ref) {
  ref.watch(localeProvider);
  return ref.watch(billingApiProvider).plans();
});
final billingSubscriptionProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) {
  ref.watch(localeProvider);
  return ref.watch(billingApiProvider).subscription();
});
final billingInvoicesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) => ref.watch(billingApiProvider).invoices());

String planPriceText(BuildContext context, AppL10n l, Map<String, dynamic> plan) {
  final p = plan['price'] is Map ? Map<String, dynamic>.from(plan['price'] as Map) : const <String, dynamic>{};
  final minor = (p['amount_minor'] as num?) ?? 0;
  if (minor == 0) return l.billingFree;
  final amount = p['currency'] == 'EUR' || p['currency'] == null ? formatEur(context, minor / 100) : '${(minor / 100).toStringAsFixed(2)} ${p['currency']}';
  return switch (p['interval']) { 'month' => l.billingPerMonth(amount), 'year' => l.billingPerYear(amount), _ => amount };
}

List<String> planFeatureLines(BuildContext context, AppL10n l, Map<String, dynamic> plan) {
  final f = plan['features'] is Map ? Map<String, dynamic>.from(plan['features'] as Map) : const <String, dynamic>{};
  String n(Object? x) => formatNumber(context, (x as num?) ?? 0);
  return [
    if (f['ai_daily_limit'] is num) l.billingFeatAi(n(f['ai_daily_limit'])),
    if (f['reminders_advanced'] == true) l.billingFeatReminders,
    if (f['document_ai'] == true) l.billingFeatDocAi,
    if (f['human_credits'] is num && (f['human_credits'] as num) > 0) l.billingFeatHuman(n(f['human_credits'])),
  ];
}

class BillingScreen extends ConsumerStatefulWidget {
  const BillingScreen({super.key});
  @override
  ConsumerState<BillingScreen> createState() => _BillingState();
}

class _BillingState extends ConsumerState<BillingScreen> {
  bool _busy = false;

  Future<void> _checkout(String plan) async {
    final l = AppL10n.of(context);
    setState(() => _busy = true);
    try {
      final url = await ref.read(billingApiProvider).checkout(plan);
      if (!mounted) return;
      if (safeHttpsUri(url) == null) {
        showSnack(context, l.billingCheckoutFailed);
      } else {
        await openUrlWithFeedback(context, url);
      }
    } catch (e) {
      if (mounted) showSnack(context, _checkoutError(l, e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _checkoutError(AppL10n l, Object e) {
    if (e is ApiException) {
      if (e.code == 'billing_unavailable') return l.billingUnavailableShort;
      if (e.code == 'already_subscribed') return l.billingAlreadySubscribed;
      if (e.code == 'plan_not_purchasable') return l.billingPlanNotPurchasable;
    }
    return errorMessage(l, e);
  }

  Future<void> _cancel() async {
    final l = AppL10n.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(l.billingCancelTitle),
        content: Text(l.billingCancelBody),
        actions: [
          TextButton(onPressed: () => Navigator.of(c).pop(false), child: Text(l.cancel)),
          FilledButton(key: const ValueKey('billing-cancel-confirm'), onPressed: () => Navigator.of(c).pop(true), child: Text(l.billingCancelConfirm)),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(billingApiProvider).cancel();
      ref.invalidate(billingSubscriptionProvider);
      if (mounted) showSnack(context, l.billingCancelled);
    } catch (e) {
      if (mounted) showSnack(context, e is NotFoundException ? l.billingNothingToCancel : errorMessage(l, e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final plans = ref.watch(billingPlansProvider);
    final sub = ref.watch(billingSubscriptionProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.billingTitle)),
      body: AsyncBody<({List<Map<String, dynamic>> plans, bool available})>(
        value: plans,
        onRetry: () {
          ref.invalidate(billingPlansProvider);
          ref.invalidate(billingSubscriptionProvider);
        },
        data: (p) {
          final s = sub.valueOrNull;
          final currentKey = '${(s?['plan'] as Map?)?['key'] ?? 'free'}';
          final paidActive = s != null && s['status'] != 'free' && s['status'] != null && currentKey != 'free';
          final canBuy = p.available && (s?['billing_available'] != false);
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            if (!p.available) ...[
              Notice(key: const ValueKey('billing-unavailable'), title: l.billingUnavailableTitle, text: l.billingUnavailableBody, kind: NoticeKind.info),
              const SizedBox(height: Tokens.s3),
            ],
            Text(l.billingCurrent, style: theme.textTheme.titleMedium),
            const SizedBox(height: Tokens.s2),
            if (sub.hasError)
              Notice(key: const ValueKey('billing-sub-error'), text: errorMessage(l, sub.error), kind: NoticeKind.danger)
            else if (s == null)
              const LoadingView()
            else
              Card(
                key: const ValueKey('billing-current'),
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s4),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${(s['plan'] as Map?)?['name'] ?? l.billingFree}', style: theme.textTheme.titleMedium),
                    Text(_statusLabel(l, '${s['status']}'), style: theme.textTheme.bodySmall),
                    if (s['current_period_end'] != null) Text(s['cancel_at_period_end'] == true ? l.billingAccessUntil(formatDate(context, '${s['current_period_end']}')) : l.billingRenews(formatDate(context, '${s['current_period_end']}'))),
                    if (s['cancel_at_period_end'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Pill(key: const ValueKey('billing-ending'), text: l.billingEnding, bg: Tokens.warningSoft, fg: Tokens.warning)),
                    if (paidActive && s['cancel_at_period_end'] != true)
                      Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: OutlinedButton(key: const ValueKey('billing-cancel'), onPressed: _busy ? null : _cancel, child: Text(l.billingCancel))),
                  ]),
                ),
              ),
            const SizedBox(height: Tokens.s5),
            Text(l.billingPlans, style: theme.textTheme.titleMedium),
            const SizedBox(height: Tokens.s2),
            if (p.plans.isEmpty) EmptyView(message: l.billingNoPlans, icon: Icons.workspace_premium_outlined),
            for (final plan in p.plans) _planCard(context, l, plan, current: '${plan['key']}' == currentKey, canBuy: canBuy),
            const SizedBox(height: Tokens.s4),
            Text(l.billingInvoices, style: theme.textTheme.titleMedium),
            const SizedBox(height: Tokens.s2),
            _invoices(context, l),
            const SizedBox(height: Tokens.s4),
            Text(l.billingPricesNote, style: theme.textTheme.bodySmall),
          ]);
        },
      ),
    );
  }

  String _statusLabel(AppL10n l, String status) => switch (status) {
        'active' => l.billingStatusActive,
        'past_due' => l.billingStatusPastDue,
        'canceled' || 'cancelled' => l.billingStatusCanceled,
        'free' => l.billingStatusFree,
        _ => status,
      };

  Widget _planCard(BuildContext context, AppL10n l, Map<String, dynamic> plan, {required bool current, required bool canBuy}) {
    final theme = Theme.of(context);
    final price = (plan['price'] as Map?)?['amount_minor'] as num? ?? 0;
    return Card(
      key: ValueKey('plan-${plan['key']}'),
      child: Padding(
        padding: const EdgeInsets.all(Tokens.s4),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text('${plan['name'] ?? plan['key']}', style: theme.textTheme.titleMedium)),
            if (current) Pill(text: l.billingYourPlan, bg: Tokens.primarySoft, fg: Tokens.primaryStrong),
          ]),
          Text(planPriceText(context, l, plan), style: theme.textTheme.titleSmall, textDirection: TextDirection.ltr),
          if ('${plan['description'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${plan['description']}')),
          for (final f in planFeatureLines(context, l, plan)) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Icon(Icons.check, size: 18, color: Tokens.success), const SizedBox(width: Tokens.s2), Expanded(child: Text(f))])),
          // Purchase is offered ONLY when the backend says billing is available; otherwise nothing to tap.
          if (!current && price > 0 && canBuy)
            Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: FilledButton(key: ValueKey('plan-buy-${plan['key']}'), onPressed: _busy ? null : () => _checkout('${plan['key']}'), child: Text(l.billingChoose))),
        ]),
      ),
    );
  }

  Widget _invoices(BuildContext context, AppL10n l) {
    final inv = ref.watch(billingInvoicesProvider);
    return inv.when(
      loading: () => const LoadingView(),
      error: (e, _) => Notice(text: errorMessage(l, e), kind: NoticeKind.danger),
      data: (list) {
        if (list.isEmpty) return Text(l.billingNoInvoices, key: const ValueKey('billing-no-invoices'));
        return Column(children: [
          for (final i in list)
            Card(
              child: ListTile(
                title: Text('${i['number']}', textDirection: TextDirection.ltr),
                subtitle: Text([formatDate(context, '${i['issued_at']}'), if ('${i['description'] ?? ''}'.isNotEmpty) '${i['description']}'].join('\n')),
                isThreeLine: '${i['description'] ?? ''}'.isNotEmpty,
                trailing: Text(i['currency'] == 'EUR' ? formatEur(context, ((i['total_minor'] as num?) ?? 0) / 100) : '${(((i['total_minor'] as num?) ?? 0) / 100).toStringAsFixed(2)} ${i['currency']}', textDirection: TextDirection.ltr),
              ),
            ),
        ]);
      },
    );
  }
}
