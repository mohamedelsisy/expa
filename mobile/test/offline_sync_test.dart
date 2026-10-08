import 'package:expa_mobile/core/cache/content_repository.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'support.dart';

void main() {
  test('refreshAll updates saved copies (server wins), strips personal keys, keeps old copy on failure', () async {
    final env = TestEnv();
    env.backend.ok('GET /italian/lessons/a', {'title': 'A v2', 'progress': {'status': 'done'}});
    final repo = ContentRepository(api: env.api, cache: env.cache, kind: 'lesson', endpoint: '/italian/lessons', lang: 'en');
    await repo.save('a', {'title': 'A v1'});
    await repo.save('b', {'title': 'B v1'}); // GET /italian/lessons/b -> 404 in the fake
    expect(await repo.refreshAll(), 1);
    expect((await repo.cached('a'))!.data, {'title': 'A v2'});
    expect((await repo.cached('b'))!.data, {'title': 'B v1'});
  });

  test('reconnect (offline -> online) refreshes every saved kind and bumps the saved revision', () async {
    final env = TestEnv();
    env.backend.ok('GET /guides/g1', {'title': 'G1 new'});
    final c = ProviderContainer(overrides: env.overrides());
    addTearDown(c.dispose);
    await c.read(contentRepositoryProvider(guideKind)).save('g1', {'title': 'G1 old'});
    c.read(reconnectSyncProvider);
    c.read(offlineProvider.notifier).state = true;
    c.read(offlineProvider.notifier).state = false;
    await Future<void>.delayed(const Duration(milliseconds: 50));
    expect((await c.read(contentRepositoryProvider(guideKind)).cached('g1'))!.data['title'], 'G1 new');
  });

  test('clearing the cache (logout) removes saved content and the index', () async {
    final env = TestEnv();
    final repo = ContentRepository(api: env.api, cache: env.cache, kind: 'guide', endpoint: '/guides', lang: 'en');
    await repo.save('g', {'title': 'x'});
    await env.cache.clear();
    expect(await repo.savedSlugs(), isEmpty);
    expect(await repo.cached('g'), isNull);
    expect(env.blobs.values, isEmpty);
  });
}
