import 'package:expa_mobile/features/housing/housing.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

final _result = {
  'language': 'it',
  'facts': {'rent_monthly': 700, 'deposit_amount': 1400, 'deposit_months': 2, 'utilities': 'excluded', 'expenses_monthly': null},
  'red_flags': [
    {'id': 'cash', 'severity': 'warning', 'title': 'Cash payment only', 'explanation': 'Ask for traceable payment.', 'basis': 'general_guidance', 'source': null},
    {'id': 'reg', 'severity': 'caution', 'title': 'Registration not mentioned', 'explanation': 'Contracts must be registered.', 'basis': 'sourced', 'source': {'name': 'Agenzia delle Entrate', 'url': 'https://www.agenziaentrate.gov.it'}},
  ],
  'questions': [{'id': 'q1', 'question': 'Who pays the condo fees?'}],
  'could_not_detect': [{'key': 'notice_period', 'label': 'Notice period'}],
  'cost': {
    'currency': 'EUR',
    'monthly_total': null,
    'components': [{'key': 'rent', 'amount': 700, 'source': 'text'}, {'key': 'internet', 'amount': 25, 'source': 'user'}],
    'one_time': [{'key': 'deposit', 'amount': 1400, 'source': 'text'}],
    'assumptions': [{'code': 'utilities_unknown', 'text': 'Utilities were not stated, so they are excluded from the total.'}],
  },
  'confidence': 'medium',
  'notes': [{'code': 'x', 'text': 'Check the lease duration.'}],
  'explanation': {'text': 'Plain explanation.', 'label': 'ai_explanation'},
  'disclaimer': 'Not legal advice (server).',
  'persisted': false,
  'usage': {'remaining': 4},
};

Future<TestEnv> open(WidgetTester tester, {String lang = 'en', Size size = const Size(360, 1800), double scale = 1}) async {
  final env = TestEnv();
  env.backend.ok('GET /housing/usage', {'remaining': 4});
  env.backend.ok('POST /housing/check', _result);
  await pumpScreen(tester, const HousingCheckerScreen(), env, lang: lang, size: size, textScale: scale);
  return env;
}

Future<void> submit(WidgetTester tester, [String text = 'Appartamento in affitto 700 euro al mese, solo contanti']) async {
  await tester.enterText(find.byKey(const ValueKey('housing-text')), text);
  await tester.pump();
  await tester.tap(find.byKey(const ValueKey('housing-send')));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('shows quota; short text is rejected locally without a request', (tester) async {
    final env = await open(tester);
    expect(find.byKey(const ValueKey('housing-quota')), findsOneWidget);
    await submit(tester, 'too short');
    expect(find.byKey(const ValueKey('housing-error')), findsOneWidget);
    expect(env.backend.where('POST', '/housing/check'), isEmpty);
  });

  testWidgets('sends text + extras with save:false and renders flags, questions, costs, assumptions, disclaimer', (tester) async {
    final env = await open(tester);
    await tester.enterText(find.byKey(const ValueKey('housing-internet_monthly')), '25');
    await submit(tester);
    final body = env.backend.where('POST', '/housing/check').single.body as Map;
    expect(body['save'], false);
    expect((body['extra'] as Map)['internet_monthly'], 25);
    expect(find.text('Cash payment only'), findsOneWidget);
    expect(find.text('Agenzia delle Entrate'), findsOneWidget);
    expect(find.text('Who pays the condo fees?'), findsOneWidget);
    expect(find.textContaining('Check the lease duration.'), findsOneWidget);
    expect(find.textContaining('Deposit: 1,400'), findsWidgets);
    expect(find.text('Notice period'), findsOneWidget);
    expect(find.byKey(const ValueKey('housing-confidence')), findsOneWidget);
    expect(find.text('A reliable total cannot be computed from the available information.'), findsOneWidget, reason: 'null total is never replaced by a made-up number');
    expect(find.textContaining('Utilities were not stated'), findsOneWidget);
    expect(find.textContaining('you entered'), findsOneWidget);
    expect(find.byKey(const ValueKey('housing-explanation')), findsOneWidget);
    expect(find.text('Not legal advice (server).'), findsOneWidget);
    expect(find.byKey(const ValueKey('housing-disclaimer')), findsOneWidget);
  });

  testWidgets('consent_required offers housing_analysis and does not send by itself', (tester) async {
    final env = await open(tester);
    env.backend.error('POST /housing/check', 403, 'consent_required');
    env.backend.ok('PUT /profile/consents', {});
    await submit(tester);
    expect(find.byKey(const ValueKey('housing-grant')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('housing-grant')));
    await tester.pumpAndSettle();
    expect(env.backend.where('PUT', '/profile/consents').single.body, {'consents': {'housing_analysis': true}});
    expect(env.backend.where('POST', '/housing/check').length, 1);
  });

  testWidgets('429 quota_reached shows the quota message', (tester) async {
    final env = await open(tester, lang: 'ar');
    env.backend.error('POST /housing/check', 429, 'quota_reached');
    await submit(tester);
    expect(find.text((await l10n('ar')).housingQuotaReached), findsOneWidget);
  });

  testWidgets('no red flags: honest wording, not an all-clear', (tester) async {
    final env = await open(tester);
    env.backend.ok('POST /housing/check', {..._result, 'red_flags': [], 'disclaimer': null});
    await submit(tester);
    expect(find.byKey(const ValueKey('housing-no-flags')), findsOneWidget);
    expect(find.text((await l10n('en')).housingFallbackDisclaimer), findsOneWidget);
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name form and result render without overflow', (tester) async {
        await open(tester, lang: lang, size: Size(size.width, 6000), scale: scale);
        expect(tester.takeException(), isNull);
        await submit(tester);
        expect(find.byKey(const ValueKey('housing-disclaimer')), findsOneWidget);
        expect(tester.takeException(), isNull);
      });
    }
  }
}
