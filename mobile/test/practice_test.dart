import 'package:expa_mobile/features/learn/practice.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

Map<String, dynamic> vocab(String slug, String lemma, {bool reviewed = true}) => {
      'slug': slug,
      'lemma': lemma,
      'part_of_speech': 'noun',
      'level': 'a1',
      'level_label': 'A1',
      'category': 'doctor',
      'category_label': 'Doctor',
      'gloss': 'doctor (gloss)',
      'example_it': 'Vado dal medico.',
      'example_gloss': 'I go to the doctor.',
      'audio': null,
      'progress': null,
      'reviewed': reviewed,
      'reviewed_at': reviewed ? '2026-09-01T00:00:00Z' : null,
      'review_notice': reviewed ? null : 'Not reviewed by a teacher yet (server).',
    };

Map<String, dynamic> exercise(String type, Map<String, dynamic> form, {bool reviewed = true, Object? audio}) => {
      'slug': 'ex-$type',
      'type': type,
      'type_label': type,
      'level': 'a1',
      'level_label': 'A1',
      'scenario': null,
      'prompt': 'Prompt for $type',
      'audio': audio,
      'form': form,
      'reviewed': reviewed,
      'reviewed_at': null,
      'review_notice': reviewed ? null : 'Pending teacher review.',
    };

void main() {
  group('review notice', () {
    testWidgets('reviewed:false shows the server notice; reviewed:true shows a badge', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/vocabulary/medico', vocab('medico', 'medico', reviewed: false));
      await pumpScreen(tester, const VocabularyDetailScreen(slug: 'medico'), env);
      expect(find.text('Not reviewed by a teacher yet (server).'), findsOneWidget);
      env.backend.ok('GET /italian/vocabulary/medico', vocab('medico', 'medico'));
      await pumpScreen(tester, const VocabularyDetailScreen(slug: 'medico'), env);
      expect(find.byKey(const ValueKey('reviewed-badge')), findsOneWidget);
      expect(find.byKey(const ValueKey('review-notice')), findsNothing);
    });
    testWidgets('missing review_notice falls back to local localized text', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/vocabulary/medico', {...vocab('medico', 'medico', reviewed: false), 'review_notice': null});
      await pumpScreen(tester, const VocabularyDetailScreen(slug: 'medico'), env, lang: 'ar');
      expect(find.text((await l10n('ar')).practiceNotReviewed), findsOneWidget);
    });
  });

  testWidgets('vocabulary list: items, empty state, filters', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /italian/vocabulary', [vocab('medico', 'medico')], meta: {'page': 1, 'last_page': 1});
    await pumpScreen(tester, const VocabularyScreen(category: 'doctor'), env);
    expect(find.text('medico'), findsOneWidget);
    expect(env.backend.where('GET', '/italian/vocabulary').single.query['category'], 'doctor');
    env.backend.ok('GET /italian/vocabulary', [], meta: {'page': 1, 'last_page': 1});
    await pumpScreen(tester, const VocabularyScreen(), env);
    expect(find.text((await l10n('en')).vocabEmpty), findsOneWidget);
  });

  group('spaced repetition review', () {
    testWidgets('card -> show meaning -> answer posts correct and advances; finishes with a summary', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/practice/review', {'cards': [{...vocab('medico', 'medico'), 'box': 1, 'new': true}, {...vocab('farmacia', 'farmacia'), 'box': 2, 'new': false}], 'stats': {}});
      env.backend.ok('POST /italian/vocabulary/medico/review', {'slug': 'medico', 'box': 2});
      env.backend.ok('POST /italian/vocabulary/farmacia/review', {'slug': 'farmacia', 'box': 1});
      await pumpScreen(tester, const ReviewScreen(), env, size: const Size(360, 900));
      expect(find.byKey(const ValueKey('review-gloss')), findsNothing, reason: 'meaning hidden until requested');
      await tester.tap(find.byKey(const ValueKey('review-show')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('review-gloss')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('review-yes')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/vocabulary/medico/review').single.body, {'correct': true});
      await tester.tap(find.byKey(const ValueKey('review-show')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('review-no')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/vocabulary/farmacia/review').single.body, {'correct': false});
      expect(find.byKey(const ValueKey('review-done')), findsOneWidget);
    });
    testWidgets('failed save keeps the same card and shows an error', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/practice/review', {'cards': [{...vocab('medico', 'medico'), 'box': 1, 'new': false}], 'stats': {}});
      env.backend.error('POST /italian/vocabulary/medico/review', 500, 'server_error');
      await pumpScreen(tester, const ReviewScreen(), env, size: const Size(360, 900));
      await tester.tap(find.byKey(const ValueKey('review-show')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('review-yes')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('review-done')), findsNothing);
      expect(find.text((await l10n('en')).errorServer), findsOneWidget);
    });
    testWidgets('empty queue shows the empty state', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/practice/review', {'cards': [], 'stats': {}});
      await pumpScreen(tester, const ReviewScreen(), env);
      expect(find.text((await l10n('en')).reviewEmpty), findsOneWidget);
    });
  });

  group('exercises (4 types)', () {
    testWidgets('multiple_choice sends the choice index; wrong answer reveals the correct one + explanation', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/exercises/ex-multiple_choice', exercise('multiple_choice', {'stem': 'Dov\'e il ___?', 'choices': [{'index': 0, 'text': 'medico'}, {'index': 1, 'text': 'treno'}]}));
      env.backend.ok('POST /italian/exercises/ex-multiple_choice/attempt', {'correct': false, 'correct_answer': {'index': 0}, 'explanation': 'Because.', 'vocabulary': null});
      await pumpScreen(tester, const ExerciseScreen(slug: 'ex-multiple_choice'), env, size: const Size(360, 900));
      await tester.tap(find.byKey(const ValueKey('exercise-check')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/exercises/ex-multiple_choice/attempt'), isEmpty, reason: 'must choose first');
      await tester.tap(find.byKey(const ValueKey('choice-1')));
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('exercise-check')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/exercises/ex-multiple_choice/attempt').single.body, {'answer': 1});
      expect(find.textContaining('Correct answer: medico'), findsOneWidget);
      expect(find.text('Because.'), findsOneWidget);
    });
    testWidgets('listening with audio:null explains there is no recording; answers by index', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/exercises/ex-listening', exercise('listening', {'stem': null, 'choices': [{'index': 0, 'text': 'a'}, {'index': 1, 'text': 'b'}]}));
      env.backend.ok('POST /italian/exercises/ex-listening/attempt', {'correct': true, 'correct_answer': {'index': 0}, 'explanation': null, 'vocabulary': {'slug': 'x', 'box': 2}});
      await pumpScreen(tester, const ExerciseScreen(slug: 'ex-listening'), env, size: const Size(360, 900));
      expect(find.text((await l10n('en')).exNoAudio), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('choice-0')));
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('exercise-check')));
      await tester.pumpAndSettle();
      expect(find.text((await l10n('en')).exCorrect), findsOneWidget);
    });
    testWidgets('listening with a recording says playback is unavailable in this version', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/exercises/ex-listening', exercise('listening', {'choices': [{'index': 0, 'text': 'a'}, {'index': 1, 'text': 'b'}]}, audio: {'url': 'https://x/a.mp3', 'rights_note': 'ok'}));
      await pumpScreen(tester, const ExerciseScreen(slug: 'ex-listening'), env, size: const Size(360, 900));
      expect(find.text((await l10n('en')).exAudioUnsupported), findsOneWidget);
    });
    testWidgets('fill_blank sends the typed string', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/exercises/ex-fill_blank', exercise('fill_blank', {'sentence': 'Io ___ medico.'}, reviewed: false));
      env.backend.ok('POST /italian/exercises/ex-fill_blank/attempt', {'correct': false, 'correct_answer': {'answers': ['sono', 'Sono']}, 'explanation': null, 'vocabulary': null});
      await pumpScreen(tester, const ExerciseScreen(slug: 'ex-fill_blank'), env, size: const Size(360, 900));
      expect(find.text('Pending teacher review.'), findsOneWidget);
      await tester.enterText(find.byKey(const ValueKey('fill-answer')), 'ho');
      await tester.tap(find.byKey(const ValueKey('exercise-check')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/exercises/ex-fill_blank/attempt').single.body, {'answer': 'ho'});
      expect(find.textContaining('sono / Sono'), findsOneWidget);
    });
    testWidgets('match sends the right-hand ids in left order and requires all pairs', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/exercises/ex-match', exercise('match', {
        'left': [{'index': 0, 'text': 'medico'}, {'index': 1, 'text': 'treno'}],
        'right': [{'id': 0, 'text': 'train'}, {'id': 1, 'text': 'doctor'}],
      }));
      env.backend.ok('POST /italian/exercises/ex-match/attempt', {'correct': true, 'correct_answer': {'right_ids': [1, 0]}, 'explanation': null, 'vocabulary': null});
      await pumpScreen(tester, const ExerciseScreen(slug: 'ex-match'), env, size: const Size(360, 900));
      await tester.tap(find.byKey(const ValueKey('exercise-check')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/exercises/ex-match/attempt'), isEmpty);
      await tester.tap(find.byKey(const ValueKey('match-0')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('doctor').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('match-1')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('train').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('exercise-check')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/exercises/ex-match/attempt').single.body, {'answer': [1, 0]});
    });
    testWidgets('exercises list filters by type and shows empty state', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/exercises', [], meta: {'page': 1, 'last_page': 1});
      await pumpScreen(tester, const ExercisesScreen(scenario: 'doctor'), env);
      expect(find.text((await l10n('en')).exercisesEmpty), findsOneWidget);
      await tester.ensureVisible(find.widgetWithText(ChoiceChip, 'Match'));
      await tester.tap(find.widgetWithText(ChoiceChip, 'Match'));
      await tester.pumpAndSettle();
      final q = env.backend.where('GET', '/italian/exercises').last.query;
      expect([q['type'], q['scenario']], ['match', 'doctor']);
    });
  });

  testWidgets('scenarios: only scenarios with material; empty state otherwise; detail links', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /italian/scenarios', [{'value': 'doctor', 'label': 'Doctor', 'lessons': 1, 'vocabulary': 3, 'exercises': 0}, {'value': 'bank', 'label': 'Bank', 'lessons': 0, 'vocabulary': 0, 'exercises': 0}]);
    await pumpScreen(tester, const ScenariosScreen(), env);
    expect(find.text('Doctor'), findsOneWidget);
    expect(find.text('Bank'), findsNothing);
    env.backend.ok('GET /italian/scenarios', []);
    await pumpScreen(tester, const ScenariosScreen(), env);
    expect(find.text((await l10n('en')).scenariosEmpty), findsOneWidget);
  });

  testWidgets('hub shows progress numbers from the API', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /italian/practice/progress', {'vocabulary': {'due_now': 4, 'cards_learning': 9, 'mastered': 2, 'accuracy': 80}, 'exercises': {'attempts': 12, 'correct': 9, 'accuracy': 75}});
    await pumpScreen(tester, const PracticeHubScreen(), env);
    expect(find.text('Cards due now: 4'), findsOneWidget);
    expect(find.text('Accuracy: 80%'), findsOneWidget);
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name practice screens render without overflow', (tester) async {
        final env = TestEnv();
        env.backend.ok('GET /italian/practice/progress', {'vocabulary': {'due_now': 4}, 'exercises': {'attempts': 1}});
        env.backend.ok('GET /italian/vocabulary', [vocab('medico', 'medico', reviewed: false)], meta: {'page': 1, 'last_page': 1});
        env.backend.ok('GET /italian/vocabulary/medico', vocab('medico', 'medico', reviewed: false));
        env.backend.ok('GET /italian/practice/review', {'cards': [{...vocab('medico', 'medico', reviewed: false), 'box': 1, 'new': true}], 'stats': {}});
        env.backend.ok('GET /italian/exercises', [exercise('match', {})], meta: {'page': 1, 'last_page': 1});
        env.backend.ok('GET /italian/exercises/ex-match', exercise('match', {'left': [{'index': 0, 'text': 'medico'}], 'right': [{'id': 0, 'text': 'a very long right-hand gloss text that must not overflow'}]}, reviewed: false));
        env.backend.ok('GET /italian/scenarios', [{'value': 'doctor', 'label': 'Doctor', 'lessons': 1, 'vocabulary': 3, 'exercises': 2}]);
        for (final w in [const PracticeHubScreen(), const VocabularyScreen(), const VocabularyDetailScreen(slug: 'medico'), const ReviewScreen(), const ExercisesScreen(), const ExerciseScreen(slug: 'ex-match'), const ScenariosScreen(), const ScenarioDetailScreen(value: 'doctor')]) {
          await pumpScreen(tester, w, env, lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull, reason: '${w.runtimeType}');
        }
      });
    }
  }
}
