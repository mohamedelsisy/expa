import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';

final documentTypesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  final r = await ref.watch(apiClientProvider).get('/document-types');
  return [for (final e in r.list) if (e is Map) Map<String, dynamic>.from(e)];
});

/// Grants a single consent purpose through the append-only ledger (`PUT /profile/consents`).
Future<void> grantConsent(WidgetRef ref, String purpose) =>
    ref.read(apiClientProvider).put('/profile/consents', body: {'consents': {purpose: true}});

class DocumentsScreen extends ConsumerStatefulWidget {
  const DocumentsScreen({super.key});
  @override
  ConsumerState<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends ConsumerState<DocumentsScreen> {
  int _reload = 0;

  Color _statusColor(String s) => switch (s) { 'expired' => Tokens.danger, 'expiring_soon' => Tokens.warning, _ => Tokens.success };
  IconData _statusIcon(String s) => switch (s) { 'expired' => Icons.error_outline, 'expiring_soon' => Icons.schedule, _ => Icons.check_circle_outline };

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.documentsTitle)),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final added = await context.push<bool>('/documents/new');
          if (added == true) setState(() => _reload++);
        },
        icon: const Icon(Icons.add),
        label: Text(l.addDocument),
      ),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_reload|${ref.watch(localeProvider).languageCode}',
        emptyText: l.docsEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/my-documents', query: {'page': page, 'per_page': 50});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        itemBuilder: (context, d) {
          final status = '${d['status']}';
          final days = (d['days_remaining'] as num?)?.toInt();
          final color = _statusColor(status);
          // MOB-17: never invent "0 days left" when the API sent an expiry date without a day count.
          final remaining = d['expiry_date'] == null
              ? l.noExpiry
              : (days == null ? '' : (days < 0 ? l.expiredDaysAgo(formatNumber(context, -days)) : l.daysRemaining(formatNumber(context, days))));
          return Card(
            child: ListTile(
              minVerticalPadding: Tokens.s3,
              title: Text('${d['display_name'] ?? (d['type'] as Map?)?['name'] ?? ''}'),
              subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (d['expiry_date'] != null) Text('${l.expiryDate}: ${formatDate(context, d['expiry_date'] as String?)}'),
                const SizedBox(height: Tokens.s1),
                Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
                  Pill(text: '${d['status_label'] ?? status}', fg: color, icon: _statusIcon(status)),
                  if (remaining.isNotEmpty) Text(remaining, style: Theme.of(context).textTheme.bodySmall),
                ]),
              ]),
              trailing: IconButton(
                tooltip: l.delete,
                icon: const Icon(Icons.delete_outline),
                onPressed: () async {
                  final ok = await showDialog<bool>(
                    context: context,
                    builder: (c) => AlertDialog(
                      content: Text(l.deleteDocConfirm),
                      actions: [TextButton(onPressed: () => c.pop(false), child: Text(l.cancel)), FilledButton(onPressed: () => c.pop(true), child: Text(l.delete))],
                    ),
                  );
                  if (ok != true) return;
                  try {
                    await ref.read(apiClientProvider).delete('/my-documents/${d['id']}');
                    if (mounted) setState(() => _reload++);
                  } catch (e) {
                    if (context.mounted) showSnack(context, errorMessage(l, e));
                  }
                },
              ),
            ),
          );
        },
        header: Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: Notice(text: l.docAttachmentsNote)),
      ),
    );
  }
}

class AddDocumentScreen extends ConsumerStatefulWidget {
  const AddDocumentScreen({super.key});
  @override
  ConsumerState<AddDocumentScreen> createState() => _AddDocumentState();
}

class _AddDocumentState extends ConsumerState<AddDocumentScreen> {
  final _form = GlobalKey<FormState>();
  final _label = TextEditingController();
  final _notes = TextEditingController();
  String? _type;
  DateTime? _issue;
  DateTime? _expiry;
  bool _reminders = true;
  bool _busy = false;
  Object? _error;

  @override
  void dispose() {
    _label.dispose();
    _notes.dispose();
    super.dispose();
  }

  String _iso(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<DateTime?> _pick(DateTime? initial, DateTime first, DateTime last) =>
      showDatePicker(context: context, initialDate: initial ?? DateTime.now(), firstDate: first, lastDate: last);

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).post('/my-documents', body: {
        'type': _type,
        if (_label.text.trim().isNotEmpty) 'label': _label.text.trim(),
        if (_issue != null) 'issue_date': _iso(_issue!),
        if (_expiry != null) 'expiry_date': _iso(_expiry!),
        if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
        'reminders_enabled': _reminders,
      });
      if (mounted) context.pop(true);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _dateField(String label, DateTime? value, VoidCallback onPick, VoidCallback onClear) => InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Row(children: [
          Expanded(child: Text(value == null ? l10nNone : formatDate(context, _iso(value)))),
          if (value != null) IconButton(tooltip: AppL10n.of(context).clearDate, icon: const Icon(Icons.clear), onPressed: onClear),
          IconButton(tooltip: AppL10n.of(context).pickDate, icon: const Icon(Icons.calendar_today_outlined), onPressed: onPick),
        ]),
      );

  String get l10nNone => '—';

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final types = ref.watch(documentTypesProvider);
    final consentErr = _error is ForbiddenException && (_error as ForbiddenException).consentRequired;
    return Scaffold(
      appBar: AppBar(title: Text(l.addDocument)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(Tokens.s4),
          child: Form(
            key: _form,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              if (_error != null) ...[
                Notice(
                  text: consentErr ? l.consentNeededDocs : errorMessage(l, _error),
                  kind: NoticeKind.danger,
                  trailing: consentErr
                      ? TextButton(
                          onPressed: () async {
                            try {
                              await grantConsent(ref, 'document_storage');
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
              types.when(
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(documentTypesProvider)),
                data: (list) => DropdownButtonFormField<String>(
                  isExpanded: true,
                  decoration: InputDecoration(labelText: l.docType),
                  initialValue: _type,
                  items: [for (final t in list) DropdownMenuItem(value: '${t['key']}', child: Text('${t['name']}', overflow: TextOverflow.ellipsis))],
                  onChanged: (v) => setState(() => _type = v),
                  validator: (v) => v == null ? l.fieldRequired : null,
                ),
              ),
              const SizedBox(height: Tokens.s4),
              TextFormField(controller: _label, maxLength: 100, decoration: InputDecoration(labelText: l.docLabel)),
              _dateField(l.issueDate, _issue, () async {
                final d = await _pick(_issue, DateTime(1950), DateTime.now());
                if (d != null) setState(() => _issue = d);
              }, () => setState(() => _issue = null)),
              const SizedBox(height: Tokens.s4),
              _dateField(l.expiryDate, _expiry, () async {
                final d = await _pick(_expiry, _issue ?? DateTime(1950), DateTime.now().add(const Duration(days: 365 * 30)));
                if (d != null) setState(() => _expiry = d);
              }, () => setState(() => _expiry = null)),
              SwitchListTile(contentPadding: EdgeInsets.zero, title: Text(l.remindersEnabled), value: _reminders, onChanged: (v) => setState(() => _reminders = v)),
              TextFormField(controller: _notes, maxLength: 2000, maxLines: 3, decoration: InputDecoration(labelText: l.notes)),
              const SizedBox(height: Tokens.s4),
              FilledButton(onPressed: _busy ? null : _submit, child: Text(l.save)),
            ]),
          ),
        ),
      ),
    );
  }
}
