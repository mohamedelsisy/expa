<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Models\AiConversation;
use App\Domains\Ai\Models\AiMessage;
use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Enums\SourceType;
use App\Models\User;
use Throwable;

/**
 * User → Intent → Context → Retrieval → Source verification → LLM → Post-processing → Label → Actions.
 *
 * Hard rules enforced here (not left to the prompt):
 *  - emergencies never reach the LLM
 *  - sensitive intents without verified sources never reach the LLM
 *  - URLs and citations in the output are validated against the verified sources
 *  - LLM failure degrades to a useful fallback; it never surfaces as an error
 */
class AiAssistant
{
    public function __construct(
        private IntentDetector $intents,
        private UserContextBuilder $context,
        private KeywordRetriever $retriever,
        private SourceVerifier $verifier,
        private PromptBuilder $prompts,
        private LlmClient $llm,
        private ResponseProcessor $processor,
        private ActionSuggester $actions,
        private AiUsageService $usage,
    ) {}

    /** @return array{conversation:AiConversation,message:AiMessage,remaining:int} */
    public function ask(User $user, string $message, string $locale, ?AiConversation $conversation = null): array
    {
        $intent = $this->intents->detect($message);

        // Emergencies are answered before anything else and never touch the daily allowance
        // (a user who used up their questions must still get the safety message). No LLM call.
        if ($intent === 'emergency') {
            $conversation ??= $this->newConversation($user, $message, $locale);
            $this->save($conversation, $user, 'user', $message, ['intent' => $intent]);

            return $this->finish($conversation, $user, $this->canned('emergency', $intent, 'general_guidance'), $this->usage->remaining($user));
        }

        $remaining = $this->usage->consume($user);
        app(Analytics::class)->system(AnalyticsEvent::AiQuestion);

        $conversation ??= $this->newConversation($user, $message, $locale);
        $history = $this->history($conversation);
        $this->save($conversation, $user, 'user', $message, ['intent' => $intent]);

        $retrieved = $this->retriever->retrieve($message, $locale);
        $sources = $this->verifier->verify($retrieved);
        $sensitive = $this->intents->isSensitive($intent);

        if ($sensitive && ! $sources) {
            $this->usage->refund($user); // nothing was generated
            $reply = array_merge($this->canned('no_verified_info', $intent, 'general_guidance'), [
                'actions' => [['type' => 'route', 'target' => 'guides', 'label' => __('ai.actions.browse_guides')]],
            ]);

            return $this->finish($conversation, $user, $reply, $this->usage->remaining($user));
        }

        try {
            $llm = $this->llm->complete(
                $this->prompts->system($locale, (bool) $sources),
                [...$history, ['role' => 'user', 'content' => $this->prompts->userTurn($message, $sources, $this->context->build($user))]],
            );
        } catch (Throwable $e) {
            report($e);
            $this->usage->refund($user);

            return $this->finish($conversation, $user, [
                'content' => __('ai.failure'),
                'label' => null,
                'intent' => $intent,
                'sources' => [],
                'actions' => [['type' => 'route', 'target' => 'search?q='.rawurlencode(mb_substr($message, 0, 100)), 'label' => __('ai.actions.search')]],
                'degraded' => true,
            ], $this->usage->remaining($user));
        }

        $processed = $this->processor->process($llm->text, array_column(array_column($sources, 'source'), 'url'), count($sources), implode("\n", array_merge(...array_column($sources, 'excerpts') ?: [[]])));
        $content = $processed['text'];
        // Sensitive topics always carry the disclaimer; so does any answer without a verified source, because the
        // keyword-based intent detector cannot recognise every sensitive phrasing.
        $disclaimer = ($sensitive || ! $sources) ? __('ai.disclaimers.'.($intent === 'health' ? 'health' : 'sensitive')) : null;

        return $this->finish($conversation, $user, [
            'content' => $content,
            'label' => $this->label($sources),
            'intent' => $intent,
            'sources' => $this->publicSources($sources),
            'actions' => $this->actions->suggest($intent, $message, $sources),
            'degraded' => false,
            'disclaimer' => $disclaimer,
            'tokens' => [$llm->inputTokens, $llm->outputTokens],
        ], $remaining);
    }

    /** official > third_party/verified_partner-only > general_guidance (institutional) > ai_explanation (no sources) */
    public function label(array $sources): string
    {
        if (! $sources) {
            return 'ai_explanation';
        }
        $types = collect($sources)->pluck('source.type');
        if ($types->contains(SourceType::Official->value)) {
            return 'official';
        }
        if ($types->contains(SourceType::Institutional->value)) {
            return 'general_guidance';
        }

        return 'third_party';
    }

    private function canned(string $key, string $intent, string $label): array
    {
        return ['content' => __("ai.$key"), 'label' => $label, 'intent' => $intent, 'sources' => [], 'actions' => [], 'degraded' => false, 'disclaimer' => null];
    }

    private function publicSources(array $sources): array
    {
        return array_map(fn ($s) => [
            'n' => $s['n'], 'title' => $s['title'], 'ref' => $s['ref'], 'source' => $s['source'],
        ], $sources);
    }

    private function finish(AiConversation $c, User $user, array $reply, int $remaining): array
    {
        $msg = $this->save($c, $user, 'assistant', $reply['content'], [
            'intent' => $reply['intent'], 'label' => $reply['label'], 'sources' => $reply['sources'],
            'actions' => $reply['actions'], 'degraded' => $reply['degraded'], 'disclaimer' => $reply['disclaimer'] ?? null,
            'input_tokens' => $reply['tokens'][0] ?? null, 'output_tokens' => $reply['tokens'][1] ?? null,
        ]);
        $c->touch();

        return ['conversation' => $c, 'message' => $msg, 'remaining' => $remaining];
    }

    private function save(AiConversation $c, User $user, string $role, string $content, array $extra = []): AiMessage
    {
        $m = new AiMessage(array_merge(['role' => $role, 'content' => $content], $extra));
        $m->user_id = $user->id;
        $m->ai_conversation_id = $c->id;
        $m->save();

        return $m;
    }

    private function newConversation(User $user, string $message, string $locale): AiConversation
    {
        $c = new AiConversation(['locale' => $locale, 'title' => mb_substr($message, 0, 60)]);
        $c->user_id = $user->id;
        $c->save();

        return $c;
    }

    /** @return list<array{role:string,content:string}> recent turns as plain text (no sources/metadata are replayed) */
    private function history(AiConversation $c): array
    {
        // reorder(): the relation already orders ascending; we need the NEWEST turns, then chronological.
        return $c->messages()->reorder('id', 'desc')->limit(config('ai.history_turns') * 2)->get()->reverse()
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])->values()->all();
    }
}
