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
  String get id => 'fake';
  @override
  bool get isAvailable => true;
  @override
  Future<String?> recognize(CapturedImage image) async => 'Gentile signore, scadenza 18 novembre';
}

class FakeExplainer implements DocumentExplainer {
  final List<String> sent = [];
  Object? error;
  bool failOnce = false;
  Map<String, dynamic>? custom;
  @override
  Future<ExplainUsage?> usage() async => const ExplainUsage(limit: 5, remaining: 3);
  @override
  Future<Explanation> explainText(String text) async {
    sent.add('text:$text');
    if (error != null) {
      final e = error!;
      if (failOnce) error = null;
      throw e;
    }
    return Explanation.fromJson(custom ?? {
      'classification': {'type': 'comune_letter', 'type_label': 'Letter from the Comune', 'confidence': 'medium'},
      'label': 'ai_explanation',
      'label_text': 'AI explanation',
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
    if (error != null) {
      final e = error!;
      if (failOnce) error = null;
      throw e;
    }
    return const Explanation(summary: 'From image');
  }
}

Future<(FakeExplainer, TestEnv)> open(WidgetTester tester, {FakeCapture? capture, OcrEngine? ocr, String lang = 'en', Size size = const Size(360, 1200), double scale = 1}) async {
  final ex = FakeExplainer();
  final env = TestEnv();
  await pumpScreen(tester, const ScannerScreen(), env, lang: lang, size: size, textScale: scale, extra: [
    imageCaptureProvider.overrideWithValue(capture ?? FakeCapture()),
    ocrEngineProvider.overrideWithValue(ocr ?? const ManualEntryOcrEngine()),
    documentExplainerProvider.overrideWithValue(ex),
  ]);
  return (ex, env);
}

void main() {
  testWidgets('review shows a redaction hint for IBAN-like text, a general tip otherwise', (tester) async {
    await open(tester);
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'Pagare su IT60 X054 2811 1010 0000 0123 456 entro il 18 novembre');
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-redact')), findsOneWidget);
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'Gentile signore, scadenza 18 novembre');
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-redact')), findsNothing);
    expect(find.byKey(const ValueKey('scanner-redact-general')), findsOneWidget);
  });

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

  testWidgets('classification object renders label, confidence and quota; reminder action routes to documents', (tester) async {
    final (ex, _) = await open(tester);
    expect(find.byKey(const ValueKey('scanner-quota')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.text('Letter from the Comune'), findsOneWidget);
    expect(find.text('AI explanation'), findsOneWidget);
    expect(find.byKey(const ValueKey('scanner-confidence')), findsOneWidget);
    expect(ex.sent.length, 1);
  });

  testWidgets('key date with null date says the date is not clear (never invented)', (tester) async {
    final (ex, _) = await open(tester);
    ex.custom = {
      'classification': {'type': 'x', 'type_label': 'Letter', 'confidence': 'low'},
      'summary': 's',
      'key_dates': [{'label': 'Appointment', 'label_key': 'appt', 'date': null, 'text': 'next Monday', 'year_missing': false, 'past': false}, {'label': 'Old', 'date': '2020-01-01', 'past': true, 'year_missing': true}],
      'suggested_actions': [{'type': 'appointment', 'target': 'appointments/hub', 'label': 'Open the hub'}, {'type': 'guide', 'target': 'search?q=permesso', 'label': 'Search it'}],
    };
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.textContaining('Date not clear'), findsOneWidget);
    expect(find.textContaining('This date has passed'), findsOneWidget);
    expect(find.text('Open the hub'), findsOneWidget);
    expect(find.text('Search it'), findsOneWidget);
  });

  testWidgets('OCR failure on a photo falls back to pasting text and sends only the pasted text', (tester) async {
    final (ex, _) = await open(tester);
    ex.error = const ValidationException('x', code: 'ocr_failed', details: {'fallback': ['text']});
    ex.failOnce = true;
    await tester.tap(find.byKey(const ValueKey('scanner-camera')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-ocr-fallback')), findsOneWidget);
    expect(find.byKey(const ValueKey('scanner-error')), findsNothing);
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'typed text');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(ex.sent, ['image:scan.png', 'text:typed text']);
  });

  testWidgets('consent_required offers the document_analysis consent, then the user can send again', (tester) async {
    final ex = FakeExplainer();
    final env = TestEnv();
    env.backend.ok('PUT /profile/consents', {});
    await pumpScreen(tester, const ScannerScreen(), env, size: const Size(360, 1200), extra: [
      imageCaptureProvider.overrideWithValue(FakeCapture()),
      documentExplainerProvider.overrideWithValue(ex),
    ]);
    ex.error = const ForbiddenException('x', code: 'consent_required');
    ex.failOnce = true;
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.byKey(const ValueKey('scanner-grant')), findsOneWidget);
    await tester.tap(find.byKey(const ValueKey('scanner-grant')));
    await tester.pumpAndSettle();
    expect(env.backend.where('PUT', '/profile/consents').single.body, {'consents': {'document_analysis': true}});
    expect(ex.sent.length, 1, reason: 'granting consent does not send anything by itself');
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(ex.sent.length, 2);
    expect(find.byKey(const ValueKey('scanner-summary')), findsOneWidget);
  });

  testWidgets('quota_reached shows the quota message', (tester) async {
    final (ex, _) = await open(tester, lang: 'it');
    ex.error = const RateLimitedException('x', code: 'quota_reached');
    await tester.tap(find.byKey(const ValueKey('scanner-paste')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
    await tester.pump();
    await tester.tap(find.byKey(const ValueKey('scanner-send')));
    await tester.pumpAndSettle();
    expect(find.text((await l10n('it')).scannerQuotaReached), findsOneWidget);
  });

  group('contract parser (document_explainer_api.dart)', () {
    test('classification is an object; a bare string is tolerated', () {
      final e = Explanation.fromJson({'classification': {'type': 'bill', 'type_label': 'Bill', 'confidence': 'high'}, 'key_dates': [{'label': 'a', 'date': null}]});
      expect(e.classification!.label, 'Bill');
      expect(e.classification!.confidence, 'high');
      expect(e.keyDates.single.date, isNull);
      expect(Explanation.fromJson({'classification': 'old'}).classification!.label, 'old');
    });
    test('422 ocr_* with details.fallback=[text] is recognised through the real client', () async {
      for (final code in ['ocr_unavailable', 'ocr_failed', 'ocr_empty']) {
        final env = TestEnv();
        env.backend.error('POST /documents/explain', 422, code, details: {'fallback': ['text']});
        await expectLater(
          ApiDocumentExplainer(env.api).explainImage(CapturedImage(bytes: Uint8List(3), filename: 'a.jpg', mimeType: 'image/jpeg')),
          throwsA(predicate(isOcrFallback)),
        );
      }
      final env = TestEnv();
      env.backend.error('POST /documents/explain', 422, 'image_too_large');
      await expectLater(ApiDocumentExplainer(env.api).explainText('x'), throwsA(predicate((e) => !isOcrFallback(e))));
    });
    test('usage endpoint', () async {
      final env = TestEnv();
      env.backend.ok('GET /documents/explain/usage', {'limit': 5, 'remaining': 2, 'ocr_available': true, 'max_file_kb': 4096, 'max_text_chars': 6000});
      final u = (await ApiDocumentExplainer(env.api).usage())!;
      expect([u.remaining, u.maxTextChars, u.ocrAvailable], [2, 6000, true]);
    });
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
    testWidgets('[$lang] result with null date renders at 320px / 1.5x text without overflow', (tester) async {
      final (ex, _) = await open(tester, lang: lang, size: const Size(320, 1600), scale: 1.5);
      ex.custom = {'classification': {'type': 'x', 'type_label': 'Letter', 'confidence': 'low'}, 'summary': 's', 'key_dates': [{'label': 'Appointment', 'date': null, 'text': 'tomorrow'}], 'suggested_actions': [], 'degraded': true};
      await tester.tap(find.byKey(const ValueKey('scanner-paste')));
      await tester.pumpAndSettle();
      await tester.enterText(find.byKey(const ValueKey('scanner-text')), 'abc');
      await tester.pump();
      await tester.tap(find.byKey(const ValueKey('scanner-send')));
      await tester.pumpAndSettle();
      expect(find.byKey(const ValueKey('scanner-summary')), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }
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
