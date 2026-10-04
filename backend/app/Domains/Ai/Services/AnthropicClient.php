<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Contracts\LlmClient;
use Illuminate\Support\Facades\Http;
use Throwable;

class AnthropicClient implements LlmClient
{
    public function complete(string $system, array $messages): LlmResponse
    {
        $cfg = config('ai.anthropic');
        if (blank($cfg['api_key'])) {
            throw new LlmException('ANTHROPIC_API_KEY is not configured.');
        }

        try {
            $res = Http::withHeaders(['x-api-key' => $cfg['api_key'], 'anthropic-version' => $cfg['version']])
                ->timeout(config('ai.timeout_seconds'))->acceptJson()
                ->post(rtrim($cfg['base_url'], '/').'/v1/messages', [
                    'model' => $cfg['model'],
                    'max_tokens' => config('ai.max_output_tokens'),
                    'system' => $system,
                    'messages' => $messages,
                ]);
        } catch (Throwable $e) {
            throw new LlmException('LLM transport failure: '.$e::class, 0, $e); // never include request data
        }

        if (! $res->successful()) {
            throw new LlmException('LLM provider returned HTTP '.$res->status());
        }

        $text = collect($res->json('content', []))->where('type', 'text')->pluck('text')->implode("\n");
        if (trim($text) === '') {
            throw new LlmException('LLM returned an empty answer.');
        }

        return new LlmResponse($text, $res->json('usage.input_tokens'), $res->json('usage.output_tokens'));
    }
}
