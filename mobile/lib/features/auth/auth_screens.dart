import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/common.dart';
import '../../core/widgets/language_switcher.dart';
import '../../l10n/app_localizations.dart';
import 'auth_controller.dart';

class AuthScaffold extends StatelessWidget {
  const AuthScaffold({super.key, required this.title, this.subtitle, required this.children, this.showBack = false});
  final String title;
  final String? subtitle;
  final List<Widget> children;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    return Scaffold(
      appBar: showBack ? AppBar() : null,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(Tokens.s6),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Text(l.appName, style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: Tokens.primary), textAlign: TextAlign.center),
                Text(l.appTagline, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
                const SizedBox(height: Tokens.s6),
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                if (subtitle != null) Padding(padding: const EdgeInsets.only(top: Tokens.s1), child: Text(subtitle!)),
                const SizedBox(height: Tokens.s4),
                ...children,
                const SizedBox(height: Tokens.s6),
                const LanguageSwitcher(),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    await ref.read(authControllerProvider.notifier).login(_email.text, _password.text);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final auth = ref.watch(authControllerProvider);
    return AuthScaffold(
      title: l.loginTitle,
      subtitle: l.loginSubtitle,
      children: [
        if (auth.sessionExpired) ...[Notice(text: l.sessionExpired, kind: NoticeKind.warning), const SizedBox(height: Tokens.s3)],
        if (auth.error != null) ...[Notice(text: errorMessage(l, auth.error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
        Form(
          key: _form,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            TextFormField(
              key: const ValueKey('login-email'),
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              textDirection: TextDirection.ltr,
              decoration: InputDecoration(labelText: l.email),
              validator: (v) => (v == null || !v.contains('@')) ? l.invalidEmail : null,
            ),
            const SizedBox(height: Tokens.s4),
            TextFormField(
              key: const ValueKey('login-password'),
              controller: _password,
              obscureText: true,
              autofillHints: const [AutofillHints.password],
              textDirection: TextDirection.ltr,
              decoration: InputDecoration(labelText: l.password),
              validator: (v) => (v == null || v.isEmpty) ? l.fieldRequired : null,
              onFieldSubmitted: (_) => _submit(),
            ),
          ]),
        ),
        const SizedBox(height: Tokens.s4),
        FilledButton(
          key: const ValueKey('login-submit'),
          onPressed: auth.busy ? null : _submit,
          child: auth.busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.loginButton),
        ),
        TextButton(onPressed: () => context.push('/forgot'), child: Text(l.forgotLink, textAlign: TextAlign.center)),
        TextButton(onPressed: () => context.push('/register'), child: Text(l.noAccount, textAlign: TextAlign.center)),
      ],
    );
  }
}

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _terms = false;
  bool _privacy = false;
  bool _showAcceptError = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final ok = _form.currentState!.validate();
    setState(() => _showAcceptError = !(_terms && _privacy));
    if (!ok || !_terms || !_privacy) return;
    final done = await ref.read(authControllerProvider.notifier).register(name: _name.text, email: _email.text, password: _password.text);
    if (done && mounted) context.go('/verify');
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final auth = ref.watch(authControllerProvider);
    return AuthScaffold(
      title: l.registerTitle,
      showBack: true,
      children: [
        if (auth.error != null) ...[Notice(text: errorMessage(l, auth.error), kind: NoticeKind.danger), const SizedBox(height: Tokens.s3)],
        Form(
          key: _form,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            TextFormField(controller: _name, decoration: InputDecoration(labelText: l.name), autofillHints: const [AutofillHints.name], validator: (v) => (v == null || v.trim().length < 2) ? l.fieldRequired : null),
            const SizedBox(height: Tokens.s4),
            TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.email), validator: (v) => (v == null || !v.contains('@')) ? l.invalidEmail : null),
            const SizedBox(height: Tokens.s4),
            TextFormField(controller: _password, obscureText: true, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.password, helperText: l.passwordHint, helperMaxLines: 2), validator: (v) => (v == null || v.length < 10) ? l.passwordTooShort : null),
            const SizedBox(height: Tokens.s4),
            TextFormField(controller: _confirm, obscureText: true, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.confirmPassword), validator: (v) => v != _password.text ? l.passwordsMismatch : null),
          ]),
        ),
        CheckboxListTile(contentPadding: EdgeInsets.zero, controlAffinity: ListTileControlAffinity.leading, value: _terms, onChanged: (v) => setState(() => _terms = v ?? false), title: Text(l.acceptTerms)),
        CheckboxListTile(contentPadding: EdgeInsets.zero, controlAffinity: ListTileControlAffinity.leading, value: _privacy, onChanged: (v) => setState(() => _privacy = v ?? false), title: Text(l.acceptPrivacy)),
        if (_showAcceptError) Padding(padding: const EdgeInsets.only(bottom: Tokens.s2), child: Text(l.mustAcceptBoth, style: const TextStyle(color: Tokens.danger))),
        FilledButton(onPressed: auth.busy ? null : _submit, child: auth.busy ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(l.registerButton)),
        TextButton(onPressed: () => context.go('/login'), child: Text(l.haveAccount, textAlign: TextAlign.center)),
      ],
    );
  }
}

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotState();
}

class _ForgotState extends ConsumerState<ForgotPasswordScreen> {
  final _email = TextEditingController();
  final _form = GlobalKey<FormState>();
  bool _sent = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final auth = ref.watch(authControllerProvider);
    return AuthScaffold(
      title: l.forgotTitle,
      subtitle: l.forgotBody,
      showBack: true,
      children: [
        if (_sent) Notice(text: l.resetSent, kind: NoticeKind.success),
        if (auth.error != null) Notice(text: errorMessage(l, auth.error), kind: NoticeKind.danger),
        const SizedBox(height: Tokens.s3),
        Form(key: _form, child: TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, textDirection: TextDirection.ltr, decoration: InputDecoration(labelText: l.email), validator: (v) => (v == null || !v.contains('@')) ? l.invalidEmail : null)),
        const SizedBox(height: Tokens.s4),
        FilledButton(
          onPressed: auth.busy
              ? null
              : () async {
                  if (!_form.currentState!.validate()) return;
                  final ok = await ref.read(authControllerProvider.notifier).forgotPassword(_email.text);
                  if (mounted) setState(() => _sent = ok);
                },
          child: Text(l.sendResetLink),
        ),
      ],
    );
  }
}

/// Shown after registration and reachable from the banner: the user must open the emailed link,
/// the app never verifies on their behalf.
class VerifyNoticeScreen extends ConsumerStatefulWidget {
  const VerifyNoticeScreen({super.key});
  @override
  ConsumerState<VerifyNoticeScreen> createState() => _VerifyState();
}

class _VerifyState extends ConsumerState<VerifyNoticeScreen> {
  bool _sent = false;

  @override
  Widget build(BuildContext context) {
    final l = AppL10n.of(context);
    final auth = ref.watch(authControllerProvider);
    return AuthScaffold(
      title: l.verifyTitle,
      children: [
        Notice(text: l.verifyBody, kind: NoticeKind.info),
        if (_sent) ...[const SizedBox(height: Tokens.s3), Notice(text: l.verificationSent, kind: NoticeKind.success)],
        if (auth.error != null) ...[const SizedBox(height: Tokens.s3), Notice(text: errorMessage(l, auth.error), kind: NoticeKind.danger)],
        const SizedBox(height: Tokens.s4),
        OutlinedButton(
          onPressed: () async {
            final ok = await ref.read(authControllerProvider.notifier).resendVerification();
            if (mounted) setState(() => _sent = ok);
          },
          child: Text(l.resendVerification),
        ),
        const SizedBox(height: Tokens.s2),
        FilledButton(
          onPressed: () async {
            await ref.read(authControllerProvider.notifier).refreshUser();
            if (context.mounted) context.go('/home');
          },
          child: Text(l.verifiedCheck),
        ),
        TextButton(onPressed: () => context.go('/home'), child: Text(l.continueToApp)),
      ],
    );
  }
}
