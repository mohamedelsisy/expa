<?php

namespace App\Domains\Ai\Services;

final class LlmResponse
{
    public function __construct(public readonly string $text, public readonly ?int $inputTokens = null, public readonly ?int $outputTokens = null) {}
}
