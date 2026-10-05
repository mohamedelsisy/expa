import 'dart:async';

import '../api/api_client.dart';
import 'local_cache.dart';

/// A guide or lesson as shown to the user, plus where it came from.
class ContentResult {
  const ContentResult({required this.data, this.fromCache = false, this.cachedAt, this.refreshFailed = false, this.stale = false});
  final Map<String, dynamic> data;

  /// True when [data] is the saved copy (not (yet) confirmed by the server).
  final bool fromCache;
  final DateTime? cachedAt;

  /// The refresh was attempted and failed (offline/server down): the saved copy is all we have.
  final bool refreshFailed;

  /// Older than [LocalCache.maxAge] or flagged stale/outdated/unverified by its source.
  final bool stale;

  String? get lastVerifiedAt => (data['source'] as Map?)?['last_verified_at'] as String?;
}

/// Cache-first / network-refresh repository for content the user chose to keep offline.
/// * Not saved: network only (nothing is cached silently).
/// * Saved: emit the saved copy immediately, then refresh from the network and update the copy;
///   if the refresh fails, keep the saved copy and mark `refreshFailed` (never an empty error screen).
class ContentRepository {
  ContentRepository({required this.api, required this.cache, required this.kind, required this.endpoint, required this.lang});
  final ApiClient api;
  final LocalCache cache;

  /// `guide` | `lesson`.
  final String kind;

  /// e.g. `/guides` or `/italian/lessons`.
  final String endpoint;
  final String lang;

  String _key(String slug) => 'content:$kind:$lang:$slug';
  String get _indexKey => 'saved:index:$kind';

  Future<List<String>> savedSlugs() async {
    final e = await cache.read(_indexKey);
    return [for (final s in (e?.payload['slugs'] as List? ?? const [])) '$s'];
  }

  Future<bool> isSaved(String slug) async => (await savedSlugs()).contains(slug);

  Future<void> save(String slug, Map<String, dynamic> data) async {
    final slugs = await savedSlugs();
    if (!slugs.contains(slug)) await cache.write(_indexKey, {'slugs': [...slugs, slug]});
    await cache.write(_key(slug), data);
  }

  Future<void> unsave(String slug) async {
    final slugs = await savedSlugs()..remove(slug);
    await cache.write(_indexKey, {'slugs': slugs});
    for (final k in await cache.keys('content:$kind:')) {
      if (k.endsWith(':$slug')) await cache.delete(k);
    }
  }

  /// Saved copy in the current language, or null.
  Future<ContentResult?> cached(String slug) async {
    final e = await cache.read(_key(slug));
    if (e == null) return null;
    return ContentResult(data: e.payload, fromCache: true, cachedAt: e.cachedAt, stale: cache.isStale(e));
  }

  Stream<ContentResult> open(String slug) async* {
    final saved = await isSaved(slug);
    final copy = saved ? await cached(slug) : null;
    if (copy != null) yield copy;
    try {
      final r = await api.get('$endpoint/${Uri.encodeComponent(slug)}');
      final data = r.map;
      if (saved) await cache.write(_key(slug), data);
      yield ContentResult(data: data, cachedAt: DateTime.now());
    } catch (e) {
      if (copy == null) rethrow;
      yield ContentResult(data: copy.data, fromCache: true, cachedAt: copy.cachedAt, stale: copy.stale, refreshFailed: true);
    }
  }
}

