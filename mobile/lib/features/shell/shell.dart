import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../community/community.dart';
import '../../l10n/app_localizations.dart';

/// Bottom navigation: Home · Explore · Ask EXPA · Tasks · Profile (docs/DESIGN_SYSTEM.md).
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      body: shell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.home_outlined), selectedIcon: const Icon(Icons.home), label: l.tabHome),
          NavigationDestination(icon: const Icon(Icons.explore_outlined), selectedIcon: const Icon(Icons.explore), label: l.tabExplore),
          NavigationDestination(icon: const Icon(Icons.chat_bubble_outline), selectedIcon: const Icon(Icons.chat_bubble), label: l.tabAsk),
          NavigationDestination(icon: const Icon(Icons.checklist), selectedIcon: const Icon(Icons.checklist), label: l.tabTasks),
          NavigationDestination(icon: const Icon(Icons.person_outline), selectedIcon: const Icon(Icons.person), label: l.tabProfile),
        ],
      ),
    );
  }
}

class ExploreScreen extends ConsumerWidget {
  const ExploreScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Community is shown only while GET /community/meta says it is enabled (the API answers 404 while the flag is off).
    final communityOn = ref.watch(communityMetaProvider).valueOrNull != null;
    final l = AppL10n.of(context);
    final tiles = <(IconData, String, String)>[
      (Icons.menu_book_outlined, l.exploreGuides, '/guides'),
      (Icons.badge_outlined, l.exploreMyDocs, '/documents'),
      (Icons.event_available_outlined, l.exploreAppointments, '/appointments'),
      (Icons.translate, l.exploreLearn, '/learn'),
      (Icons.work_outline, l.exploreJobs, '/jobs'),
      (Icons.account_balance_outlined, l.exploreGovernment, '/government'),
      (Icons.directions_car_outlined, l.explorePatente, '/patente'),
      (Icons.school_outlined, l.exploreStudy, '/study'),
      (Icons.article_outlined, l.exploreArticles, '/articles'),
      (Icons.location_city_outlined, l.exploreCities, '/cities'),
      (Icons.handshake_outlined, l.exploreServices, '/providers'),
      (Icons.home_work_outlined, l.exploreHousing, '/housing'),
      (Icons.document_scanner_outlined, l.exploreScan, '/scan'),
      (Icons.auto_awesome_outlined, l.recoTitle, '/recommendations'),
      (Icons.calculate_outlined, l.netTitle, '/money/net-salary'),
      (Icons.flight_takeoff_outlined, l.travelTitle, '/travel'),
      if (communityOn) (Icons.forum_outlined, l.exploreCommunity, '/community'),
      (Icons.gavel_outlined, l.exploreLegal, '/legal'),
      (Icons.bookmark_border, l.exploreSaved, '/saved'),
      (Icons.notifications_none, l.exploreNotifications, '/notifications'),
    ];
    return Scaffold(
      appBar: AppBar(title: Text(l.exploreTitle), actions: [
        IconButton(key: const ValueKey('explore-search'), tooltip: l.searchTitle, icon: const Icon(Icons.search), onPressed: () => context.push('/search')),
      ]),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        for (final t in tiles)
          Padding(
            padding: const EdgeInsets.only(bottom: Tokens.s2),
            child: Card(child: ListTile(minVerticalPadding: Tokens.s4, leading: Icon(t.$1, color: Tokens.primary), title: Text(t.$2), trailing: const Icon(Icons.chevron_right), onTap: () => context.push(t.$3))),
          ),
      ]),
    );
  }
}
