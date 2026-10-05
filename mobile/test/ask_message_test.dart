import 'package:expa_mobile/features/ask/ask_models.dart';
import 'package:expa_mobile/features/ask/ask_screen.dart';
import 'package:expa_mobile/l10n/app_localizations.dart';
import 'package:expa_mobile/core/util/safe_url.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'helpers.dart';

Map<String, dynamic> payload({String? disclaimer, bool degraded = false, List<Map<String, dynamic>>? sources}) => {
      'id': 1,
      'role': 'assistant',
      'content': 'Per il rinnovo serve il kit postale.',
      'label': 'official',
      'label_text': 'Official information',
      'sources': sources ??
          [
            {
              'n': 1,
              'title': 'Rinnovo del permesso',
              'ref': {'type': 'guide', 'slug': 'rinnovo', 'route': 'guides/rinnovo'},
              'source': {'name': 'Polizia di Stato', 'url': 'https://www.poliziadistato.it/', 'type': 'official', 'last_verified_at': '2026-09-01', 'freshness': 'fresh'},
            }
          ],
      'actions': [
        {'type': 'guide', 'target': 'rinnovo', 'label': 'Open the guide'},
        {'type': 'route', 'target': 'https://evil.example/x', 'label': 'Bad link'},
        {'type': 'route', 'target': 'patente', 'label': 'Unmapped'},
      ],
      'disclaimer': disclaimer,
      'degraded': degraded,
    };

void main() {
  testWidgets('renders label, content, sources, safe actions; disclaimer is a separate notice', (tester) async {
    const warn = 'General information, not legal advice.';
    final msg = AskMessage.fromJson(payload(disclaimer: warn));
    await tester.pumpWidget(harness(SingleChildScrollView(child: AskMessageView(message: msg)), locale: const Locale('en')));
    await tester.pump();
    final l = await AppL10n.delegate.load(const Locale('en'));

    expect(find.byKey(const ValueKey('ask-label')), findsOneWidget);
    expect(find.text('Official information'), findsOneWidget);
    // content does not contain the disclaimer; it is its own widget
    expect(tester.widget<Text>(find.byKey(const ValueKey('ask-content'))).data, 'Per il rinnovo serve il kit postale.');
    expect(find.byKey(const ValueKey('ask-disclaimer')), findsOneWidget);
    expect(find.text(warn), findsOneWidget);
    // source metadata
    expect(find.text('[1] Rinnovo del permesso'), findsOneWidget);
    expect(find.text('Polizia di Stato'), findsOneWidget);
    expect(find.text(l.sourceOfficial), findsOneWidget);
    expect(find.text(l.freshFresh), findsOneWidget);
    expect(find.textContaining('Last verified'), findsOneWidget);
    expect(find.text(l.openOfficialSite), findsOneWidget);
    // only allow-listed actions survive
    expect(find.text('Open the guide'), findsOneWidget);
    expect(find.text('Bad link'), findsNothing);
    expect(find.text('Unmapped'), findsNothing);
    expect(find.byKey(const ValueKey('ask-degraded')), findsNothing);
  });

  testWidgets('no disclaimer widget when the API sent none; shows an explicit no-sources note', (tester) async {
    final msg = AskMessage.fromJson(payload(sources: []));
    await tester.pumpWidget(harness(SingleChildScrollView(child: AskMessageView(message: msg)), locale: const Locale('ar')));
    await tester.pump();
    expect(find.byKey(const ValueKey('ask-disclaimer')), findsNothing);
    expect(find.byKey(const ValueKey('ask-no-sources')), findsOneWidget);
  });

  testWidgets('degraded answers show the degraded notice', (tester) async {
    final msg = AskMessage.fromJson(payload(degraded: true, disclaimer: 'x'));
    await tester.pumpWidget(harness(SingleChildScrollView(child: AskMessageView(message: msg)), locale: const Locale('it')));
    await tester.pump();
    expect(find.byKey(const ValueKey('ask-degraded')), findsOneWidget);
  });

  testWidgets('official URL opens externally and only https is allowed', (tester) async {
    final opened = <Uri>[];
    urlOpener = (u) async {
      opened.add(u);
      return true;
    };
    final msg = AskMessage.fromJson(payload());
    await tester.pumpWidget(harness(SingleChildScrollView(child: AskMessageView(message: msg)), locale: const Locale('en')));
    await tester.pump();
    await tester.tap(find.text('Open the official website'));
    await tester.pump();
    expect(opened.single.toString(), 'https://www.poliziadistato.it/');

    expect(safeHttpsUri('http://insecure.example'), isNull);
    expect(safeHttpsUri('javascript:alert(1)'), isNull);
    expect(safeHttpsUri('https://user:pw@x.example'), isNull);
    expect(safeHttpsUri(null), isNull);
  });

  testWidgets('message renders in Arabic and RTL without overflow on a narrow screen', (tester) async {
    tester.view.physicalSize = const Size(960, 1700);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final msg = AskMessage.fromJson(payload(disclaimer: 'معلومات عامة وليست استشارة قانونية.'));
    await tester.pumpWidget(harness(SingleChildScrollView(child: AskMessageView(message: msg)), locale: const Locale('ar')));
    await tester.pump();
    expect(tester.takeException(), isNull);
    expect(Directionality.of(tester.element(find.byType(AskMessageView))), TextDirection.rtl);
  });
}
