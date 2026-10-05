/// Success envelope: `{ "data": ..., "meta": {...} }`.
class ApiResponse {
  const ApiResponse(this.data, this.meta);
  final Object? data;
  final Map<String, dynamic> meta;

  Map<String, dynamic> get map => data is Map ? Map<String, dynamic>.from(data! as Map) : <String, dynamic>{};
  List<dynamic> get list => data is List ? data! as List : const [];

  /// PHP encodes an empty array as `[]`, so `meta` may arrive as a list: treat it as empty.
  static Map<String, dynamic> parseMeta(Object? raw) => raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};

  int? get page => meta['page'] as int?;
  int? get lastPage => meta['last_page'] as int?;
  int? get total => meta['total'] as int?;
}
