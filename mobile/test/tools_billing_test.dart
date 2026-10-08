import 'package:expa_mobile/features/billing/billing.dart';
import 'package:expa_mobile/features/tools/tools.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

const _plans = [
  {'key': 'free', 'name': 'Free', 'description': 'Basics', 'price': {'amount_minor': 0, 'currency': 'EUR', 'interval': 'none'}, 'features': {'ai_daily_limit': 10, 'reminders_advanced': false, 'document_ai': false, 'human_credits': 0}},
  {'key': 'plus', 'name': 'Plus', 'description': 'More', 'price': {'amount_minor': 599, 'currency': 'EUR', 'interval': 'month'}, 'features': {'ai_daily_limit': 100, 'reminders_advanced': true, 'document_ai': false, 'human_credits': 0}},
];

TestEnv billingEnv({required bool available, Map<String, dynamic>? sub, List<Object> invoices = const []}) {
  final env = TestEnv();
  env.backend.ok('GET /billing/plans', _plans, meta: {'billing_available': available});
  env.backend.ok('GET /billing/subscription', sub ?? {'plan': {'key': 'free', 'name': 'Free'}, 'status': 'free', 'cancel_at_period_end': false, 'billing_available': available});
  env.backend.ok('GET /billing/invoices', invoices);
  return env;
}

void main() {
  group('billing', () {
    testWidgets('payments not enabled: honest state and NO purchase button', (tester) async {
      final env = billingEnv(available: false);
      await pumpScreen(tester, const BillingScreen(), env, size: const Size(360, 1600));
      expect(find.byKey(const ValueKey('billing-unavailable')), findsOneWidget);
      expect(find.byKey(const ValueKey('plan-plus')), findsOneWidget);
      expect(find.byKey(const ValueKey('plan-buy-plus')), findsNothing);
      expect(env.backend.where('POST', '/billing/checkout'), isEmpty);
      expect(find.byKey(const ValueKey('billing-no-invoices')), findsOneWidget);
    });

    testWidgets('available: choose plan posts checkout and opens only the returned https URL', (tester) async {
      final env = billingEnv(available: true);
      env.backend.ok('POST /billing/checkout', {'checkout_url': 'https://pay.example.com/s/1'});
      await pumpScreen(tester, const BillingScreen(), env, size: const Size(360, 1600));
      expect(find.byKey(const ValueKey('billing-unavailable')), findsNothing);
      await tester.tap(find.byKey(const ValueKey('plan-buy-plus')));
      await tester.pumpAndSettle();
      expect((env.backend.where('POST', '/billing/checkout').single.body as Map)['plan'], 'plus');
    });

    testWidgets('active subscription: cancel at period end after confirmation; shows ending state', (tester) async {
      final env = billingEnv(available: true, sub: {'plan': {'key': 'plus', 'name': 'Plus'}, 'status': 'active', 'current_period_end': '2026-12-01T00:00:00+00:00', 'cancel_at_period_end': false, 'billing_available': true});
      env.backend.ok('POST /billing/cancel', {'cancel_at_period_end': true});
      await pumpScreen(tester, const BillingScreen(), env, size: const Size(360, 1600));
      await tester.tap(find.byKey(const ValueKey('billing-cancel')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('billing-cancel-confirm')));
      await tester.pumpAndSettle();
      expect(env.backend.where('POST', '/billing/cancel'), hasLength(1));
    });

    testWidgets('cancel pending: no cancel button, ending pill, invoices listed', (tester) async {
      final env = billingEnv(available: true, sub: {'plan': {'key': 'plus', 'name': 'Plus'}, 'status': 'active', 'current_period_end': '2026-12-01T00:00:00+00:00', 'cancel_at_period_end': true, 'billing_available': true}, invoices: [
        {'number': 'EXPA-1', 'total_minor': 599, 'currency': 'EUR', 'description': 'Plus', 'issued_at': '2026-10-01T00:00:00+00:00'}
      ]);
      await pumpScreen(tester, const BillingScreen(), env, size: const Size(360, 1800));
      expect(find.byKey(const ValueKey('billing-cancel')), findsNothing);
      expect(find.byKey(const ValueKey('billing-ending')), findsOneWidget);
      expect(find.text('EXPA-1'), findsOneWidget);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name billing renders without overflow', (tester) async {
          final env = billingEnv(available: true);
          await pumpScreen(tester, const BillingScreen(), env, lang: lang, size: Size(size.width, 2200), textScale: scale);
          expect(tester.takeException(), isNull);
          expect(find.byKey(const ValueKey('plan-plus')), findsOneWidget);
        });
      }
    }
  });

  group('recommendations', () {
    final data = {
      'personalization': {'enabled': false},
      'guides': [{'type': 'guide', 'slug': 'permesso', 'title': 'Permesso di soggiorno', 'route': 'guides/permesso', 'reason': {'code': 'setup_task', 'text': 'Open setup task'}}],
      'lessons': [],
      'services': [{'type': 'service', 'slug': 'caf-1', 'title': 'CAF Roma', 'route': 'providers/caf-1', 'label': 'third_party', 'reason': {'code': 'goal', 'text': 'Goal: documents'}}],
      'reminders': [],
    };

    testWidgets('shows reasons, third-party label and non-personalized notice', (tester) async {
      final env = TestEnv()..backend.ok('GET /recommendations', data);
      await pumpScreen(tester, const RecommendationsScreen(), env, size: const Size(360, 1400));
      expect(find.byKey(const ValueKey('reco-personalization')), findsOneWidget);
      expect(find.byKey(const ValueKey('reco-consent')), findsOneWidget);
      expect(find.text('Permesso di soggiorno'), findsOneWidget);
      expect(find.textContaining('Open setup task'), findsOneWidget);
      expect(find.textContaining('Third-party'), findsOneWidget);
    });

    testWidgets('empty response shows the empty state', (tester) async {
      final env = TestEnv()..backend.ok('GET /recommendations', {'personalization': {'enabled': true}, 'guides': [], 'lessons': [], 'services': [], 'reminders': []});
      await pumpScreen(tester, const RecommendationsScreen(), env);
      expect(find.byKey(const ValueKey('reco-consent')), findsNothing);
      expect(find.byIcon(Icons.auto_awesome_outlined), findsOneWidget);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name recommendations render without overflow', (tester) async {
          final env = TestEnv()..backend.ok('GET /recommendations', data);
          await pumpScreen(tester, const RecommendationsScreen(), env, lang: lang, size: Size(size.width, 1600), textScale: scale);
          expect(tester.takeException(), isNull);
        });
      }
    }
  });

  group('net salary', () {
    testWidgets('invalid input is rejected locally without a request', (tester) async {
      final env = TestEnv();
      await pumpScreen(tester, const NetSalaryScreen(), env);
      await tester.enterText(find.byKey(const ValueKey('net-gross')), 'abc');
      await tester.tap(find.byKey(const ValueKey('net-run')));
      await tester.pumpAndSettle();
      expect(env.backend.calls.where((c) => c.path == '/money/net-salary'), isEmpty);
    });

    testWidgets('tables not published: honest unavailable state, no figures', (tester) async {
      final env = TestEnv()..backend.ok('POST /money/net-salary', {'available': false, 'reason': 'tables_not_published', 'message': 'No verified tables.'});
      await pumpScreen(tester, const NetSalaryScreen(), env, size: const Size(360, 1200));
      await tester.enterText(find.byKey(const ValueKey('net-gross')), '30000');
      await tester.tap(find.byKey(const ValueKey('net-run')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('net-unavailable')), findsOneWidget);
      expect(find.byKey(const ValueKey('net-result')), findsNothing);
      expect(find.text('No verified tables.'), findsOneWidget);
      final body = env.backend.where('POST', '/money/net-salary').single.body as Map;
      expect([body['gross_annual'], body['months']], [30000.0, 12]);
    });

    testWidgets('available: shows estimate, table source and server disclaimer', (tester) async {
      final env = TestEnv()
        ..backend.ok('POST /money/net-salary', {
          'available': true,
          'tax_year': 2026,
          'estimate': {'gross_annual': 30000, 'contributions': 2757, 'deduction': 0, 'taxable_income': 27243, 'income_tax': 5800, 'net_annual': 21443, 'months': 13, 'net_monthly': 1649.46},
          'table': {'name': 'IRPEF', 'source': {'name': 'Agenzia delle Entrate', 'url': 'https://www.agenziaentrate.gov.it', 'type': 'official', 'last_verified_at': '2026-09-01', 'freshness': 'fresh'}},
          'disclaimer': 'Estimate only (server).',
        });
      await pumpScreen(tester, const NetSalaryScreen(), env, size: const Size(360, 1800));
      await tester.tap(find.byKey(const ValueKey('net-months-13')));
      await tester.enterText(find.byKey(const ValueKey('net-gross')), '30000');
      await tester.tap(find.byKey(const ValueKey('net-run')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('net-result')), findsOneWidget);
      expect(find.textContaining('Agenzia delle Entrate'), findsOneWidget);
      expect(find.text('Estimate only (server).'), findsOneWidget);
      expect((env.backend.where('POST', '/money/net-salary').single.body as Map)['months'], 13);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name net salary renders without overflow', (tester) async {
          final env = TestEnv()..backend.ok('POST /money/net-salary', {'available': false, 'message': 'x'});
          await pumpScreen(tester, const NetSalaryScreen(), env, lang: lang, size: Size(size.width, 1400), textScale: scale);
          await tester.enterText(find.byKey(const ValueKey('net-gross')), '1000');
          await tester.tap(find.byKey(const ValueKey('net-run')));
          await tester.pumpAndSettle();
          expect(tester.takeException(), isNull);
        });
      }
    }
  });

  group('travel', () {
    testWidgets('invalid codes are rejected locally', (tester) async {
      final env = TestEnv();
      await pumpScreen(tester, const TravelScreen(), env, size: const Size(360, 1200));
      await tester.enterText(find.byKey(const ValueKey('travel-nat')), 'E');
      await tester.tap(find.byKey(const ValueKey('travel-run')));
      await tester.pumpAndSettle();
      expect(env.backend.calls.where((c) => c.path == '/travel/requirements'), isEmpty);
    });

    testWidgets('no verified entry: "no verified information", never "allowed"', (tester) async {
      final env = TestEnv()..backend.ok('GET /travel/requirements', {'available': false, 'message': 'No verified entries.', 'disclaimer': 'Check official.', 'items': []});
      await pumpScreen(tester, const TravelScreen(), env, size: const Size(360, 1400));
      await tester.enterText(find.byKey(const ValueKey('travel-nat')), 'eg');
      await tester.tap(find.byKey(const ValueKey('travel-run')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('travel-none')), findsOneWidget);
      expect(find.byKey(const ValueKey('travel-disclaimer')), findsOneWidget);
      final q = env.backend.where('GET', '/travel/requirements').single.query;
      expect([q['nationality'], q['destination']], ['EG', 'IT']);
    });

    testWidgets('entries show requirements with source block and disclaimer', (tester) async {
      final env = TestEnv()
        ..backend.ok('GET /travel/requirements', {
          'available': true,
          'disclaimer': 'Check official.',
          'items': [
            {'slug': 'eg-it', 'title': 'Entry to Italy', 'summary': 'Visa needed', 'requirements': 'Passport', 'notes': null, 'source': {'name': 'Viaggiare Sicuri', 'url': 'https://www.viaggiaresicuri.it', 'type': 'official', 'last_verified_at': '2026-09-01', 'freshness': 'fresh'}}
          ],
        });
      await pumpScreen(tester, const TravelScreen(), env, size: const Size(360, 1800));
      await tester.enterText(find.byKey(const ValueKey('travel-nat')), 'EG');
      await tester.tap(find.byKey(const ValueKey('travel-run')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('travel-eg-it')), findsOneWidget);
      expect(find.text('Viaggiare Sicuri'), findsOneWidget);
    });

    for (final lang in langs) {
      for (final (name, size, scale) in sizes) {
        testWidgets('[$lang] $name travel renders without overflow', (tester) async {
          final env = TestEnv()..backend.ok('GET /travel/requirements', {'available': false, 'items': []});
          await pumpScreen(tester, const TravelScreen(), env, lang: lang, size: Size(size.width, 1600), textScale: scale);
          await tester.enterText(find.byKey(const ValueKey('travel-nat')), 'EG');
          await tester.tap(find.byKey(const ValueKey('travel-run')));
          await tester.pumpAndSettle();
          expect(tester.takeException(), isNull);
        });
      }
    }
  });
}
