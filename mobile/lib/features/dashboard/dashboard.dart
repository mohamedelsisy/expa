import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/routes.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_controller.dart';

final dashboardProvider = FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/dashboard')).map;
});

final dashboardTasksProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(localeProvider);
  final r = await ref.watch(apiClientProvider).get('/dashboard/tasks');
  return [for (final e in r.list) if (e is Map) Map<String, dynamic>.from(e)];
});

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final user = ref.watch(authControllerProvider).user;
    final dash = ref.watch(dashboardProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(l.appName),
        actions: [IconButton(tooltip: l.notificationsTitle, icon: const Icon(Icons.notifications_none), onPressed: () => context.push('/notifications'))],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dashboardProvider);
          await ref.read(dashboardProvider.future).catchError((_) => <String, dynamic>{});
        },
        child: dash.when(
          loading: () => const LoadingView(),
          error: (e, _) => ListView(children: [SizedBox(height: 400, child: ErrorView(error: e, onRetry: () => ref.invalidate(dashboardProvider)))]),
          data: (d) => DashboardView(data: d, fallbackName: user?.name ?? ''),
        ),
      ),
    );
  }
}

class DashboardView extends ConsumerWidget {
  const DashboardView({super.key, required this.data, this.fallbackName = ''});
  final Map<String, dynamic> data;
  final String fallbackName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final name = ((data['greeting'] as Map?)?['name'] ?? fallbackName).toString();
    final score = (data['score'] as Map?) ?? const {};
    final overall = (score['overall'] as num?)?.toInt();
    final cats = [for (final c in (score['categories'] as List? ?? const [])) if (c is Map) c];
    final actions = [for (final a in (data['next_actions'] as List? ?? const [])) if (a is Map) a];
    final onboarding = (data['onboarding'] as Map?) ?? const {};
    final personalized = (data['personalization'] as Map?)?['enabled'] == true;
    final verified = ref.watch(authControllerProvider).user?.emailVerified ?? true;
    return ListView(physics: const AlwaysScrollableScrollPhysics(), padding: const EdgeInsets.all(Tokens.s4), children: [
      Text(l.homeGreeting(name), style: theme.textTheme.titleLarge),
      const SizedBox(height: Tokens.s3),
      if (!verified) ...[
        Notice(text: l.verifyBanner, kind: NoticeKind.warning, trailing: TextButton(onPressed: () => context.push('/verify'), child: Text(l.resendVerification))),
        const SizedBox(height: Tokens.s3),
      ],
      if (onboarding['completed'] != true) ...[
        Notice(text: l.onboardingContinue, kind: NoticeKind.info, trailing: TextButton(onPressed: () => context.push('/onboarding'), child: Text(l.next))),
        const SizedBox(height: Tokens.s3),
      ],
      Card(
        child: Padding(
          padding: const EdgeInsets.all(Tokens.s4),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              ScoreRing(percent: overall),
              const SizedBox(width: Tokens.s4),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(l.scoreTitle, style: theme.textTheme.titleMedium),
                if (overall == null) Text(l.scoreUnavailable, style: theme.textTheme.bodySmall),
              ])),
            ]),
            const SizedBox(height: Tokens.s3),
            for (final c in cats)
              Padding(
                padding: const EdgeInsets.only(bottom: Tokens.s2),
                child: Row(children: [
                  Expanded(flex: 3, child: Text('${c['label']}', style: theme.textTheme.bodyMedium)),
                  Expanded(
                    flex: 4,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(minHeight: 8, value: ((c['percent'] as num?) ?? 0) / 100, backgroundColor: Tokens.sunken, color: Tokens.primary),
                    ),
                  ),
                  SizedBox(width: 52, child: Text(c['percent'] == null ? '—' : '${formatNumber(context, c['percent'] as num)}%', textAlign: TextAlign.end, style: theme.textTheme.bodySmall)),
                ]),
              ),
            if (score['how_calculated'] != null) ...[
              const SizedBox(height: Tokens.s2),
              ExpansionTile(
                tilePadding: EdgeInsets.zero,
                title: Text(l.scoreHow, style: theme.textTheme.labelLarge),
                children: [Align(alignment: AlignmentDirectional.centerStart, child: Text('${score['how_calculated']}'))],
              ),
            ],
            if (score['note'] != null) Notice(text: '${score['note']}', kind: NoticeKind.info),
          ]),
        ),
      ),
      if (!personalized) ...[
        const SizedBox(height: Tokens.s3),
        Notice(text: l.personalizationOff, kind: NoticeKind.info, trailing: TextButton(onPressed: () => context.push('/privacy'), child: Text(l.profilePrivacy))),
      ],
      const SizedBox(height: Tokens.s5),
      Text(l.nextActions, style: theme.textTheme.titleMedium),
      const SizedBox(height: Tokens.s2),
      if (actions.isEmpty) Text(l.nextActionsEmpty),
      for (final a in actions)
        Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s2),
          child: Card(
            child: Builder(builder: (context) {
              final cta = a['cta'] as Map?;
              final route = cta == null ? null : routeForTarget('${cta['type']}', '${cta['target']}');
              return ListTile(
                minVerticalPadding: Tokens.s3,
                title: Text('${a['title']}'),
                subtitle: a['description'] == null ? null : Text('${a['description']}'),
                trailing: route == null ? null : const Icon(Icons.chevron_right),
                onTap: route == null ? null : () => context.push(route),
              );
            }),
          ),
        ),
    ]);
  }
}

class TasksScreen extends ConsumerWidget {
  const TasksScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final tasks = ref.watch(dashboardTasksProvider);
    Future<void> setStatus(String key, String status) async {
      try {
        await ref.read(apiClientProvider).put('/dashboard/tasks/$key', body: {'status': status});
        ref.invalidate(dashboardTasksProvider);
        ref.invalidate(dashboardProvider);
      } catch (e) {
        if (context.mounted) showSnack(context, errorMessage(l, e));
      }
    }

    return Scaffold(
      appBar: AppBar(title: Text(l.tasksTitle), actions: [TextButton.icon(onPressed: () => context.push('/documents'), icon: const Icon(Icons.badge_outlined), label: Text(l.tasksDocuments))]),
      body: AsyncBody<List<Map<String, dynamic>>>(
        value: tasks,
        onRetry: () => ref.invalidate(dashboardTasksProvider),
        data: (items) {
          final shown = items.where((t) => t['applicable'] == true || t['status'] == 'dismissed').toList();
          if (shown.isEmpty) return EmptyView(message: l.emptyList);
          return ListView.separated(
            padding: const EdgeInsets.all(Tokens.s4),
            itemCount: shown.length,
            separatorBuilder: (_, _) => const SizedBox(height: Tokens.s2),
            itemBuilder: (context, i) {
              final t = shown[i];
              final status = t['status'];
              final done = status == 'done';
              final dismissed = status == 'dismissed';
              final auto = t['auto'] == true;
              final guide = t['guide'] as Map?;
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(Tokens.s3),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Icon(done ? Icons.check_circle : Icons.radio_button_unchecked, color: done ? Tokens.success : Tokens.muted),
                      const SizedBox(width: Tokens.s2),
                      Expanded(child: Text('${t['title']}', style: Theme.of(context).textTheme.titleMedium?.copyWith(decoration: dismissed ? TextDecoration.lineThrough : null))),
                      Pill(text: '${t['category_label']}'),
                    ]),
                    if (t['hint'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text('${t['hint']}', style: Theme.of(context).textTheme.bodySmall)),
                    Wrap(spacing: Tokens.s2, children: [
                      if (guide != null) TextButton(onPressed: () => context.push('/guides/${Uri.encodeComponent('${guide['slug']}')}'), child: Text('${guide['title']}')),
                      if (!auto && !dismissed) TextButton(onPressed: () => setStatus('${t['key']}', done ? 'todo' : 'done'), child: Text(done ? l.taskReopen : l.taskMarkDone)),
                      if (!auto && !done && !dismissed) TextButton(onPressed: () => setStatus('${t['key']}', 'dismissed'), child: Text(l.taskDismiss)),
                      if (dismissed) TextButton(onPressed: () => setStatus('${t['key']}', 'todo'), child: Text(l.taskReopen)),
                    ]),
                  ]),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
