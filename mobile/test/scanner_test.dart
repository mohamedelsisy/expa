import 'dart:typed_data';

import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:expa_mobile/features/scanner/document_explainer_api.dart';
import 'package:expa_mobile/features/scanner/scanner_screen.dart';
import 'package:expa_mobile/features/scanner/scanner_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

class FakeCapture implements ImageCaptureService {
  FakeCapture({this.available = true, this.deny = false});
  final bool available;
  final bool deny;
  int captures = 0;
  @override
  bool get isAvailable => available;
  @override
  Future<CapturedImage?> capture({required bool fromCamera}) async {
    captures++;
    if (deny) throw const CapturePermissionDenied();
    // 1x1 transparent PNG
    final png = Uint8List.fromList([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
    return CapturedImage(bytes: png, filename: 'scan.png', mimeType: 'image/png');
  }
}

class FakeOcr implements OcrEngine {
  @override
  bool get isAvailable => true;
  @override
  Future<String?> recognize(CapturedImage image) async => 'Gentile signore, scadenza 18 novembre';
}

class FakeExplainer implements DocumentExplainer {
  final List<String> sent = [];
  Object? error;
  @override
  Future<Explanation> explainText(String text) async {
    sent.add('text:$text');
    if (error != null) throw error!;
    return Explanation.fromJson({
      'classification': 'comune_letter',
      'summary': 'A letter from the Comune.',
      'key_dates': [{'label': 'Deadline', 'date': '2026-11-18'}],
      'suggested_actions': [{'type': 'route', 'target': 'my-documents', 'label': 'Track it'}, 'Call the office', {'type': 'route', 'target': 'https://evil.example', 'label': 'Evil'}],
      'disclaimer': 'Not legal advice.',
      'sources': [{'title': 'Comune site', 'url': 'https://comune.example/x'}, {'title': 'Bad', 'url': 'http://insecure.example'}],
    });
  }

  @override
  Future<Explanation> explainImage(CapturedImage image) async {
    sent.add('image:${image.filename}');
    if (error != null) throw error!;
    return const Explanation(summary: 'From image');
  }
}

Future<(FakeExplainer, TestEnv)> open(WidgetTester tester, {FakeCapture? capture, OcrEngine? ocr, String lang = 'en', Size size = const Size(360, 1200), double scale = 1}) async {
  final ex = FakeExplainer();
  final env = TestEnv();
  await pumpScreen(tester, const ScannerScreen(), env, lang: lang, size: size, textScale: scale, extra: [
    imageCaptureProvider.overrideWithValue(capture ?? FakeCapture()),
    ocrEngineProvider.overrideWithValue(ocr ?? const NoopOcrEngine()),
    documentExplainerProvider.overrideWithValue(ex),
  ]);
  return (ex, env);
}

void main() {
  testWidgets('capture goes to REVIEW; nothing is uploaded until the user taps Send', (tester) async {
    final (ex, _) = await open(tester);
    await tester.tap(find.byKey(const ValueKey('scanner-camera')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-send')), findsOneWidget);
    expect(find.byKey(const ValueKey('scanner-no-ocr')), findsOneWidget, reason: 'no OCR engine: tells the user');
    expect(ex.sent, isEmpty, reason: 'never auto-upload');
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(ex.sent, ['image:scan.png']);
    expect(find.text('From image'), findsOneWidget);
  });

  testWidgets('with an OCR engine the recognised text is shown, editable, and only text is sent', (tester) async {
    final (ex, _) = await open(tester, ocr: FakeOcr());
    await tester.tap(find.byKey(const ValueKey('scanner-camera')));
    await tester.pumpAndSettle();
    expect(find.text('Gentile signore, scadenza 18 novembre'), findsOneWidget);
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'Edited text');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(ex.sent, ['text:Edited text']);
  });

  testWidgets('no camera: manual paste fallback works end to end and renders a safe result', (tester) async {
    final (ex, _) = await open(tester, capture: FakeCapture(available: false));
    expect(find.byKey(const ValueKey('scanner-no-camera')), findsOneWidget);
    expect(find.byKey(const ValueKey('scanner-camera')), findsNothing);
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    expect(tester.widget<FilledButton>(find.byKey(const ValueKey('scanner-send'))).onPressed, isNull, reason: 'nothing to send yet');
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'Letter text');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(ex.sent, ['text:Letter text']);
    expect(find.byKey(const ValueKey('scanner-summary')), findsOneWidget);
    expect(find.text('Deadline'), findsOneWidget);
    expect(find.text('Track it'), findsOneWidget);
    expect(find.text('Call the office'), findsOneWidget);
    expect(find.text('Evil'), findsOneWidget, reason: 'unsafe route is shown as plain text, not as a link');
    expect(find.widgetWithText(ListTile, 'Evil').evaluate().single.widget, isA<ListTile>().having((t) => t.onTap, 'onTap', isNull));
    expect(find.text('Comune site'), findsOneWidget);
    expect(find.text('Bad'), findsNothing, reason: 'http source URLs are not offered');
    expect(find.text('Not legal advice.'), findsOneWidget);
  });

  testWidgets('permission denied: explains and keeps the paste fallback available', (tester) async {
    await open(tester, capture: FakeCapture(deny: true));
    await tester.tap(find.byKey(const ValueKey('scanner-camera')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-denied')), findsOneWidget);
    expect(find.byKey(const ValueKey('scanner-paste')), findsOneWidget);
  });

  testWidgets('discard returns to the start without sending anything', (tester) async {
    final (ex, _) = await open(tester);
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.tap(find.byKey(const ValueKey('scanner-discard')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-paste')), findsOneWidget);
    expect(ex.sent, isEmpty);
  });

  testWidgets('backend endpoint not deployed (404) -> specific localized message, not a crash', (tester) async {
    final (ex, _) = await open(tester, lang: 'ar');
    ex.error = const NotFoundException('nf');
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.text((await l10n('ar')).scannerBackendUnavailable), findsOneWidget);
  });

  testWidgets('network error keeps the review screen so the user can retry', (tester) async {
    final (ex, _) = await open(tester);
    ex.error = const NetworkException();
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.text((await l10n('en')).errorNetwork), findsOneWidget);
    expect(find.byKey(const ValueKey('scanner-send')), findsOneWidget);
  });

  group('provisional contract parser (isolated in document_explainer_api.dart)', () {
    test('tolerates missing fields', () {
      final e = Explanation.fromJson({});
      expect(e.summary, '');
      expect(e.keyDates, isEmpty);
      expect(e.disclaimer, isNull);
    });
    test('POST /documents/explain: text as JSON, image as multipart', () async {
      final env = TestEnv();
      env.backend.ok('POST /documents/explain', {'summary': 's', 'key_dates': [], 'suggested_actions': [], 'sources': []});
      final api = ApiDocumentExplainer(env.api);
      await api.explainText('hello');
      await api.explainImage(CapturedImage(bytes: Uint8List(3), filename: 'a.jpg', mimeType: 'image/jpeg'));
      final calls = env.backend.where('POST', '/documents/explain').toList();
      expect(calls[0].body, {'text': 'hello'});
      expect(calls[1].body, 'multipart');
    });
  });

  for (final lang in langs) {
    for (final (name, size, scale) in sizes) {
      testWidgets('[$lang] $name intro and review render without overflow', (tester) async {
        await open(tester, lang: lang, size: size, scale: scale);
        expect(tester.takeException(), isNull);
        await tester.scrollUntilVisible(find.byKey(const ValueKey('scanner-paste')), 100, scrollable: find.byType(Scrollable).first);
        await tester.tap(find.byKey(const ValueKey('scanner-paste')));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      });
    }
  }
}
