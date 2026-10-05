import 'package:expa_mobile/features/patente/patente.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

TestEnv hubEnv({List<Map<String, dynamic>> topics = const [], List<Map<String, dynamic>> cats = const [], Map<String, dynamic>? progress}) {
  final env = TestEnv();
  env.backend.ok('GET /patente/topics', topics);
  env.backend.ok('GET /patente/categories', cats);
  env.backend.ok('GET /patente/rules', {'questions': 30, 'max_errors': 3, 'minutes': 20, 'practice_max_questions': 40});
  env.backend.ok('GET /patente/progress', progress ?? {'summary': {'exams_taken': 0, 'exams_passed': 0, 'recent_pass_rate': null}, 'topics': []});
  return env;
}

Map<String, dynamic> exam({String? deadline, int n = 2}) => {
      'id': 5,
      'mode': deadline == null ? 'practice' : 'exam',
      'finished': false,
      'max_errors': 3,
      'deadline_at': deadline,
      'questions': [for (var i = 1; i <= n; i++) {'id': i, 'statement': 'Statement $i', 'statement_it': 'Affermazione $i', 'locale': 'en'}],
    };

void main() {
  for (final lang in langs) {
    testWidgets('[$lang] empty content shows an honest "not published yet" state', (tester) async {
      await pumpScreen(tester, const PatenteScreen(), hubEnv(), lang: lang);
      final l = await l10n(lang);
      expect(find.text(l.patenteEmpty), findsOneWidget);
      expect(find.byKey(const ValueKey('patente-start-exam')), findsNothing);
    });
  }

  testWidgets('hub with content: rules, topics, weak topics and practice start', (tester) async {
    final env = hubEnv(
      topics: [
        {'slug': 'segnali', 'title': 'Road signs', 'question_count': 12},
        {'slug': 'empty', 'title': 'No questions', 'question_count': 0},
      ],
      progress: {
        'summary': {'exams_taken': 4, 'exams_passed': 2, 'recent_pass_rate': 50},
        'topics': [
          {'topic': {'slug': 'segnali', 'title': 'Road signs'}, 'answered': 10, 'correct': 3, 'accuracy': 30, 'weak': true},
        ],
      },
    );
    env.backend.ok('POST /patente/exams', {'id': 5, 'mode': 'practice'});
    await pumpScreen(tester, const PatenteScreen(), env, size: const Size(360, 1400));
    final l = await l10n('en');
    expect(find.text('Road signs'), findsWidgets);
    expect(find.text(l.patenteRules('30', '3', '20')), findsOneWidget);
    expect(find.byKey(const ValueKey('patente-weak')), findsOneWidget);
    // a topic without published questions cannot be ticked for practice
    expect(tester.widgetList<Checkbox>(find.byType(Checkbox)).map((c) => c.onChanged == null), [false, true]);
    await tester.tap(find.byType(Checkbox).first);
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('patente-start-practice')));
    await tester.pumpAndSettle();
    expect(env.backend.where('POST', '/patente/exams').single.body, {'mode': 'practice', 'topics': ['segnali']});
  });

  testWidgets('starting an exam without verified e-mail shows the localized verify message', (tester) async {
    final env = hubEnv(topics: [{'slug': 'a', 'title': 'A', 'question_count': 3}]);
    env.backend.error('POST /patente/exams', 403, 'email_not_verified');
    await pumpScreen(tester, const PatenteScreen(), env, lang: 'ar');
    await tester.tap(find.byKey(const ValueKey('patente-start-exam')));
    await tester.pumpAndSettle();
    expect(find.text((await l10n('ar')).askVerifyEmail), findsOneWidget);
  });

  group('exam flow', () {
    testWidgets('practice: answer, submit, graded review with explanation and Italian original', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/5', exam());
      env.backend.ok('POST /patente/exams/5/answers', {
        'id': 5, 'mode': 'practice', 'finished': true, 'correct': 1, 'errors': 1, 'total': 2, 'passed': null, 'timed_out': false, 'max_errors': 3,
        'review': [
          {'question_id': 1, 'statement': 'Statement 1', 'statement_it': 'Affermazione 1', 'your_answer': true, 'correct_answer': true, 'correct': true, 'explanation': 'Because.'},
          {'question_id': 2, 'statement': 'Statement 2', 'statement_it': 'Affermazione 2', 'your_answer': null, 'correct_answer': null, 'correct': false, 'explanation': null},
        ],
      });
      await pumpScreen(tester, const ExamScreen(id: 5), env, size: const Size(360, 1200));
      expect(find.byKey(const ValueKey('exam-timer')), findsNothing, reason: 'practice has no timer');
      expect(find.text('Affermazione 1'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('q1-true')));
      await tester.pump();
      expect(find.text('Answered 1 of 2'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('exam-submit')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/patente/exams/5/answers').single.body, {
        'answers': [{'question_id': 1, 'answer': true}, {'question_id': 2, 'answer': null}],
      });
      expect(find.byKey(const ValueKey('exam-result')), findsOneWidget);
      expect(find.text('Because.'), findsOneWidget);
      expect(find.text((await l10n('en')).patenteNotAnswered), findsOneWidget);
    });

    testWidgets('exam: timer counts down from deadline_at and auto-submits at zero', (tester) async {
      var now = DateTime.utc(2026, 10, 5, 10, 0, 0);
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/5', exam(deadline: '2026-10-05T10:00:03Z'));
      env.backend.ok('POST /patente/exams/5/answers', {'id': 5, 'mode': 'exam', 'finished': true, 'correct': 0, 'errors': 2, 'total': 2, 'passed': false, 'timed_out': true, 'max_errors': 3, 'review': []});
      await pumpScreen(tester, ExamScreen(id: 5, now: () => now), env);
      expect(find.text('00:03'), findsOneWidget);
      now = now.add(const Duration(seconds: 5));
      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/patente/exams/5/answers'), hasLength(1), reason: 'auto-submitted exactly once');
      expect(find.byKey(const ValueKey('exam-result')), findsOneWidget);
      expect(find.text((await l10n('en')).patenteTimedOut), findsOneWidget);
    });

    testWidgets('submitting too early shows the dedicated message and stays on the questions', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/5', exam());
      env.backend.error('POST /patente/exams/5/answers', 422, 'exam_submitted_too_early');
      await pumpScreen(tester, const ExamScreen(id: 5), env, size: const Size(360, 1200));
      await tester.tap(find.byKey(const ValueKey('exam-submit')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).patenteTooEarly), findsOneWidget);
      expect(find.byKey(const ValueKey('exam-submit')), findsOneWidget);
    });

    testWidgets('a finished exam reopens as a result', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/5', {'id': 5, 'mode': 'exam', 'finished': true, 'passed': true, 'correct': 29, 'errors': 1, 'total': 30, 'max_errors': 3, 'timed_out': false, 'review': []});
      await pumpScreen(tester, const ExamScreen(id: 5), env);
      expect(find.text((await l10n('en')).patentePassed), findsOneWidget);
    });

    testWidgets('a load failure offers retry', (tester) async {
      final env2 = TestEnv()..backend.offline = true;
      await pumpScreen(tester, const ExamScreen(id: 5), env2, lang: 'it');
      expect(find.text((await l10n('it')).retry), findsOneWidget);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name question page has no overflow, Italian statement stays LTR', (tester) async {
          final env = TestEnv();
          env.backend.ok('GET /patente/exams/5', exam(deadline: '2099-01-01T00:00:00Z', n: 3));
          await pumpScreen(tester, ExamScreen(id: 5, now: () => DateTime.utc(2026)), env, lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull);
          if (lang != 'it') {
            expect(tester.widget<Text>(find.text('Affermazione 1')).textDirection, TextDirection.ltr);
          }
          await tester.pumpWidget(const SizedBox());
        });
      }
    }
  });
}
