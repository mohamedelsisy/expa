import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/util/format.dart';
import '../../core/util/safe_url.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/content_view.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';

/// Public content detail by API path (e.g. `/government/services/<slug>`). Used for government services and
/// offices, appointment guides, study programs/universities/scholarships and Patente topics: they share the
/// API's content envelope (title/name, summary, long sections, `source`, `fallback`).
final catalogDetailProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, String>((ref, path) async {
  ref.watch(localeProvider);
  return (await ref.watch(apiClientProvider).get(path)).map;
});

class CatalogDetailScreen extends ConsumerWidget {
  const CatalogDetailScreen({super.key, required this.path, required this.title});
  final String path;
  final String title;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final value = ref.watch(catalogDetailProvider(path));
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: AsyncBody<Map<String, dynamic>>(
        value: value,
        onRetry: () => ref.invalidate(catalogDetailProvider(path)),
        data: (d) => CatalogDetailView(data: d),
      ),
    );
  }
}

class CatalogDetailView extends StatelessWidget {
  const CatalogDetailView({super.key, required this.data, this.embedded = false});
  final Map<String, dynamic> data;

  /// Shrink-wrapped, non-scrolling (and no own padding) so a parent list can host it.
  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final theme = Theme.of(context);
    final d = data;
    final title = '${d['title'] ?? d['name'] ?? ''}';
    final labels = [for (final k in const ['domain_label', 'office_type_label', 'degree_level_label', 'field_label', 'instruction_language_label']) if (d[k] != null) '${d[k]}'];
    final source = SourceInfo.fromJson(d['source']);
    final offices = [for (final o in (d['offices'] as List? ?? const [])) if (o is Map) Map<String, dynamic>.from(o)];
    final guide = d['guide'] is Map && (d['guide'] as Map)['slug'] != null && d['office_type'] == null ? d['guide'] as Map : null;
    final tuition = d['tuition'] as Map?;
    final deadline = d['deadline'] as Map?;
    final sections = <(String, Object?)>[
      (l.secWhatIs, d['what_is']),
      (l.secWhoNeeds, d['who_needs']),
      (l.secWhere, d['how_to_apply']),
      (l.secDocuments, d['required_documents']),
      (l.secAdmission, d['admission_requirements']),
      (l.secSteps, d['steps']),
      (l.secTips, d['tips']),
      (l.secCautions, d['cautions']),
      (l.secNotes, d['notes']),
      ('', d['body']),
    ];
    return ListView(shrinkWrap: embedded, physics: embedded ? const NeverScrollableScrollPhysics() : null, padding: embedded ? EdgeInsets.zero : const EdgeInsets.all(Tokens.s4), children: [
      Text(title, style: theme.textTheme.titleLarge),
      if (d['italian_term'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Align(alignment: AlignmentDirectional.centerStart, child: Pill(text: '${d['italian_term']}', bg: Tokens.primarySoft, fg: Tokens.primaryStrong))),
      if (labels.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Wrap(spacing: Tokens.s2, runSpacing: Tokens.s1, children: [for (final t in labels) Pill(text: t)])),
      if (d['fallback'] == true) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Notice(text: l.fallbackLocale)),
      if (d['summary'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: Text('${d['summary']}')),
      if (d['office_type'] != null && d['booking'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: OfficeCard(office: d)),
      if (tuition != null) ContentSection(title: l.studyTuition, value: '${formatNumber(context, (tuition['min'] as num?) ?? 0)} – ${formatNumber(context, (tuition['max'] as num?) ?? (tuition['min'] as num?) ?? 0)} ${tuition['currency'] ?? 'EUR'} / ${l.studyPerYear}'),
      if (deadline != null && deadline['date'] != null) ContentSection(title: l.studyDeadline, value: formatDate(context, deadline['date'] as String?)),
      for (final s in sections) ContentSection(title: s.$1, value: s.$2),
      if (offices.isNotEmpty) ...[
        Padding(padding: const EdgeInsets.only(top: Tokens.s5, bottom: Tokens.s2), child: Text(l.govOffices, style: theme.textTheme.titleMedium)),
        for (final o in offices) Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: OfficeCard(office: o, onTap: o['slug'] == null ? null : () => context.push('/government/offices/${Uri.encodeComponent('${o['slug']}')}'))),
      ],
      if (guide != null)
        Padding(
          padding: const EdgeInsets.only(top: Tokens.s4),
          child: OutlinedButton.icon(onPressed: () => context.push('/guides/${Uri.encodeComponent('${guide['slug']}')}'), icon: const Icon(Icons.menu_book_outlined), label: Text('${l.govRelatedGuide}: ${guide['title'] ?? ''}')),
        ),
      if (safeHttpsUri(d['program_url'] as String?) != null)
        Padding(padding: const EdgeInsets.only(top: Tokens.s3), child: OutlinedButton.icon(onPressed: () => openUrlWithFeedback(context, d['program_url'] as String?), icon: const Icon(Icons.open_in_new, size: 18), label: Text(l.openOfficialSite))),
      const SizedBox(height: Tokens.s5),
      if (source != null) Card(child: Padding(padding: const EdgeInsets.all(Tokens.s4), child: SourceBlock(source: source))),
      const SizedBox(height: Tokens.s3),
      Notice(text: '${d['verify_notice'] ?? l.verifyOfficialNotice}', kind: NoticeKind.warning),
    ]);
  }
}

class CatalogTab {
  const CatalogTab({required this.label, required this.endpoint, required this.detailBase, this.query = const {}, this.officeCards = false});
  final String label;
  final String endpoint;

  /// Route prefix of the detail screen, e.g. `/government/services` (slug is appended).
  final String detailBase;
  final Map<String, dynamic> query;
  final bool officeCards;
}

/// Tabs of searchable, paginated public lists (government, study, appointment guides).
class CatalogTabsScreen extends StatelessWidget {
  const CatalogTabsScreen({super.key, required this.title, required this.tabs, this.emptyText});
  final String title;
  final List<CatalogTab> tabs;
  final String? emptyText;

  @override
  Widget build(BuildContext context) {
    final body = tabs.length == 1
        ? CatalogList(tab: tabs.first, emptyText: emptyText)
        : TabBarView(children: [for (final t in tabs) CatalogList(tab: t, emptyText: emptyText)]);
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: AppBar(title: Text(title), bottom: tabs.length == 1 ? null : TabBar(isScrollable: true, tabs: [for (final t in tabs) Tab(text: t.label)])),
        body: body,
      ),
    );
  }
}

class CatalogList extends ConsumerStatefulWidget {
  const CatalogList({super.key, required this.tab, this.emptyText});
  final CatalogTab tab;
  final String? emptyText;
  @override
  ConsumerState<CatalogList> createState() => _CatalogListState();
}

class _CatalogListState extends ConsumerState<CatalogList> with AutomaticKeepAliveClientMixin {
  String _q = '';
  @override
  bool get wantKeepAlive => true;

  String _slug(Map<String, dynamic> m) => Uri.encodeComponent('${m['slug']}');

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final l = AppL10n.of(context);
    final tab = widget.tab;
    return PagedView<Map<String, dynamic>>(
      resetKey: '$_q|${ref.watch(localeProvider).languageCode}',
      emptyText: widget.emptyText ?? l.emptyList,
      fetch: (page) async {
        final r = await ref.read(apiClientProvider).get(tab.endpoint, query: {'page': page, 'per_page': 20, ...tab.query, if (_q.isNotEmpty) 'q': _q});
        return pageFrom(r.list, r.meta, (m) => m);
      },
      header: Padding(
        padding: const EdgeInsets.only(bottom: Tokens.s3),
        child: TextField(
          key: const ValueKey('catalog-search'),
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)),
          onSubmitted: (v) => setState(() => _q = v.trim()),
        ),
      ),
      itemBuilder: (context, m) {
        final slug = m['slug'];
        void open() {
          if (slug != null) context.push('${tab.detailBase}/${_slug(m)}');
        }

        if (tab.officeCards) return OfficeCard(office: m, onTap: open);
        final sub = [for (final k in const ['domain_label', 'office_type_label', 'degree_level_label', 'field_label']) if (m[k] != null) '${m[k]}'];
        final uni = (m['university'] as Map?)?['name'];
        final src = SourceInfo.fromJson(m['source']);
        return Card(
          child: InkWell(
            borderRadius: BorderRadius.circular(Tokens.radiusMd),
            onTap: open,
            child: Padding(
              padding: const EdgeInsets.all(Tokens.s4),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${m['title'] ?? m['name'] ?? ''}', style: Theme.of(context).textTheme.titleMedium),
                if (uni != null) Text('$uni'),
                if (sub.isNotEmpty) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text(sub.join(' · '), style: Theme.of(context).textTheme.bodySmall)),
                if (m['summary'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Text('${m['summary']}', maxLines: 3, overflow: TextOverflow.ellipsis)),
                if (src != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: FreshnessBadge(freshness: src.freshness)),
              ]),
            ),
          ),
        );
      },
    );
  }
}

class GovernmentScreen extends StatelessWidget {
  const GovernmentScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return CatalogTabsScreen(
      title: l.govTitle,
      emptyText: l.govEmpty,
      tabs: [
        CatalogTab(label: l.govServices, endpoint: '/government/services', detailBase: '/government/services'),
        CatalogTab(label: l.govOffices, endpoint: '/government/offices', detailBase: '/government/offices', officeCards: true),
      ],
    );
  }
}

class StudyScreen extends StatelessWidget {
  const StudyScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return CatalogTabsScreen(
      title: l.studyTitle,
      emptyText: l.studyEmpty,
      tabs: [
        CatalogTab(label: l.studyPrograms, endpoint: '/study/programs', detailBase: '/study/programs'),
        CatalogTab(label: l.studyUniversities, endpoint: '/study/universities', detailBase: '/study/universities'),
        CatalogTab(label: l.studyScholarships, endpoint: '/study/scholarships', detailBase: '/study/scholarships'),
      ],
    );
  }
}

class AppointmentGuidesScreen extends StatelessWidget {
  const AppointmentGuidesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return CatalogTabsScreen(
      title: l.apptGuidesTitle,
      emptyText: l.emptyList,
      tabs: [CatalogTab(label: l.apptGuidesTitle, endpoint: '/appointments/guides', detailBase: '/appointments/guides')],
    );
  }
}
