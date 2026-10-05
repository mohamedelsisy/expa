import 'package:dio/dio.dart';

import '../../core/api/api_client.dart';
import 'scanner_service.dart';

/// PROVISIONAL CONTRACT (the backend endpoint is being built by another team; nothing else in the app
/// knows this shape, change it here only):
///
///   POST /api/v1/documents/explain        (auth required)
///     multipart/form-data  file=(image)   OR   JSON/form  text=(string)
///   200 {"data": {
///        "classification": "residence_permit_letter",
///        "summary": "...",
///        "key_dates": [{"label": "...", "date": "2026-11-18"}],
///        "suggested_actions": [{"type":"route","target":"my-documents","label":"..."} | "plain string"],
///        "disclaimer": "...",
///        "sources": [{"title": "...", "url": "https://..."}]
///   }}
class ExplainedDate {
  const ExplainedDate({required this.label, this.date});
  final String label;
  final String? date;
}

class ExplainedAction {
  const ExplainedAction({required this.label, this.type, this.target});
  final String label;
  final String? type;
  final String? target;
}

class ExplainedSource {
  const ExplainedSource({required this.title, this.url});
  final String title;
  final String? url;
}

class Explanation {
  const Explanation({this.classification, this.summary = '', this.keyDates = const [], this.actions = const [], this.disclaimer, this.sources = const []});
  final String? classification;
  final String summary;
  final List<ExplainedDate> keyDates;
  final List<ExplainedAction> actions;
  final String? disclaimer;
  final List<ExplainedSource> sources;

  factory Explanation.fromJson(Map<String, dynamic> j) => Explanation(
        classification: j['classification'] as String?,
        summary: (j['summary'] ?? '').toString(),
        keyDates: [
          for (final d in (j['key_dates'] as List? ?? const []))
            if (d is Map) ExplainedDate(label: '${d['label'] ?? ''}', date: d['date'] as String?),
        ],
        actions: [
          for (final a in (j['suggested_actions'] as List? ?? const []))
            if (a is Map) ExplainedAction(label: '${a['label'] ?? ''}', type: a['type'] as String?, target: a['target'] as String?) else if (a is String) ExplainedAction(label: a),
        ],
        disclaimer: (j['disclaimer'] as String?)?.trim().isEmpty ?? true ? null : j['disclaimer'] as String,
        sources: [
          for (final s in (j['sources'] as List? ?? const []))
            if (s is Map) ExplainedSource(title: '${s['title'] ?? s['name'] ?? ''}', url: s['url'] as String?),
        ],
      );
}

abstract class DocumentExplainer {
  Future<Explanation> explainText(String text);
  Future<Explanation> explainImage(CapturedImage image);
}

class ApiDocumentExplainer implements DocumentExplainer {
  ApiDocumentExplainer(this._api);
  final ApiClient _api;
  static const path = '/documents/explain';

  @override
  Future<Explanation> explainText(String text) async => Explanation.fromJson((await _api.post(path, body: {'text': text})).map);

  @override
  Future<Explanation> explainImage(CapturedImage image) async {
    final form = FormData.fromMap({'file': MultipartFile.fromBytes(image.bytes, filename: image.filename, contentType: DioMediaType.parse(image.mimeType))});
    return Explanation.fromJson((await _api.post(path, body: form)).map);
  }
}
