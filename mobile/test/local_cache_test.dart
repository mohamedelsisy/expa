import 'dart:io';

import 'package:expa_mobile/core/cache/content_repository.dart';
import 'package:expa_mobile/core/cache/local_cache.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

void main() {
  group('LocalCache', () {
    test('round-trips payloads with the cached_at timestamp', () async {
      final now = DateTime.utc(2026, 10, 5);
      final c = LocalCache(MemoryBlobStore(), now: () => now);
      await c.write('k', {'a': 1});
      final e = (await c.read('k'))!;
      expect(e.payload, {'a': 1});
      expect(e.cachedAt, now);
      expect(await c.read('missing'), isNull);
    });

    test('stale flag: old copy, or source freshness stale/outdated/unverified', () async {
      var now = DateTime.utc(2026, 10, 5);
      final c = LocalCache(MemoryBlobStore(), now: () => now);
      await c.write('fresh', {'source': {'freshness': 'fresh'}});
      await c.write('old-source', {'source': {'freshness': 'outdated'}});
      await c.write('nosource', {'title': 't'});
      expect(c.isStale((await c.read('fresh'))!), isFalse);
      expect(c.isStale((await c.read('old-source'))!), isTrue);
      expect(c.isStale((await c.read('nosource'))!), isFalse);
      now = now.add(const Duration(days: 15));
      expect(c.isStale((await c.read('fresh'))!), isTrue, reason: 'older than maxAge');
    });

    test('a corrupt entry is dropped instead of crashing', () async {
      final store = MemoryBlobStore();
      store.values['bad'] = '{not json';
      final c = LocalCache(store);
      expect(await c.read('bad'), isNull);
      expect(store.values.containsKey('bad'), isFalse);
    });

    test('keys(prefix) and clear', () async {
      final c = LocalCache(MemoryBlobStore());
      await c.write('content:guide:ar:a', {'x': 1});
      await c.write('other', {'x': 1});
      expect(await c.keys('content:'), ['content:guide:ar:a']);
      await c.clear();
      expect(await c.keys(''), isEmpty);
    });
  });

  group('FileBlobStore', () {
    late Directory dir;
    setUp(() => dir = Directory.systemTemp.createTempSync('expa_cache_test'));
    tearDown(() => dir.deleteSync(recursive: true));

    test('writes atomically, lists original keys (with ":" and "/"), deletes and clears', () async {
      final s = FileBlobStore(() async => dir);
      await s.write('content:guide:ar:permesso/x', 'hello');
      await s.write('b', 'w');
      expect(await s.read('content:guide:ar:permesso/x'), 'hello');
      expect((await s.keys())..sort(), ['b', 'content:guide:ar:permesso/x']);
      expect(dir.listSync().where((e) => e.path.endsWith('.tmp')), isEmpty);
      await s.delete('b');
      expect(await s.read('b'), isNull);
      await s.clear();
      expect(await s.keys(), isEmpty);
    });

    test('I/O failures are swallowed (cache is an optimisation)', () async {
      final s = FileBlobStore(() async => Directory('/proc/does/not/exist/\u0000'));
      await s.write('k', 'v');
      expect(await s.read('k'), isNull);
    });
  });

  group('ContentRepository (cache-first, network refresh)', () {
    late TestEnv env;
    late ContentRepository repo;
    setUp(() {
      env = TestEnv();
      repo = ContentRepository(api: env.api, cache: env.cache, kind: 'guide', endpoint: '/guides', lang: 'ar');
    });

    Map<String, dynamic> guide(String title, {String freshness = 'fresh'}) => {
          'slug': 'permesso',
          'title': title,
          'source': {'name': 'Questura', 'last_verified_at': '2026-09-01T00:00:00Z', 'freshness': freshness},
        };

    test('not saved: network only, nothing is cached silently', () async {
      env.backend.ok('GET /guides/permesso', guide('Net'));
      final r = await repo.open('permesso').toList();
      expect(r.single.data['title'], 'Net');
      expect(r.single.fromCache, isFalse);
      expect(await env.cache.keys(''), isEmpty);
    });

    test('not saved + offline: the error propagates (screen shows retry)', () async {
      env.backend.offline = true;
      await expectLater(repo.open('permesso').toList(), throwsA(anything));
    });

    test('saved: emits the saved copy first, then the refreshed one, and updates the copy', () async {
      await repo.save('permesso', guide('Old'));
      env.backend.ok('GET /guides/permesso', guide('New'));
      final r = await repo.open('permesso').toList();
      expect(r.map((e) => e.data['title']), ['Old', 'New']);
      expect(r.first.fromCache, isTrue);
      expect(r.last.fromCache, isFalse);
      expect((await repo.cached('permesso'))!.data['title'], 'New');
    });

    test('saved + offline: keeps the saved copy, flags refreshFailed, exposes last_verified_at and stale', () async {
      await repo.save('permesso', guide('Old', freshness: 'stale'));
      env.backend.offline = true;
      final r = await repo.open('permesso').toList();
      expect(r, hasLength(2));
      expect(r.last.fromCache, isTrue);
      expect(r.last.refreshFailed, isTrue);
      expect(r.last.stale, isTrue);
      expect(r.last.lastVerifiedAt, '2026-09-01T00:00:00Z');
    });

    test('save / unsave maintain the index and remove every language copy', () async {
      await repo.save('permesso', guide('Old'));
      await env.cache.write('content:guide:en:permesso', guide('Eng'));
      expect(await repo.isSaved('permesso'), isTrue);
      expect(await repo.savedSlugs(), ['permesso']);
      await repo.unsave('permesso');
      expect(await repo.isSaved('permesso'), isFalse);
      expect(await env.cache.keys('content:'), isEmpty);
    });

    test('copies are per language', () async {
      await repo.save('permesso', guide('AR'));
      final en = ContentRepository(api: env.api, cache: env.cache, kind: 'guide', endpoint: '/guides', lang: 'en');
      expect(await en.cached('permesso'), isNull);
      expect(await en.isSaved('permesso'), isTrue);
    });
  });
}
