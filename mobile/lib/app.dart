import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/analytics/analytics.dart';
import 'core/providers.dart';
import 'core/push/push_registrar.dart';
import 'core/push/push_service.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/common.dart';
import 'core/widgets/offline_banner.dart';
import 'features/appointments/appointments.dart';
import 'features/articles/articles.dart';
import 'features/ask/ask_screen.dart';
import 'features/ask/history.dart';
import 'features/catalog/catalog.dart';
import 'features/community/community.dart';
import 'features/patente/patente.dart';
import 'features/patente/patente_learning.dart';
import 'features/patente/patente_topic.dart';
import 'features/billing/billing.dart';
import 'features/provider/provider_portal.dart';
import 'features/tools/tools.dart';
import 'features/saved/saved.dart';
import 'features/scanner/scanner_screen.dart';
import 'features/search/search.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/auth_screens.dart';
import 'features/dashboard/dashboard.dart';
import 'features/documents/documents.dart';
import 'features/guides/guides.dart';
import 'features/housing/housing.dart';
import 'features/jobs/jobs.dart';
import 'features/learn/learn.dart';
import 'features/legal/legal.dart';
import 'features/learn/practice.dart';
import 'features/marketplace/marketplace.dart';
import 'features/notifications/notifications.dart';
import 'features/onboarding/onboarding.dart';
import 'features/profile/profile.dart';
import 'features/shell/shell.dart';
import 'l10n/app_localizations.dart';

const _publicPaths = {'/login', '/register', '/forgot'};

/// Reachable signed in or out: the e-mail links (`/{locale}/reset-password`, `/{locale}/verify-email`) open these.
final _linkPath = RegExp(r'^(/(ar|en|it))?/(reset-password|verify-email)$');

/// Legal texts are public: the register screen links to them before sign-in.
final _legalPath = RegExp(r'^/legal(/(privacy|terms|cookies))?$');

/// Messenger used for foreground push banners (no BuildContext available in the coordinator).
final rootMessengerKey = GlobalKey<ScaffoldMessengerState>();

/// Router with an auth redirect. Rebuilt only when the auth *status* changes.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<AuthStatus>(ref.read(authControllerProvider).status);
  ref.listen<AuthState>(authControllerProvider, (_, next) => refresh.value = next.status);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/home',
    errorBuilder: (context, state) => const _NotFoundScreen(),
    refreshListenable: refresh,
    redirect: (context, state) {
      final status = ref.read(authControllerProvider).status;
      final loc = state.matchedLocation;
      if (status == AuthStatus.unknown) return loc == '/splash' ? null : '/splash';
      if (_linkPath.hasMatch(loc)) return null;
      final authed = status == AuthStatus.authenticated;
      if (!authed && !_publicPaths.contains(loc) && !_legalPath.hasMatch(loc)) return '/login';
      if (authed && (_publicPaths.contains(loc) || loc == '/splash')) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, _) => const Scaffold(body: LoadingView())),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, _) => const RegisterScreen()),
      GoRoute(path: '/forgot', builder: (_, _) => const ForgotPasswordScreen()),
      GoRoute(path: '/verify', builder: (_, _) => const VerifyNoticeScreen()),
      GoRoute(path: '/reset-password', builder: (_, s) => ResetPasswordScreen(token: s.uri.queryParameters['token'], email: s.uri.queryParameters['email'])),
      GoRoute(path: '/:lang(ar|en|it)/reset-password', builder: (_, s) => ResetPasswordScreen(token: s.uri.queryParameters['token'], email: s.uri.queryParameters['email'])),
      GoRoute(path: '/verify-email', builder: (_, s) => VerifyEmailLinkScreen(url: s.uri.queryParameters['url'])),
      GoRoute(path: '/:lang(ar|en|it)/verify-email', builder: (_, s) => VerifyEmailLinkScreen(url: s.uri.queryParameters['url'])),
      StatefulShellRoute.indexedStack(
        builder: (_, _, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [GoRoute(path: '/home', builder: (_, _) => const HomeScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/explore', builder: (_, _) => const ExploreScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/ask', builder: (_, _) => const AskScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/tasks', builder: (_, _) => const TasksScreen())]),
          StatefulShellBranch(routes: [GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen())]),
        ],
      ),
      GoRoute(path: '/guides', builder: (_, _) => const GuidesScreen()),
      GoRoute(path: '/guides/:slug', builder: (_, s) => GuideDetailScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/documents', builder: (_, _) => const DocumentsScreen()),
      GoRoute(path: '/documents/new', builder: (_, _) => const AddDocumentScreen()),
      GoRoute(path: '/learn', builder: (_, s) => LearnScreen(scenario: s.uri.queryParameters['scenario'])),
      GoRoute(path: '/learn/practice', builder: (_, _) => const PracticeHubScreen()),
      GoRoute(path: '/learn/practice/review', builder: (_, _) => const ReviewScreen()),
      GoRoute(path: '/learn/vocabulary', builder: (_, s) => VocabularyScreen(category: s.uri.queryParameters['category'])),
      GoRoute(path: '/learn/vocabulary/:slug', builder: (_, s) => VocabularyDetailScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/learn/exercises', builder: (_, s) => ExercisesScreen(scenario: s.uri.queryParameters['scenario'])),
      GoRoute(path: '/learn/exercises/:slug', builder: (_, s) => ExerciseScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/learn/scenarios', builder: (_, _) => const ScenariosScreen()),
      GoRoute(path: '/learn/scenarios/:value', builder: (_, s) => ScenarioDetailScreen(value: s.pathParameters['value']!)),
      GoRoute(path: '/learn/:slug', builder: (_, s) => LessonScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/jobs', builder: (_, _) => const JobsScreen()),
      GoRoute(path: '/jobs/saved', builder: (_, _) => const SavedJobsScreen()),
      GoRoute(path: '/jobs/:id', builder: (_, s) => JobDetailScreen(id: int.tryParse(s.pathParameters['id'] ?? '') ?? 0)),
      GoRoute(path: '/notifications', builder: (_, _) => const NotificationsScreen()),
      GoRoute(path: '/appointments', builder: (_, _) => const AppointmentsScreen()),
      GoRoute(path: '/appointments/guides', builder: (_, _) => const AppointmentGuidesScreen()),
      GoRoute(path: '/appointments/guides/:slug', builder: (c, s) => CatalogDetailScreen(path: '/appointments/guides/${Uri.encodeComponent(s.pathParameters['slug']!)}', title: AppL10n.of(c).apptGuidesTitle)),
      GoRoute(path: '/government', builder: (_, _) => const GovernmentScreen()),
      GoRoute(path: '/government/services/:slug', builder: (c, s) => CatalogDetailScreen(path: '/government/services/${Uri.encodeComponent(s.pathParameters['slug']!)}', title: AppL10n.of(c).govServices)),
      GoRoute(path: '/government/offices/:slug', builder: (c, s) => CatalogDetailScreen(path: '/government/offices/${Uri.encodeComponent(s.pathParameters['slug']!)}', title: AppL10n.of(c).govOffices)),
      GoRoute(path: '/study', builder: (_, _) => const StudyScreen()),
      GoRoute(path: '/study/:kind(universities|programs|scholarships)/:slug', builder: (c, s) => CatalogDetailScreen(path: '/study/${s.pathParameters['kind']}/${Uri.encodeComponent(s.pathParameters['slug']!)}', title: AppL10n.of(c).studyTitle)),
      GoRoute(path: '/patente', builder: (_, _) => const PatenteScreen()),
      GoRoute(path: '/patente/weak', builder: (_, _) => const WeakTopicsScreen()),
      GoRoute(path: '/patente/glossary', builder: (_, _) => const PatenteGlossaryScreen()),
      GoRoute(path: '/patente/topics/:slug', builder: (_, s) => PatenteTopicScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/patente/categories/:slug', builder: (c, s) => CatalogDetailScreen(path: '/patente/categories/${Uri.encodeComponent(s.pathParameters['slug']!)}', title: AppL10n.of(c).patenteTitle)),
      GoRoute(path: '/patente/exam/:id', builder: (_, s) => ExamScreen(id: int.tryParse(s.pathParameters['id'] ?? '') ?? 0)),
      GoRoute(path: '/search', builder: (_, s) => SearchScreen(initialQuery: s.uri.queryParameters['q'] ?? '')),
      GoRoute(path: '/saved', builder: (_, _) => const SavedScreen()),
      GoRoute(path: '/articles', builder: (_, _) => const ArticlesScreen()),
      GoRoute(path: '/articles/:slug', builder: (_, s) => ArticleDetailScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/cities', builder: (_, _) => const CitiesScreen()),
      GoRoute(path: '/cities/:slug', builder: (_, s) => CityDetailScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/providers', builder: (_, _) => const ProvidersScreen()),
      GoRoute(path: '/providers/:slug', builder: (_, s) => ProviderDetailScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/providers/:slug/request', builder: (_, s) => ProviderLeadScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/providers/:slug/review', builder: (_, s) => ProviderReviewScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/my/requests', builder: (_, _) => const MyRequestsScreen()),
      GoRoute(path: '/legal', builder: (_, _) => const LegalIndexScreen()),
      GoRoute(path: '/legal/:slug(privacy|terms|cookies)', builder: (_, s) => LegalDocumentScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/community', builder: (_, _) => const CommunityScreen()),
      GoRoute(path: '/community/ask', builder: (_, _) => const CommunityAskScreen()),
      GoRoute(path: '/community/:id', builder: (_, s) => CommunityQuestionScreen(id: int.tryParse(s.pathParameters['id'] ?? '') ?? 0)),
      GoRoute(path: '/housing', builder: (_, _) => const HousingCheckerScreen()),
      GoRoute(path: '/scan', builder: (_, _) => const ScannerScreen()),
      GoRoute(path: '/ai/history', builder: (_, _) => const AiHistoryScreen()),
      GoRoute(path: '/ai/history/:id', builder: (_, s) => AiConversationScreen(id: int.tryParse(s.pathParameters['id'] ?? '') ?? 0)),
      GoRoute(path: '/billing', builder: (_, _) => const BillingScreen()),
      GoRoute(path: '/provider', builder: (_, _) => const ProviderPortalScreen()),
      GoRoute(path: '/recommendations', builder: (_, _) => const RecommendationsScreen()),
      GoRoute(path: '/money/net-salary', builder: (_, _) => const NetSalaryScreen()),
      GoRoute(path: '/travel', builder: (_, _) => const TravelScreen()),
      GoRoute(path: '/onboarding', builder: (_, _) => const OnboardingScreen()),
      GoRoute(path: '/privacy', builder: (_, _) => const PrivacyScreen()),
    ],
  );
});

/// Wires push events to the app: registers the device after sign-in (only when the user opted in), routes
/// notification taps through the route allow-list, and shows foreground notifications as a banner.
/// With the default [NoopPushService] every stream is empty and this does nothing.
final pushCoordinatorProvider = Provider<void>((ref) {
  final service = ref.watch(pushServiceProvider);
  final registrar = ref.watch(pushRegistrarProvider);
  final subs = <StreamSubscription<Object?>>[];
  ref.onDispose(() {
    for (final s in subs) {
      s.cancel();
    }
  });

  void open(PushMessage m) {
    final route = PushRegistrar.routeFor(m);
    if (route != null) ref.read(routerProvider).push(route);
  }

  ref.listen<AuthStatus>(authControllerProvider.select((s) => s.status), (_, status) {
    if (status == AuthStatus.authenticated) registrar.syncIfEnabled();
  }, fireImmediately: true);
  subs.add(service.onTokenRefresh.listen(registrar.onTokenRefreshed));
  subs.add(service.onTap.listen(open));
  subs.add(service.onForeground.listen((m) {
    final text = [m.title, m.body].whereType<String>().where((e) => e.isNotEmpty).join(' - ');
    if (text.isNotEmpty) rootMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(text)));
  }));
  service.initialMessage().then((m) {
    if (m != null && ref.read(authControllerProvider).status == AuthStatus.authenticated) open(m);
  }).catchError((_) {});
});

/// Mirrors the user's `analytics` consent into [analyticsConsentProvider] (drives the consent header); off when signed out.
final analyticsCoordinatorProvider = Provider<void>((ref) {
  ref.listen<AuthStatus>(authControllerProvider.select((s) => s.status), (_, status) {
    if (status == AuthStatus.authenticated) {
      syncAnalyticsConsent(ref.read(apiClientProvider), (v) => ref.read(analyticsConsentProvider.notifier).state = v);
    } else {
      ref.read(analyticsConsentProvider.notifier).state = false;
    }
  }, fireImmediately: true);
});

class _NotFoundScreen extends StatelessWidget {
  const _NotFoundScreen();
  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l.appName)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(Tokens.s6),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(l.errorNotFound, textAlign: TextAlign.center),
            const SizedBox(height: Tokens.s4),
            FilledButton(onPressed: () => context.go('/home'), child: Text(l.continueToApp)),
          ]),
        ),
      ),
    );
  }
}

class ExpaApp extends ConsumerWidget {
  const ExpaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    ref.watch(pushCoordinatorProvider);
    ref.watch(analyticsCoordinatorProvider);
    ref.watch(reconnectSyncProvider);
    return MaterialApp.router(
      scaffoldMessengerKey: rootMessengerKey,
      builder: (context, child) => OfflineBannerHost(child: child ?? const SizedBox.shrink()),
      onGenerateTitle: (c) => AppL10n.of(c).appName,
      debugShowCheckedModeBanner: false,
      routerConfig: ref.watch(routerProvider),
      locale: locale,
      supportedLocales: AppL10n.supportedLocales,
      localizationsDelegates: const [
        AppL10n.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: AppTheme.of(locale),
    );
  }
}
