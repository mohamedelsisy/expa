import 'package:expa_mobile/features/articles/articles.dart';
import 'package:expa_mobile/features/saved/saved.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

Map<String, dynamic> article({String title = 'Moving to Milan', Map<String, dynamic>? source}) => {
      'slug': 'milan',
      'title': title,
      'excerpt': 'A short intro',
      'category_label': 'Living',
      'content_type': 'editorial',
      'published_at': '2026-09-01T00:00:00Z',
      'body': '# Heading\n\nFirst **paragraph**.\n\n- one\n- two <script>x</script>',
      'tags': [{'slug': 'milan', 'label': 'Milan'}],
      'related_guides': [{'slug': 'permesso', 'title': 'Permesso guide'}],
      'related_articles': [],
      'source': source,
      'disclaimer': 'Server disclaimer text.',
    };

Map<String, dynamic> city() => {
      'slug': 'milano',
      'name': 'Milano',
      'headline': 'Lombardy capital',
      'summary': 'Big city',
      'blocks': [
        {'key': 'transport', 'label': 'Transport', 'title': 'Metro', 'body': 'Buy tickets at ATM.', 'info_type': 'official_info', 'info_label': 'Official information', 'source': {'name': 'ATM', 'url': 'https://www.atm.it', 'type': 'official', 'last_verified_at': '2026-09-01T00:00:00Z', 'freshness': 'fresh'}},
        {'key': 'tips', 'label': 'Tips', 'title': 'Local tips', 'body': 'Be early.', 'info_type': 'general_guidance', 'info_label': 'General guidance', 'source': null},
      ],
      'guides': [{'slug': 'permesso', 'title': 'Permesso guide'}],
      'articles': [{'slug': 'milan', 'title': 'Moving to Milan'}],
      'offices_count': 12,
      'disclaimer': 'City disclaimer.',
    };

void main() {
  testWidgets('articles list: items, search sends q, category chips from the API', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /articles/categories', [{'value': 'living', 'label': 'Living'}]);
    env.backend.ok('GET /articles', [{'slug': 'milan', 'title': 'Moving to Milan', 'excerpt': 'A short intro', 'category_label': 'Living'}], meta: {'page': 1, 'last_page': 1});
    await pumpScreen(tester, const ArticlesScreen(), env);
    expect(find.text('Moving to Milan'), findsOneWidget);
    await tester.tap(find.widgetWithText(ChoiceChip, 'Living'));
    await tester.pumpAndSettle();
    expect(env.backend.where('GET', '/articles').last.query['category'], 'living');
    await tester.enterText(find.byKey(const ValueKey('articles-search')), 'milan');
    await tester.testTextInput.receiveAction(TextInputAction.search);
    await tester.pumpAndSettle();
    expect(env.backend.where('GET', '/articles').last.query['q'], 'milan');
  });

  testWidgets('articles empty state', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /articles/categories', []);
    env.backend.ok('GET /articles', [], meta: {'page': 1, 'last_page': 1});
    await pumpScreen(tester, const ArticlesScreen(), env);
    expect(find.text((await l10n('en')).articlesEmpty), findsOneWidget);
  });

  testWidgets('article detail: editorial pill, no source block when source is null, markup is not interpreted', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /articles/milan', article());
    await pumpScreen(tester, const ArticleDetailScreen(slug: 'milan'), env, size: const Size(360, 1400));
    expect(find.byKey(const ValueKey('article-editorial')), findsOneWidget);
    expect(find.text('Heading'), findsOneWidget);
    expect(find.textContaining('First paragraph'), findsOneWidget, reason: '** markers are stripped');
    expect(find.text('Permesso guide'), findsOneWidget);
    expect(find.text((await l10n('en')).sourceLabel), findsNothing, reason: 'no source given -> never implies an official source');
    expect(find.text('Server disclaimer text.'), findsOneWidget);
  });

  testWidgets('article detail shows the source when the API gives a complete one', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /articles/milan', article(source: {'name': 'Comune di Milano', 'url': 'https://www.comune.milano.it', 'type': 'institutional', 'last_verified_at': '2026-09-01T00:00:00Z', 'freshness': 'fresh'}));
    await pumpScreen(tester, const ArticleDetailScreen(slug: 'milan'), env, size: const Size(360, 1600));
    expect(find.text('Comune di Milano'), findsOneWidget);
  });

  testWidgets('saved article opens offline from the device; saving stores a copy under content:article', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /articles/milan', article());
    await pumpScreen(tester, const ArticleDetailScreen(slug: 'milan'), env);
    await tester.tap(find.byKey(const ValueKey('save-offline')));
    await tester.pumpAndSettle();
    expect(await env.cache.keys('content:article:'), ['content:article:en:milan']);
    env.backend.offline = true;
    await pumpScreen(tester, const ArticleDetailScreen(slug: 'milan'), env);
    expect(find.text('Moving to Milan'), findsOneWidget);
    expect(find.byKey(const ValueKey('cached-copy')), findsOneWidget);
  });

  testWidgets('saved screen lists saved articles and cities (cache only)', (tester) async {
    final env = TestEnv()..backend.offline = true;
    await env.cache.write('saved:index:article', {'slugs': ['milan']});
    await env.cache.write('content:article:en:milan', article());
    await env.cache.write('saved:index:city', {'slugs': ['milano']});
    await env.cache.write('content:city:en:milano', city());
    await pumpScreen(tester, const SavedScreen(), env);
    expect(find.text('Moving to Milan'), findsOneWidget);
    expect(find.text('Milano'), findsOneWidget);
  });

  testWidgets('cities list and detail: official vs general label, source only where given, offices count', (tester) async {
    final env = TestEnv();
    env.backend.ok('GET /city-profiles', [{'slug': 'milano', 'name': 'Milano', 'headline': 'Lombardy capital'}], meta: {'page': 1, 'last_page': 1});
    env.backend.ok('GET /cities/milano', city());
    await pumpScreen(tester, const CitiesScreen(), env);
    expect(find.text('Milano'), findsOneWidget);
    await pumpScreen(tester, const CityDetailScreen(slug: 'milano'), env, size: const Size(360, 2400));
    expect(find.text('Official information'), findsOneWidget);
    expect(find.text('General guidance'), findsOneWidget);
    expect(find.text('ATM'), findsOneWidget);
    expect(find.text('Government offices listed: 12'), findsOneWidget);
    expect(find.text('City disclaimer.'), findsOneWidget);
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name article and city detail render without overflow', (tester) async {
        final env = TestEnv();
        env.backend.ok('GET /articles/milan', article(source: {'name': 'Comune', 'url': 'https://x.it', 'type': 'official'}));
        env.backend.ok('GET /cities/milano', city());
        await pumpScreen(tester, const ArticleDetailScreen(slug: 'milan'), env, lang: lang, size: size, textScale: scale);
        expect(tester.takeException(), isNull);
        await pumpScreen(tester, const CityDetailScreen(slug: 'milano'), env, lang: lang, size: size, textScale: scale);
        expect(tester.takeException(), isNull);
      });
    }
  }
}
