import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/cache/content_repository.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/saved_content.dart';
import '../../l10n/app_localizations.dart';

class SavedEntry {
  const SavedEntry({required this.kind, required this.slug, this.result});
  final ContentKind kind;
  final String slug;

  /// Saved copy in the current language, null when only another language was saved.
  final ContentResult? result;
}

/// Reads ONLY the local cache: it works fully offline.
final savedEntriesProvider = FutureProvider.autoDispose<List<SavedEntry>>((ref) async {
  ref.watch(savedRevisionProvider);
  ref.watch(localeProvider);
  final out = <SavedEntry>[];
  for (final k in [guideKind, lessonKind, articleKind, cityKind]) {
    final repo = ref.watch(contentRepositoryProvider(k));
    for (final slug in await repo.savedSlugs()) {
      out.add(SavedEntry(kind: k, slug: slug, result: await repo.cached(slug)));
    }
  }
  return out;
});

IconData _icon(ContentKind k) => k == guideKind ? Icons.menu_book_outlined : k == articleKind ? Icons.article_outlined : k == cityKind ? Icons.location_city_outlined : Icons.translate;
String _label(AppL10n l, ContentKind k) => k == guideKind ? l.exploreGuides : k == articleKind ? l.exploreArticles : k == cityKind ? l.exploreCities : l.exploreLearn;
String _base(ContentKind k) => k == guideKind ? '/guides' : k == articleKind ? '/articles' : k == cityKind ? '/cities' : '/learn';

class SavedScreen extends ConsumerWidget {
  const SavedScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(savedEntriesProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.savedTitle)),
      body: AsyncBody<List<SavedEntry>>(
        value: value,
        onRetry: () => ref.invalidate(savedEntriesProvider),
        data: (entries) {
          if (entries.isEmpty) return EmptyView(message: l.savedEmpty, icon: Icons.bookmark_border);
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Notice(text: l.savedHint),
            const SizedBox(height: Tokens.s3),
            for (final e in entries)
              Card(
                child: ListTile(
                  minVerticalPadding: Tokens.s3,
                  leading: Icon(_icon(e.kind), color: Tokens.primary),
                  title: Text('${e.result?.data['title'] ?? e.result?.data['name'] ?? e.slug}'),
                  subtitle: Text([
                    _label(l, e.kind),
                    if (e.result?.cachedAt != null) l.savedOn(formatDate(context, e.result!.cachedAt!.toIso8601String())),
                    if (e.result?.lastVerifiedAt != null) l.lastVerified(formatDate(context, e.result!.lastVerifiedAt)),
                    if (e.result?.stale == true) l.savedStale,
                  ].join('\n')),
                  isThreeLine: true,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('${_base(e.kind)}/${Uri.encodeComponent(e.slug)}'),
                ),
              ),
          ]);
        },
      ),
    );
  }
}
