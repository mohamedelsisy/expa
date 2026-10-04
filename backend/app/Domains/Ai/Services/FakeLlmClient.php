<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Contracts\LlmClient;

/**
 * Deterministic client for tests and credential-less local development. It never invents content:
 * by default it only points at the sources it was given.
 */
class FakeLlmClient implements LlmClient
{
    /** @var list<array{system:string,messages:array}> every request received, for assertions */
    public array $calls = [];

    /** @var list<string|\Closure|\Throwable> queued replies, consumed in order */
    private array $queue = [];

    public function push(string|\Closure|\Throwable $reply): static
    {
        $this->queue[] = $reply;

        return $this;
    }

    public function complete(string $system, array $messages): LlmResponse
    {
        $this->calls[] = compact('system', 'messages');
        $reply = array_shift($this->queue);

        if ($reply instanceof \Throwable) {
            throw $reply;
        }
        if ($reply instanceof \Closure) {
            $reply = $reply($system, $messages);
        }
        if ($reply === null) {
            $has = preg_match('/<source id="1"/', end($messages)['content'] ?? '');
            $reply = $has ? 'This is covered in the verified sources [1].' : 'I can help with that in general terms.';
        }

        return new LlmResponse($reply, 100, 50);
    }
}
