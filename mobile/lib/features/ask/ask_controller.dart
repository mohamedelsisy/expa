import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_exception.dart';
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

  AskState copyWith({List<ChatEntry>? entries, bool? busy, int? remaining, String? resetsAt, int? conversationId, bool? limitReached, bool? needsVerification}) => AskState(
        entries: entries ?? this.entries,
        busy: busy ?? this.busy,
        remaining: remaining ?? this.remaining,
        resetsAt: resetsAt ?? this.resetsAt,
        conversationId: conversationId ?? this.conversationId,
        limitReached: limitReached ?? this.limitReached,
        needsVerification: needsVerification ?? this.needsVerification,
      );
}

class AskController extends Notifier<AskState> {
  @override
  AskState build() => const AskState();

  AskRepository get _repo => ref.read(askRepositoryProvider);

  Future<void> loadUsage() async {
    try {
      final u = await _repo.usage();
      state = state.copyWith(remaining: u.remaining, resetsAt: u.resetsAt, limitReached: state.limitReached || (u.remaining != null && u.remaining! <= 0));
    } on ApiException {
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
    } on ApiException catch (e) {
      state = state.copyWith(
        entries: [...state.entries, FailureEntry(e)],
        busy: false,
        limitReached: e is RateLimitedException && e.aiLimitReached ? true : state.limitReached,
        needsVerification: e is ForbiddenException && e.emailNotVerified,
      );
      if (e is RateLimitedException && e.aiLimitReached) await loadUsage();
    }
  }
}

final askControllerProvider = NotifierProvider<AskController, AskState>(AskController.new);
