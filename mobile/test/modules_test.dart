import 'package:expa_mobile/features/ask/history.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:expa_mobile/features/catalog/catalog.dart';
import 'package:expa_mobile/features/dashboard/dashboard.dart';
import 'package:expa_mobile/features/documents/documents.dart';
import 'package:expa_mobile/features/jobs/jobs.dart';
import 'package:expa_mobile/features/notifications/notifications.dart';
import 'package:expa_mobile/features/search/search.dart';
import 'package:expa_mobile/features/shell/shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'profile_test.dart' show SignedIn;
import 'support.dart';

const page1 = {'page': 1, 'last_page': 1};

Map<String, dynamic> job({bool saved = false}) => {
      'id': 7, 'title': 'Laravel developer', 'company': 'Acme', 'location': 'Milano', 'remote_mode_label': 'Remote', 'employment_type_label': 'Full time',
      'saved': saved, 'apply_url': 'https://acme.example/apply', 'visa_sponsorship': {'stated': false}, 'description': 'Build things',
      'match': {'score': 87, 'reasons': [{'status': 'match', 'label': 'PHP'}, {'status': 'partial', 'label': 'Italian B1'}]},
    };

Future<void> open(WidgetTester tester, Widget w, TestEnv env, {String lang = 'en', Size size = const Size(360, 1200), double scale = 1.0, GoRouter? router}) =>
    pumpScreen(tester, w, env, lang: lang, size: size, textScale: scale, router: router, extra: [authControllerProvider.overrideWith(SignedIn.new)]);

void main() {
  group('jobs', () {
    testWidgets('list shows match pill; detail toggles save with POST/DELETE /jobs/{id}/save', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /jobs/7', job());
      env.backend.on('POST /jobs/7/save', null, status: 204);
      env.backend.on('DELETE /jobs/7/save', null, status: 204);
      env.backend.ok('GET /jobs/saved', []);
      await open(tester, const JobDetailScreen(id: 7), env);
      expect(find.byKey(const ValueKey('match-score')), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('job-save')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/jobs/7/save'), hasLength(1));
      expect(find.byIcon(Icons.bookmark), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey('job-save')));
      await tester.pumpAndSettle();
      expect(env.backend.where('DELETE', '/jobs/7/save'), hasLength(1));
    });

    testWidgets('detail never claims visa sponsorship unless stated', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /jobs/7', job());
      await open(tester, const JobDetailScreen(id: 7), env);
      expect(find.text((await l10n('en')).visaNotStated), findsOneWidget);
    });

    testWidgets('saved jobs screen: list and empty state', (tester) async {
      final env = TestEnv();
      env.backend.ok('GET /jobs/saved', [job(saved: true)]);
      await open(tester, const SavedJobsScreen(), env, lang: 'ar');
      expect(find.text('Laravel developer'), findsOneWidget);
      final env2 = TestEnv();
      env2.backend.ok('GET /jobs/saved', []);
      await open(tester, const SavedJobsScreen(), env2, lang: 'ar');
      expect(find.text((await l10n('ar')).jobsSavedEmpty), findsOneWidget);
    });

    testWidgets('job list renders in all locales at 320px/1.5x', (tester) async {
      for (final lang in langs) {
        final env = TestEnv();
        env.backend.ok('GET /jobs', [job()], meta: page1);
        await open(tester, const JobsScreen(), env, lang: lang, size: const Size(320, 568), scale: 1.5);
        expect(tester.takeException(), isNull);
        expect(find.text('Laravel developer'), findsOneWidget);
      }
    });
  });

  group('search', () {
    TestEnv env() {
      final e = TestEnv();
      e.backend.ok('GET /search', [
        {'type': 'guide', 'type_label': 'Guide', 'title': 'Residence permit', 'snippet': 'How to renew', 'route': 'guides/permesso'},
        {'type': 'x', 'type_label': 'Other', 'title': 'Unsafe', 'route': 'https://evil.example'},
      ], meta: page1);
      return e;
    }

    testWidgets('requires 2 characters, then lists results; results open only allow-listed routes', (tester) async {
      final e = env();
      final router = routerFor(const SearchScreen());
      await open(tester, const SizedBox(), e, router: router);
      final l = await l10n('en');
      expect(find.text(l.searchMinChars), findsOneWidget);
      expect(e.backend.calls, isEmpty);
      await tester.enterText(find.byKey(const ValueKey('search-input')), 'permesso');
      await tester.testTextInput.receiveAction(TextInputAction.search);
      await tester.pumpAndSettle();
      expect(e.backend.where('GET', '/search').single.query, containsPair('q', 'permesso'));
      expect(find.text('Residence permit'), findsOneWidget);
      await tester.tap(find.text('Unsafe'));
      await tester.pumpAndSettle();
      expect(find.byType(SearchScreen), findsOneWidget, reason: 'unsafe route must not navigate');
      await tester.tap(find.text('Residence permit'));
      await tester.pumpAndSettle();
      expect(find.text('ROUTE:/guides/permesso'), findsOneWidget);
    });

    testWidgets('initial query (from an AI action) searches immediately; empty and error states', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /search', [], meta: page1);
      await open(tester, const SearchScreen(initialQuery: 'visto'), e, lang: 'it');
      expect(find.text((await l10n('it')).searchEmpty), findsOneWidget);
      final e2 = TestEnv();
      e2.backend.error('GET /search', 429, 'rate_limited');
      await open(tester, const SearchScreen(initialQuery: 'visto'), e2, lang: 'it');
      expect(find.text((await l10n('it')).errorRateLimited), findsOneWidget);
    });
  });

  group('government / study catalog', () {
    testWidgets('government: services and offices tabs, office card with official booking link', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /government/services', [{'slug': 'permesso', 'name': 'Permit renewal', 'domain_label': 'Immigration', 'summary': 'Renew', 'source': {'freshness': 'fresh'}}], meta: page1);
      e.backend.ok('GET /government/offices', [{'slug': 'q-roma', 'name': 'Questura Roma', 'office_type': 'questura', 'office_type_label': 'Police', 'booking': {'method_label': 'Online', 'url': 'https://p.example/'}}], meta: page1);
      await open(tester, const GovernmentScreen(), e, lang: 'ar');
      expect(find.text('Permit renewal'), findsOneWidget);
      await tester.tap(find.text((await l10n('ar')).govOffices));
      await tester.pumpAndSettle();
      expect(find.text('Questura Roma'), findsOneWidget);
      expect(find.text((await l10n('ar')).apptGoOfficial), findsOneWidget);
    });

    testWidgets('empty government directory explains that content is added after verification', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /government/services', [], meta: page1);
      e.backend.ok('GET /government/offices', [], meta: page1);
      await open(tester, const GovernmentScreen(), e);
      expect(find.text((await l10n('en')).govEmpty), findsOneWidget);
    });

    testWidgets('service detail: sections, offices, related guide, source and verify notice', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /government/services/permesso', {
        'name': 'Permit renewal', 'italian_term': 'Rinnovo', 'summary': 'Renew it', 'how_to_apply': 'Kit postale', 'required_documents': ['Passport', 'Photos'],
        'guide': {'slug': 'permesso', 'title': 'Permit guide'},
        'offices': [{'slug': 'q', 'name': 'Questura Roma', 'office_type': 'questura', 'booking': {'method_label': 'Online', 'url': null}}],
        'source': {'name': 'Polizia', 'url': 'https://poliziadistato.it', 'type': 'official', 'freshness': 'fresh', 'last_verified_at': '2026-09-01'},
      });
      await open(tester, const CatalogDetailScreen(path: '/government/services/permesso', title: 'x'), e, size: const Size(360, 2400));
      expect(find.text('Permit renewal'), findsOneWidget);
      expect(find.text('Kit postale'), findsOneWidget);
      expect(find.text('Passport'), findsOneWidget);
      expect(find.text('Questura Roma'), findsOneWidget);
      expect(find.textContaining('Permit guide'), findsOneWidget);
      expect(find.text((await l10n('en')).verifyOfficialNotice), findsOneWidget);
    });

    testWidgets('study programme detail shows tuition only when the source states it', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /study/programs/cs', {'title': 'CS MSc', 'tuition': null, 'deadline': {'date': null, 'status': 'not_stated'}, 'verify_notice': 'Check the university site.'});
      await open(tester, const CatalogDetailScreen(path: '/study/programs/cs', title: 'x'), e);
      expect(find.text('CS MSc'), findsOneWidget);
      expect(find.text((await l10n('en')).studyTuition), findsNothing);
      expect(find.text('Check the university site.'), findsOneWidget);
    });

    testWidgets('detail failure shows retry', (tester) async {
      await open(tester, const CatalogDetailScreen(path: '/government/offices/x', title: 'x'), TestEnv(), lang: 'it');
      expect(find.text((await l10n('it')).errorNotFound), findsOneWidget);
    });
  });

  group('AI history', () {
    testWidgets('lists conversations and opens one with sources/disclaimer rendered like live answers', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /ai/conversations', [{'id': 3, 'title': 'Renewal', 'updated_at': '2026-10-01T10:00:00Z'}], meta: page1);
      e.backend.ok('GET /ai/conversations/3', {
        'id': 3, 'title': 'Renewal',
        'messages': [
          {'role': 'user', 'content': 'How to renew?'},
          {'role': 'assistant', 'content': 'Use the kit.', 'label': 'official', 'sources': [], 'actions': [], 'disclaimer': 'Not legal advice'},
        ],
      });
      final router = routerFor(const AiHistoryScreen(), more: [GoRoute(path: '/ai/history/:id', builder: (_, s) => AiConversationScreen(id: int.parse(s.pathParameters['id']!)))]);
      await open(tester, const SizedBox(), e, router: router);
      await tester.tap(find.text('Renewal'));
      await tester.pumpAndSettle();
      expect(find.text('How to renew?'), findsOneWidget);
      expect(find.byKey(const ValueKey('ask-disclaimer')), findsOneWidget);
    });

    testWidgets('delete asks for confirmation then DELETEs the conversation', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /ai/conversations/3', {'id': 3, 'title': 'T', 'messages': []});
      e.backend.on('DELETE /ai/conversations/3', null, status: 204);
      await open(tester, const AiConversationScreen(id: 3), e);
      await tester.tap(find.byKey(const ValueKey('history-delete')));
      await tester.pumpAndSettle();
      expect(e.backend.where('DELETE', '/ai/conversations/3'), isEmpty);
      await tester.tap(find.byKey(const ValueKey('history-delete-confirm')));
      await tester.pumpAndSettle();
      expect(e.backend.where('DELETE', '/ai/conversations/3'), hasLength(1));
    });

    testWidgets('empty history', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /ai/conversations', [], meta: page1);
      await open(tester, const AiHistoryScreen(), e, lang: 'ar');
      expect(find.text((await l10n('ar')).askHistoryEmpty), findsOneWidget);
    });
  });

  group('notifications, dashboard, tasks, documents, explore', () {
    testWidgets('notifications: unread styling, CTA through allow-list, mark all read', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /notifications', [
        {'id': 'u1', 'title': 'Permit expires', 'body': 'In 30 days', 'read': false, 'created_at': '2026-10-01T10:00:00Z', 'cta': {'type': 'route', 'target': 'patente/topics/segnali'}},
      ], meta: page1);
      e.backend.on('POST /notifications/u1/read', null, status: 204);
      e.backend.on('POST /notifications/read-all', null, status: 204);
      await open(tester, const SizedBox(), e, router: routerFor(const NotificationsScreen()));
      await tester.tap(find.text('Permit expires'));
      await tester.pumpAndSettle();
      expect(e.backend.where('POST', '/notifications/u1/read'), hasLength(1));
      expect(find.text('ROUTE:/patente/topics/segnali'), findsOneWidget);
    });

    testWidgets('dashboard renders score, categories, next actions in RTL at 320px/1.5x', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /dashboard', {
        'greeting': {'name': 'Mohamed'},
        'score': {'overall': 82, 'categories': [{'label': 'Documents', 'percent': 80}, {'label': 'Italian', 'percent': null}], 'how_calculated': 'Explained'},
        'next_actions': [{'title': 'Renew', 'description': 'In 74 days', 'cta': {'type': 'route', 'target': 'my-documents'}}, {'title': 'Plain'}],
        'onboarding': {'completed': false}, 'personalization': {'enabled': true},
      });
      await open(tester, const HomeScreen(), e, lang: 'ar', size: const Size(320, 1600), scale: 1.5);
      expect(tester.takeException(), isNull);
      expect(find.text('Renew'), findsOneWidget);
    });

    testWidgets('tasks: mark done calls PUT', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /dashboard/tasks', [{'key': 'k1', 'title': 'Get codice fiscale', 'category_label': 'Docs', 'status': 'todo', 'applicable': true, 'auto': false}]);
      e.backend.ok('PUT /dashboard/tasks/k1', {});
      e.backend.ok('GET /dashboard', {});
      await open(tester, const TasksScreen(), e);
      await tester.tap(find.text((await l10n('en')).taskMarkDone));
      await tester.pumpAndSettle();
      expect(e.backend.where('PUT', '/dashboard/tasks/k1').single.body, {'status': 'done'});
    });

    testWidgets('documents: MOB-17 never invents "0 days left" when days_remaining is missing', (tester) async {
      final e = TestEnv();
      e.backend.ok('GET /my-documents', [
        {'id': 1, 'display_name': 'Passport', 'status': 'valid', 'status_label': 'Valid', 'expiry_date': '2027-01-01'},
        {'id': 2, 'display_name': 'Permit', 'status': 'expiring_soon', 'status_label': 'Soon', 'expiry_date': '2026-12-01', 'days_remaining': 5},
      ], meta: page1);
      await open(tester, const DocumentsScreen(), e);
      final l = await l10n('en');
      expect(find.text(l.daysRemaining('0')), findsNothing);
      expect(find.text(l.daysRemaining('5')), findsOneWidget);
    });

    for (final lang in langs) {
      testWidgets('[$lang] explore lists every module incl. patente, government, scan, saved at 320px/1.5x', (tester) async {
        final router = GoRouter(routes: [
          StatefulShellRoute.indexedStack(builder: (_, _, shell) => AppShell(shell: shell), branches: [
            StatefulShellBranch(routes: [GoRoute(path: '/', builder: (_, _) => const ExploreScreen())]),
          ]),
          GoRoute(path: '/:r(.*)', builder: (_, s) => Text('ROUTE:${s.uri}')),
        ]);
        await open(tester, const SizedBox(), TestEnv(), lang: lang, size: const Size(320, 1200), scale: 1.5, router: router);
        final l = await l10n(lang);
        expect(tester.takeException(), isNull);
        for (final t in [l.exploreGovernment, l.explorePatente, l.exploreScan]) {
          await tester.scrollUntilVisible(find.text(t), 100);
          expect(find.text(t), findsOneWidget);
        }
        await tester.tap(find.text(l.exploreScan));
        await tester.pumpAndSettle();
        expect(find.text('ROUTE:/scan'), findsOneWidget);
      });
    }
  });
}
