import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../l10n/app_localizations.dart';
import '../cache/content_repository.dart';
import '../providers.dart';
import '../theme/app_theme.dart';
import '../util/format.dart';
import 'common.dart';

/// Bumped whenever a saved list changes so dependent widgets/providers reload.
final savedRevisionProvider = StateProvider<int>((ref) => 0);

final isSavedProvider = FutureProvider.autoDispose.family<bool, (ContentKind, String)>((ref, k) async {
  ref.watch(savedRevisionProvider);
  return ref.watch(contentRepositoryProvider(k.$1)).isSaved(k.$2);
});

/// Bookmark button: keeps a copy of the content on this device (offline), or removes it.
class SaveOfflineButton extends ConsumerWidget {
  const SaveOfflineButton({super.key, required this.kind, required this.slug, required this.data});
  final ContentKind kind;
  final String slug;
  final Map<String, dynamic> data;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final saved = ref.watch(isSavedProvider((kind, slug))).valueOrNull ?? false;
    return IconButton(
      key: const ValueKey('save-offline'),
      tooltip: saved ? l.savedRemove : l.savedAdd,
      icon: Icon(saved ? Icons.bookmark : Icons.bookmark_border),
      onPressed: () async {
        final repo = ref.read(contentRepositoryProvider(kind));
        final messenger = ScaffoldMessenger.of(context);
        if (saved) {
          await repo.unsave(slug);
        } else {
          await repo.save(slug, data);
        }
        ref.read(savedRevisionProvider.notifier).state++;
        messenger.showSnackBar(SnackBar(content: Text(saved ? l.savedRemoved : l.savedAdded)));
      },
    );
  }
}

/// Explains where the shown copy comes from: a saved copy (with its dates) or a stale one.
class CachedCopyNotice extends StatelessWidget {
  const CachedCopyNotice({super.key, required this.result});
  final ContentResult result;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    if (!result.fromCache && !result.stale) return const SizedBox.shrink();
    final verified = result.lastVerifiedAt;
    final text = [
      if (result.fromCache) result.refreshFailed ? l.savedOfflineCopy(formatDate(context, result.cachedAt?.toIso8601String())) : l.savedRefreshing,
      verified == null ? l.neverVerified : l.lastVerified(formatDate(context, verified)),
      if (result.stale) l.savedStale,
    ].join('\n');
    return Padding(
      padding: const EdgeInsets.only(bottom: Tokens.s3),
      child: Notice(key: const ValueKey('cached-copy'), text: text, kind: result.stale ? NoticeKind.warning : NoticeKind.info),
    );
  }
}
