import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/cache/content_repository.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/saved_content.dart';
import '../../l10n/app_localizations.dart';
import '../ask/ask_models.dart';
import '../ask/ask_screen.dart' show AskMessageView;
import '../catalog/catalog.dart' show CatalogDetailView;

final patenteTopicDetailProvider = StreamProvider.autoDispose.family<ContentResult, String>((ref, slug) {
  ref.watch(localeProvider);
  return ref.watch(contentRepositoryProvider(patenteTopicKind)).open(slug);
});

/// A Patente theory topic: cache-first when saved for offline (public content only), with the AI teacher
/// (`POST /ai/ask` with `patente_topic`). The answer shows label, sources and disclaimer exactly as the API sends them.
/// Exam questions/review items now carry a `slug` -> see [PatenteQuestionExplain].
class PatenteTopicScreen extends ConsumerStatefulWidget {
  const PatenteTopicScreen({super.key, required this.slug});
  final String slug;
  @override
  ConsumerState<PatenteTopicScreen> createState() => _TopicState();
}

class _TopicState extends ConsumerState<PatenteTopicScreen> {
  bool _busy = false;
  Object? _error;
  AskReply? _reply;

  Future<void> _explain(String title) async {
    final l = AppL10n.of(context);
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(askRepositoryProvider).ask(l.patenteTeacherPrompt(title), patenteTopic: widget.slug);
      if (mounted) setState(() => _reply = r);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final value = ref.watch(patenteTopicDetailProvider(widget.slug));
    return Scaffold(
      appBar: AppBar(title: Text(l.patenteTitle), actions: [
        if (value.valueOrNull != null) SaveOfflineButton(kind: patenteTopicKind, slug: widget.slug, data: value.valueOrNull!.data),
      ]),
      body: AsyncBody<ContentResult>(
        value: value,
        onRetry: () => ref.invalidate(patenteTopicDetailProvider(widget.slug)),
        data: (r) {
          final title = '${r.data['title'] ?? widget.slug}';
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            CachedCopyNotice(result: r),
            CatalogDetailView(data: r.data, embedded: true),
            const SizedBox(height: Tokens.s4),
            Text(l.patenteTeacherTitle, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: Tokens.s2),
            Text(l.patenteTeacherIntro),
            const SizedBox(height: Tokens.s2),
            if (_error != null) ...[Notice(key: const ValueKey('teacher-error'), text: errorMessage(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s2)],
            FilledButton.icon(
              key: const ValueKey('teacher-explain'),
              onPressed: _busy || r.fromCache && r.refreshFailed ? null : () => _explain(title),
              icon: _busy ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.auto_awesome),
              label: Text(l.patenteTeacherAsk),
            ),
            if (r.fromCache && r.refreshFailed) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.patenteTeacherOffline, key: const ValueKey('teacher-offline'))),
            if (_reply != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: AskMessageView(message: _reply!.message)),
          ]);
        },
      ),
    );
  }
}

/// "Explain this question" for one licensed exam question (`POST /ai/ask` with `patente_question` = its slug).
/// Hidden when the item has no slug. Only used where the answer is already revealed (practice feedback, review).
class PatenteQuestionExplain extends ConsumerStatefulWidget {
  const PatenteQuestionExplain({super.key, required this.slug, required this.statement});
  final String? slug;
  final String statement;
  @override
  ConsumerState<PatenteQuestionExplain> createState() => _QuestionExplainState();
}

class _QuestionExplainState extends ConsumerState<PatenteQuestionExplain> {
  bool _busy = false;
  Object? _error;
  AskReply? _reply;

  Future<void> _explain() async {
    final l = AppL10n.of(context);
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(askRepositoryProvider).ask(l.patenteQuestionPrompt(widget.statement), patenteQuestion: widget.slug);
      if (mounted) setState(() => _reply = r);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final slug = widget.slug;
    if (slug == null || slug.isEmpty) return const SizedBox.shrink();
    final l = AppL10n.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: Tokens.s2),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        if (_error != null) Padding(padding: const EdgeInsets.only(bottom: Tokens.s2), child: Notice(key: ValueKey('explain-error-$slug'), text: errorMessage(l, _error), kind: NoticeKind.danger)),
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: OutlinedButton.icon(
            key: ValueKey('explain-$slug'),
            onPressed: _busy ? null : _explain,
            icon: _busy ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.auto_awesome, size: 18),
            label: Text(l.patenteExplainQuestion),
          ),
        ),
        if (_reply != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: AskMessageView(message: _reply!.message)),
      ]),
    );
  }
}
