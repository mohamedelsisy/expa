import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/language_switcher.dart';
import '../../l10n/app_localizations.dart';
import '../auth/auth_controller.dart';
import '../dashboard/dashboard.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppL10n.of(context);
    final user = ref.watch(authControllerProvider).user;
    return Scaffold(
      appBar: AppBar(title: Text(l.profileTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Card(
          child: ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person_outline)),
            title: Text(user?.name ?? ''),
            subtitle: Text(user?.email ?? '', textDirection: TextDirection.ltr),
          ),
        ),
        const SizedBox(height: Tokens.s3),
        Card(child: ListTile(leading: const Icon(Icons.tune), title: Text(l.profileOnboarding), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/onboarding'))),
        const SizedBox(height: Tokens.s2),
        Card(child: ListTile(leading: const Icon(Icons.shield_outlined), title: Text(l.profilePrivacy), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/privacy'))),
        const SizedBox(height: Tokens.s2),
        Card(child: ListTile(leading: const Icon(Icons.notifications_none), title: Text(l.notificationsTitle), trailing: const Icon(Icons.chevron_right), onTap: () => context.push('/notifications'))),
        const SizedBox(height: Tokens.s4),
        Text(l.language, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: Tokens.s2),
        const LanguageSwitcher(),
        const SizedBox(height: Tokens.s4),
        if (!ref.watch(pushServiceProvider).isAvailable) Notice(text: l.pushNote),
        const SizedBox(height: Tokens.s4),
        OutlinedButton.icon(onPressed: () => ref.read(authControllerProvider.notifier).logout(), icon: const Icon(Icons.logout), label: Text(l.logout)),
      ]),
    );
  }
}

final consentsProvider = FutureProvider.autoDispose<({List<Map<String, dynamic>> purposes, Map<String, dynamic> current})>((ref) async {
  ref.watch(localeProvider);
  final api = ref.watch(apiClientProvider);
  final p = await api.get('/privacy/purposes');
  final c = await api.get('/profile/consents');
  return (
    purposes: [for (final e in (p.map['purposes'] as List? ?? const [])) if (e is Map) Map<String, dynamic>.from(e)],
    current: Map<String, dynamic>.from((c.map['consents'] as Map?) ?? const {}),
  );
});

class PrivacyScreen extends ConsumerStatefulWidget {
  const PrivacyScreen({super.key});
  @override
  ConsumerState<PrivacyScreen> createState() => _PrivacyState();
}

class _PrivacyState extends ConsumerState<PrivacyScreen> {
  final _password = TextEditingController();
  bool _busy = false;
  String? _message;
  Object? _error;

  @override
  void dispose() {
    _password.dispose();
    super.dispose();
  }

  Future<void> _toggle(String key, bool value) async {
    final l = AppL10n.of(context);
    try {
      await ref.read(apiClientProvider).put('/profile/consents', body: {'consents': {key: value}});
      ref.invalidate(consentsProvider);
      ref.invalidate(dashboardProvider);
    } catch (e) {
      if (mounted) showSnack(context, errorMessage(l, e));
    }
  }

  Future<void> _export() async {
    final l = AppL10n.of(context);
    setState(() {
      _busy = true;
      _error = null;
      _message = null;
    });
    try {
      final r = await ref.read(apiClientProvider).get('/profile/export');
      // The export is deliberately not written to disk: a file of personal data on a shared device is a risk.
      if (mounted) setState(() => _message = l.exportDone(r.map.length.toString()));
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final l = AppL10n.of(context);
    if (_password.text.isEmpty) {
      setState(() => _error = null);
      showSnack(context, l.fieldRequired);
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).delete('/profile', body: {'password': _password.text});
      _password.clear();
      if (mounted) {
        showSnack(context, l.deleteRequested);
        await ref.read(authControllerProvider.notifier).logout();
      }
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final consents = ref.watch(consentsProvider);
    return Scaffold(
      appBar: AppBar(title: Text(l.privacyTitle)),
      body: ListView(padding: const EdgeInsets.all(Tokens.s4), children: [
        Text(l.consentsTitle, style: Theme.of(context).textTheme.titleMedium),
        Text(l.consentsHint, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: Tokens.s2),
        AsyncBody<({List<Map<String, dynamic>> purposes, Map<String, dynamic> current})>(
          value: consents,
          onRetry: () => ref.invalidate(consentsProvider),
          data: (d) => Column(children: [
            for (final p in d.purposes)
              Card(
                child: SwitchListTile(
                  title: Text('${p['title']}'),
                  subtitle: Text('${p['why']}${p['required'] == true ? '\n${l.consentRequiredBadge}' : ''}'),
                  isThreeLine: true,
                  value: (d.current['${p['key']}'] as Map?)?['granted'] == true,
                  // Required purposes (terms, privacy) cannot be withdrawn without deleting the account.
                  onChanged: p['required'] == true ? null : (v) => _toggle('${p['key']}', v),
                ),
              ),
          ]),
        ),
        const Divider(height: Tokens.s8),
        Text(l.exportTitle, style: Theme.of(context).textTheme.titleMedium),
        Text(l.exportBody),
        const SizedBox(height: Tokens.s2),
        OutlinedButton(onPressed: _busy ? null : _export, child: Text(l.exportRequest)),
        if (_message != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: _message!, kind: NoticeKind.success)),
        const Divider(height: Tokens.s8),
        Text(l.deleteAccountTitle, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Tokens.danger)),
        Text(l.deleteAccountBody),
        const SizedBox(height: Tokens.s2),
        TextField(controller: _password, obscureText: true, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.password)),
        const SizedBox(height: Tokens.s2),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: Tokens.danger, foregroundColor: Tokens.onPrimary),
          onPressed: _busy ? null : _delete,
          child: Text(l.deleteAccountConfirm),
        ),
        if (_error != null) Padding(padding: const EdgeInsets.only(top: Tokens.s2), child: Notice(text: errorMessage(l, _error), kind: NoticeKind.danger)),
      ]),
    );
  }
}
