import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../core/widgets/report_dialog.dart';
import '../../l10n/app_localizations.dart';

/// Community Q&A: only reachable when `GET /community/meta` answers (the API returns 404 while the feature flag is off,
/// in which case nothing about the community is shown in the app). Posts are third-party, unverified content: the
/// API's `label`/`notice` are shown with every item. Voting, accepting answers, comments and blocking are web-only for now.

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

/// `null` = feature off (404) or unreachable -> hidden. A usable map = enabled.
final communityMetaProvider = FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  ref.watch(localeProvider);
  try {
    return (await ref.watch(apiClientProvider).get('/community/meta')).map;
  } catch (_) {
    return null;
  }
});

String communityError(AppL10n l, Object? e) {
  if (e is ApiException && const {'link_not_allowed', 'too_many_links', 'invalid_length', 'duplicate_content', 'new_account_throttled', 'community_muted', 'account_too_new', 'vote_not_allowed', 'already_reported'}.contains(e.code) && e.message.isNotEmpty) return e.message;
  return errorMessage(l, e);
}

class CommunityScreen extends ConsumerStatefulWidget {
  const CommunityScreen({super.key});
  @override
  ConsumerState<CommunityScreen> createState() => _CommunityState();
}

class _CommunityState extends ConsumerState<CommunityScreen> {
  String? _topic;
  bool _mine = false;
  int _rev = 0;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final meta = ref.watch(communityMetaProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.communityTitle)),
      floatingActionButton: meta.valueOrNull == null ? null : FloatingActionButton.extended(key: const ValueKey('community-ask'), onPressed: () async {
        await context.push('/community/ask');
        if (mounted) setState(() => _rev++);
      }, icon: const Icon(Icons.edit_outlined), label: Text(l.communityAskOpen)),
      body: meta.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(communityMetaProvider)),
        data: (m) {
          if (m == null) return EmptyView(message: l.errorNotFound);
          final topics = _maps(m['topics']);
          return PagedView<Map<String, dynamic>>(
            resetKey: '$_topic|$_mine|$_rev|${ref.watch(localeProvider).languageCode}',
            emptyText: l.communityEmpty,
            fetch: (page) async {
              final r = await ref.read(apiClientProvider).get('/community/questions', query: {'page': page, 'per_page': 20, if (_topic != null) 'topic': _topic, if (_mine) 'mine': 1});
              return pageFrom(r.list, r.meta, (x) => x);
            },
            header: Padding(
              padding: const EdgeInsets.only(bottom: Tokens.s3),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Notice(key: const ValueKey('community-notice'), text: '${m['notice'] ?? ''}'.isEmpty ? l.communityNoticeFallback : '${m['notice']}', kind: NoticeKind.warning),
                const SizedBox(height: Tokens.s2),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(children: [
                    Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.allCategories), selected: _topic == null, onSelected: (_) => setState(() => _topic = null))),
                    for (final t in topics) Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text('${t['label']}'), selected: _topic == '${t['value']}', onSelected: (_) => setState(() => _topic = '${t['value']}'))),
                  ]),
                ),
                SwitchListTile(contentPadding: EdgeInsets.zero, value: _mine, onChanged: (v) => setState(() => _mine = v), title: Text(l.communityMineOnly)),
              ]),
            ),
            itemBuilder: (context, q) => Card(
              child: InkWell(
                borderRadius: BorderRadius.circular(Tokens.radiusMd),
                onTap: () => context.push('/community/${q['id']}'),
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s4),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    if (q['topic_label'] != null) Text('${q['topic_label']}', style: Theme.of(context).textTheme.bodySmall),
                    Text('${q['title']}', style: Theme.of(context).textTheme.titleMedium),
                    if (q['excerpt'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text('${q['excerpt']}', maxLines: 2, overflow: TextOverflow.ellipsis)),
                    const SizedBox(height: Tokens.s2),
                    Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
                      if (q['label'] != null) Pill(text: '${q['label']}'),
                      Pill(text: l.communityAnswers(formatNumber(context, (q['answers_count'] as num?) ?? 0))),
                      if (q['mine'] == true) Pill(text: l.communityMine, bg: Tokens.primarySoft, fg: Tokens.primaryStrong),
                    ]),
                  ]),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

final communityQuestionProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/community/questions/$id')).map;
});

class CommunityQuestionScreen extends ConsumerStatefulWidget {
  const CommunityQuestionScreen({super.key, required this.id});
  final int id;
  @override
  ConsumerState<CommunityQuestionScreen> createState() => _QuestionState();
}

class _QuestionState extends ConsumerState<CommunityQuestionScreen> {
  final _answer = TextEditingController();
  bool _busy = false;
  Object? _error;
  bool _posted = false;

  @override
  void dispose() {
    _answer.dispose();
    super.dispose();
  }

  Future<void> _post() async {
    if (_answer.text.trim().isEmpty) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).post('/community/questions/${widget.id}/answers', body: {'body': _answer.text.trim()});
      _answer.clear();
      ref.invalidate(communityQuestionProvider(widget.id));
      if (mounted) setState(() => _posted = true);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _report(String kind, Object? id) async {
    final l = AppL10n.of(context);
    final res = await showDialog<({String reason, String note})>(context: context, builder: (_) => const ReportDialog());
    if (res == null || !mounted) return;
    try {
      await ref.read(apiClientProvider).post('/community/$kind/$id/report', body: {'reason': res.reason, if (res.note.isNotEmpty) 'note': res.note});
      if (mounted) showSnack(context, l.reviewReportSent);
    } catch (e) {
      if (mounted) showSnack(context, communityError(l, e));
    }
  }

  Future<void> _delete() async {
    final l = AppL10n.of(context);
    try {
      await ref.read(apiClientProvider).delete('/community/questions/${widget.id}');
      if (mounted) {
        showSnack(context, l.communityDeleted);
        context.pop();
      }
    } catch (e) {
      if (mounted) showSnack(context, communityError(l, e));
    }
  }

  String? _statusText(AppL10n l, Object? s) => s == 'pending' ? l.communityPendingStatus : (s == 'hidden' ? l.communityHiddenStatus : null);

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.communityTitle)),
      body: AsyncBody<Map<String, dynamic>>(
        value: ref.watch(communityQuestionProvider(widget.id)),
        onRetry: () => ref.invalidate(communityQuestionProvider(widget.id)),
        data: (q) {
          final answers = _maps(q['answers']);
          final guide = q['official_guide'] is Map ? Map<String, dynamic>.from(q['official_guide'] as Map) : null;
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
              if (q['label'] != null) Pill(text: '${q['label']}'),
              if (_statusText(l, q['status']) != null) Pill(text: _statusText(l, q['status'])!, bg: Tokens.warningSoft, fg: Tokens.warning),
            ]),
            const SizedBox(height: Tokens.s2),
            Text('${q['title']}', style: theme.textTheme.titleLarge),
            if (q['notice'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(key: const ValueKey('sensitive-notice'), text: '${q['notice']}', kind: NoticeKind.warning)),
            if (guide != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Card(child: ListTile(key: const ValueKey('official-guide'), leading: const Icon(Icons.verified_outlined, color: Tokens.success), title: Text(l.communityOfficialGuide), subtitle: Text('${guide['title']}'), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/guides/${Uri.encodeComponent('${guide['slug']}')}')))),
            const SizedBox(height: Tokens.s3),
            Text('${q['body'] ?? ''}'),
            Row(children: [
              if (q['mine'] != true) TextButton(key: const ValueKey('report-question'), onPressed: () => _report('question', q['id']), child: Text(l.reviewReport)),
              if (q['mine'] == true) TextButton(key: const ValueKey('delete-question'), onPressed: _delete, child: Text(l.communityDelete)),
            ]),
            const Divider(height: Tokens.s6),
            Text(l.communityAnswers(formatNumber(context, answers.length)), style: theme.textTheme.titleMedium),
            if (answers.isEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.communityNoAnswers)),
            for (final a in answers)
              Card(
                key: ValueKey('answer-${a['id']}'),
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s3),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
                      if (a['label'] != null) Pill(text: '${a['label']}'),
                      if (a['accepted'] == true) Pill(text: l.communityAccepted, bg: Tokens.successSoft, fg: Tokens.success, icon: Icons.check_circle_outline),
                      if (_statusText(l, a['status']) != null) Pill(text: _statusText(l, a['status'])!, bg: Tokens.warningSoft, fg: Tokens.warning),
                    ]),
                    const SizedBox(height: Tokens.s1),
                    Text('${a['body'] ?? ''}'),
                    if (a['mine'] != true) Align(alignment: AlignmentDirectional.centerStart, child: TextButton(key: ValueKey('report-answer-${a['id']}'), onPressed: () => _report('answer', a['id']), child: Text(l.reviewReport))),
                  ]),
                ),
              ),
            const SizedBox(height: Tokens.s4),
            if (_error != null) ...[Notice(key: const ValueKey('answer-error'), text: communityError(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s2)],
            if (_posted) ...[Notice(key: const ValueKey('answer-posted'), text: l.communityPostedPending, kind: NoticeKind.success), const SizedBox(height: Tokens.s2)],
            TextField(key: const ValueKey('answer-body'), controller: _answer, minLines: 3, maxLines: 8, maxLength: 20000, decoration: InputDecoration(labelText: l.communityWriteAnswer, alignLabelWithHint: true)),
            FilledButton(key: const ValueKey('answer-send'), onPressed: _busy ? null : _post, child: Text(l.communityPost)),
          ]);
        },
      ),
    );
  }
}

class CommunityAskScreen extends ConsumerStatefulWidget {
  const CommunityAskScreen({super.key});
  @override
  ConsumerState<CommunityAskScreen> createState() => _AskState();
}

class _AskState extends ConsumerState<CommunityAskScreen> {
  final _title = TextEditingController();
  final _body = TextEditingController();
  String? _topic;
  bool _busy = false, _done = false;
  Object? _error;

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final l = AppL10n.of(context);
    if (_title.text.trim().isEmpty || _body.text.trim().isEmpty) return setState(() => _error = ValidationException(l.fieldRequired));
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).post('/community/questions', body: {'title': _title.text.trim(), 'body': _body.text.trim(), if (_topic != null) 'topic': _topic, 'locale': ref.read(localeProvider).languageCode});
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
    final topics = _maps(ref.watch(communityMetaProvider).valueOrNull?['topics']);
    return Scaffold(
      appBar: AppBar(title: Text(l.communityAskOpen)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        if (_done)
          Notice(key: const ValueKey('ask-posted'), text: l.communityPostedPending, kind: NoticeKind.success)
        else ...[
          if (_error != null) ...[Notice(key: const ValueKey('ask-error'), text: communityError(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
          TextField(key: const ValueKey('ask-title'), controller: _title, maxLength: 500, decoration: InputDecoration(labelText: l.communityQuestionTitle)),
          const SizedBox(height: Tokens.s2),
          TextField(key: const ValueKey('ask-body'), controller: _body, minLines: 4, maxLines: 10, maxLength: 20000, decoration: InputDecoration(labelText: l.communityQuestionBody, alignLabelWithHint: true)),
          if (topics.isNotEmpty) ...[
            const SizedBox(height: Tokens.s2),
            DropdownButtonFormField<String?>(
              isExpanded: true,
              decoration: InputDecoration(labelText: l.communityTopic),
              initialValue: _topic,
              items: [DropdownMenuItem<String?>(value: null, child: Text(l.communityNoTopic)), for (final t in topics) DropdownMenuItem<String?>(value: '${t['value']}', child: Text('${t['label']}'))],
              onChanged: (v) => setState(() => _topic = v),
            ),
          ],
          const SizedBox(height: Tokens.s3),
          FilledButton(key: const ValueKey('ask-send'), onPressed: _busy ? null : _send, child: Text(l.communityPost)),
        ],
      ]),
    );
  }
}
