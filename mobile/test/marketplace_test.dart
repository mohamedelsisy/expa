import 'package:expa_mobile/features/marketplace/marketplace.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

Map<String, dynamic> provider({bool contact = false}) => {
      'slug': 'cafe-roma',
      'display_name': 'CAF Roma',
      'category': 'caf',
      'category_label': 'CAF',
      'headline': 'Tax assistance',
      'description': 'Long description',
      'languages': ['it', 'ar'],
      'source_type': 'third_party',
      'official': false,
      'notice': 'Independent provider (server notice).',
      'verification': {'status': 'verified', 'label': 'Verified by EXPA', 'verified_at': '2026-08-01', 'valid_until': '2027-08-01'},
      'rating': {'average': 4.5, 'count': 2},
      'services': [{'name': 'ISEE', 'description': 'x', 'price_from_eur': 20}],
      if (contact) 'contact': {'email': 'info@cafroma.it', 'phone': '+39 06 000000', 'website': 'https://cafroma.it'},
    };

TestEnv env0() {
  final env = TestEnv();
  env.backend.ok('GET /providers/meta', {'categories': [{'value': 'caf', 'label': 'CAF'}]});
  env.backend.ok('GET /providers', [provider()], meta: {'page': 1, 'last_page': 1});
  env.backend.ok('GET /providers/cafe-roma', provider(contact: true));
  env.backend.ok('GET /providers/cafe-roma/reviews', [{'id': 7, 'rating': 5, 'body': 'Great help', 'created_at': '2026-09-01'}]);
  return env;
}

void main() {
  testWidgets('list: verification label and third-party pill from the API; filters send verified=1', (tester) async {
    final env = env0();
    await pumpScreen(tester, const ProvidersScreen(), env);
    expect(find.text('CAF Roma'), findsOneWidget);
    expect(find.text('Verified by EXPA'), findsOneWidget);
    expect(find.text('Third-party service, not official'), findsOneWidget);
    await tester.tap(find.byType(SwitchListTile));
    await tester.pumpAndSettle();
    expect(env.backend.where('GET', '/providers').last.query['verified'], 1);
  });

  testWidgets('detail: shows the server notice as given, contact only because the API sent it, reviews list', (tester) async {
    final env = env0();
    await pumpScreen(tester, const ProviderDetailScreen(slug: 'cafe-roma'), env, size: const Size(360, 1600));
    expect(find.text('Independent provider (server notice).'), findsOneWidget);
    expect(find.text('info@cafroma.it'), findsOneWidget);
    expect(find.text('Great help'), findsOneWidget);
    expect(find.byKey(const ValueKey('provider-request')), findsOneWidget);
  });

  testWidgets('detail without contact fields shows no contact block and falls back to the local notice', (tester) async {
    final env = env0();
    env.backend.ok('GET /providers/cafe-roma', {...provider(), 'notice': null});
    env.backend.ok('GET /providers/cafe-roma/reviews', []);
    await pumpScreen(tester, const ProviderDetailScreen(slug: 'cafe-roma'), env, size: const Size(360, 1600));
    final l = await l10n('en');
    expect(find.text(l.providersContact), findsNothing);
    expect(find.text(l.providersNoticeFallback), findsOneWidget);
    expect(find.byKey(const ValueKey('reviews-empty')), findsOneWidget);
  });

  testWidgets('report a review posts reason and note', (tester) async {
    final env = env0();
    env.backend.ok('POST /provider-reviews/7/report', {});
    await pumpScreen(tester, const ProviderDetailScreen(slug: 'cafe-roma'), env, size: const Size(360, 1600));
    await tester.tap(find.byKey(const ValueKey('report-7')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Misleading or fake'));
    await tester.enterText(find.byKey(const ValueKey('report-note')), 'looks fake');
    await tester.tap(find.byKey(const ValueKey('report-send')));
    await tester.pumpAndSettle();
    expect(env.backend.where('POST', '/provider-reviews/7/report').single.body, {'reason': 'misleading', 'note': 'looks fake'});
  });

  testWidgets('lead: explicit consent checkbox is required; body carries consent_share_contact:true', (tester) async {
    final env = env0();
    env.backend.ok('POST /providers/cafe-roma/leads', {'id': 1});
    await pumpScreen(tester, const ProviderLeadScreen(slug: 'cafe-roma'), env, size: const Size(360, 1200));
    expect(tester.widget<CheckboxListTile>(find.byKey(const ValueKey('lead-consent'))).value, false, reason: 'consent is never pre-checked');
    await tester.enterText(find.byKey(const ValueKey('lead-message')), 'Need ISEE help');
    await tester.tap(find.byKey(const ValueKey('lead-send')));
    await tester.pumpAndSettle();
    expect(env.backend.where('POST', '/providers/cafe-roma/leads'), isEmpty, reason: 'blocked without consent');
    expect(find.byKey(const ValueKey('lead-error')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('lead-consent')));
    await tester.tap(find.byKey(const ValueKey('lead-send')));
    await tester.pumpAndSettle();
    final body = env.backend.where('POST', '/providers/cafe-roma/leads').single.body as Map;
    expect(body['consent_share_contact'], true);
    expect(body['message'], 'Need ISEE help');
    expect(find.byKey(const ValueKey('lead-sent')), findsOneWidget);
  });

  testWidgets('lead 429 lead_cooldown shows the cooldown text', (tester) async {
    final env = env0();
    env.backend.error('POST /providers/cafe-roma/leads', 429, 'lead_cooldown');
    await pumpScreen(tester, const ProviderLeadScreen(slug: 'cafe-roma'), env, lang: 'it', size: const Size(360, 1200));
    await tester.enterText(find.byKey(const ValueKey('lead-message')), 'x');
    await tester.tap(find.byKey(const ValueKey('lead-consent')));
    await tester.tap(find.byKey(const ValueKey('lead-send')));
    await tester.pumpAndSettle();
    expect(find.text((await l10n('it')).leadCooldown), findsOneWidget);
  });

  testWidgets('review: needs a rating, posts, then says it awaits moderation', (tester) async {
    final env = env0();
    env.backend.ok('POST /providers/cafe-roma/reviews', {'id': 9, 'status': 'pending'});
    await pumpScreen(tester, const ProviderReviewScreen(slug: 'cafe-roma'), env, size: const Size(360, 1000));
    await tester.tap(find.byKey(const ValueKey('review-send')));
    await tester.pumpAndSettle();
    expect(env.backend.where('POST', '/providers/cafe-roma/reviews'), isEmpty);
    await tester.tap(find.byKey(const ValueKey('star-4')));
    await tester.tap(find.byKey(const ValueKey('review-send')));
    await tester.pumpAndSettle();
    expect((env.backend.where('POST', '/providers/cafe-roma/reviews').single.body as Map)['rating'], 4);
    expect(find.byKey(const ValueKey('review-pending')), findsOneWidget);
  });

  testWidgets('review_exists maps to a specific message', (tester) async {
    final env = env0();
    env.backend.error('POST /providers/cafe-roma/reviews', 422, 'review_exists');
    await pumpScreen(tester, const ProviderReviewScreen(slug: 'cafe-roma'), env, size: const Size(360, 1000));
    await tester.tap(find.byKey(const ValueKey('star-5')));
    await tester.tap(find.byKey(const ValueKey('review-send')));
    await tester.pumpAndSettle();
    expect(find.text((await l10n('en')).reviewExists), findsOneWidget);
  });

  testWidgets('my requests: leads and own reviews, delete review calls DELETE', (tester) async {
    final env = env0();
    env.backend.ok('GET /my/provider-leads', [{'id': 1, 'provider': {'slug': 'cafe-roma', 'display_name': 'CAF Roma'}, 'message': 'Need ISEE help', 'status': 'seen', 'created_at': '2026-09-01'}]);
    env.backend.ok('GET /my/provider-reviews', [{'id': 5, 'provider': {'slug': 'cafe-roma', 'display_name': 'CAF Roma'}, 'rating': 4, 'body': 'ok', 'status': 'pending'}]);
    env.backend.on('DELETE /my/provider-reviews/5', null, status: 204);
    await pumpScreen(tester, const MyRequestsScreen(), env, size: const Size(360, 1200));
    expect(find.textContaining('Need ISEE help'), findsOneWidget);
    expect(find.textContaining('Seen by the provider'), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('delete-review-5')));
    await tester.pumpAndSettle();
    expect(env.backend.where('DELETE', '/my/provider-reviews/5'), hasLength(1));
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name list, detail, lead, my requests render without overflow', (tester) async {
        final env = env0();
        env.backend.ok('GET /my/provider-leads', []);
        env.backend.ok('GET /my/provider-reviews', []);
        for (final w in [const ProvidersScreen(), const ProviderDetailScreen(slug: 'cafe-roma'), const ProviderLeadScreen(slug: 'cafe-roma'), const MyRequestsScreen()]) {
          await pumpScreen(tester, w, env, lang: lang, size: size, textScale: scale);
          expect(tester.takeException(), isNull, reason: '${w.runtimeType}');
        }
      });
    }
  }
}
