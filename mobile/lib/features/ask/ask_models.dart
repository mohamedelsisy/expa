import '../../core/api/api_client.dart';
import '../../core/providers.dart';
import '../../core/widgets/common.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AskSource {
  const AskSource({required this.n, required this.title, this.source});
  final int n;
  final String title;
  final SourceInfo? source;

  factory AskSource.fromJson(Map<String, dynamic> j) => AskSource(
        n: (j['n'] as num?)?.toInt() ?? 0,
        title: (j['title'] ?? '').toString(),
        source: SourceInfo.fromJson(j['source']),
      );
}

class AskAction {
  const AskAction({required this.type, required this.target, required this.label});
  final String type;
  final String target;
  final String label;
}

/// Assistant message exactly as the API returns it. `disclaimer` is a separate field and is never merged into `content`.
class AskMessage {
  const AskMessage({
    required this.content,
    this.label,
    this.labelText,
    this.sources = const [],
    this.actions = const [],
    this.disclaimer,
    this.degraded = false,
  });
  final String content;
  final String? label; // official | general_guidance | ai_explanation | third_party
  final String? labelText;
  final List<AskSource> sources;
  final List<AskAction> actions;
  final String? disclaimer;
  final bool degraded;

  factory AskMessage.fromJson(Map<String, dynamic> j) => AskMessage(
        content: (j['content'] ?? '').toString(),
        label: j['label'] as String?,
        labelText: j['label_text'] as String?,
        sources: [for (final s in (j['sources'] as List? ?? const [])) if (s is Map) AskSource.fromJson(Map<String, dynamic>.from(s))],
        actions: [
          for (final a in (j['actions'] as List? ?? const []))
            if (a is Map) AskAction(type: '${a['type']}', target: '${a['target']}', label: '${a['label']}'),
        ],
        disclaimer: (j['disclaimer'] as String?)?.trim().isEmpty ?? true ? null : j['disclaimer'] as String,
        degraded: j['degraded'] == true,
      );
}

class AskReply {
  const AskReply({required this.conversationId, required this.message, this.remaining});
  final int? conversationId;
  final AskMessage message;
  final int? remaining;
}

class AskUsage {
  const AskUsage({this.limit, this.remaining, this.resetsAt});
  final int? limit;
  final int? remaining;
  final String? resetsAt;
}

abstract class AskRepository {
  Future<AskReply> ask(String message, {int? conversationId});
  Future<AskUsage> usage();
}

class ApiAskRepository implements AskRepository {
  ApiAskRepository(this._api);
  final ApiClient _api;

  @override
  Future<AskReply> ask(String message, {int? conversationId}) async {
    final r = await _api.post('/ai/ask', body: {'message': message, 'conversation_id': ?conversationId});
    final d = r.map;
    final msg = AskMessage.fromJson(Map<String, dynamic>.from(d['message'] as Map));
    return AskReply(
      conversationId: (d['conversation_id'] as num?)?.toInt(),
      message: AskMessage(
        content: msg.content,
        label: msg.label,
        labelText: msg.labelText,
        sources: msg.sources,
        actions: msg.actions,
        disclaimer: msg.disclaimer,
        degraded: msg.degraded || r.meta['degraded'] == true,
      ),
      remaining: ((d['usage'] as Map?)?['remaining'] as num?)?.toInt(),
    );
  }

  @override
  Future<AskUsage> usage() async {
    final d = (await _api.get('/ai/usage')).map;
    return AskUsage(limit: (d['limit'] as num?)?.toInt(), remaining: (d['remaining'] as num?)?.toInt(), resetsAt: d['resets_at'] as String?);
  }
}

final askRepositoryProvider = Provider<AskRepository>((ref) => ApiAskRepository(ref.watch(apiClientProvider)));
