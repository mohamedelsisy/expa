import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_exception.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import 'patente_topic.dart' show PatenteQuestionExplain;

List<Map<String, dynamic>> _maps(Object? v) => [for (final e in (v as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)];

final patenteTopicsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  return _maps((await ref.watch(apiClientProvider).get('/patente/topics')).data);
});

final patenteCategoriesProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  return _maps((await ref.watch(apiClientProvider).get('/patente/categories')).data);
});

final patenteRulesProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  return (await ref.watch(apiClientProvider).get('/patente/rules')).map;
});

final patenteProgressProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/patente/progress')).map;
});

/// Patente hub: topics (study), mock exam, practice by topic, progress and weak topics.
/// Works with no published content: the empty state says so (the backend only publishes questions that have
/// a recorded licence/provenance, so an empty catalogue is expected until content is cleared).
class PatenteScreen extends ConsumerStatefulWidget {
  const PatenteScreen({super.key});
  @override
  ConsumerState<PatenteScreen> createState() => _PatenteState();
}

class _PatenteState extends ConsumerState<PatenteScreen> {
  final Set<String> _selected = {};
  bool _busy = false;
  Object? _error;

  Future<void> _start(String mode, {List<String> topics = const []}) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final r = mode == 'weak'
          ? await ref.read(apiClientProvider).post('/patente/practice/weak')
          : await ref.read(apiClientProvider).post('/patente/exams', body: {'mode': mode, if (mode == 'practice') 'topics': topics});
      final id = (r.map['id'] as num?)?.toInt();
      if (id != null && mounted) {
        await context.push('/patente/exam/$id');
        ref.invalidate(patenteProgressProvider);
      }
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
    final topics = ref.watch(patenteTopicsProvider);
    final cats = ref.watch(patenteCategoriesProvider);
    final rules = ref.watch(patenteRulesProvider).valueOrNull;
    final progress = ref.watch(patenteProgressProvider).valueOrNull;
    return Scaffold(
      appBar: AppBar(title: Text(l.patenteTitle)),
      body: AsyncBody<List<Map<String, dynamic>>>(
        value: topics,
        onRetry: () => ref.invalidate(patenteTopicsProvider),
        data: (list) {
          final categories = cats.valueOrNull ?? const <Map<String, dynamic>>[];
          if (list.isEmpty && categories.isEmpty) {
            return Column(children: [
              Padding(padding: const EdgeInsets.all(Tokens.s4), child: Notice(text: l.patenteDisclaimer, kind: NoticeKind.warning)),
              Expanded(child: EmptyView(message: l.patenteEmpty, icon: Icons.directions_car_outlined)),
            ]);
          }
          final withQuestions = [for (final t in list) if (((t['question_count'] as num?) ?? 0) > 0) t];
          final weak = [for (final t in _maps(progress?['topics'])) if (t['weak'] == true) '${(t['topic'] as Map)['slug']}'];
          final summary = (progress?['summary'] as Map?) ?? const {};
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Notice(text: l.patenteDisclaimer, kind: NoticeKind.warning),
            const SizedBox(height: Tokens.s4),
            if (_error != null) ...[Notice(text: errorMessage(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
            Card(
              child: Padding(
                padding: const EdgeInsets.all(Tokens.s4),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.patenteMockExam, style: theme.textTheme.titleMedium),
                  if (rules != null) Text(l.patenteRules(formatNumber(context, (rules['questions'] as num?) ?? 0), formatNumber(context, (rules['max_errors'] as num?) ?? 0), formatNumber(context, (rules['minutes'] as num?) ?? 0))),
                  const SizedBox(height: Tokens.s2),
                  FilledButton(key: const ValueKey('patente-start-exam'), onPressed: _busy ? null : () => _start('exam'), child: Text(l.patenteStartExam)),
                ]),
              ),
            ),
            const SizedBox(height: Tokens.s2),
            Card(child: ListTile(key: const ValueKey('patente-open-weak'), leading: const Icon(Icons.insights_outlined, color: Tokens.primary), title: Text(l.patenteWeakOpen), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/patente/weak'))),
            Card(child: ListTile(key: const ValueKey('patente-open-glossary'), leading: const Icon(Icons.translate, color: Tokens.primary), title: Text(l.patenteGlossaryOpen), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/patente/glossary'))),
            if (progress != null) ...[
              const SizedBox(height: Tokens.s3),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s4),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(l.patenteProgress, style: theme.textTheme.titleMedium),
                    Text(l.patenteProgressLine(formatNumber(context, (summary['exams_taken'] as num?) ?? 0), formatNumber(context, (summary['exams_passed'] as num?) ?? 0))),
                    if (summary['recent_pass_rate'] != null) Text(l.patentePassRate(formatNumber(context, summary['recent_pass_rate'] as num))),
                    if (weak.isNotEmpty) ...[
                      const SizedBox(height: Tokens.s2),
                      Notice(key: const ValueKey('patente-weak'), text: l.patenteWeakTopics(_maps(progress['topics']).where((t) => t['weak'] == true).map((t) => '${(t['topic'] as Map)['title']}').join(', ')), kind: NoticeKind.warning),
                      TextButton(onPressed: _busy ? null : () => _start('weak'), child: Text(l.patentePracticeWeak)),
                    ],
                  ]),
                ),
              ),
            ],
            const SizedBox(height: Tokens.s4),
            Text(l.patenteTopics, style: theme.textTheme.titleMedium),
            Text(l.patenteTopicsHint, style: theme.textTheme.bodySmall),
            const SizedBox(height: Tokens.s2),
            if (list.isEmpty) Text(l.patenteNoTopics),
            for (final t in list)
              Card(
                child: ListTile(
                  title: Text('${t['title']}'),
                  subtitle: Text(l.patenteQuestionCount(formatNumber(context, (t['question_count'] as num?) ?? 0))),
                  leading: Checkbox(
                    value: _selected.contains('${t['slug']}'),
                    // A topic without published questions cannot be practised, but can still be studied.
                    onChanged: ((t['question_count'] as num?) ?? 0) > 0 ? (v) => setState(() => v == true ? _selected.add('${t['slug']}') : _selected.remove('${t['slug']}')) : null,
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/patente/topics/${Uri.encodeComponent('${t['slug']}')}'),
                ),
              ),
            if (withQuestions.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: Tokens.s2),
                child: OutlinedButton(key: const ValueKey('patente-start-practice'), onPressed: (_busy || _selected.isEmpty) ? null : () => _start('practice', topics: _selected.toList()), child: Text(l.patentePractice)),
              ),
            if (categories.isNotEmpty) ...[
              const SizedBox(height: Tokens.s5),
              Text(l.patenteCategories, style: theme.textTheme.titleMedium),
              const SizedBox(height: Tokens.s2),
              for (final c in categories)
                Card(child: ListTile(title: Text('${c['title']}'), subtitle: c['summary'] == null ? null : Text('${c['summary']}', maxLines: 2, overflow: TextOverflow.ellipsis), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/patente/categories/${Uri.encodeComponent('${c['slug']}')}'))),
            ],
          ]);
        },
      ),
    );
  }
}

/// Runs (or shows the result of) one exam/practice session: `GET /patente/exams/{id}` returns the questions
/// while unfinished and the graded result once finished, so a finished exam can be reopened.
class ExamScreen extends ConsumerStatefulWidget {
  const ExamScreen({super.key, required this.id, this.now});
  final int id;

  /// Injected in tests.
  final DateTime Function()? now;
  @override
  ConsumerState<ExamScreen> createState() => _ExamState();
}

class _ExamState extends ConsumerState<ExamScreen> {
  Map<String, dynamic>? _exam;
  Object? _error;
  bool _loading = true, _submitting = false;
  final Map<int, bool?> _answers = {};
  final Map<int, Map<String, dynamic>> _feedback = {};
  final Set<int> _checking = {};
  Timer? _ticker;
  Duration? _left;
  bool _autoSubmitted = false;

  DateTime _now() => (widget.now ?? DateTime.now)();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).get('/patente/exams/${widget.id}');
      if (!mounted) return;
      setState(() {
        _exam = r.map;
        _loading = false;
      });
      _startTimer();
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e;
          _loading = false;
        });
      }
    }
  }

  void _startTimer() {
    _ticker?.cancel();
    final deadline = DateTime.tryParse('${_exam?['deadline_at']}');
    if (deadline == null || _exam?['finished'] == true) {
      _left = null;
      return;
    }
    void tick() {
      final left = deadline.difference(_now());
      if (!mounted) return;
      setState(() => _left = left.isNegative ? Duration.zero : left);
      if (left.isNegative && !_autoSubmitted && !_submitting) {
        _autoSubmitted = true;
        _submit(); // time is up: grade what was answered
      }
    }

    tick();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => tick());
  }

  Future<void> _submit() async {
    final questions = [for (final q in (_exam?['questions'] as List? ?? const [])) if (q is Map) q];
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).post('/patente/exams/${widget.id}/answers', body: {
        'answers': [for (final q in questions) {'question_id': q['id'], 'answer': _answers[(q['id'] as num).toInt()]}],
      });
      _ticker?.cancel();
      ref.invalidate(patenteProgressProvider);
      if (mounted) setState(() => _exam = r.map);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  /// Instant feedback on ONE question of a practice session (`POST /patente/exams/{id}/check`). Practice only.
  Future<void> _check(int qid) async {
    final answer = _answers[qid];
    if (answer == null) return;
    setState(() {
      _checking.add(qid);
      _error = null;
    });
    try {
      final r = await ref.read(apiClientProvider).post('/patente/exams/${widget.id}/check', body: {'question_id': qid, 'answer': answer});
      if (mounted) setState(() => _feedback[qid] = r.map);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _checking.remove(qid));
    }
  }

  String _clock(Duration d) => '${d.inMinutes.toString().padLeft(2, '0')}:${(d.inSeconds % 60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final exam = _exam;
    return Scaffold(
      appBar: AppBar(title: Text(l.patenteTitle), actions: [
        if (_left != null) Padding(padding: const EdgeInsetsDirectional.only(end: Tokens.s4), child: Center(child: Semantics(label: l.patenteTimeLeft(_clock(_left!)), child: Text(_clock(_left!), key: const ValueKey('exam-timer'), textDirection: TextDirection.ltr, style: Theme.of(context).textTheme.titleMedium)))),
      ]),
      body: _loading
          ? const LoadingView()
          : exam == null
              ? ErrorView(error: _error, onRetry: _load)
              : exam['finished'] == true
                  ? ExamResultView(result: exam)
                  : _questions(context, l, exam),
    );
  }

  Widget _questions(BuildContext context, AppL10n l, Map<String, dynamic> exam) {
    final theme = Theme.of(context);
    final questions = [for (final q in (exam['questions'] as List? ?? const [])) if (q is Map) Map<String, dynamic>.from(q)];
    final answered = _answers.values.where((v) => v != null).length;
    final locale = Localizations.localeOf(context).languageCode;
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      Text(l.patenteAnswered(formatNumber(context, answered), formatNumber(context, questions.length)), key: const ValueKey('exam-progress')),
      if (exam['mode'] == 'exam') Text(l.patenteMaxErrors(formatNumber(context, (exam['max_errors'] as num?) ?? 0)), style: theme.textTheme.bodySmall),
      const SizedBox(height: Tokens.s3),
      if (_error != null) ...[Notice(text: _examError(l, _error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
      for (var i = 0; i < questions.length; i++)
        Card(
          child: Padding(
            padding: const EdgeInsets.all(Tokens.s4),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${i + 1}. ${questions[i]['statement']}', style: theme.textTheme.titleMedium),
              if (locale != 'it' && questions[i]['statement_it'] != null && questions[i]['statement_it'] != questions[i]['statement'])
                Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Align(alignment: AlignmentDirectional.centerStart, child: Text('${questions[i]['statement_it']}', textDirection: TextDirection.ltr, style: theme.textTheme.bodySmall))),
              const SizedBox(height: Tokens.s2),
              Wrap(spacing: Tokens.s2, children: [
                for (final v in [true, false])
                  ChoiceChip(
                    key: ValueKey('q${questions[i]['id']}-${v ? 'true' : 'false'}'),
                    label: Text(v ? l.patenteTrue : l.patenteFalse),
                    selected: _answers[(questions[i]['id'] as num).toInt()] == v,
                    onSelected: _submitting || _feedback.containsKey((questions[i]['id'] as num).toInt()) ? null : (_) => setState(() => _answers[(questions[i]['id'] as num).toInt()] = v),
                  ),
              ]),
              if (exam['mode'] == 'practice') ..._practiceCheck(context, l, (questions[i]['id'] as num).toInt(), questions[i]),
            ]),
          ),
        ),
      const SizedBox(height: Tokens.s2),
      FilledButton(key: const ValueKey('exam-submit'), onPressed: _submitting ? null : _submit, child: _submitting ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.patenteSubmit)),
    ]);
  }

  List<Widget> _practiceCheck(BuildContext context, AppL10n l, int qid, Map<String, dynamic> q) {
    final fb = _feedback[qid];
    final theme = Theme.of(context);
    if (fb == null) {
      return [
        const SizedBox(height: Tokens.s2),
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: OutlinedButton(key: ValueKey('check-$qid'), onPressed: _checking.contains(qid) || _answers[qid] == null ? null : () => _check(qid), child: Text(l.patenteCheck)),
        ),
      ];
    }
    final ex = fb['explanations'] is Map ? Map<String, dynamic>.from(fb['explanations'] as Map) : const <String, dynamic>{};
    final labels = {'it': l.patenteExplanationIt, 'ar': l.patenteExplanationAr, 'en': l.patenteExplanationEn};
    return [
      const SizedBox(height: Tokens.s2),
      Notice(key: ValueKey('feedback-$qid'), text: fb['correct'] == true ? l.patenteFeedbackCorrect : l.patenteFeedbackWrong(fb['correct_answer'] == true ? l.patenteTrue : l.patenteFalse), kind: fb['correct'] == true ? NoticeKind.success : NoticeKind.danger),
      for (final lang in const ['it', 'ar', 'en'])
        if ('${ex[lang] ?? ''}'.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: Tokens.s2),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(labels[lang]!, style: theme.textTheme.labelLarge),
              Text('${ex[lang]}', textDirection: lang == 'ar' ? TextDirection.rtl : (lang == 'it' || lang == 'en' ? TextDirection.ltr : null)),
            ]),
          ),
      PatenteQuestionExplain(slug: q['slug'] as String?, statement: '${q['statement_it'] ?? q['statement']}'),
    ];
  }

  String _examError(AppL10n l, Object? e) {
    if (e is ValidationException && e.code == 'exam_submitted_too_early') {
      return l.patenteTooEarly;
    }
    return errorMessage(l, e);
  }
}

class ExamResultView extends StatelessWidget {
  const ExamResultView({super.key, required this.result});
  final Map<String, dynamic> result;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final isExam = result['mode'] != 'practice';
    final passed = result['passed'] == true;
    final review = [for (final r in (result['review'] as List? ?? const [])) if (r is Map) r];
    return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
      if (isExam)
        Notice(key: const ValueKey('exam-result'), title: passed ? l.patentePassed : l.patenteFailed, text: l.patenteResultLine(formatNumber(context, (result['correct'] as num?) ?? 0), formatNumber(context, (result['errors'] as num?) ?? 0), formatNumber(context, (result['max_errors'] as num?) ?? 0)), kind: passed ? NoticeKind.success : NoticeKind.danger)
      else
        Notice(key: const ValueKey('exam-result'), text: l.patentePracticeResult(formatNumber(context, (result['correct'] as num?) ?? 0), formatNumber(context, (result['total'] as num?) ?? review.length)), kind: NoticeKind.info),
      if (result['timed_out'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: l.patenteTimedOut, kind: NoticeKind.warning)),
      const SizedBox(height: Tokens.s3),
      Text(l.patenteReview, style: theme.textTheme.titleMedium),
      for (final r in review)
        Card(
          child: Padding(
            padding: const EdgeInsets.all(Tokens.s4),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${r['statement']}', style: theme.textTheme.titleSmall),
              if (r['statement_it'] != null && r['statement_it'] != r['statement']) Align(alignment: AlignmentDirectional.centerStart, child: Text('${r['statement_it']}', textDirection: TextDirection.ltr, style: theme.textTheme.bodySmall)),
              const SizedBox(height: Tokens.s2),
              Row(children: [
                Icon(r['correct'] == true ? Icons.check_circle : (r['your_answer'] == null ? Icons.remove_circle_outline : Icons.cancel), color: r['correct'] == true ? Tokens.success : (r['your_answer'] == null ? Tokens.muted : Tokens.danger), size: 20),
                const SizedBox(width: Tokens.s2),
                Expanded(child: Text(r['your_answer'] == null ? l.patenteNotAnswered : l.patenteYourAnswer(r['your_answer'] == true ? l.patenteTrue : l.patenteFalse))),
              ]),
              if (r['correct_answer'] != null) Text(l.patenteCorrectAnswer(r['correct_answer'] == true ? l.patenteTrue : l.patenteFalse), style: theme.textTheme.bodySmall),
              if (r['explanation'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text('${r['explanation']}', style: theme.textTheme.bodySmall)),
              PatenteQuestionExplain(slug: r['slug'] as String?, statement: '${r['statement_it'] ?? r['statement']}'),
            ]),
          ),
        ),
      const SizedBox(height: Tokens.s3),
      OutlinedButton(onPressed: () => context.canPop() ? context.pop() : context.go('/patente'), child: Text(l.patenteBack)),
    ]);
  }
}
