<?php

namespace App\Domains\Ai\Contracts;

use App\Domains\Ai\Services\LlmException;
use App\Domains\Ai\Services\LlmResponse;

interface LlmClient
{
    /**
     * @param  list<array{role:'user'|'assistant',content:string}>  $messages
     *
     * @throws LlmException on any provider/transport failure or timeout
     */
    public function complete(string $system, array $messages): LlmResponse;
}
