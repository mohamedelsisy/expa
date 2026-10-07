import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';

/// Italian practice: vocabulary, 4 exercise types, spaced-repetition review and scenarios.
/// Contract: docs/API_SPEC.md "Italian practice". Italian text is always LTR. Every item carries a teacher-review
/// state: when `reviewed` is false the app says so (never presents unreviewed content as checked).

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];
const _levels = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'];

Widget italian(BuildContext context, Object? text, {TextStyle? style}) =>
    text == null || '$text'.isEmpty ? const SizedBox.shrink() : Align(alignment: AlignmentDirectional.centerStart, child: Text('$text', style: style, textDirection: TextDirection.ltr));

/// `reviewed:false` -> the server's `review_notice` (local text as fallback); `reviewed:true` -> a small badge.
class TeacherReviewNotice extends StatelessWidget {
  const TeacherReviewNotice({super.key, required this.item});
  final Map<String, dynamic> item;
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    if (item['reviewed'] == false) {
      final n = '${item['review_notice'] ?? ''}'.trim();
      return Notice(key: const ValueKey('review-notice'), text: n.isEmpty ? l.practiceNotReviewed : n, kind: NoticeKind.warning);
    }
    if (item['reviewed'] == true) {
      final at = item['reviewed_at'] as String?;
      return Pill(key: const ValueKey('reviewed-badge'), text: at == null ? l.practiceReviewed : l.practiceReviewedOn(formatDate(context, at)), bg: Tokens.successSoft, fg: Tokens.success, icon: Icons.verified_outlined);
    }
    return const SizedBox.shrink();
  }
}

final practiceProgressProvider = FutureProvider.autoDispose<Map<String, dynamic>?>((ref) async {
  ref.watch(localeProvider);
  try {
    return (await ref.watch(apiClientProvider).get('/italian/practice/progress')).map;
  } catch (_) {
    return null;
  }
});

final scenariosProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  return _maps((await ref.watch(apiClientProvider).get('/italian/scenarios')).data);
});

// ------------------------------------------------------------------ hub

class PracticeHubScreen extends ConsumerWidget {
  const PracticeHubScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final p = ref.watch(practiceProgressProvider).valueOrNull;
    final v = p?['vocabulary'] is Map ? Map<String, dynamic>.from(p!['vocabulary'] as Map) : const <String, dynamic>{};
    final e = p?['exercises'] is Map ? Map<String, dynamic>.from(p!['exercises'] as Map) : const <String, dynamic>{};
    String n(Object? x) => formatNumber(context, (x as num?) ?? 0);
    final tiles = <(IconData, String, String)>[
      (Icons.style_outlined, l.practiceReviewCards, '/learn/practice/review'),
      (Icons.abc, l.practiceVocabulary, '/learn/vocabulary'),
      (Icons.quiz_outlined, l.practiceExercises, '/learn/exercises'),
      (Icons.forum_outlined, l.practiceScenarios, '/learn/scenarios'),
    ];
    return Scaffold(
      appBar: AppBar(title: Text(l.practiceTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        if (p != null)
          Card(
            key: const ValueKey('practice-progress'),
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (v['due_now'] != null) Text(l.practiceDue(n(v['due_now']))),
                if (v['cards_learning'] != null) Text(l.practiceLearning(n(v['cards_learning']))),
                if (v['mastered'] != null) Text(l.practiceMastered(n(v['mastered']))),
                if (v['accuracy'] != null) Text(l.practiceAccuracy(n(v['accuracy']))),
                if (e['attempts'] != null) Text(l.practiceAttempts(n(e['attempts']))),
              ]),
            ),
          ),
        const SizedBox(height: Tokens.s3),
        for (final t in tiles)
          Padding(padding: const EdgeInsets.only(bottom: Tokens.s2), child: Card(child: ListTile(minVerticalPadding: Tokens.s4, leading: Icon(t.$1, color: Tokens.primary), title: Text(t.$2), trailing: const Icon(Icons.chevron_right), onTap: () => context.push(t.$3)))),
      ]),
    );
  }
}

// ------------------------------------------------------------------ vocabulary

class VocabularyScreen extends ConsumerStatefulWidget {
  const VocabularyScreen({super.key, this.category});
  final String? category;
  @override
  ConsumerState<VocabularyScreen> createState() => _VocabState();
}

class _VocabState extends ConsumerState<VocabularyScreen> {
  String? _level;
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.practiceVocabulary)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_level|$_q|${widget.category}|${ref.watch(localeProvider).languageCode}',
        emptyText: l.vocabEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/italian/vocabulary', query: {'page': page, 'per_page': 40, if (_level != null) 'level': _level, if (_q.isNotEmpty) 'q': _q, if (widget.category != null) 'category': widget.category});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        header: Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            TextField(key: const ValueKey('vocab-search'), textInputAction: TextInputAction.search, decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)), onSubmitted: (v) => setState(() => _q = v.trim())),
            const SizedBox(height: Tokens.s2),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.allCategories), selected: _level == null, onSelected: (_) => setState(() => _level = null))),
                for (final lv in _levels) Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(lv.toUpperCase()), selected: _level == lv, onSelected: (_) => setState(() => _level = lv))),
              ]),
            ),
          ]),
        ),
        itemBuilder: (context, v) => Card(
          child: ListTile(
            minVerticalPadding: Tokens.s3,
            title: Align(alignment: AlignmentDirectional.centerStart, child: Text('${v['lemma']}', textDirection: TextDirection.ltr)),
            subtitle: Text([v['gloss'], v['level_label'], v['category_label']].where((e) => e != null && '$e'.isNotEmpty).join(' · ')),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/learn/vocabulary/${Uri.encodeComponent('${v['slug']}')}'),
          ),
        ),
      ),
    );
  }
}

final vocabularyDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, slug) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/italian/vocabulary/${Uri.encodeComponent(slug)}')).map;
});

class VocabularyDetailScreen extends ConsumerWidget {
  const VocabularyDetailScreen({super.key, required this.slug});
  final String slug;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.practiceVocabulary)),
      body: AsyncBody<Map<String, dynamic>>(
        value: ref.watch(vocabularyDetailProvider(slug)),
        onRetry: () => ref.invalidate(vocabularyDetailProvider(slug)),
        data: (v) => ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
          italian(context, v['lemma'], style: theme.textTheme.headlineSmall),
          Text([v['part_of_speech'], v['level_label'], v['category_label']].where((e) => e != null && '$e'.isNotEmpty).join(' · '), style: theme.textTheme.bodySmall),
          if (v['fallback'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: l.fallbackLocale)),
          const SizedBox(height: Tokens.s3),
          if (v['gloss'] != null) Text('${v['gloss']}', style: theme.textTheme.titleMedium),
          if (v['example_it'] != null) ...[
            const SizedBox(height: Tokens.s4),
            Text(l.vocabExample, style: theme.textTheme.labelLarge),
            italian(context, v['example_it']),
            if (v['example_gloss'] != null) Text('${v['example_gloss']}', style: theme.textTheme.bodySmall),
          ],
          if (v['audio'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(text: l.vocabAudioNote)),
          if (v['progress'] is Map) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text(l.vocabBox(formatNumber(context, ((v['progress'] as Map)['box'] as num?) ?? 0)), style: theme.textTheme.bodySmall)),
          const SizedBox(height: Tokens.s4),
          TeacherReviewNotice(item: v),
        ]),
      ),
    );
  }
}

// ------------------------------------------------------------------ spaced repetition review

class ReviewScreen extends ConsumerStatefulWidget {
  const ReviewScreen({super.key});
  @override
  ConsumerState<ReviewScreen> createState() => _ReviewState();
}

class _ReviewState extends ConsumerState<ReviewScreen> {
  List<Map<String, dynamic>> _cards = [];
  int _i = 0;
  bool _loading = true, _shown = false, _busy = false;
  Object? _error, _saveError;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).get('/italian/practice/review', query: {'limit': 20});
      if (mounted) setState(() => _cards = _maps(r.map['cards']));
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _answer(bool correct) async {
    setState(() {
      _busy = true;
      _saveError = null;
    });
    try {
      await ref.read(apiClientProvider).post('/italian/vocabulary/${Uri.encodeComponent('${_cards[_i]['slug']}')}/review', body: {'correct': correct});
      if (!mounted) return;
      setState(() {
        _i++;
        _shown = false;
      });
      if (_i >= _cards.length) ref.invalidate(practiceProgressProvider);
    } catch (e) {
      if (mounted) setState(() => _saveError = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    Widget body;
    if (_loading) {
      body = const LoadingView();
    } else if (_error != null) {
      body = ErrorView(error: _error, onRetry: _load);
    } else if (_cards.isEmpty) {
      body = EmptyView(message: l.reviewEmpty, icon: Icons.style_outlined);
    } else if (_i >= _cards.length) {
      body = Padding(padding: const EdgeInsets.all(Tokens.s4), child: Notice(key: const ValueKey('review-done'), text: l.reviewDone(formatNumber(context, _cards.length)), kind: NoticeKind.success));
    } else {
      final c = _cards[_i];
      body = ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Text(l.reviewProgress(formatNumber(context, _i + 1), formatNumber(context, _cards.length)), key: const ValueKey('review-progress'), style: theme.textTheme.bodySmall),
        const SizedBox(height: Tokens.s3),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(Tokens.s5),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (c['new'] == true) Padding(padding: const EdgeInsets.only(bottom: Tokens.s2), child: Pill(text: l.reviewNew)),
              italian(context, c['lemma'], style: theme.textTheme.headlineMedium),
              if (_shown) ...[
                const SizedBox(height: Tokens.s3),
                if (c['gloss'] != null) Text('${c['gloss']}', key: const ValueKey('review-gloss'), style: theme.textTheme.titleMedium),
                if (c['example_it'] != null) ...[const SizedBox(height: Tokens.s2), italian(context, c['example_it']), if (c['example_gloss'] != null) Text('${c['example_gloss']}', style: theme.textTheme.bodySmall)],
              ],
            ]),
          ),
        ),
        const SizedBox(height: Tokens.s3),
        if (c['reviewed'] == false) ...[TeacherReviewNotice(item: c), const SizedBox(height: Tokens.s3)],
        if (_saveError != null) ...[Notice(text: errorMessage(l, _saveError), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
        if (!_shown)
          FilledButton(key: const ValueKey('review-show'), onPressed: () => setState(() => _shown = true), child: Text(l.reviewShow))
        else
          Row(children: [
            Expanded(child: OutlinedButton(key: const ValueKey('review-no'), onPressed: _busy ? null : () => _answer(false), child: Text(l.reviewNotYet))),
            const SizedBox(width: Tokens.s3),
            Expanded(child: FilledButton(key: const ValueKey('review-yes'), onPressed: _busy ? null : () => _answer(true), child: Text(l.reviewKnew))),
          ]),
      ]);
    }
    return Scaffold(appBar: AppBar(title: Text(l.reviewTitle)), body: body);
  }
}

// ------------------------------------------------------------------ exercises

const exerciseTypes = ['multiple_choice', 'listening', 'fill_blank', 'match'];

String exerciseTypeLabel(AppL10n l, String t) => switch (t) { 'multiple_choice' => l.exTypeMultiple, 'listening' => l.exTypeListening, 'fill_blank' => l.exTypeFill, 'match' => l.exTypeMatch, _ => t };

class ExercisesScreen extends ConsumerStatefulWidget {
  const ExercisesScreen({super.key, this.scenario});
  final String? scenario;
  @override
  ConsumerState<ExercisesScreen> createState() => _ExercisesState();
}

class _ExercisesState extends ConsumerState<ExercisesScreen> {
  String? _type, _level;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    Widget chips<T>(List<String> values, String? cur, String Function(String) label, void Function(String?) set) => SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(l.exTypeAll), selected: cur == null, onSelected: (_) => setState(() => set(null)))),
            for (final v in values) Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s2), child: ChoiceChip(label: Text(label(v)), selected: cur == v, onSelected: (_) => setState(() => set(v)))),
          ]),
        );
    return Scaffold(
      appBar: AppBar(title: Text(l.practiceExercises)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_type|$_level|${widget.scenario}|${ref.watch(localeProvider).languageCode}',
        emptyText: l.exercisesEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/italian/exercises', query: {'page': page, 'per_page': 30, if (_type != null) 'type': _type, if (_level != null) 'level': _level, if (widget.scenario != null) 'scenario': widget.scenario});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        header: Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            chips<String>(exerciseTypes, _type, (v) => exerciseTypeLabel(l, v), (v) => _type = v),
            const SizedBox(height: Tokens.s2),
            chips<String>(_levels, _level, (v) => v.toUpperCase(), (v) => _level = v),
          ]),
        ),
        itemBuilder: (context, e) => Card(
          child: ListTile(
            minVerticalPadding: Tokens.s3,
            title: Text('${e['prompt']}'),
            subtitle: Text([e['type_label'], e['level_label'], e['scenario_label']].where((x) => x != null && '$x'.isNotEmpty).join(' · ')),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/learn/exercises/${Uri.encodeComponent('${e['slug']}')}'),
          ),
        ),
      ),
    );
  }
}

final exerciseDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, slug) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/italian/exercises/${Uri.encodeComponent(slug)}')).map;
});

class ExerciseScreen extends ConsumerWidget {
  const ExerciseScreen({super.key, required this.slug});
  final String slug;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.practiceExercises)),
      body: AsyncBody<Map<String, dynamic>>(
        value: ref.watch(exerciseDetailProvider(slug)),
        onRetry: () => ref.invalidate(exerciseDetailProvider(slug)),
        data: (e) => ExercisePlayer(key: ValueKey(slug), exercise: e),
      ),
    );
  }
}

/// Plays one exercise. The answer is graded by the server (`POST /italian/exercises/{slug}/attempt`); the correct
/// answer is only shown after an attempt.
class ExercisePlayer extends ConsumerStatefulWidget {
  const ExercisePlayer({super.key, required this.exercise});
  final Map<String, dynamic> exercise;
  @override
  ConsumerState<ExercisePlayer> createState() => _ExercisePlayerState();
}

class _ExercisePlayerState extends ConsumerState<ExercisePlayer> {
  int? _choice;
  final _text = TextEditingController();
  final Map<int, int?> _matches = {};
  bool _busy = false;
  Object? _error;
  String? _local;
  Map<String, dynamic>? _result;

  Map<String, dynamic> get _e => widget.exercise;
  String get _type => '${_e['type']}';
  Map<String, dynamic> get _form => _e['form'] is Map ? Map<String, dynamic>.from(_e['form'] as Map) : const {};

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  Object? _answer(AppL10n l) {
    switch (_type) {
      case 'multiple_choice':
      case 'listening':
        if (_choice == null) _local = l.exChooseOne;
        return _choice;
      case 'fill_blank':
        if (_text.text.trim().isEmpty) _local = l.exTypeFirst;
        return _text.text.trim().isEmpty ? null : _text.text.trim();
      case 'match':
        final left = _maps(_form['left']);
        final ids = [for (var i = 0; i < left.length; i++) _matches[i]];
        if (ids.any((x) => x == null) || ids.toSet().length != ids.length) _local = l.exMatchAll;
        return ids.any((x) => x == null) || ids.toSet().length != ids.length ? null : ids;
    }
    return null;
  }

  Future<void> _check() async {
    final l = AppL10n.of(context);
    _local = null;
    final a = _answer(l);
    if (a == null) return setState(() {});
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).post('/italian/exercises/${Uri.encodeComponent('${_e['slug']}')}/attempt', body: {'answer': a});
      ref.invalidate(practiceProgressProvider);
      if (mounted) setState(() => _result = r.map);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _correctText(AppL10n l) {
    final ca = _result?['correct_answer'];
    if (ca is! Map) return '';
    if (ca['index'] != null) {
      final c = _maps(_form['choices']).where((x) => x['index'] == ca['index']).firstOrNull;
      return '${c?['text'] ?? ca['index']}';
    }
    if (ca['answers'] is List) return (ca['answers'] as List).join(' / ');
    if (ca['right_ids'] is List) {
      final right = {for (final r in _maps(_form['right'])) r['id']: '${r['text']}'};
      final left = _maps(_form['left']);
      final ids = ca['right_ids'] as List;
      return [for (var i = 0; i < left.length && i < ids.length; i++) '${left[i]['text']} = ${right[ids[i]] ?? ''}'].join('; ');
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final done = _result != null;
    final audio = _e['audio'];
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      Text([_e['type_label'], _e['level_label']].where((x) => x != null && '$x'.isNotEmpty).join(' · '), style: theme.textTheme.bodySmall),
      const SizedBox(height: Tokens.s1),
      Text('${_e['prompt']}', style: theme.textTheme.titleMedium),
      if (_e['fallback'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: l.fallbackLocale)),
      if (_type == 'listening') Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(key: const ValueKey('listening-note'), text: audio == null ? l.exNoAudio : l.exAudioUnsupported)),
      const SizedBox(height: Tokens.s3),
      if (_local != null || _error != null) ...[Notice(key: const ValueKey('exercise-error'), text: _local ?? errorMessage(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
      ..._body(context, l, done),
      const SizedBox(height: Tokens.s3),
      if (!done) FilledButton(key: const ValueKey('exercise-check'), onPressed: _busy ? null : _check, child: Text(l.exCheck)),
      if (done) ...[
        Notice(
          key: const ValueKey('exercise-result'),
          text: _result!['correct'] == true ? l.exCorrect : '${l.exWrong}\n${l.exCorrectAnswer(_correctText(l))}',
          kind: _result!['correct'] == true ? NoticeKind.success : NoticeKind.danger,
        ),
        if ('${_result!['explanation'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${_result!['explanation']}')),
        const SizedBox(height: Tokens.s3),
        OutlinedButton(onPressed: () => context.canPop() ? context.pop() : context.go('/learn/exercises'), child: Text(l.exTryAnother)),
      ],
      const SizedBox(height: Tokens.s4),
      TeacherReviewNotice(item: _e),
    ]);
  }

  List<Widget> _body(BuildContext context, AppL10n l, bool done) {
    final theme = Theme.of(context);
    switch (_type) {
      case 'multiple_choice':
      case 'listening':
        return [
          if ('${_form['stem'] ?? ''}'.isNotEmpty) Padding(padding: const EdgeInsets.only(bottom: Tokens.s2), child: italian(context, _form['stem'], style: theme.textTheme.titleMedium)),
          RadioGroup<int>(
            groupValue: _choice,
            onChanged: (v) => done ? null : setState(() => _choice = v),
            child: Column(children: [for (final c in _maps(_form['choices'])) RadioListTile<int>(key: ValueKey('choice-${c['index']}'), contentPadding: EdgeInsets.zero, enabled: !done, value: (c['index'] as num).toInt(), title: Text('${c['text']}'))]),
          ),
        ];
      case 'fill_blank':
        return [
          italian(context, _form['sentence'], style: theme.textTheme.titleMedium),
          const SizedBox(height: Tokens.s2),
          TextField(key: const ValueKey('fill-answer'), controller: _text, enabled: !done, textDirection: TextDirection.ltr, autocorrect: false, decoration: InputDecoration(labelText: l.exAnswerHint)),
        ];
      case 'match':
        final right = _maps(_form['right']);
        return [
          for (final lf in _maps(_form['left']))
            Padding(
              padding: const EdgeInsets.only(bottom: Tokens.s3),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                italian(context, lf['text'], style: theme.textTheme.titleSmall),
                DropdownButtonFormField<int>(
                  key: ValueKey('match-${lf['index']}'),
                  isExpanded: true,
                  decoration: InputDecoration(hintText: l.exMatchChoose),
                  initialValue: _matches[(lf['index'] as num).toInt()],
                  items: [for (final r in right) DropdownMenuItem(value: (r['id'] as num).toInt(), child: Text('${r['text']}', overflow: TextOverflow.ellipsis))],
                  onChanged: done ? null : (v) => setState(() => _matches[(lf['index'] as num).toInt()] = v),
                ),
              ]),
            ),
        ];
    }
    return [Text('${_e['type']}')];
  }
}

// ------------------------------------------------------------------ scenarios

class ScenariosScreen extends ConsumerWidget {
  const ScenariosScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.practiceScenarios)),
      body: AsyncBody<List<Map<String, dynamic>>>(
        value: ref.watch(scenariosProvider),
        onRetry: () => ref.invalidate(scenariosProvider),
        data: (list) {
          final shown = [for (final s in list) if ((((s['lessons'] as num?) ?? 0) + ((s['vocabulary'] as num?) ?? 0) + ((s['exercises'] as num?) ?? 0)) > 0) s];
          if (shown.isEmpty) return EmptyView(message: l.scenariosEmpty, icon: Icons.forum_outlined);
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            for (final s in shown)
              Card(
                child: ListTile(
                  minVerticalPadding: Tokens.s3,
                  title: Text('${s['label']}'),
                  subtitle: Text(l.scenarioCounts(formatNumber(context, (s['lessons'] as num?) ?? 0), formatNumber(context, (s['vocabulary'] as num?) ?? 0), formatNumber(context, (s['exercises'] as num?) ?? 0))),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/learn/scenarios/${Uri.encodeComponent('${s['value']}')}'),
                ),
              ),
          ]);
        },
      ),
    );
  }
}

class ScenarioDetailScreen extends ConsumerWidget {
  const ScenarioDetailScreen({super.key, required this.value});
  final String value;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final s = ref.watch(scenariosProvider).valueOrNull?.where((x) => x['value'] == value).firstOrNull;
    final q = Uri.encodeQueryComponent(value);
    return Scaffold(
      appBar: AppBar(title: Text('${s?['label'] ?? l.practiceScenarios}')),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        for (final t in <(IconData, String, String, num?)>[
          (Icons.menu_book_outlined, l.lessonsTitle, '/learn?scenario=$q', s?['lessons'] as num?),
          (Icons.abc, l.practiceVocabulary, '/learn/vocabulary?category=$q', s?['vocabulary'] as num?),
          (Icons.quiz_outlined, l.practiceExercises, '/learn/exercises?scenario=$q', s?['exercises'] as num?),
        ])
          if (t.$4 == null || t.$4! > 0) Card(child: ListTile(minVerticalPadding: Tokens.s3, leading: Icon(t.$1, color: Tokens.primary), title: Text(t.$2), trailing: const Icon(Icons.chevron_right), onTap: () => context.push(t.$3))),
      ]),
    );
  }
}
