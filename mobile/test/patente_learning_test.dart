import 'package:expa_mobile/features/patente/patente.dart';
import 'package:expa_mobile/features/patente/patente_learning.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

final _weak = {
  'threshold': 70,
  'min_answers': 5,
  'weak': [
    {'topic': {'slug': 'segnali', 'title': 'Road signs'}, 'answered': 10, 'correct': 3, 'accuracy': 30, 'weak': true, 'available_questions': 12},
  ],
  'untouched': [
    {'topic': {'slug': 'precedenza', 'title': 'Right of way'}, 'answered': 0, 'correct': 0, 'accuracy': null, 'weak': false, 'available_questions': 8},
  ],
  'recommended': 'segnali',
};

TestEnv weakEnv([Map<String, dynamic>? data]) {
  final env = TestEnv();
  env.backend.ok('GET /patente/weak-topics', data ?? _weak);
  return env;
}

Map<String, dynamic> practiceExam() => {
      'id': 9,
      'mode': 'practice',
      'finished': false,
      'max_errors': 3,
      'deadline_at': null,
      'questions': [
        {'id': 1, 'statement': 'Statement 1', 'statement_it': 'Affermazione 1', 'locale': 'ar'},
        {'id': 2, 'statement': 'Statement 2', 'statement_it': 'Affermazione 2', 'locale': 'ar'},
      ],
    };

void main() {
  group('weak topics', () {
    testWidgets('lists weak + untouched topics with accuracy and a recommendation', (tester) async {
      await pumpScreen(tester, const WeakTopicsScreen(), weakEnv(), size: const Size(360, 1200));
      expect(find.text('Accuracy 30% (3 of 10)'), findsOneWidget);
      expect(find.byKey(const ValueKey('weak-recommended')), findsOneWidget);
      expect(find.text('Right of way'), findsOneWidget);
    });

    testWidgets('empty analysis shows an honest empty state', (tester) async {
      await pumpScreen(tester, const WeakTopicsScreen(), weakEnv({'threshold': 70, 'min_answers': 5, 'weak': [], 'untouched': [], 'recommended': null}));
      expect(find.text((await l10n('en')).patenteWeakNone), findsOneWidget);
    });

    testWidgets('practice a topic: POST /patente/topics/{slug}/practice then opens the session', (tester) async {
      final env = weakEnv();
      env.backend.ok('POST /patente/topics/segnali/practice', {'id': 9, 'mode': 'practice'});
      env.backend.ok('GET /patente/exams/9', practiceExam());
      final router = routerFor(const WeakTopicsScreen());
      await pumpScreen(tester, const SizedBox(), env, router: router, size: const Size(360, 1200));
      await tester.tap(find.byKey(const ValueKey('practice-segnali')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/patente/topics/segnali/practice'), hasLength(1));
      expect(find.textContaining('ROUTE:/patente/exam/9'), findsOneWidget);
    });

    testWidgets('practice all weak: 422 no_weak_topics is explained', (tester) async {
      final env = weakEnv();
      env.backend.error('POST /patente/practice/weak', 422, 'no_weak_topics');
      await pumpScreen(tester, const WeakTopicsScreen(), env, size: const Size(360, 1200));
      await tester.tap(find.byKey(const ValueKey('weak-practice-all')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).patenteNoWeakToPractice), findsOneWidget);
    });

    testWidgets('hub: tiles to weak topics and glossary exist, weak button uses the dedicated endpoint', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/topics', [{'slug': 'segnali', 'title': 'Road signs', 'question_count': 3}]);
      env.backend.ok('GET /patente/categories', []);
      env.backend.ok('GET /patente/rules', {'questions': 30, 'max_errors': 3, 'minutes': 20});
      env.backend.ok('GET /patente/progress', {'summary': {'exams_taken': 1, 'exams_passed': 0}, 'topics': [{'topic': {'slug': 'segnali', 'title': 'Road signs'}, 'weak': true}]});
      env.backend.ok('POST /patente/practice/weak', {'id': 9});
      await pumpScreen(tester, const PatenteScreen(), env, size: const Size(360, 1600), router: routerFor(const PatenteScreen()));
      expect(find.byKey(const ValueKey('patente-open-weak')), findsOneWidget);
      expect(find.byKey(const ValueKey('patente-open-glossary')), findsOneWidget);
      await tester.tap(find.text((await l10n('en')).patentePracticeWeak));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/patente/practice/weak'), hasLength(1));
    });
  });

  group('practice session: instant feedback', () {
    testWidgets('check needs an answer, posts it and shows Arabic/Italian/English explanations; exam mode has no check', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/9', practiceExam());
      env.backend.ok('POST /patente/exams/9/check', {'question_id': 1, 'correct': false, 'correct_answer': true, 'explanation': 'x', 'explanations': {'ar': 'شرح عربي', 'it': 'Spiegazione', 'en': 'English text'}});
      await pumpScreen(tester, const ExamScreen(id: 9), env, size: const Size(360, 1200));
      expect(tester.widget<OutlinedButton>(find.byKey(const ValueKey('check-1'))).onPressed, isNull);
      await tester.tap(find.byKey(const ValueKey('q1-false')));
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('check-1')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/patente/exams/9/check').single.body, {'question_id': 1, 'answer': false});
      expect(find.byKey(const ValueKey('feedback-1')), findsOneWidget);
      expect(find.text('شرح عربي'), findsOneWidget);
      expect(find.text('Spiegazione'), findsOneWidget);
      expect(find.byKey(const ValueKey('check-2')), findsOneWidget);
      // an exam never offers a per-question check
      env.backend.ok('GET /patente/exams/9', {...practiceExam(), 'mode': 'exam', 'deadline_at': DateTime.now().add(const Duration(minutes: 20)).toIso8601String()});
      await pumpScreen(tester, const ExamScreen(id: 9), env, size: const Size(360, 1200));
      expect(find.byKey(const ValueKey('check-1')), findsNothing);
    });

    testWidgets('409 practice_only surfaces as an error without crashing', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/exams/9', practiceExam());
      env.backend.error('POST /patente/exams/9/check', 409, 'practice_only', message: 'Practice only');
      await pumpScreen(tester, const ExamScreen(id: 9), env, size: const Size(360, 1200));
      await tester.tap(find.byKey(const ValueKey('q1-true')));
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('check-1')));
      await tester.pumpAndSettle();
      expect(find.text('Practice only'), findsOneWidget);
    });
  });

  group('glossary', () {
    testWidgets('empty state when no content is published', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/glossary', []);
      await pumpScreen(tester, const PatenteGlossaryScreen(), env);
      expect(find.text((await l10n('en')).patenteGlossaryEmpty), findsOneWidget);
    });
    testWidgets('lists Italian terms LTR with the Arabic gloss and the unreviewed notice', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /patente/glossary', [{'slug': 'precedenza', 'lemma': 'precedenza', 'gloss': 'أفضلية المرور', 'example_it': 'Dare la precedenza.', 'example_gloss': 'Give way.', 'reviewed': false, 'review_notice': 'Pending teacher review.'}]);
      await pumpScreen(tester, const PatenteGlossaryScreen(), env, lang: 'ar');
      expect(find.text('precedenza'), findsOneWidget);
      expect(find.text('أفضلية المرور'), findsOneWidget);
      expect(find.text('Pending teacher review.'), findsOneWidget);
    });
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name weak topics, glossary and practice check render without overflow', (tester) async {
        final env = weakEnv();
        env.backend.ok('GET /patente/glossary', [{'slug': 'a', 'lemma': 'precedenza', 'gloss': 'a long gloss text to wrap over several lines in the card', 'example_it': 'Dare la precedenza ai pedoni.', 'reviewed': true}]);
        env.backend.ok('GET /patente/exams/9', practiceExam());
        env.backend.ok('POST /patente/exams/9/check', {'correct': true, 'correct_answer': true, 'explanations': {'ar': 'شرح', 'it': 'Spiegazione', 'en': 'Explanation'}});
        for (final w in [const WeakTopicsScreen(), const PatenteGlossaryScreen(), const ExamScreen(id: 9)]) {
          await pumpScreen(tester, w, env, lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull, reason: '${w.runtimeType}');
        }
      });
    }
  }
}
