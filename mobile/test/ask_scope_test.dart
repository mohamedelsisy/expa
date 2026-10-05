import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:expa_mobile/core/providers.dart';
import 'package:expa_mobile/features/ask/ask_controller.dart';
import 'package:expa_mobile/features/ask/ask_models.dart';
import 'package:expa_mobile/features/auth/auth_controller.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'ask_controller_test.dart' show FakeAsk;
import 'session_resilience_test.dart' show Repo, RecordingRegistrar;
import 'support.dart';

void main() {
  ProviderContainer make(FakeAsk ask, {Repo? repo}) {
    final env = TestEnv();
    final c = ProviderContainer(overrides: [
      ...env.overrides(),
      askRepositoryProvider.overrideWithValue(ask),
      authRepositoryProvider.overrideWithValue(repo ?? Repo([])),
      pushRegistrarProvider.overrideWithValue(RecordingRegistrar([], env)),
    ]);
    addTearDown(c.dispose);
    return c;
  }

  test('MOB-18: the previous user\'s conversation is gone after logout and after an account switch', () async {
    final c = make(FakeAsk());
    final auth = c.read(authControllerProvider.notifier);
    await auth.login('a@b.c', 'pw');
    c.listen(askControllerProvider, (_, _) {});
    await c.read(askControllerProvider.notifier).send('private question about my visa');
    expect(c.read(askControllerProvider).entries, isNotEmpty);
    expect(c.read(askControllerProvider).conversationId, 9);

    await auth.logout();
    expect(c.read(askControllerProvider).entries, isEmpty);
    expect(c.read(askControllerProvider).conversationId, isNull);

    // a different account signs in on the same device
    await c.read(askControllerProvider.notifier).send('x1');
    await auth.login('other@b.c', 'pw');
    // same demo id here; force a different user to prove the scoping key
    c.read(authControllerProvider.notifier).state = const AuthState(status: AuthStatus.authenticated, user: AppUser(id: 2, name: 'Other', email: 'o@b.c', emailVerified: true));
    expect(c.read(askControllerProvider).entries, isEmpty);
  });

  test('MOB-8: a non-ApiException (e.g. parsing error) ends the busy state with a generic failure entry', () async {
    final f = FakeAsk()..error = const FormatException('bad json');
    final c = make(f);
    c.listen(askControllerProvider, (_, _) {});
    await c.read(askControllerProvider.notifier).send('hello there');
    final s = c.read(askControllerProvider);
    expect(s.busy, isFalse);
    expect(s.entries.last, isA<FailureEntry>());
    expect((s.entries.last as FailureEntry).error, isNull);
  });

  test('MOB-27c: a stale conversation id (404) is dropped so the next question starts a new conversation', () async {
    final f = FakeAsk();
    final c = make(f);
    c.listen(askControllerProvider, (_, _) {});
    final n = c.read(askControllerProvider.notifier);
    await n.send('first question');
    expect(c.read(askControllerProvider).conversationId, 9);
    f.error = const NotFoundException('gone');
    await n.send('second question');
    expect(c.read(askControllerProvider).conversationId, isNull);
    f.error = null;
    await n.send('third question');
    expect(c.read(askControllerProvider).conversationId, 9);
  });

  test('newConversation clears entries but keeps the usage numbers', () async {
    final c = make(FakeAsk());
    c.listen(askControllerProvider, (_, _) {});
    final n = c.read(askControllerProvider.notifier);
    await n.send('first question');
    n.newConversation();
    final s = c.read(askControllerProvider);
    expect(s.entries, isEmpty);
    expect(s.conversationId, isNull);
    expect(s.remaining, isNotNull);
  });
}
