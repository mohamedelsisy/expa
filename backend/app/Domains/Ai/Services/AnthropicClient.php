<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Contracts\LlmClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Anthropic Messages API over HTTPS (no SDK). Hardening:
 *  - credentials only from config/env; refuses to run without a key or with a non-https base URL
 *  - hard timeout, bounded retries with backoff on transient failures only (connection, 429, 5xx)
 *  - output capped by `max_tokens`; input capped by `max_input_chars` (oldest history dropped first)
 *  - optional global daily token budget (`daily_token_budget`, 0 = off) as a cost circuit breaker
 *  - exceptions carry only a class name / HTTP status: never the prompt, the answer, the key or the previous exception
 *    (its trace could contain argument fragments), so nothing user-written can reach the logs from here
 * Callers (AiAssistant) turn LlmException into the localized fallback answer and refund the user's quota.
 */
class AnthropicClient implements LlmClient
{
    public function complete(string $system, array $messages): LlmResponse
    {
        $cfg = config('ai.anthropic');
        if (blank($cfg['api_key'])) {
            throw new LlmException('ANTHROPIC_API_KEY is not configured.');
        }
        $base = rtrim((string) $cfg['base_url'], '/');
        $host = (string) parse_url($base, PHP_URL_HOST);
        if (! str_starts_with($base, 'https://') && ! in_array($host, ['localhost', '127.0.0.1'], true)) {
            throw new LlmException('ANTHROPIC_BASE_URL must be https.');
        }
        if ($this->budgetExhausted()) {
            throw new LlmException('Daily AI token budget exhausted.');
        }

        try {
            $res = Http::withHeaders(['x-api-key' => $cfg['api_key'], 'anthropic-version' => $cfg['version']])
                ->connectTimeout(min(5, (int) config('ai.timeout_seconds')))->timeout((int) config('ai.timeout_seconds'))->acceptJson()
                ->retry(
                    max(1, (int) config('ai.retries', 2) + 1),
                    (int) config('ai.retry_sleep_ms', 400),
                    fn ($e) => $e instanceof ConnectionException || ($e instanceof RequestException && ($e->response->serverError() || $e->response->status() === 429)),
                    throw: false,
                )
                ->post($base.'/v1/messages', [
                    'model' => $cfg['model'],
                    'max_tokens' => (int) config('ai.max_output_tokens'),
                    'system' => $system,
                    'messages' => $this->capInput($system, $messages),
                ]);
        } catch (Throwable $e) {
            throw new LlmException('LLM transport failure: '.$e::class); // no previous exception, no request data
        }

        if (! $res->successful()) {
            throw new LlmException('LLM provider returned HTTP '.$res->status());
        }

        $text = collect($res->json('content', []))->where('type', 'text')->pluck('text')->implode("\n");
        if (trim($text) === '') {
            throw new LlmException('LLM returned an empty answer.');
        }
        $in = $res->json('usage.input_tokens');
        $out = $res->json('usage.output_tokens');
        $this->spend((int) $in + (int) $out);

        return new LlmResponse($text, $in, $out);
    }

    /** Drops the oldest turns until the prompt fits `max_input_chars`; the last (current) user turn is always kept. */
    private function capInput(string $system, array $messages): array
    {
        $max = (int) config('ai.max_input_chars', 24000);
        $size = fn (array $m) => mb_strlen($system) + array_sum(array_map(fn ($x) => mb_strlen($x['content']), $m));
        while (count($messages) > 1 && $size($messages) > $max) {
            array_shift($messages);
            // a conversation must start with a user turn
            while (count($messages) > 1 && ($messages[0]['role'] ?? 'user') !== 'user') {
                array_shift($messages);
            }
        }

        return array_values($messages);
    }

    private function budgetKey(): string
    {
        return 'ai:tokens:'.now()->format('Y-m-d');
    }

    private function budgetExhausted(): bool
    {
        $budget = (int) config('ai.daily_token_budget', 0);

        return $budget > 0 && (int) Cache::get($this->budgetKey(), 0) >= $budget;
    }

    private function spend(int $tokens): void
    {
        if ((int) config('ai.daily_token_budget', 0) > 0 && $tokens > 0) {
            Cache::add($this->budgetKey(), 0, now()->addDay());
            Cache::increment($this->budgetKey(), $tokens);
        }
    }
}
