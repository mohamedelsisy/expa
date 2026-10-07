import 'package:dio/dio.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import 'scanner_service.dart';

/// Contract (docs/API_SPEC.md, "Document explainer"):
///
///   POST /api/v1/documents/explain   (auth, verified e-mail, consent `document_analysis`)
///     multipart `file` (jpg/png/pdf)  OR  `text`, never both
///   200 {data:{classification:{type,type_label,confidence}, summary, label, label_text,
///        key_dates:[{label,label_key,date|null,text,year_missing,past}],
///        suggested_actions:[{type:reminder|guide|appointment,label,target,date?}],
///        language, disclaimer, sources:[{title,url,name,type,last_verified_at,ref}], degraded, persisted:false, usage}}
///   422 ocr_unavailable | ocr_failed | ocr_empty   (details.fallback = ["text"]: paste the text instead)
///   422 attachment_type_not_allowed | image_too_large | pdf_too_many_pages | attachment_rejected
///   503 scanner_unavailable, 403 consent_required, 429 quota_reached
///   GET /documents/explain/usage -> {limit, remaining, ocr_available, max_file_kb, max_text_chars}
class ExplainedClassification {
  const ExplainedClassification({this.type, this.label, this.confidence});
  final String? type;
  final String? label;
  final String? confidence;

  /// The API sends an object; a bare string (older drafts) is tolerated as the label.
  static ExplainedClassification? parse(Object? raw) {
    if (raw is Map) {
      final label = (raw['type_label'] ?? raw['type'])?.toString();
      return ExplainedClassification(type: raw['type']?.toString(), label: label, confidence: raw['confidence']?.toString());
    }
    if (raw is String && raw.isNotEmpty) return ExplainedClassification(type: raw, label: raw);
    return null;
  }
}

class ExplainedDate {
  const ExplainedDate({required this.label, this.date, this.text, this.yearMissing = false, this.past = false});
  final String label;

  /// ISO date, or null when the document's date could not be determined reliably ("date not clear").
  final String? date;
  final String? text;
  final bool yearMissing;
  final bool past;
}

class ExplainedAction {
  const ExplainedAction({required this.label, this.type, this.target, this.date});
  final String label;
  final String? type;
  final String? target;
  final String? date;
}

class ExplainedSource {
  const ExplainedSource({required this.title, this.url, this.type, this.lastVerifiedAt});
  final String title;
  final String? url;
  final String? type;
  final String? lastVerifiedAt;
}

class ExplainUsage {
  const ExplainUsage({this.limit, this.remaining, this.ocrAvailable = false, this.maxFileKb, this.maxTextChars});
  final int? limit;
  final int? remaining;
  final bool ocrAvailable;
  final int? maxFileKb;
  final int? maxTextChars;

  factory ExplainUsage.fromJson(Map<String, dynamic> j) => ExplainUsage(
        limit: (j['limit'] as num?)?.toInt(),
        remaining: (j['remaining'] as num?)?.toInt(),
        ocrAvailable: j['ocr_available'] == true,
        maxFileKb: (j['max_file_kb'] as num?)?.toInt(),
        maxTextChars: (j['max_text_chars'] as num?)?.toInt(),
      );
}

class Explanation {
  const Explanation({
    this.classification,
    this.summary = '',
    this.label,
    this.labelText,
    this.keyDates = const [],
    this.actions = const [],
    this.disclaimer,
    this.sources = const [],
    this.degraded = false,
  });
  final ExplainedClassification? classification;
  final String summary;

  /// `official | general_guidance | ai_explanation | third_party` with its localized text.
  final String? label;
  final String? labelText;
  final List<ExplainedDate> keyDates;
  final List<ExplainedAction> actions;
  final String? disclaimer;
  final List<ExplainedSource> sources;
  final bool degraded;

  factory Explanation.fromJson(Map<String, dynamic> j) => Explanation(
        classification: ExplainedClassification.parse(j['classification']),
        summary: (j['summary'] ?? '').toString(),
        label: j['label'] as String?,
        labelText: j['label_text'] as String?,
        keyDates: [
          for (final d in (j['key_dates'] as List? ?? const []))
            if (d is Map)
              ExplainedDate(
                label: '${d['label'] ?? ''}',
                date: (d['date'] as String?)?.isEmpty ?? true ? null : d['date'] as String,
                text: d['text'] as String?,
                yearMissing: d['year_missing'] == true,
                past: d['past'] == true,
              ),
        ],
        actions: [
          for (final a in (j['suggested_actions'] as List? ?? const []))
            if (a is Map) ExplainedAction(label: '${a['label'] ?? ''}', type: a['type'] as String?, target: a['target'] as String?, date: a['date'] as String?) else if (a is String) ExplainedAction(label: a),
        ],
        disclaimer: (j['disclaimer'] as String?)?.trim().isEmpty ?? true ? null : j['disclaimer'] as String,
        sources: [
          for (final s in (j['sources'] as List? ?? const []))
            if (s is Map) ExplainedSource(title: '${s['title'] ?? s['name'] ?? ''}', url: s['url'] as String?, type: s['type'] as String?, lastVerifiedAt: s['last_verified_at'] as String?),
        ],
        degraded: j['degraded'] == true,
      );
}

/// 422 `ocr_unavailable | ocr_failed | ocr_empty`: the server could not read the photo; the client falls back to pasted text.
bool isOcrFallback(Object? e) =>
    e is ValidationException && (const {'ocr_unavailable', 'ocr_failed', 'ocr_empty'}.contains(e.code) || (e.details['fallback'] ?? const []).contains('text'));

abstract class DocumentExplainer {
  Future<Explanation> explainText(String text);
  Future<Explanation> explainImage(CapturedImage image);

  /// Quota and limits; null when it cannot be read (optional information, never blocks the flow).
  Future<ExplainUsage?> usage() async => null;
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

  @override
  Future<ExplainUsage?> usage() async {
    try {
      return ExplainUsage.fromJson((await _api.get('$path/usage')).map);
    } catch (_) {
      return null;
    }
  }
}
