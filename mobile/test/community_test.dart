import 'package:expa_mobile/features/community/community.dart';
import 'package:expa_mobile/features/shell/shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

final _meta = {
  'topics': [{'value': 'housing', 'label': 'Housing', 'sensitive': false}, {'value': 'immigration', 'label': 'Immigration', 'sensitive': true}],
  'notice': 'Community answers are not verified (server).',
  'limits': {},
  'sorts': ['-created_at'],
};

Map<String, dynamic> question() => {
      'id': 3,
      'title': 'How do I rent a room?',
      'body': 'Details here',
      'topic': 'immigration',
      'topic_label': 'Immigration',
      'label': 'Community question, not verified',
      'notice': 'Sensitive topic: check official sources (server).',
      'mine': false,
      'status': null,
      'answers_count': 1,
      'official_guide': {'slug': 'permesso', 'title': 'Permesso guide', 'path': '/guides/permesso'},
      'answers': [{'id': 8, 'body': 'Try the Comune', 'label': 'Community answer, not verified', 'accepted': true, 'mine': false, 'status': null, 'comments': []}],
      'comments': [],
    };

void main() {
  group('hidden unless GET /community/meta says enabled', () {
    testWidgets('404 -> no community tile on Explore', (tester) async {
      final env = TestEnv();
      env.backend.error('GET /community/meta', 404, 'not_found');
      await pumpScreen(tester, const ExploreScreen(), env, size: const Size(360, 1800));
      expect(find.text((await l10n('en')).exploreCommunity), findsNothing);
    });
    testWidgets('enabled -> tile appears', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /community/meta', _meta);
      await pumpScreen(tester, const ExploreScreen(), env, size: const Size(360, 1800));
      expect(find.text((await l10n('en')).exploreCommunity), findsOneWidget);
    });
  });

  testWidgets('list shows the server notice, unverified label and topic filter', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /community/meta', _meta);
    env.backend.ok('GET /community/questions', [{'id': 3, 'title': 'How do I rent a room?', 'excerpt': 'Details', 'topic_label': 'Housing', 'label': 'Community question, not verified', 'answers_count': 2, 'mine': true}], meta: {'page': 1, 'last_page': 1});
    await pumpScreen(tester, const CommunityScreen(), env, size: const Size(360, 900));
    expect(find.text('Community answers are not verified (server).'), findsOneWidget);
    expect(find.text('Community question, not verified'), findsOneWidget);
    await tester.tap(find.widgetWithText(ChoiceChip, 'Housing'));
    await tester.pumpAndSettle();
    expect(env.backend.where('GET', '/community/questions').last.query['topic'], 'housing');
  });

  testWidgets('disabled feature: the screen shows nothing community-specific', (tester) async {
    final env = TestEnv();
    env.backend.error('GET /community/meta', 404, 'not_found');
    await pumpScreen(tester, const CommunityScreen(), env);
    expect(find.byKey(const ValueKey('community-ask')), findsNothing);
    expect(find.byKey(const ValueKey('community-notice')), findsNothing);
  });

  testWidgets('detail: unverified labels, sensitive notice, pinned official guide; answer posts and says it may wait for moderation', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /community/questions/3', question());
    env.backend.ok('POST /community/questions/3/answers', {'id': 9});
    await pumpScreen(tester, const CommunityQuestionScreen(id: 3), env, size: const Size(360, 1800));
    expect(find.text('Community answer, not verified'), findsOneWidget);
    expect(find.text('Sensitive topic: check official sources (server).'), findsOneWidget);
    expect(find.byKey(const ValueKey('official-guide')), findsOneWidget);
    await tester.enterText(find.byKey(const ValueKey('answer-body')), 'My answer');
    await tester.tap(find.byKey(const ValueKey('answer-send')));
    await tester.pumpAndSettle();
    expect(env.backend.where('POST', '/community/questions/3/answers').single.body, {'body': 'My answer'});
    expect(find.byKey(const ValueKey('answer-posted')), findsOneWidget);
  });

  testWidgets('link_not_allowed shows the server message', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /community/meta', _meta);
    env.backend.error('POST /community/questions', 422, 'link_not_allowed', message: 'Links are not allowed.');
    await pumpScreen(tester, const CommunityAskScreen(), env, size: const Size(360, 900));
    await tester.enterText(find.byKey(const ValueKey('ask-title')), 'T');
    await tester.enterText(find.byKey(const ValueKey('ask-body')), 'see http://x');
    await tester.tap(find.byKey(const ValueKey('ask-send')));
    await tester.pumpAndSettle();
    expect(find.text('Links are not allowed.'), findsOneWidget);
  });

  testWidgets('ask posts title/body/topic/locale', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /community/meta', _meta);
    env.backend.ok('POST /community/questions', {'id': 4});
    await pumpScreen(tester, const CommunityAskScreen(), env, lang: 'it', size: const Size(360, 900));
    await tester.enterText(find.byKey(const ValueKey('ask-title')), 'Titolo');
    await tester.enterText(find.byKey(const ValueKey('ask-body')), 'Testo');
    await tester.tap(find.byKey(const ValueKey('ask-send')));
    await tester.pumpAndSettle();
    expect(env.backend.where('POST', '/community/questions').single.body, {'title': 'Titolo', 'body': 'Testo', 'locale': 'it'});
    expect(find.byKey(const ValueKey('ask-posted')), findsOneWidget);
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name community screens render without overflow', (tester) async {
        final env = TestEnv();
        env.backend.ok('GET /community/meta', _meta);
        env.backend.ok('GET /community/questions', [{'id': 3, 'title': 'A long question title that should wrap properly in narrow screens', 'excerpt': 'Details', 'label': 'Community question, not verified', 'answers_count': 2, 'mine': true}], meta: {'page': 1, 'last_page': 1});
        env.backend.ok('GET /community/questions/3', question());
        for (final w in [const CommunityScreen(), const CommunityQuestionScreen(id: 3), const CommunityAskScreen()]) {
          await pumpScreen(tester, w, env, lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull, reason: '${w.runtimeType}');
        }
      });
    }
  }
}
