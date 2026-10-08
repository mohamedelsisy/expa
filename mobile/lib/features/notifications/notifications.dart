import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/routes.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsState();
}

class _NotificationsState extends ConsumerState<NotificationsScreen> {
  int _reload = 0;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final api = ref.read(apiClientProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.notificationsTitle), actions: [
        IconButton(key: const ValueKey('notif-settings'), tooltip: l.notificationsSettings, icon: const Icon(Icons.tune), onPressed: () => context.go('/profile')),
        TextButton(
          onPressed: () async {
            try {
              await api.post('/notifications/read-all');
              if (mounted) setState(() => _reload++);
            } catch (e) {
              if (context.mounted) showSnack(context, errorMessage(l, e));
            }
          },
          child: Text(l.markAllRead),
        ),
      ]),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_reload|${ref.watch(localeProvider).languageCode}',
        emptyText: l.notificationsEmpty,
        fetch: (page) async {
          final r = await api.get('/notifications', query: {'page': page, 'per_page': 20});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        itemBuilder: (context, n) {
          final read = n['read'] == true;
          final cta = n['cta'] as Map?;
          final route = cta == null ? null : routeForTarget('${cta['type'] ?? 'route'}', '${cta['target'] ?? cta['route'] ?? ''}');
          return Card(
            color: read ? Tokens.surface : Tokens.primarySoft,
            child: ListTile(
              minVerticalPadding: Tokens.s3,
              leading: Icon(read ? Icons.notifications_none : Icons.notifications_active, color: Tokens.primary),
              title: Text('${n['title']}', style: TextStyle(fontWeight: read ? FontWeight.w400 : FontWeight.w700)),
              subtitle: Text('${n['body'] ?? ''}\n${formatDate(context, n['created_at'] as String?)}'),
              isThreeLine: true,
              trailing: IconButton(
                key: ValueKey('notif-delete-${n['id']}'),
                tooltip: l.notificationsDelete,
                icon: const Icon(Icons.close),
                onPressed: () async {
                  try {
                    await api.delete('/notifications/${n['id']}');
                    if (mounted) setState(() => _reload++);
                  } catch (e) {
                    if (context.mounted) showSnack(context, errorMessage(l, e));
                  }
                },
              ),
              onTap: () async {
                if (!read) {
                  try {
                    await api.post('/notifications/${n['id']}/read');
                  } catch (_) {}
                }
                if (route != null && context.mounted) context.push(route);
                if (mounted && !read) setState(() => _reload++);
              },
            ),
          );
        },
      ),
    );
  }
}
