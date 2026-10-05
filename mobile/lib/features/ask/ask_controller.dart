import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_exception.dart';
import '../auth/auth_controller.dart';
import 'ask_models.dart';

sealed class ChatEntry {
  const ChatEntry();
}

class UserEntry extends ChatEntry {
  const UserEntry(this.text);
  final String text;
}

class AssistantEntry extends ChatEntry {
  const AssistantEntry(this.message);
  final AskMessage message;
}

/// The request failed. The UI shows localized text (never a made-up answer) plus a way to browse guides.
class FailureEntry extends ChatEntry {
  const FailureEntry(this.error);
  final ApiException? error;
}

class AskState {
  const AskState({this.entries = const [], this.busy = false, this.remaining, this.resetsAt, this.conversationId, this.limitReached = false, this.needsVerification = false});
  final List<ChatEntry> entries;
  final bool busy;
  final int? remaining;
  final String? resetsAt;
  final int? conversationId;
  final bool limitReached;
  final bool needsVerification;

  AskState copyWith({List<ChatEntry>? entries, bool? busy, int? remaining, String? resetsAt, int? conversationId, bool? limitReached, bool? needsVerification, bool resetConversation = false}) => AskState(
        entries: entries ?? this.entries,
        busy: busy ?? this.busy,
        remaining: remaining ?? this.remaining,
        resetsAt: resetsAt ?? this.resetsAt,
        conversationId: resetConversation ? null : (conversationId ?? this.conversationId),
        limitReached: limitReached ?? this.limitReached,
        needsVerification: needsVerification ?? this.needsVerification,
      );
}

class AskController extends Notifier<AskState> {
  /// Scoped to the signed-in user: on logout / account switch this provider rebuilds and the previous
  /// user's conversation is gone (MOB-18).
  @override
  AskState build() {
    ref.watch(authControllerProvider.select((s) => s.user?.id));
    return const AskState();
  }

  AskRepository get _repo => ref.read(askRepositoryProvider);

  void newConversation() => state = AskState(remaining: state.remaining, resetsAt: state.resetsAt, limitReached: state.limitReached);

  Future<void> loadUsage() async {
    try {
      final u = await _repo.usage();
      state = state.copyWith(remaining: u.remaining, resetsAt: u.resetsAt, limitReached: state.limitReached || (u.remaining != null && u.remaining! <= 0));
    } catch (_) {
      // usage is informational; the ask call still enforces limits
    }
  }

  Future<void> send(String text) async {
    final message = text.trim();
    if (message.length < 2 || state.busy) return;
    state = state.copyWith(entries: [...state.entries, UserEntry(message)], busy: true, needsVerification: false);
    try {
      final r = await _repo.ask(message, conversationId: state.conversationId);
      state = state.copyWith(
        entries: [...state.entries, AssistantEntry(r.message)],
        busy: false,
        remaining: r.remaining,
        conversationId: r.conversationId,
        limitReached: r.remaining != null && r.remaining! <= 0,
      );
    } catch (e) {
      final api = e is ApiException ? e : null; // anything else (parsing, platform) -> generic localized failure
      state = state.copyWith(
        entries: [...state.entries, FailureEntry(api)],
        busy: false,
        limitReached: api is RateLimitedException && api.aiLimitReached ? true : state.limitReached,
        needsVerification: api is ForbiddenException && api.emailNotVerified,
        resetConversation: api is NotFoundException, // stale conversation_id: start a new conversation next time
      );
      if (api is RateLimitedException && api.aiLimitReached) await loadUsage();
    }
  }
}

final askControllerProvider = NotifierProvider<AskController, AskState>(AskController.new);
