import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/cache/content_repository.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../core/widgets/saved_content.dart';
import '../../l10n/app_localizations.dart';

final dailyProvider = FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  ref.watch(localeProvider);
  try {
    return (await ref.watch(apiClientProvider).get('/italian/daily')).map;
  } catch (_) {
    return null; // the daily plan is optional; the lesson list still works
  }
});

final lessonDetailProvider = StreamProvider.autoDispose.family<ContentResult, String>((ref, slug) {
  ref.watch(localeProvider);
  return ref.watch(contentRepositoryProvider(lessonKind)).open(slug);
});

class LearnScreen extends ConsumerStatefulWidget {
  const LearnScreen({super.key});
  @override
  ConsumerState<LearnScreen> createState() => _LearnState();
}

class _LearnState extends ConsumerState<LearnScreen> {
  String? _level;
  static const levels = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'];

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final daily = ref.watch(dailyProvider).valueOrNull;
    final slots = [for (final s in (daily?['slots'] as List? ?? const [])) if (s is Map) s];
    return Scaffold(
      appBar: AppBar(title: Text(l.learnTitle)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_level|${ref.watch(localeProvider).languageCode}',
        emptyText: l.lessonsEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/italian/lessons', query: {'page': page, 'per_page': 30, if (_level != null) 'level': _level});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        header: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (slots.isNotEmpty) ...[
            Text(l.dailyTitle, style: Theme.of(context).textTheme.titleMedium),
            if (daily?['streak'] != null) Text(l.streak(formatNumber(context, daily!['streak'] as num))),
            const SizedBox(height: Tokens.s2),
            for (final s in slots)
              if (s['lesson'] is Map)
                Padding(
                  padding: const EdgeInsets.only(bottom: Tokens.s2),
                  child: Card(
                    child: ListTile(
                      leading: Icon((s['lesson'] as Map)['progress']?['status'] == 'completed' || s['done'] == true ? Icons.check_circle : Icons.play_circle_outline, color: Tokens.primary),
                      title: Text('${(s['lesson'] as Map)['title']}'),
                      subtitle: Text('${s['type_label'] ?? ''}'),
                      onTap: () => context.push('/learn/${Uri.encodeComponent('${(s['lesson'] as Map)['slug']}')}'),
                    ),
                  ),
                ),
            const SizedBox(height: Tokens.s4),
          ],
          Text(l.lessonsTitle, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: Tokens.s2),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: [
              Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.allCategories), selected: _level == null, onSelected: (_) => setState(() => _level = null))),
              for (final lv in levels)
                Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(lv.toUpperCase()), selected: _level == lv, onSelected: (_) => setState(() => _level = lv))),
            ]),
          ),
          const SizedBox(height: Tokens.s3),
        ]),
        itemBuilder: (context, m) {
          final status = (m['progress'] as Map?)?['status'];
          return Card(
            child: ListTile(
              minVerticalPadding: Tokens.s3,
              title: Text('${m['title']}'),
              subtitle: Text('${m['level_label'] ?? ''} · ${m['type_label'] ?? ''} · ${l.minutes(formatNumber(context, (m['duration_minutes'] as num?) ?? 0))}'),
              trailing: status == 'completed' ? const Icon(Icons.check_circle, color: Tokens.success) : const Icon(Icons.chevron_right),
              onTap: () => context.push('/learn/${Uri.encodeComponent('${m['slug']}')}'),
            ),
          );
        },
      ),
    );
  }
}

class LessonScreen extends ConsumerStatefulWidget {
  const LessonScreen({super.key, required this.slug});
  final String slug;
  @override
  ConsumerState<LessonScreen> createState() => _LessonState();
}

class _LessonState extends ConsumerState<LessonScreen> {
  bool _started = false;
  bool? _completed;

  Future<void> _record(String status, {bool silent = false}) async {
    final l = AppL10n.of(context);
    try {
      await ref.read(apiClientProvider).post('/italian/lessons/${Uri.encodeComponent(widget.slug)}/progress', body: {'status': status});
      if (status == 'completed' && mounted) setState(() => _completed = true);
      ref.invalidate(dailyProvider);
    } catch (e) {
      if (mounted && !silent) showSnack(context, errorMessage(l, e));
    }
  }

  /// Italian text is always LTR, whatever the UI direction (MOB-15).
  Widget _it(BuildContext context, Object? v, {TextStyle? style}) =>
      v == null ? const SizedBox.shrink() : Align(alignment: AlignmentDirectional.centerStart, child: Text('$v', style: style, textDirection: TextDirection.ltr));

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final value = ref.watch(lessonDetailProvider(widget.slug));
    return Scaffold(
      appBar: AppBar(title: Text(l.learnTitle), actions: [
        if (value.valueOrNull != null) SaveOfflineButton(kind: lessonKind, slug: widget.slug, data: value.valueOrNull!.data),
      ]),
      body: AsyncBody<ContentResult>(
        value: value,
        onRetry: () => ref.invalidate(lessonDetailProvider(widget.slug)),
        data: (r) {
          final m = r.data;
          if (!_started && !r.fromCache) {
            _started = true;
            Future.microtask(() => _record('started', silent: true));
          }
          final items = [for (final i in (m['items'] as List? ?? const [])) if (i is Map) i];
          final done = _completed == true || (m['progress'] as Map?)?['status'] == 'completed';
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            CachedCopyNotice(result: r),
            Text('${m['title']}', style: theme.textTheme.titleLarge),
            Text('${m['level_label'] ?? ''} · ${m['type_label'] ?? ''}', style: theme.textTheme.bodySmall),
            if (m['summary'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${m['summary']}')),
            if (m['body'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text('${m['body']}')),
            const SizedBox(height: Tokens.s3),
            for (final it in items)
              Padding(
                padding: const EdgeInsets.only(bottom: Tokens.s2),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(Tokens.s3),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      if (it['speaker'] != null) Text('${it['speaker']}', style: theme.textTheme.bodySmall),
                      _it(context, it['it'], style: theme.textTheme.titleMedium),
                      if (it['phonetic'] != null) _it(context, '/${it['phonetic']}/', style: theme.textTheme.bodySmall),
                      if (it['gloss'] != null) Text('${it['gloss']}', style: theme.textTheme.bodyMedium),
                      if (it['example_it'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: _it(context, it['example_it'], style: theme.textTheme.bodyMedium)),
                      if (it['example_gloss'] != null) Text('${it['example_gloss']}', style: theme.textTheme.bodySmall),
                      if (it['tip'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${l.lessonTip}: ${it['tip']}', style: theme.textTheme.bodySmall)),
                    ]),
                  ),
                ),
              ),
            const SizedBox(height: Tokens.s3),
            if (done)
              Notice(text: l.lessonCompleted, kind: NoticeKind.success)
            else
              FilledButton(onPressed: r.fromCache && r.refreshFailed ? null : () => _record('completed'), child: Text(l.lessonComplete)),
          ]);
        },
      ),
    );
  }
}
