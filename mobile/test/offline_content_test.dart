import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/core/widgets/offline_banner.dart';
import 'package:expa_mobile/features/guides/guides.dart';
import 'package:expa_mobile/features/learn/learn.dart';
import 'package:expa_mobile/features/saved/saved.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

Map<String, dynamic> guide(String title, {String freshness = 'fresh'}) => {
      'slug': 'permesso',
      'title': title,
      'summary': 'Summary',
      'italian_term': 'Permesso di soggiorno',
      'steps': [{'title': 'Step one', 'text': 'Do it'}],
      'source': {'name': 'Questura', 'url': 'https://questure.poliziadistato.it', 'type': 'official', 'last_verified_at': '2026-09-01T00:00:00Z', 'freshness': freshness},
    };

Map<String, dynamic> lesson() => {
      'slug': 'saluti',
      'title': 'Saluti',
      'level_label': 'A1',
      'type_label': 'Dialogue',
      'items': [
        {'speaker': 'Anna', 'it': 'Buongiorno', 'gloss': 'Good morning', 'example_it': 'Buongiorno a tutti', 'example_gloss': 'Good morning all', 'phonetic': 'bwon-jor-no', 'tip': 'Formal', 'secret_internal': 'LEAK'},
      ],
      'progress': null,
    };

void main() {
  group('guide detail: cache-first with explicit save (MOB-33 foundation)', () {
    testWidgets('online, not saved: shows content, no cache notice; saving stores a copy', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /guides/permesso', guide('Residence permit'));
      await pumpScreen(tester, const GuideDetailScreen(slug: 'permesso'), env);
      expect(find.text('Residence permit'), findsOneWidget);
      expect(find.byKey(const ValueKey('cached-copy')), findsNothing);
      expect(await env.cache.keys(''), isEmpty);
      await tester.tap(find.byKey(const ValueKey('save-offline')));
      await tester.pumpAndSettle();
      expect(await env.cache.keys('content:guide:'), ['content:guide:en:permesso']);
      expect(find.byIcon(Icons.bookmark), findsOneWidget);
    });

    testWidgets('saved + offline: opens from the device, says so, shows last verified date and the stale flag', (tester) async {
      final env = TestEnv();
      env.backend.offline = true;
      await env.cache.write('saved:index:guide', {'slugs': ['permesso']});
      await env.cache.write('content:guide:en:permesso', guide('Saved permit', freshness: 'stale'));
      await pumpScreen(tester, const GuideDetailScreen(slug: 'permesso'), env);
      final l = await l10n('en');
      expect(find.text('Saved permit'), findsOneWidget);
      expect(find.byKey(const ValueKey('cached-copy')), findsOneWidget);
      expect(find.textContaining('Last verified'), findsWidgets);
      expect(find.textContaining(l.savedStale), findsOneWidget);
      expect(find.text(l.errorNetwork), findsNothing, reason: 'no empty error screen when a saved copy exists');
    });

    testWidgets('not saved + offline: normal error with retry', (tester) async {
      final env = TestEnv()..backend.offline = true;
      await pumpScreen(tester, const GuideDetailScreen(slug: 'permesso'), env, lang: 'it');
      expect(find.text((await l10n('it')).errorNetwork), findsOneWidget);
    });

    testWidgets('saved + online: shows the fresh copy and updates the saved one', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /guides/permesso', guide('Fresh title'));
      await env.cache.write('saved:index:guide', {'slugs': ['permesso']});
      await env.cache.write('content:guide:en:permesso', guide('Old title'));
      await pumpScreen(tester, const GuideDetailScreen(slug: 'permesso'), env);
      expect(find.text('Fresh title'), findsOneWidget);
      expect((await env.cache.read('content:guide:en:permesso'))!.payload['title'], 'Fresh title');
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name guide detail renders without overflow', (tester) async {
          final env = TestEnv();
          env.backend.ok('GET /guides/permesso', guide('Residence permit'));
          await pumpScreen(tester, const GuideDetailScreen(slug: 'permesso'), env, lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull);
        });
      }
    }
  });

  group('guides list', () {
    testWidgets('lists guides with categories, source freshness and opens search results', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /guides/categories', [{'value': 'documents', 'label': 'Documents'}]);
      env.backend.ok('GET /guides', [guide('Residence permit')], meta: {'page': 1, 'last_page': 1});
      await pumpScreen(tester, const GuidesScreen(), env, lang: 'ar');
      expect(find.text('Residence permit'), findsOneWidget);
      expect(find.text('Permesso di soggiorno'), findsOneWidget);
      expect(find.text('Documents'), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'permesso');
      await tester.testTextInput.receiveAction(TextInputAction.search);
      await tester.pumpAndSettle();
      expect(env.backend.where('GET', '/guides').last.query['q'], 'permesso');
    });
  });

  group('lessons (MOB-15)', () {
    testWidgets('items are modelled: Italian fields forced LTR, unknown keys never printed', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/lessons/saluti', lesson());
      env.backend.ok('POST /italian/lessons/saluti/progress', {});
      env.backend.ok('GET /italian/daily', {'slots': []});
      await pumpScreen(tester, const LessonScreen(slug: 'saluti'), env, lang: 'ar', size: const Size(360, 1200));
      expect(tester.widget<Text>(find.text('Buongiorno')).textDirection, TextDirection.ltr);
      expect(tester.widget<Text>(find.text('Buongiorno a tutti')).textDirection, TextDirection.ltr);
      expect(find.text('Good morning'), findsOneWidget);
      expect(find.text('LEAK'), findsNothing);
      expect(find.textContaining('LEAK'), findsNothing);
    });

    testWidgets('opening records "started" silently; completing posts completed; offline copy does not post', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/lessons/saluti', lesson());
      env.backend.ok('POST /italian/lessons/saluti/progress', {});
      await pumpScreen(tester, const LessonScreen(slug: 'saluti'), env, size: const Size(360, 1200));
      expect(env.backend.where('POST', '/italian/lessons/saluti/progress').single.body, {'status': 'started'});
      await tester.tap(find.byType(FilledButton));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/italian/lessons/saluti/progress').last.body, {'status': 'completed'});
      expect(find.text((await l10n('en')).lessonCompleted), findsOneWidget);
    });

    testWidgets('saved lesson works offline and the complete button is disabled until online', (tester) async {
      final env = TestEnv()..backend.offline = true;
      await env.cache.write('saved:index:lesson', {'slugs': ['saluti']});
      await env.cache.write('content:lesson:en:saluti', lesson());
      await pumpScreen(tester, const LessonScreen(slug: 'saluti'), env, size: const Size(360, 1200));
      expect(find.text('Buongiorno'), findsOneWidget);
      expect(find.byKey(const ValueKey('cached-copy')), findsOneWidget);
      expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
      expect(env.backend.where('POST', '/italian/lessons/saluti/progress'), isEmpty);
    });

    testWidgets('lesson list renders levels and daily plan', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /italian/daily', {'streak': 3, 'slots': [{'type_label': 'Vocabulary', 'lesson': {'slug': 'saluti', 'title': 'Saluti'}}]});
      env.backend.ok('GET /italian/lessons', [{'slug': 'saluti', 'title': 'Saluti', 'level_label': 'A1', 'type_label': 'Dialogue', 'duration_minutes': 5}], meta: {'page': 1, 'last_page': 1});
      await pumpScreen(tester, const LearnScreen(), env, lang: 'it', size: const Size(360, 1000));
      expect(find.text('Saluti'), findsWidgets);
      expect(find.textContaining('A1'), findsWidgets);
    });
  });

  group('saved screen reads only the local cache', () {
    testWidgets('empty state', (tester) async {
      await pumpScreen(tester, const SavedScreen(), TestEnv(), lang: 'ar');
      expect(find.text((await l10n('ar')).savedEmpty), findsOneWidget);
    });

    testWidgets('lists saved guides and lessons with saved/verified dates and works fully offline', (tester) async {
      final env = TestEnv()..backend.offline = true;
      await env.cache.write('saved:index:guide', {'slugs': ['permesso']});
      await env.cache.write('content:guide:en:permesso', guide('Saved permit', freshness: 'outdated'));
      await env.cache.write('saved:index:lesson', {'slugs': ['saluti']});
      await env.cache.write('content:lesson:en:saluti', lesson());
      await pumpScreen(tester, const SavedScreen(), env);
      expect(find.text('Saved permit'), findsOneWidget);
      expect(find.text('Saluti'), findsOneWidget);
      expect(find.textContaining('Last verified'), findsOneWidget);
      expect(find.textContaining((await l10n('en')).savedStale), findsOneWidget);
      expect(env.backend.calls, isEmpty);
    });
  });

  group('offline banner', () {
    testWidgets('appears when a request fails for lack of network, disappears after a successful retry', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /health', {'status': 'ok'});
      await pumpScreen(tester, const OfflineBannerHost(child: Scaffold(body: Text('content'))), env);
      final container = ProviderScope.containerOf(tester.element(find.text('content')));
      expect(find.byKey(const ValueKey('offline-banner')), findsNothing);
      container.read(offlineProvider.notifier).state = true;
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('offline-banner')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('offline-retry')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('offline-banner')), findsNothing);
    });
  });
}
