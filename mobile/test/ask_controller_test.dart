import 'package:expa_mobile/core/api/api_exception.dart';
import 'package:expa_mobile/features/ask/ask_controller.dart';
import 'package:expa_mobile/features/ask/ask_models.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeAsk implements AskRepository {
  Object? error;
  int remaining = 5;
  @override
  Future<AskReply> ask(String message, {int? conversationId, String? patenteTopic, String? patenteQuestion}) async {
    if (error != null) throw error!;
    remaining--;
    return AskReply(conversationId: 9, message: const AskMessage(content: 'ok', label: 'general_guidance', disclaimer: 'd'), remaining: remaining);
  }

  @override
  Future<AskUsage> usage() async => AskUsage(limit: 20, remaining: remaining, resetsAt: '2026-10-06T00:00:00+00:00');
}

void main() {
  ProviderContainer make(FakeAsk f) {
    final c = ProviderContainer(overrides: [askRepositoryProvider.overrideWithValue(f)]);
    addTearDown(c.dispose);
    return c;
  }

  test('successful ask appends user + assistant entries and tracks usage and conversation', () async {
    final f = FakeAsk();
    final c = make(f);
    await c.read(askControllerProvider.notifier).loadUsage();
    expect(c.read(askControllerProvider).resetsAt, isNotNull);
    await c.read(askControllerProvider.notifier).send('How do I renew?');
    final s = c.read(askControllerProvider);
    expect(s.entries, hasLength(2));
    expect(s.entries.last, isA<AssistantEntry>());
    expect(s.remaining, 4);
    expect(s.conversationId, 9);
  });

  test('failure never fabricates an answer', () async {
    final f = FakeAsk()..error = const ServerException('x', statusCode: 500);
    final c = make(f);
    await c.read(askControllerProvider.notifier).send('Hello there');
    expect(c.read(askControllerProvider).entries.last, isA<FailureEntry>());
    expect(c.read(askControllerProvider).entries.whereType<AssistantEntry>(), isEmpty);
  });

  test('ai_limit_reached and email_not_verified set the blocking flags', () async {
    final f = FakeAsk()..error = const RateLimitedException('x', code: 'ai_limit_reached');
    final c = make(f);
    await c.read(askControllerProvider.notifier).send('Hello there');
    expect(c.read(askControllerProvider).limitReached, isTrue);
    f.error = const ForbiddenException('x', code: 'email_not_verified');
    await c.read(askControllerProvider.notifier).send('Again please');
    expect(c.read(askControllerProvider).needsVerification, isTrue);
  });

  test('messages shorter than two characters are not sent', () async {
    final c = make(FakeAsk());
    await c.read(askControllerProvider.notifier).send(' a ');
    expect(c.read(askControllerProvider).entries, isEmpty);
  });
}
