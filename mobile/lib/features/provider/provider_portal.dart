import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_controller.dart';
import '../marketplace/marketplace.dart' show providerMetaProvider;
import '../scanner/scanner_screen.dart' show imageCaptureProvider;
import '../scanner/scanner_service.dart';

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

/// Provider self-service API (`/provider/*`, role `provider` + a listing owned by the caller; the API resolves the
/// listing from the account and enforces everything: this client only gates which screens it shows).
class ProviderPortalApi {
  ProviderPortalApi(this._api);
  final ApiClient _api;

  Future<Map<String, dynamic>> profile() async => (await _api.get('/provider/profile')).map;
  Future<Map<String, dynamic>> apply(Map<String, dynamic> body) async => (await _api.post('/provider/apply', body: body)).map;
  Future<Map<String, dynamic>> update(Map<String, dynamic> body) async => (await _api.patch('/provider/profile', body: body)).map;
  Future<Map<String, dynamic>> submit() async => (await _api.post('/provider/profile/submit')).map;
  Future<List<Map<String, dynamic>>> evidence() async => _maps((await _api.get('/provider/verification/documents')).data);
  Future<void> uploadEvidence(CapturedImage image) async {
    final form = FormData.fromMap({'file': MultipartFile.fromBytes(image.bytes, filename: image.filename, contentType: DioMediaType.parse(image.mimeType))});
    await _api.post('/provider/verification/documents', body: form);
  }

  Future<void> deleteEvidence(int id) async => _api.delete('/provider/verification/documents/$id');
  Future<Map<String, dynamic>> requestVerification() async => (await _api.post('/provider/verification/request')).map;
  Future<PageResult<Map<String, dynamic>>> leads(int page) async {
    final r = await _api.get('/provider/leads', query: {'page': page, 'per_page': 20});
    return pageFrom(r.list, r.meta, (m) => m);
  }

  Future<void> setLeadStatus(int id, String status) async => _api.patch('/provider/leads/$id', body: {'status': status});
  Future<List<Map<String, dynamic>>> reviews() async => _maps((await _api.get('/provider/reviews')).data);
  Future<void> reply(int reviewId, String body) async => _api.post('/provider/reviews/$reviewId/reply', body: {'body': body});
}

final providerPortalApiProvider = Provider<ProviderPortalApi>((ref) => ProviderPortalApi(ref.watch(apiClientProvider)));

/// Null when the account has no listing (403 `provider_account_required`): the apply form is shown instead.
final providerProfileProvider = FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  ref.watch(localeProvider);
  try {
    return await ref.watch(providerPortalApiProvider).profile();
  } on ForbiddenException catch (e) {
    if (e.code == 'provider_account_required') return null;
    rethrow;
  }
});

final providerEvidenceProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) => ref.watch(providerPortalApiProvider).evidence());
final providerReviewsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) => ref.watch(providerPortalApiProvider).reviews());

String statusLabel(AppL10n l, String? s) => switch (s) {
      'draft' => l.provStatusDraft,
      'review' => l.provStatusReview,
      'approved' => l.provStatusApproved,
      'published' => l.provStatusPublished,
      'archived' => l.provStatusArchived,
      _ => s ?? '',
    };

String verificationLabel(AppL10n l, String? s) => switch (s) {
      'verified' => l.provVerified,
      'pending' => l.provVerifPending,
      'rejected' => l.provVerifRejected,
      'expired' => l.provVerifExpired,
      _ => l.provVerifNone,
    };

/// Entry point (`/provider`). Everyone signed in can reach it; the content depends on the account:
/// no listing -> apply form; listing -> tabs. The profile menu shows the entry for provider accounts (and for
/// everyone as "Become a provider").
class ProviderPortalScreen extends ConsumerWidget {
  const ProviderPortalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final user = ref.watch(authControllerProvider).user;
    final value = ref.watch(providerProfileProvider);
    return value.when(
      loading: () => Scaffold(appBar: AppBar(title: Text(l.provTitle)), body: const LoadingView()),
      error: (e, _) => Scaffold(appBar: AppBar(title: Text(l.provTitle)), body: ErrorView(error: e, onRetry: () => ref.invalidate(providerProfileProvider))),
      data: (p) {
        if (p == null) {
          return Scaffold(
            appBar: AppBar(title: Text(l.provApplyTitle)),
            body: user != null && !user.emailVerified ? Padding(padding: const EdgeInsets.all(Tokens.s4), child: Notice(key: const ValueKey('prov-verify-email'), text: l.askVerifyEmail, kind: NoticeKind.warning)) : const ProviderApplyForm(),
          );
        }
        return DefaultTabController(
          length: 4,
          child: Scaffold(
            appBar: AppBar(
              title: Text(l.provTitle),
              bottom: TabBar(isScrollable: true, tabAlignment: TabAlignment.start, tabs: [
                Tab(key: const ValueKey('prov-tab-profile'), text: l.provTabProfile),
                Tab(key: const ValueKey('prov-tab-verification'), text: l.provTabVerification),
                Tab(key: const ValueKey('prov-tab-leads'), text: l.provTabLeads),
                Tab(key: const ValueKey('prov-tab-reviews'), text: l.provTabReviews),
              ]),
            ),
            body: TabBarView(children: [
              ProviderProfileTab(profile: p),
              ProviderVerificationTab(profile: p),
              const ProviderLeadsTab(),
              const ProviderReviewsTab(),
            ]),
          ),
        );
      },
    );
  }
}

// ------------------------------------------------------------------ shared form pieces

Map<String, dynamic> _translationsFor(String lang, {required String headline, required String description}) => {
      lang: {'headline': headline.trim(), if (description.trim().isNotEmpty) 'description': description.trim()},
    };

class _ListingFields extends ConsumerWidget {
  const _ListingFields({required this.name, required this.headline, required this.description, required this.email, required this.phone, required this.website, required this.category, required this.onCategory, required this.online, required this.onOnline, this.errors = const {}});
  final TextEditingController name, headline, description, email, phone, website;
  final String? category;
  final ValueChanged<String?> onCategory;
  final bool online;
  final ValueChanged<bool> onOnline;
  final Map<String, String> errors;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final meta = ref.watch(providerMetaProvider).valueOrNull;
    final cats = _maps(meta?['categories']);
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      TextField(key: const ValueKey('prov-name'), controller: name, maxLength: 160, decoration: InputDecoration(labelText: l.provDisplayName, errorText: errors['display_name'])),
      if (cats.isNotEmpty)
        DropdownButtonFormField<String>(
          key: const ValueKey('prov-category'),
          isExpanded: true,
          initialValue: cats.any((c) => '${c['value']}' == category) ? category : null,
          decoration: InputDecoration(labelText: l.provCategory, errorText: errors['category']),
          items: [for (final c in cats) DropdownMenuItem(value: '${c['value']}', child: Text('${c['label'] ?? c['value']}', overflow: TextOverflow.ellipsis))],
          onChanged: onCategory,
        ),
      const SizedBox(height: Tokens.s2),
      TextField(key: const ValueKey('prov-headline'), controller: headline, maxLength: 200, decoration: InputDecoration(labelText: l.provHeadline, helperText: l.provLanguageNote, errorText: errors['headline'])),
      TextField(key: const ValueKey('prov-description'), controller: description, minLines: 3, maxLines: 8, maxLength: 5000, decoration: InputDecoration(labelText: l.provDescription, alignLabelWithHint: true)),
      TextField(key: const ValueKey('prov-email'), controller: email, keyboardType: TextInputType.emailAddress, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.provContactEmail, errorText: errors['contact_email'])),
      TextField(key: const ValueKey('prov-phone'), controller: phone, keyboardType: TextInputType.phone, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.provContactPhone, errorText: errors['contact_phone'])),
      TextField(key: const ValueKey('prov-website'), controller: website, keyboardType: TextInputType.url, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.provWebsite, hintText: 'https://', errorText: errors['website'])),
      SwitchListTile(key: const ValueKey('prov-online'), contentPadding: EdgeInsets.zero, title: Text(l.provServesOnline), value: online, onChanged: onOnline),
    ]);
  }
}

Map<String, String> _fieldErrors(Object? e) {
  if (e is! ValidationException) return const {};
  return {for (final k in e.details.entries) k.key.replaceFirst(RegExp(r'^translations\.[a-z]{2}\.'), ''): k.value.first};
}

class ProviderApplyForm extends ConsumerStatefulWidget {
  const ProviderApplyForm({super.key});
  @override
  ConsumerState<ProviderApplyForm> createState() => _ApplyState();
}

class _ApplyState extends ConsumerState<ProviderApplyForm> {
  final _name = TextEditingController(), _headline = TextEditingController(), _description = TextEditingController(), _email = TextEditingController(), _phone = TextEditingController(), _website = TextEditingController();
  String? _category;
  bool _online = true, _busy = false;
  Object? _error;

  @override
  void dispose() {
    for (final c in [_name, _headline, _description, _email, _phone, _website]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _apply() async {
    final l = AppL10n.of(context);
    if (_name.text.trim().isEmpty || _category == null || _headline.text.trim().isEmpty) {
      setState(() => _error = ValidationException(l.provRequiredFields, code: 'validation'));
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final lang = ref.read(localeProvider).languageCode;
      await ref.read(providerPortalApiProvider).apply({
        'display_name': _name.text.trim(),
        'category': _category,
        'serves_online': _online,
        'languages': [lang],
        if (_email.text.trim().isNotEmpty) 'contact_email': _email.text.trim(),
        if (_phone.text.trim().isNotEmpty) 'contact_phone': _phone.text.trim(),
        if (_website.text.trim().isNotEmpty) 'website': _website.text.trim(),
        'translations': _translationsFor(lang, headline: _headline.text, description: _description.text),
      });
      // The role was just granted: refresh the signed-in user so the profile menu shows the portal.
      await ref.read(authControllerProvider.notifier).refreshUser();
      ref.invalidate(providerProfileProvider);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final err = _error;
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      Text(l.provApplyIntro),
      const SizedBox(height: Tokens.s2),
      Notice(text: l.provApplyNotice),
      const SizedBox(height: Tokens.s3),
      if (err != null) ...[
        Notice(key: const ValueKey('prov-apply-error'), text: err is ApiException && err.code == 'provider_exists' ? l.provExists : errorMessage(l, err), kind: NoticeKind.danger),
        const SizedBox(height: Tokens.s3),
      ],
      _ListingFields(name: _name, headline: _headline, description: _description, email: _email, phone: _phone, website: _website, category: _category, onCategory: (v) => setState(() => _category = v), online: _online, onOnline: (v) => setState(() => _online = v), errors: _fieldErrors(err)),
      const SizedBox(height: Tokens.s3),
      FilledButton(key: const ValueKey('prov-apply'), onPressed: _busy ? null : _apply, child: _busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.provApply)),
    ]);
  }
}

// ------------------------------------------------------------------ profile tab

class ProviderProfileTab extends ConsumerStatefulWidget {
  const ProviderProfileTab({super.key, required this.profile});
  final Map<String, dynamic> profile;
  @override
  ConsumerState<ProviderProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends ConsumerState<ProviderProfileTab> {
  late final _name = TextEditingController(text: '${widget.profile['display_name'] ?? ''}');
  late final _email = TextEditingController(text: '${widget.profile['contact_email'] ?? ''}');
  late final _phone = TextEditingController(text: '${widget.profile['contact_phone'] ?? ''}');
  late final _website = TextEditingController(text: '${widget.profile['website'] ?? ''}');
  late final _headline = TextEditingController();
  late final _description = TextEditingController();
  late String? _category = widget.profile['category'] as String?;
  late bool _online = widget.profile['serves_online'] != false;
  bool _busy = false, _loadedLang = false;
  Object? _error;
  String? _message;

  Map<String, dynamic> _tr(String lang) => Map<String, dynamic>.from(((widget.profile['translations'] as Map?)?[lang] as Map?) ?? const {});

  @override
  void dispose() {
    for (final c in [_name, _email, _phone, _website, _headline, _description]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final l = AppL10n.of(context);
    final lang = ref.read(localeProvider).languageCode;
    setState(() {
      _busy = true;
      _error = null;
      _message = null;
    });
    try {
      final r = await ref.read(providerPortalApiProvider).update({
        'display_name': _name.text.trim(),
        'category': _category,
        'serves_online': _online,
        'contact_email': _email.text.trim().isEmpty ? null : _email.text.trim(),
        'contact_phone': _phone.text.trim().isEmpty ? null : _phone.text.trim(),
        'website': _website.text.trim().isEmpty ? null : _website.text.trim(),
        if (_headline.text.trim().isNotEmpty) 'translations': _translationsFor(lang, headline: _headline.text, description: _description.text),
      });
      ref.invalidate(providerProfileProvider);
      if (mounted) setState(() => _message = r['status'] == 'published' ? l.provSavedPendingApproval : l.provSaved);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _submit() async {
    final l = AppL10n.of(context);
    setState(() {
      _busy = true;
      _error = null;
      _message = null;
    });
    try {
      await ref.read(providerPortalApiProvider).submit();
      ref.invalidate(providerProfileProvider);
      if (mounted) setState(() => _message = l.provSubmitted);
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
    final p = widget.profile;
    final lang = ref.watch(localeProvider).languageCode;
    if (!_loadedLang) {
      _loadedLang = true;
      _headline.text = '${_tr(lang)['headline'] ?? ''}';
      _description.text = '${_tr(lang)['description'] ?? ''}';
    }
    final problems = [for (final x in (p['publish_problems'] as List? ?? const [])) if (x is Map) '${x['message'] ?? x['code'] ?? ''}' else '$x'];
    final status = '${p['status']}';
    final err = _error;
    final submitDetails = err is ValidationException && err.code == 'listing_incomplete';
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
        Pill(key: const ValueKey('prov-status'), text: statusLabel(l, status), bg: Tokens.primarySoft, fg: Tokens.primaryStrong),
        Pill(key: const ValueKey('prov-verification'), text: verificationLabel(l, '${p['effective_verification'] ?? p['verification_status']}')),
        if (p['has_pending_changes'] == true) Pill(text: l.provPendingChanges, bg: Tokens.warningSoft, fg: Tokens.warning),
      ]),
      if (status == 'published') Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.provPublishedEditNote, style: theme.textTheme.bodySmall)),
      if (problems.isNotEmpty && status != 'published') ...[
        const SizedBox(height: Tokens.s3),
        Notice(key: const ValueKey('prov-problems'), title: l.provProblems, text: problems.where((e) => e.isNotEmpty).join('\n'), kind: NoticeKind.warning),
      ],
      const SizedBox(height: Tokens.s3),
      if (err != null) ...[Notice(key: const ValueKey('prov-error'), text: submitDetails ? l.provListingIncomplete : errorMessage(l, err), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
      if (_message != null) ...[Notice(key: const ValueKey('prov-message'), text: _message!, kind: NoticeKind.success), const SizedBox(height: Tokens.s3)],
      _ListingFields(name: _name, headline: _headline, description: _description, email: _email, phone: _phone, website: _website, category: _category, onCategory: (v) => setState(() => _category = v), online: _online, onOnline: (v) => setState(() => _online = v), errors: _fieldErrors(err)),
      Notice(text: l.provServicesWebOnly),
      const SizedBox(height: Tokens.s3),
      FilledButton(key: const ValueKey('prov-save'), onPressed: _busy ? null : _save, child: Text(l.provSave)),
      if (status == 'draft' || status == 'archived') ...[
        const SizedBox(height: Tokens.s2),
        OutlinedButton(key: const ValueKey('prov-submit'), onPressed: _busy ? null : _submit, child: Text(l.provSubmit)),
      ],
    ]);
  }
}

// ------------------------------------------------------------------ verification tab

class ProviderVerificationTab extends ConsumerStatefulWidget {
  const ProviderVerificationTab({super.key, required this.profile});
  final Map<String, dynamic> profile;
  @override
  ConsumerState<ProviderVerificationTab> createState() => _VerificationState();
}

class _VerificationState extends ConsumerState<ProviderVerificationTab> {
  bool _busy = false;
  Object? _error;
  String? _message;

  Future<void> _run(Future<void> Function() job, String? ok) async {
    setState(() {
      _busy = true;
      _error = null;
      _message = null;
    });
    try {
      await job();
      if (mounted) setState(() => _message = ok);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _upload() async {
    final l = AppL10n.of(context);
    final capture = ref.read(imageCaptureProvider);
    await _run(() async {
      final img = await capture.capture(fromCamera: false);
      if (img == null) return;
      await ref.read(providerPortalApiProvider).uploadEvidence(img);
      ref.invalidate(providerEvidenceProvider);
    }, l.provEvidenceUploaded);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final evidence = ref.watch(providerEvidenceProvider);
    final err = _error;
    final status = '${widget.profile['effective_verification'] ?? widget.profile['verification_status']}';
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      Pill(text: verificationLabel(l, status), bg: Tokens.primarySoft, fg: Tokens.primaryStrong),
      const SizedBox(height: Tokens.s3),
      Notice(text: l.provVerifIntro),
      const SizedBox(height: Tokens.s3),
      Notice(key: const ValueKey('prov-evidence-note'), text: l.provEvidenceNote, kind: NoticeKind.info),
      const SizedBox(height: Tokens.s3),
      if (err != null) ...[
        Notice(key: const ValueKey('prov-verif-error'), text: err is CapturePermissionDenied ? l.scannerPermissionDenied : errorMessage(l, err), kind: NoticeKind.danger),
        const SizedBox(height: Tokens.s3),
      ],
      if (_message != null) ...[Notice(key: const ValueKey('prov-verif-message'), text: _message!, kind: NoticeKind.success), const SizedBox(height: Tokens.s3)],
      Text(l.provEvidenceTitle, style: theme.textTheme.titleMedium),
      const SizedBox(height: Tokens.s2),
      evidence.when(
        loading: () => const LoadingView(),
        error: (e, _) => Notice(text: errorMessage(l, e), kind: NoticeKind.danger),
        data: (docs) => Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          if (docs.isEmpty) Text(l.provEvidenceNone, key: const ValueKey('prov-evidence-none')),
          for (final d in docs)
            Card(
              key: ValueKey('evidence-${d['id']}'),
              child: ListTile(
                leading: Icon('${d['mime']}'.contains('pdf') ? Icons.picture_as_pdf_outlined : Icons.image_outlined),
                title: Text('${d['original_name']}', overflow: TextOverflow.ellipsis),
                subtitle: Text(formatDate(context, '${d['created_at']}')),
                trailing: IconButton(tooltip: l.provEvidenceDelete, icon: const Icon(Icons.delete_outline), onPressed: _busy ? null : () => _run(() async {
                      await ref.read(providerPortalApiProvider).deleteEvidence((d['id'] as num).toInt());
                      ref.invalidate(providerEvidenceProvider);
                    }, null)),
              ),
            ),
          OutlinedButton.icon(
            key: const ValueKey('prov-upload'),
            onPressed: _busy || ref.watch(imageCaptureProvider).isAvailable == false ? null : _upload,
            icon: const Icon(Icons.add_photo_alternate_outlined),
            label: Text(l.provEvidenceAdd),
          ),
          const SizedBox(height: Tokens.s1),
          Text(l.provEvidencePdfWeb, style: theme.textTheme.bodySmall),
        ]),
      ),
      const SizedBox(height: Tokens.s4),
      FilledButton(
        key: const ValueKey('prov-request-verification'),
        onPressed: _busy ? null : () => _run(() async {
              await ref.read(providerPortalApiProvider).requestVerification();
              ref.invalidate(providerProfileProvider);
            }, l.provVerifRequested),
        child: Text(l.provVerifRequest),
      ),
    ]);
  }
}

// ------------------------------------------------------------------ leads tab

class ProviderLeadsTab extends ConsumerStatefulWidget {
  const ProviderLeadsTab({super.key});
  @override
  ConsumerState<ProviderLeadsTab> createState() => _LeadsState();
}

class _LeadsState extends ConsumerState<ProviderLeadsTab> {
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(Tokens.s4, Tokens.s3, Tokens.s4, 0), child: Notice(text: l.provLeadsPrivacy)),
      Expanded(
        child: PagedView<Map<String, dynamic>>(
          resetKey: _reload,
          emptyText: l.provLeadsEmpty,
          fetch: ref.read(providerPortalApiProvider).leads,
          itemBuilder: (context, lead) {
            final c = lead['contact'] is Map ? Map<String, dynamic>.from(lead['contact'] as Map) : const <String, dynamic>{};
            final status = '${lead['status']}';
            return Card(
              key: ValueKey('lead-${lead['id']}'),
              child: Padding(
                padding: const EdgeInsets.all(Tokens.s3),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(child: Text('${c['name'] ?? ''}', style: theme.textTheme.titleSmall)),
                    Pill(text: switch (status) { 'new' => l.provLeadNew, 'seen' => l.provLeadSeen, _ => l.provLeadClosed }, bg: status == 'new' ? Tokens.primarySoft : Tokens.sunken, fg: status == 'new' ? Tokens.primaryStrong : Tokens.inkSoft),
                  ]),
                  Text(formatDate(context, lead['created_at'] as String?), style: theme.textTheme.bodySmall),
                  if ('${lead['message'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${lead['message']}')),
                  if (c['email'] != null) Text('${c['email']}', textDirection: TextDirection.ltr),
                  if (c['phone'] != null) Text('${c['phone']}', textDirection: TextDirection.ltr),
                  Wrap(spacing: Tokens.s2, children: [
                    if (status == 'new') TextButton(key: ValueKey('lead-seen-${lead['id']}'), onPressed: () => _set(lead, 'seen'), child: Text(l.provLeadMarkSeen)),
                    if (status != 'closed') TextButton(key: ValueKey('lead-close-${lead['id']}'), onPressed: () => _set(lead, 'closed'), child: Text(l.provLeadClose)),
                  ]),
                ]),
              ),
            );
          },
        ),
      ),
    ]);
  }

  Future<void> _set(Map<String, dynamic> lead, String status) async {
    final l = AppL10n.of(context);
    try {
      await ref.read(providerPortalApiProvider).setLeadStatus((lead['id'] as num).toInt(), status);
      if (mounted) setState(() => _reload++);
    } catch (e) {
      if (mounted) showSnack(context, errorMessage(l, e));
    }
  }
}

// ------------------------------------------------------------------ reviews tab

class ProviderReviewsTab extends ConsumerWidget {
  const ProviderReviewsTab({super.key});

  Future<void> _reply(BuildContext context, WidgetRef ref, Map<String, dynamic> review) async {
    final l = AppL10n.of(context);
    final c = TextEditingController(text: '${review['reply'] ?? ''}');
    final body = await showDialog<String>(
      context: context,
      builder: (d) => AlertDialog(
        title: Text(l.provReplyTitle),
        content: TextField(key: const ValueKey('reply-text'), controller: c, minLines: 3, maxLines: 6, maxLength: 3000, decoration: InputDecoration(helperText: l.provReplyNote)),
        actions: [
          TextButton(onPressed: () => Navigator.of(d).pop(), child: Text(l.cancel)),
          FilledButton(key: const ValueKey('reply-send'), onPressed: () => Navigator.of(d).pop(c.text.trim()), child: Text(l.provReplySend)),
        ],
      ),
    );
    // Not disposed here: the dialog is still animating out and would use a disposed controller.
    if (body == null || body.isEmpty || !context.mounted) return;
    try {
      await ref.read(providerPortalApiProvider).reply((review['id'] as num).toInt(), body);
      ref.invalidate(providerReviewsProvider);
      if (context.mounted) showSnack(context, l.provReplySent);
    } catch (e) {
      if (context.mounted) showSnack(context, errorMessage(l, e));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return AsyncBody<List<Map<String, dynamic>>>(
      value: ref.watch(providerReviewsProvider),
      onRetry: () => ref.invalidate(providerReviewsProvider),
      data: (list) {
        if (list.isEmpty) return EmptyView(message: l.provReviewsEmpty, icon: Icons.star_border);
        return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
          for (final r in list)
            Card(
              key: ValueKey('review-${r['id']}'),
              child: Padding(
                padding: const EdgeInsets.all(Tokens.s3),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Wrap(crossAxisAlignment: WrapCrossAlignment.center, spacing: 2, children: [for (var i = 1; i <= 5; i++) Icon(i <= ((r['rating'] as num?) ?? 0) ? Icons.star : Icons.star_border, size: 18, color: Tokens.warning), const SizedBox(width: Tokens.s2), Text(formatDate(context, r['created_at'] as String?), style: theme.textTheme.bodySmall)]),
                  if ('${r['body'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${r['body']}')),
                  if (r['reply'] != null) Padding(
                    padding: const EdgeInsets.only(top: Tokens.s2),
                    child: Notice(text: '${r['reply']}', title: r['reply_status'] == 'approved' ? l.provReplyPublished : l.provReplyPending),
                  ),
                  Align(alignment: AlignmentDirectional.centerStart, child: TextButton(key: ValueKey('review-reply-${r['id']}'), onPressed: () => _reply(context, ref, r), child: Text(r['reply'] == null ? l.provReply : l.provReplyEdit))),
                ]),
              ),
            ),
        ]);
      },
    );
  }
}
