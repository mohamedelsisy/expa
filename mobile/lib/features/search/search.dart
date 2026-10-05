import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/routes.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/paged_view.dart';
import '../../l10n/app_localizations.dart';

/// Unified search (`GET /search`): guides, government, appointment guides, lessons, Patente, study and jobs.
/// Result routes come from the API and are opened ONLY through [routeForTarget] (allow-list).
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key, this.initialQuery = ''});
  final String initialQuery;
  @override
  ConsumerState<SearchScreen> createState() => _SearchState();
}

class _SearchState extends ConsumerState<SearchScreen> {
  late final TextEditingController _controller = TextEditingController(text: widget.initialQuery);
  late String _q = widget.initialQuery.trim();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final field = TextField(
      key: const ValueKey('search-input'),
      controller: _controller,
      autofocus: widget.initialQuery.isEmpty,
      textInputAction: TextInputAction.search,
      decoration: InputDecoration(hintText: l.searchHint, prefixIcon: const Icon(Icons.search)),
      onSubmitted: (v) => setState(() => _q = v.trim()),
    );
    return Scaffold(
      appBar: AppBar(title: Text(l.searchTitle)),
      body: _q.length < 2
          ? ListView(padding: const EdgeInsets.all(Tokens.s4), children: [field, const SizedBox(height: Tokens.s4), Notice(text: l.searchMinChars)])
          : PagedView<Map<String, dynamic>>(
              resetKey: '$_q|${ref.watch(localeProvider).languageCode}',
              emptyText: l.searchEmpty,
              header: Padding(padding: const EdgeInsets.only(bottom: Tokens.s3), child: field),
              fetch: (page) async {
                final r = await ref.read(apiClientProvider).get('/search', query: {'q': _q, 'page': page, 'per_page': 20});
                return pageFrom(r.list, r.meta, (m) => m);
              },
              itemBuilder: (context, m) {
                final route = routeForTarget('route', '${m['route'] ?? ''}');
                return Card(
                  child: ListTile(
                    minVerticalPadding: Tokens.s3,
                    title: Text('${m['title']}'),
                    subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      if (m['type_label'] != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1, bottom: Tokens.s1), child: Pill(text: '${m['type_label']}')),
                      if (m['snippet'] != null) Text('${m['snippet']}', maxLines: 3, overflow: TextOverflow.ellipsis),
                    ]),
                    trailing: route == null ? null : const Icon(Icons.chevron_right),
                    onTap: route == null ? null : () => context.push(route),
                  ),
                );
              },
            ),
    );
  }
}
