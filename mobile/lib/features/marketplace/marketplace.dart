import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/util/safe_url.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../core/widgets/report_dialog.dart';
import '../../l10n/app_localizations.dart';

/// Third-party marketplace (docs/API_SPEC.md "Marketplace"). Providers are NEVER presented as official:
/// the API's `notice` and `verification.label` are shown as given. A lead is a contact REQUEST, not a booking.
/// The provider portal (apply, listing, verification, leads, replies) is intentionally NOT in the app: web only.

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];
String _s(Object? v) => v == null ? '' : '$v';

/// Maps marketplace-specific error codes to localized text; everything else goes through [errorMessage].
String marketError(AppL10n l, Object? e) {
  if (e is ApiException) {
    switch (e.code) {
      case 'lead_cooldown':
        return l.leadCooldown;
      case 'account_too_new':
        return l.accountTooNew;
      case 'review_exists':
        return l.reviewExists;
      case 'already_reported':
        return l.reviewAlreadyReported;
    }
  }
  return errorMessage(l, e);
}

final providerMetaProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  try {
    return (await ref.watch(apiClientProvider).get('/providers/meta')).map;
  } catch (_) {
    return const {}; // filters are optional
  }
});

final providerDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, slug) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/providers/${Uri.encodeComponent(slug)}')).map;
});

final myLeadsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  return _maps((await ref.watch(apiClientProvider).get('/my/provider-leads')).data);
});

final myReviewsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  return _maps((await ref.watch(apiClientProvider).get('/my/provider-reviews')).data);
});

(Color, Color) _verifColors(String? status) => switch (status) {
      'verified' => (Tokens.successSoft, Tokens.success),
      'expired' => (Tokens.dangerSoft, Tokens.danger),
      _ => (Tokens.warningSoft, Tokens.warning),
    };

class VerificationPill extends StatelessWidget {
  const VerificationPill({super.key, required this.provider});
  final Map<String, dynamic> provider;
  @override
  Widget build(BuildContext context) {
    final v = provider['verification'] is Map ? Map<String, dynamic>.from(provider['verification'] as Map) : const <String, dynamic>{};
    final (bg, fg) = _verifColors(v['status'] as String?);
    final label = _s(v['label']);
    if (label.isEmpty) return const SizedBox.shrink();
    return Pill(key: const ValueKey('verification-label'), text: label, bg: bg, fg: fg, icon: v['status'] == 'verified' ? Icons.verified_outlined : Icons.help_outline);
  }
}

String _ratingText(AppL10n l, BuildContext context, Map<String, dynamic> p) {
  final r = p['rating'] is Map ? Map<String, dynamic>.from(p['rating'] as Map) : const <String, dynamic>{};
  final count = (r['count'] as num?)?.toInt() ?? 0;
  final avg = r['average'] as num?;
  return count == 0 || avg == null ? l.providersNoRatings : l.providersRating(formatNumber(context, double.parse(avg.toStringAsFixed(1))), formatNumber(context, count));
}

class ProvidersScreen extends ConsumerStatefulWidget {
  const ProvidersScreen({super.key});
  @override
  ConsumerState<ProvidersScreen> createState() => _ProvidersState();
}

class _ProvidersState extends ConsumerState<ProvidersScreen> {
  String _q = '';
  String? _category;
  bool _verified = false;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final meta = ref.watch(providerMetaProvider).valueOrNull ?? const {};
    final cats = _maps(meta['categories']);
    return Scaffold(
      appBar: AppBar(title: Text(l.providersTitle), actions: [IconButton(key: const ValueKey('providers-mine'), tooltip: l.myRequestsTitle, icon: const Icon(Icons.inbox_outlined), onPressed: () => context.push('/my/requests'))]),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_q|$_category|$_verified|${ref.watch(localeProvider).languageCode}',
        emptyText: l.providersEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/providers', query: {'page': page, 'per_page': 20, if (_q.isNotEmpty) 'q': _q, if (_category != null) 'category': _category, if (_verified) 'verified': 1});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        header: Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Notice(text: l.providersNoticeFallback, kind: NoticeKind.warning),
            const SizedBox(height: Tokens.s3),
            TextField(key: const ValueKey('providers-search'), textInputAction: TextInputAction.search, decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)), onSubmitted: (v) => setState(() => _q = v.trim())),
            if (cats.isNotEmpty) ...[
              const SizedBox(height: Tokens.s2),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: [
                  Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.allCategories), selected: _category == null, onSelected: (_) => setState(() => _category = null))),
                  for (final c in cats)
                    Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(_s(c['label'] ?? c['value'])), selected: _category == _s(c['value'] ?? c['key']), onSelected: (_) => setState(() => _category = _s(c['value'] ?? c['key'])))),
                ]),
              ),
            ],
            SwitchListTile(contentPadding: EdgeInsets.zero, value: _verified, onChanged: (v) => setState(() => _verified = v), title: Text(l.providersVerifiedOnly)),
          ]),
        ),
        itemBuilder: (context, p) => Card(
          child: InkWell(
            borderRadius: BorderRadius.circular(Tokens.radiusMd),
            onTap: () => context.push('/providers/${Uri.encodeComponent(_s(p['slug']))}'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_s(p['display_name'] ?? p['name']), style: Theme.of(context).textTheme.titleMedium),
                if (_s(p['headline']).isNotEmpty) Text(_s(p['headline'])),
                if (p['category_label'] != null || p['city'] != null) Text([p['category_label'], p['city'] is Map ? (p['city'] as Map)['name'] : p['city']].where((e) => e != null && '$e'.isNotEmpty).join(' · '), style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: Tokens.s2),
                Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [VerificationPill(provider: p), Pill(text: l.providersThirdParty)]),
                const SizedBox(height: Tokens.s1),
                Text(_ratingText(l, context, p), style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

class ProviderDetailScreen extends ConsumerWidget {
  const ProviderDetailScreen({super.key, required this.slug});
  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(providerDetailProvider(slug));
    return Scaffold(
      appBar: AppBar(title: Text(l.providersTitle)),
      body: AsyncBody<Map<String, dynamic>>(value: value, onRetry: () => ref.invalidate(providerDetailProvider(slug)), data: (p) => _ProviderView(slug: slug, provider: p)),
    );
  }
}

class _ProviderView extends ConsumerStatefulWidget {
  const _ProviderView({required this.slug, required this.provider});
  final String slug;
  final Map<String, dynamic> provider;
  @override
  ConsumerState<_ProviderView> createState() => _ProviderViewState();
}

class _ProviderViewState extends ConsumerState<_ProviderView> {
  List<Map<String, dynamic>> _reviews = [];
  bool _loadingReviews = true;
  Object? _reviewsError;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() {
      _loadingReviews = true;
      _reviewsError = null;
    });
    try {
      final r = await ref.read(apiClientProvider).get('/providers/${Uri.encodeComponent(widget.slug)}/reviews');
      if (mounted) setState(() => _reviews = _maps(r.data));
    } catch (e) {
      if (mounted) setState(() => _reviewsError = e);
    } finally {
      if (mounted) setState(() => _loadingReviews = false);
    }
  }

  Future<void> _report(Map<String, dynamic> review) async {
    final l = AppL10n.of(context);
    final res = await showDialog<({String reason, String note})>(context: context, builder: (_) => const ReportDialog());
    if (res == null || !mounted) return;
    try {
      await ref.read(apiClientProvider).post('/provider-reviews/${review['id']}/report', body: {'reason': res.reason, if (res.note.isNotEmpty) 'note': res.note});
      if (mounted) showSnack(context, l.reviewReportSent);
    } catch (e) {
      if (mounted) showSnack(context, marketError(l, e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final p = widget.provider;
    final services = [for (final s in (p['services'] as List? ?? const [])) s is Map ? _s(s['name']) : _s(s)].where((e) => e.isNotEmpty).toList();
    final languages = [for (final s in (p['languages'] as List? ?? const [])) _s(s).toUpperCase()].where((e) => e.isNotEmpty).toList();
    // Contact fields exist only when the provider opted in to show them.
    final contact = p['contact'] is Map ? Map<String, dynamic>.from(p['contact'] as Map) : const <String, dynamic>{};
    final website = _s(contact['website']);
    final contacts = [if (_s(contact['email']).isNotEmpty) _s(contact['email']), if (_s(contact['phone']).isNotEmpty) _s(contact['phone'])];
    final notice = _s(p['notice']).isNotEmpty ? _s(p['notice']) : l.providersNoticeFallback;
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      Text(_s(p['display_name'] ?? p['name']), style: theme.textTheme.titleLarge),
      if (p['category_label'] != null) Text(_s(p['category_label']), style: theme.textTheme.bodySmall),
      const SizedBox(height: Tokens.s2),
      Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [VerificationPill(provider: p), Pill(text: l.providersThirdParty)]),
      const SizedBox(height: Tokens.s3),
      Notice(key: const ValueKey('provider-notice'), text: notice, kind: NoticeKind.warning),
      if (_s(p['headline']).isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text(_s(p['headline']), style: theme.textTheme.titleSmall)),
      if (_s(p['description']).isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(_s(p['description']))),
      if (_s(p['availability_note']).isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(_s(p['availability_note']), style: theme.textTheme.bodySmall)),
      if (services.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [for (final s in services) Pill(text: s)])),
      if (languages.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(languages.join(' · '), style: theme.textTheme.bodySmall)),
      Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(_ratingText(l, context, p), style: theme.textTheme.bodySmall)),
      if (contacts.isNotEmpty || safeHttpsUri(website) != null) ...[
        const SizedBox(height: Tokens.s4),
        Text(l.providersContact, style: theme.textTheme.titleSmall),
        for (final c in contacts) SelectableText(c, textDirection: TextDirection.ltr),
        if (safeHttpsUri(website) != null) TextButton.icon(onPressed: () => openUrlWithFeedback(context, website), icon: const Icon(Icons.open_in_new, size: 18), label: Text(l.providersWebsite)),
      ],
      const SizedBox(height: Tokens.s4),
      FilledButton.icon(key: const ValueKey('provider-request'), onPressed: () => context.push('/providers/${Uri.encodeComponent(widget.slug)}/request'), icon: const Icon(Icons.send_outlined), label: Text(l.providersRequestContact)),
      const Divider(height: Tokens.s8),
      Text(l.reviewsTitle, style: theme.textTheme.titleMedium),
      const SizedBox(height: Tokens.s2),
      if (_loadingReviews) const Padding(padding: EdgeInsets.all(Tokens.s4), child: LinearProgressIndicator()),
      if (_reviewsError != null) Notice(text: errorMessage(l, _reviewsError), kind: NoticeKind.danger, trailing: TextButton(onPressed: _loadReviews, child: Text(l.retry))),
      if (!_loadingReviews && _reviewsError == null && _reviews.isEmpty) Text(l.reviewsEmpty, key: const ValueKey('reviews-empty')),
      for (final r in _reviews)
        Card(
          key: ValueKey('review-${r['id']}'),
          child: Padding(
            padding: const EdgeInsets.all(Tokens.s3),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                for (var i = 1; i <= 5; i++) Icon(i <= ((r['rating'] as num?) ?? 0) ? Icons.star : Icons.star_border, size: 18, color: Tokens.warning),
                const Spacer(),
                if (r['id'] != null) TextButton(key: ValueKey('report-${r['id']}'), onPressed: () => _report(r), child: Text(l.reviewReport)),
              ]),
              if (_s(r['body']).isNotEmpty) Text(_s(r['body'])),
              if (r['created_at'] != null) Text(formatDate(context, _s(r['created_at'])), style: theme.textTheme.bodySmall),
            ]),
          ),
        ),
      OutlinedButton.icon(key: const ValueKey('provider-write-review'), onPressed: () async {
        await context.push('/providers/${Uri.encodeComponent(widget.slug)}/review');
        if (mounted) _loadReviews();
      }, icon: const Icon(Icons.rate_review_outlined), label: Text(l.reviewWrite)),
    ]);
  }
}

/// Contact request: message + an explicit, unchecked-by-default consent to share the user's contact details.
class ProviderLeadScreen extends ConsumerStatefulWidget {
  const ProviderLeadScreen({super.key, required this.slug});
  final String slug;
  @override
  ConsumerState<ProviderLeadScreen> createState() => _LeadState();
}

class _LeadState extends ConsumerState<ProviderLeadScreen> {
  final _message = TextEditingController();
  bool _consent = false, _busy = false, _sent = false;
  Object? _error;
  String? _local;

  @override
  void dispose() {
    _message.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final l = AppL10n.of(context);
    if (_message.text.trim().isEmpty) return setState(() => _local = l.leadMessageRequired);
    if (!_consent) return setState(() => _local = l.leadNeedConsent);
    setState(() {
      _busy = true;
      _error = null;
      _local = null;
    });
    try {
      await ref.read(apiClientProvider).post('/providers/${Uri.encodeComponent(widget.slug)}/leads', body: {'message': _message.text.trim(), 'request_type': 'contact', 'consent_share_contact': true, 'preferred_language': ref.read(localeProvider).languageCode});
      ref.invalidate(myLeadsProvider);
      if (mounted) setState(() => _sent = true);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.leadTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        if (_sent) ...[
          Notice(key: const ValueKey('lead-sent'), text: l.leadSent, kind: NoticeKind.success),
          const SizedBox(height: Tokens.s3),
          OutlinedButton(onPressed: () => context.push('/my/requests'), child: Text(l.myRequestsTitle)),
        ] else ...[
          Notice(text: l.leadIntro),
          const SizedBox(height: Tokens.s3),
          if (_local != null || _error != null) ...[Notice(key: const ValueKey('lead-error'), text: _local ?? marketError(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
          TextField(key: const ValueKey('lead-message'), controller: _message, minLines: 4, maxLines: 8, maxLength: 2000, decoration: InputDecoration(labelText: l.leadMessage, alignLabelWithHint: true)),
          CheckboxListTile(key: const ValueKey('lead-consent'), contentPadding: EdgeInsets.zero, controlAffinity: ListTileControlAffinity.leading, value: _consent, onChanged: (v) => setState(() => _consent = v ?? false), title: Text(l.leadConsent)),
          const SizedBox(height: Tokens.s2),
          FilledButton(key: const ValueKey('lead-send'), onPressed: _busy ? null : _send, child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.leadSend)),
        ],
      ]),
    );
  }
}

class ProviderReviewScreen extends ConsumerStatefulWidget {
  const ProviderReviewScreen({super.key, required this.slug});
  final String slug;
  @override
  ConsumerState<ProviderReviewScreen> createState() => _ReviewState();
}

class _ReviewState extends ConsumerState<ProviderReviewScreen> {
  final _body = TextEditingController();
  int _rating = 0;
  bool _busy = false, _done = false;
  Object? _error;
  String? _local;

  @override
  void dispose() {
    _body.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final l = AppL10n.of(context);
    if (_rating < 1) return setState(() => _local = l.reviewRatingRequired);
    setState(() {
      _busy = true;
      _error = null;
      _local = null;
    });
    try {
      await ref.read(apiClientProvider).post('/providers/${Uri.encodeComponent(widget.slug)}/reviews', body: {'rating': _rating, if (_body.text.trim().isNotEmpty) 'body': _body.text.trim()});
      ref.invalidate(myReviewsProvider);
      if (mounted) setState(() => _done = true);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.reviewWrite)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        if (_done)
          Notice(key: const ValueKey('review-pending'), text: l.reviewPending, kind: NoticeKind.success)
        else ...[
          if (_local != null || _error != null) ...[Notice(key: const ValueKey('review-error'), text: _local ?? marketError(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
          Text(l.reviewRating, style: Theme.of(context).textTheme.titleSmall),
          Row(children: [
            for (var i = 1; i <= 5; i++)
              IconButton(key: ValueKey('star-$i'), tooltip: '$i', onPressed: () => setState(() => _rating = i), icon: Icon(i <= _rating ? Icons.star : Icons.star_border, color: Tokens.warning)),
          ]),
          TextField(key: const ValueKey('review-body'), controller: _body, minLines: 3, maxLines: 6, maxLength: 1000, decoration: InputDecoration(labelText: l.reviewBody, alignLabelWithHint: true)),
          const SizedBox(height: Tokens.s2),
          FilledButton(key: const ValueKey('review-send'), onPressed: _busy ? null : _send, child: Text(l.reviewSend)),
        ],
      ]),
    );
  }
}

String _statusLabel(AppL10n l, Object? s) => switch (s) { 'pending' => l.statusPending, 'approved' => l.statusApproved, 'rejected' => l.statusRejected, 'seen' => l.statusSeen, 'closed' => l.statusClosed, 'new' => l.statusNew, _ => _s(s) };

/// "My requests": the contact requests the user sent and the reviews they wrote (own data only).
class MyRequestsScreen extends ConsumerWidget {
  const MyRequestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final leads = ref.watch(myLeadsProvider);
    final reviews = ref.watch(myReviewsProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.myRequestsTitle)),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(myLeadsProvider);
          ref.invalidate(myReviewsProvider);
        },
        child: ListView(physics: const AlwaysScrollableScrollPhysics(), padding: const EdgeInsets.all(Tokens.s4), children: [
          Text(l.myRequestsLeads, style: theme.textTheme.titleMedium),
          const SizedBox(height: Tokens.s2),
          AsyncBody<List<Map<String, dynamic>>>(
            value: leads,
            onRetry: () => ref.invalidate(myLeadsProvider),
            data: (list) => list.isEmpty
                ? Text(l.myRequestsEmpty, key: const ValueKey('leads-empty'))
                : Column(children: [
                    for (final x in list)
                      Card(
                        child: ListTile(
                          title: Text(_s((x['provider'] is Map ? (x['provider'] as Map)['display_name'] : null) ?? '')),
                          subtitle: Text([_s(x['message']), _statusLabel(l, x['status']), if (x['created_at'] != null) formatDate(context, _s(x['created_at']))].where((e) => e.isNotEmpty).join('\n')),
                          isThreeLine: true,
                        ),
                      ),
                  ]),
          ),
          const Divider(height: Tokens.s8),
          Text(l.myRequestsReviews, style: theme.textTheme.titleMedium),
          const SizedBox(height: Tokens.s2),
          AsyncBody<List<Map<String, dynamic>>>(
            value: reviews,
            onRetry: () => ref.invalidate(myReviewsProvider),
            data: (list) => list.isEmpty
                ? Text(l.myReviewsEmpty, key: const ValueKey('reviews-mine-empty'))
                : Column(children: [
                    for (final x in list)
                      Card(
                        child: ListTile(
                          title: Text(_s((x['provider'] is Map ? (x['provider'] as Map)['display_name'] : null) ?? '')),
                          subtitle: Text(['★' * ((x['rating'] as num?)?.toInt() ?? 0), _s(x['body']), _statusLabel(l, x['status'])].where((e) => e.isNotEmpty).join('\n')),
                          isThreeLine: true,
                          trailing: IconButton(
                            key: ValueKey('delete-review-${x['id']}'),
                            tooltip: l.myReviewDelete,
                            icon: const Icon(Icons.delete_outline),
                            onPressed: () async {
                              try {
                                await ref.read(apiClientProvider).delete('/my/provider-reviews/${x['id']}');
                                ref.invalidate(myReviewsProvider);
                                if (context.mounted) showSnack(context, l.myReviewDeleted);
                              } catch (e) {
                                if (context.mounted) showSnack(context, errorMessage(l, e));
                              }
                            },
                          ),
                        ),
                      ),
                  ]),
          ),
        ]),
      ),
    );
  }
}
