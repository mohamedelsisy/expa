import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';

final jobDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get('/jobs/$id')).map;
});

/// Score plus per-criterion reasons. Glyph + word + colour per status; unknown criteria are shown but
/// the API never counts them against the user, and we say so.
class MatchView extends StatelessWidget {
  const MatchView({super.key, required this.match});
  final Map<String, dynamic>? match;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final m = match;
    if (m == null) return Text(l.jobsSignInForMatch, style: Theme.of(context).textTheme.bodySmall);
    final score = (m['score'] as num?)?.toInt();
    final reasons = [for (final r in (m['reasons'] as List? ?? const [])) if (r is Map) r];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(score == null ? l.matchUnknown : l.matchScore(formatNumber(context, score)), key: const ValueKey('match-score'), style: Theme.of(context).textTheme.titleMedium),
      if (reasons.isNotEmpty) ...[
        const SizedBox(height: Tokens.s2),
        Text(l.matchReasons, style: Theme.of(context).textTheme.labelLarge),
        for (final r in reasons)
          Builder(builder: (_) {
            final (glyph, color, word) = switch (r['status']) {
              'match' => ('✓', Tokens.success, l.reasonMatch),
              'partial' => ('△', Tokens.warning, l.reasonPartial),
              'mismatch' => ('✗', Tokens.danger, l.reasonMismatch),
              _ => ('?', Tokens.muted, l.reasonUnknown),
            };
            return Padding(
              padding: const EdgeInsets.only(top: Tokens.s1),
              child: Semantics(
                label: '$word: ${r['label'] ?? ''}',
                child: ExcludeSemantics(
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    SizedBox(width: 24, child: Text(glyph, style: TextStyle(color: color, fontWeight: FontWeight.w700))),
                    Expanded(child: Text('${r['label'] ?? r['key']}${r['detail'] != null ? ' — ${r['detail']}' : ''}')),
                  ]),
                ),
              ),
            );
          }),
      ],
    ]);
  }
}

class JobsScreen extends ConsumerStatefulWidget {
  const JobsScreen({super.key});
  @override
  ConsumerState<JobsScreen> createState() => _JobsState();
}

class _JobsState extends ConsumerState<JobsScreen> {
  String _q = '';
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.jobsTitle)),
      body: PagedView<Map<String, dynamic>>(
        resetKey: '$_q|${ref.watch(localeProvider).languageCode}',
        emptyText: l.jobsEmpty,
        fetch: (page) async {
          final r = await ref.read(apiClientProvider).get('/jobs', query: {'page': page, 'per_page': 20, if (_q.isNotEmpty) 'q': _q});
          return pageFrom(r.list, r.meta, (m) => m);
        },
        header: Padding(
          padding: const EdgeInsets.only(bottom: Tokens.s3),
          child: TextField(
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)),
            onSubmitted: (v) => setState(() => _q = v.trim()),
          ),
        ),
        itemBuilder: (context, j) {
          final score = ((j['match'] as Map?)?['score'] as num?)?.toInt();
          return Card(
            child: InkWell(
              borderRadius: BorderRadius.circular(Tokens.radiusMd),
              onTap: () => context.push('/jobs/${j['id']}'),
              child: Padding(
                padding: const EdgeInsets.all(Tokens.s4),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${j['title']}', style: Theme.of(context).textTheme.titleMedium),
                  Text('${j['company'] ?? ''}'),
                  const SizedBox(height: Tokens.s2),
                  Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
                    if (j['location'] != null) Pill(text: '${j['location']}', icon: Icons.place_outlined),
                    if (j['remote_mode_label'] != null) Pill(text: '${j['remote_mode_label']}'),
                    if (j['employment_type_label'] != null) Pill(text: '${j['employment_type_label']}'),
                    if (score != null) Pill(text: l.matchScore(formatNumber(context, score)), bg: Tokens.primarySoft, fg: Tokens.primaryStrong, icon: Icons.insights),
                  ]),
                ]),
              ),
            ),
          );
        },
      ),
    );
  }
}

class JobDetailScreen extends ConsumerWidget {
  const JobDetailScreen({super.key, required this.id});
  final int id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final value = ref.watch(jobDetailProvider(id));
    return Scaffold(
      appBar: AppBar(title: Text(l.jobsTitle)),
      body: AsyncBody<Map<String, dynamic>>(
        value: value,
        onRetry: () => ref.invalidate(jobDetailProvider(id)),
        data: (j) {
          final sponsorship = (j['visa_sponsorship'] as Map?)?['stated'] == true;
          return ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
            Text('${j['title']}', style: Theme.of(context).textTheme.titleLarge),
            Text('${j['company'] ?? ''}'),
            const SizedBox(height: Tokens.s2),
            Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [
              if (j['location'] != null) Pill(text: '${j['location']}', icon: Icons.place_outlined),
              if (j['remote_mode_label'] != null) Pill(text: '${j['remote_mode_label']}'),
              if (j['employment_type_label'] != null) Pill(text: '${j['employment_type_label']}'),
              Pill(text: sponsorship ? l.visaStated : l.visaNotStated),
            ]),
            if (j['source'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text(l.jobSource('${j['source']}'), style: Theme.of(context).textTheme.bodySmall)),
            const SizedBox(height: Tokens.s4),
            Card(child: Padding(padding: const EdgeInsets.all(Tokens.s4), child: SizedBox(width: double.infinity, child: MatchView(match: j['match'] as Map<String, dynamic>?)))),
            if (j['description'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s4), child: Text('${j['description']}')),
            const SizedBox(height: Tokens.s4),
            Notice(text: '${j['apply_notice'] ?? l.applyNotice}', kind: NoticeKind.info),
            const SizedBox(height: Tokens.s3),
            FilledButton.icon(
              onPressed: () async {
                // Count the click (best effort) and open the ORIGINAL page. EXPA never submits applications.
                String? url = j['apply_url'] as String?;
                try {
                  final r = await ref.read(apiClientProvider).post('/jobs/$id/apply-click');
                  url = (r.map['apply_url'] as String?) ?? url;
                } catch (_) {}
                if (context.mounted) await openUrlWithFeedback(context, url);
              },
              icon: const Icon(Icons.open_in_new),
              label: Text(l.applyOriginal),
            ),
          ]);
        },
      ),
    );
  }
}
