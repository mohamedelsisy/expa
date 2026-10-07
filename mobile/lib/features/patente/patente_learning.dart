import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import '../learn/practice.dart' show TeacherReviewNotice, italian;
import 'patente.dart' show patenteProgressProvider;

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

final weakTopicsProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/patente/weak-topics')).map;
});

final glossaryProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  return _maps((await ref.watch(apiClientProvider).get('/patente/glossary')).data);
});

/// Weak-topic analysis (`GET /patente/weak-topics`) with one-tap practice sessions
/// (`POST /patente/topics/{slug}/practice`, `POST /patente/practice/weak`). Practice sessions have no timer or pass/fail.
class WeakTopicsScreen extends ConsumerStatefulWidget {
  const WeakTopicsScreen({super.key});
  @override
  ConsumerState<WeakTopicsScreen> createState() => _WeakState();
}

class _WeakState extends ConsumerState<WeakTopicsScreen> {
  bool _busy = false;
  Object? _error;

  Future<void> _start(String path) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).post(path);
      final id = (r.map['id'] as num?)?.toInt();
      if (id != null && mounted) {
        await context.push('/patente/exam/$id');
        ref.invalidate(weakTopicsProvider);
        ref.invalidate(patenteProgressProvider);
      }
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _err(AppL10n l) {
    final e = _error;
    if (e is ValidationException && e.code == 'no_weak_topics') return l.patenteNoWeakToPractice;
    if (e is ValidationException && e.code == 'not_enough_questions') return l.patenteNotEnoughQuestions;
    return errorMessage(l, e);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    String n(Object? x) => formatNumber(context, (x as num?) ?? 0);
    return Scaffold(
      appBar: AppBar(title: Text(l.patenteWeakTitle)),
      body: AsyncBody<Map<String, dynamic>>(
        value: ref.watch(weakTopicsProvider),
        onRetry: () => ref.invalidate(weakTopicsProvider),
        data: (d) {
          final weak = _maps(d['weak']);
          final untouched = _maps(d['untouched']);
          final recommended = d['recommended'] as String?;
          String? recTitle;
          for (final r in [...weak, ...untouched]) {
            if ((r['topic'] as Map?)?['slug'] == recommended) recTitle = '${(r['topic'] as Map)['title']}';
          }
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Text(l.patenteWeakIntro(n(d['threshold']), n(d['min_answers']))),
            const SizedBox(height: Tokens.s3),
            if (_error != null) ...[Notice(key: const ValueKey('weak-error'), text: _err(l), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
            if (weak.isEmpty && untouched.isEmpty) EmptyView(message: l.patenteWeakNone, icon: Icons.insights_outlined),
            if (recTitle != null) Notice(key: const ValueKey('weak-recommended'), text: l.patenteRecommended(recTitle), kind: NoticeKind.info),
            if (weak.isNotEmpty) ...[
              const SizedBox(height: Tokens.s4),
              Text(l.patenteWeakList, style: theme.textTheme.titleMedium),
              const SizedBox(height: Tokens.s2),
              for (final r in weak) _row(context, l, r, showAccuracy: true),
              const SizedBox(height: Tokens.s2),
              FilledButton(key: const ValueKey('weak-practice-all'), onPressed: _busy ? null : () => _start('/patente/practice/weak'), child: Text(l.patentePracticeAllWeak)),
            ],
            if (untouched.isNotEmpty) ...[
              const SizedBox(height: Tokens.s5),
              Text(l.patenteUntouched, style: theme.textTheme.titleMedium),
              const SizedBox(height: Tokens.s2),
              for (final r in untouched) _row(context, l, r, showAccuracy: false),
            ],
          ]);
        },
      ),
    );
  }

  Widget _row(BuildContext context, AppL10n l, Map<String, dynamic> r, {required bool showAccuracy}) {
    final topic = Map<String, dynamic>.from((r['topic'] as Map?) ?? const {});
    String n(Object? x) => formatNumber(context, (x as num?) ?? 0);
    return Card(
      key: ValueKey('weak-${topic['slug']}'),
      child: Padding(
        padding: const EdgeInsets.all(Tokens.s3),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${topic['title']}', style: Theme.of(context).textTheme.titleSmall),
          if (showAccuracy && r['accuracy'] != null) Text(l.patenteTopicAccuracy(n(r['accuracy']), n(r['correct']), n(r['answered'])), style: Theme.of(context).textTheme.bodySmall),
          Text(l.patenteQuestionCount(n(r['available_questions'])), style: Theme.of(context).textTheme.bodySmall),
          if (((r['available_questions'] as num?) ?? 0) > 0)
            Align(alignment: AlignmentDirectional.centerStart, child: TextButton(key: ValueKey('practice-${topic['slug']}'), onPressed: _busy ? null : () => _start('/patente/topics/${Uri.encodeComponent('${topic['slug']}')}/practice'), child: Text(l.patentePracticeTopic))),
        ]),
      ),
    );
  }
}

/// Italian to Arabic/English driving glossary (the vocabulary module, category `patente`). Empty until content is published.
class PatenteGlossaryScreen extends ConsumerWidget {
  const PatenteGlossaryScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.patenteGlossaryTitle)),
      body: AsyncBody<List<Map<String, dynamic>>>(
        value: ref.watch(glossaryProvider),
        onRetry: () => ref.invalidate(glossaryProvider),
        data: (list) {
          if (list.isEmpty) return EmptyView(message: l.patenteGlossaryEmpty, icon: Icons.translate);
          final anyUnreviewed = list.any((x) => x['reviewed'] == false);
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            if (anyUnreviewed) ...[TeacherReviewNotice(item: list.firstWhere((x) => x['reviewed'] == false)), const SizedBox(height: Tokens.s3)],
            for (final w in list)
              Card(
                key: ValueKey('gloss-${w['slug']}'),
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s3),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    italian(context, w['lemma'], style: theme.textTheme.titleMedium),
                    if (w['gloss'] != null) Text('${w['gloss']}'),
                    if (w['example_it'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: italian(context, w['example_it'], style: theme.textTheme.bodySmall)),
                    if (w['example_gloss'] != null) Text('${w['example_gloss']}', style: theme.textTheme.bodySmall),
                  ]),
                ),
              ),
          ]);
        },
      ),
    );
  }
}
