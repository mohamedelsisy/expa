import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/providers.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/common.dart';
import 'features/appointments/appointments.dart';
import 'features/ask/ask_screen.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/auth_screens.dart';
import 'features/dashboard/dashboard.dart';
import 'features/documents/documents.dart';
import 'features/guides/guides.dart';
import 'features/jobs/jobs.dart';
import 'features/learn/learn.dart';
import 'features/notifications/notifications.dart';
import 'features/onboarding/onboarding.dart';
import 'features/profile/profile.dart';
import 'features/shell/shell.dart';
import 'l10n/app_localizations.dart';

const _publicPaths = {'/login', '/register', '/forgot'};

/// Router with an auth redirect. Rebuilt only when the auth *status* changes.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<AuthStatus>(ref.read(authControllerProvider).status);
  ref.listen<AuthState>(authControllerProvider, (_, next) => refresh.value = next.status);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/home',
    refreshListenable: refresh,
    redirect: (context, state) {
      final status = ref.read(authControllerProvider).status;
      final loc = state.matchedLocation;
      if (status == AuthStatus.unknown) return loc == '/splash' ? null : '/splash';
      final authed = status == AuthStatus.authenticated;
      if (!authed && !_publicPaths.contains(loc)) return '/login';
      if (authed && (_publicPaths.contains(loc) || loc == '/splash')) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, _) => const Scaffold(body: LoadingView())),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, _) => const RegisterScreen()),
      GoRoute(path: '/forgot', builder: (_, _) => const ForgotPasswordScreen()),
      GoRoute(path: '/verify', builder: (_, _) => const VerifyNoticeScreen()),
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
      GoRoute(path: '/learn', builder: (_, _) => const LearnScreen()),
      GoRoute(path: '/learn/:slug', builder: (_, s) => LessonScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/jobs', builder: (_, _) => const JobsScreen()),
      GoRoute(path: '/jobs/:id', builder: (_, s) => JobDetailScreen(id: int.tryParse(s.pathParameters['id'] ?? '') ?? 0)),
      GoRoute(path: '/notifications', builder: (_, _) => const NotificationsScreen()),
      GoRoute(path: '/appointments', builder: (_, _) => const AppointmentsScreen()),
      GoRoute(path: '/onboarding', builder: (_, _) => const OnboardingScreen()),
      GoRoute(path: '/privacy', builder: (_, _) => const PrivacyScreen()),
    ],
  );
});

class ExpaApp extends ConsumerWidget {
  const ExpaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    return MaterialApp.router(
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
