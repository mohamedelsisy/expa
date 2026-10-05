import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

/// Minimal persistent string store. Production: files in the app-private support directory
/// (excluded from Android backup, see data_extraction_rules.xml). Tests: [MemoryBlobStore].
abstract class BlobStore {
  Future<String?> read(String key);
  Future<void> write(String key, String value);
  Future<void> delete(String key);
  Future<List<String>> keys();
  Future<void> clear();
}

class MemoryBlobStore implements BlobStore {
  final Map<String, String> values = {};
  @override
  Future<String?> read(String key) async => values[key];
  @override
  Future<void> write(String key, String value) async => values[key] = value;
  @override
  Future<void> delete(String key) async => values.remove(key);
  @override
  Future<List<String>> keys() async => values.keys.toList();
  @override
  Future<void> clear() async => values.clear();
}

/// One file per key (name = base64url of the key). Writes are atomic (temp file + rename) so a crash
/// can never leave a half-written entry. Every operation swallows I/O errors: the cache is an optimisation.
class FileBlobStore implements BlobStore {
  FileBlobStore([Future<Directory> Function()? resolve]) : _resolve = resolve ?? _defaultDir;
  final Future<Directory> Function() _resolve;
  Directory? _dir;

  static Future<Directory> _defaultDir() async {
    final base = await getApplicationSupportDirectory();
    return Directory('${base.path}/expa_cache');
  }

  Future<Directory> _root() async {
    final d = _dir ??= await _resolve();
    if (!await d.exists()) await d.create(recursive: true);
    return d;
  }

  String _name(String key) => base64Url.encode(utf8.encode(key)).replaceAll('=', '');
  String _key(String name) {
    final padded = name.padRight((name.length + 3) ~/ 4 * 4, '=');
    return utf8.decode(base64Url.decode(padded));
  }

  @override
  Future<String?> read(String key) async {
    try {
      final f = File('${(await _root()).path}/${_name(key)}');
      return await f.exists() ? await f.readAsString() : null;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> write(String key, String value) async {
    try {
      final path = '${(await _root()).path}/${_name(key)}';
      final tmp = File('$path.tmp');
      await tmp.writeAsString(value, flush: true);
      await tmp.rename(path);
    } catch (_) {}
  }

  @override
  Future<void> delete(String key) async {
    try {
      final f = File('${(await _root()).path}/${_name(key)}');
      if (await f.exists()) await f.delete();
    } catch (_) {}
  }

  @override
  Future<List<String>> keys() async {
    try {
      final out = <String>[];
      await for (final e in (await _root()).list()) {
        final n = e.uri.pathSegments.last;
        if (e is File && !n.endsWith('.tmp')) out.add(_key(n));
      }
      return out;
    } catch (_) {
      return const [];
    }
  }

  @override
  Future<void> clear() async {
    for (final k in await keys()) {
      await delete(k);
    }
  }
}

class CacheEntry {
  const CacheEntry(this.payload, this.cachedAt);
  final Map<String, dynamic> payload;
  final DateTime cachedAt;
}

/// JSON cache with freshness metadata. Holds ONLY public content that the user explicitly saved
/// (guides, lessons). Personal documents, profile data and AI chats are never written here.
class LocalCache {
  LocalCache(this._store, {DateTime Function()? now}) : _now = now ?? DateTime.now;
  final BlobStore _store;
  final DateTime Function() _now;

  /// Saved copies older than this are flagged stale even when the source itself was fresh.
  static const maxAge = Duration(days: 14);

  Future<CacheEntry?> read(String key) async {
    final raw = await _store.read(key);
    if (raw == null) return null;
    try {
      final j = jsonDecode(raw);
      if (j is! Map || j['payload'] is! Map) return null;
      final at = DateTime.tryParse('${j['cached_at']}');
      if (at == null) return null;
      return CacheEntry(Map<String, dynamic>.from(j['payload'] as Map), at);
    } catch (_) {
      await _store.delete(key); // corrupt entry: drop it
      return null;
    }
  }

  Future<void> write(String key, Map<String, dynamic> payload) =>
      _store.write(key, jsonEncode({'cached_at': _now().toUtc().toIso8601String(), 'payload': payload}));

  Future<void> delete(String key) => _store.delete(key);
  Future<List<String>> keys(String prefix) async => [for (final k in await _store.keys()) if (k.startsWith(prefix)) k];
  Future<void> clear() => _store.clear();

  /// A copy is stale when it is older than [maxAge] or when the source freshness says so.
  bool isStale(CacheEntry e) {
    if (_now().difference(e.cachedAt) > maxAge) return true;
    final f = (e.payload['source'] as Map?)?['freshness'];
    return f == 'stale' || f == 'outdated' || f == 'unverified';
  }
}
