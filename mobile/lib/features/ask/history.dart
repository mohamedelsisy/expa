import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_controller.dart';
import 'ask_models.dart';
import 'ask_screen.dart';

/// Past conversations (`GET /ai/conversations`). Read-only plus delete; conversations are the user's own data.
class AiHistoryScreen extends ConsumerStatefulWidget {
  const AiHistoryScreen({super.key});
  @override
  ConsumerState<AiHistoryScreen> createState() => _AiHistoryState();
}

class _AiHistoryState extends ConsumerState<AiHistoryScreen> {
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final uid = ref.watch(authControllerProvider.select((s) => s.user?.id));
    return Scaffold(
      appBar: AppBar(title: Text(l.askHistoryTitle)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_reload|$uid',
        emptyText: l.askHistoryEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/ai/conversations', query: {'page': page, 'per_page': 20});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        itemBuilder: (context, c) => Card(
          child: ListTile(
            minVerticalPadding: Tokens.s3,
            leading: const Icon(Icons.chat_bubble_outline, color: Tokens.primary),
            title: Text('${c['title'] ?? l.askHistoryUntitled}', maxLines: 2, overflow: TextOverflow.ellipsis),
            subtitle: Text(formatDate(context, c['updated_at'] as String?)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () async {
              await context.push('/ai/history/${c['id']}');
              if (mounted) setState(() => _reload++);
            },
          ),
        ),
      ),
    );
  }
}

final conversationProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/ai/conversations/$id')).map;
});

class AiConversationScreen extends ConsumerWidget {
  const AiConversationScreen({super.key, required this.id});
  final int id;

  Future<void> _delete(BuildContext context, WidgetRef ref) async {
    final l = AppL10n.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: Text(l.askHistoryDelete),
        content: Text(l.askHistoryDeleteBody),
        actions: [
          TextButton(onPressed: () => Navigator.of(c).pop(false), child: Text(l.cancel)),
          FilledButton(key: const ValueKey('history-delete-confirm'), onPressed: () => Navigator.of(c).pop(true), child: Text(l.delete)),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;
    try {
      await ref.read(apiClientProvider).delete('/ai/conversations/$id');
      if (context.mounted) context.pop();
    } catch (e) {
      if (context.mounted) showSnack(context, errorMessage(l, e));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(conversationProvider(id));
    return Scaffold(
      appBar: AppBar(title: Text(l.askHistoryTitle), actions: [
        IconButton(key: const ValueKey('history-delete'), tooltip: l.askHistoryDelete, icon: const Icon(Icons.delete_outline), onPressed: () => _delete(context, ref)),
      ]),
      body: AsyncBody<Map<String, dynamic>>(
        value: value,
        onRetry: () => ref.invalidate(conversationProvider(id)),
        data: (c) {
          final messages = [for (final m in (c['messages'] as List? ?? const [])) if (m is Map) Map<String, dynamic>.from(m)];
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            if (c['title'] != null) Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: Text('${c['title']}', style: Theme.of(context).textTheme.titleMedium)),
            for (final m in messages)
              Padding(
                padding: const EdgeInsets.only(bottom: Tokens.s3),
                child: m['role'] == 'user'
                    ? Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: Container(
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                          padding: const EdgeInsets.all(Tokens.s3),
                          decoration: BoxDecoration(color: Tokens.primarySoft, borderRadius: BorderRadius.circular(Tokens.radiusMd)),
                          child: Text('${m['content']}'),
                        ),
                      )
                    : AskMessageView(message: AskMessage.fromJson(m)),
              ),
          ]);
        },
      ),
    );
  }
}
