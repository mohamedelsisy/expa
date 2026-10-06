<?php

namespace App\Domains\Documents\Explainer;

final class OcrResult
{
    public const OK = 'ok';

    public const UNAVAILABLE = 'ocr_unavailable';

    public const FAILED = 'ocr_failed';

    public const EMPTY = 'ocr_empty';

    public function __construct(public readonly string $status, public readonly string $text = '') {}

    public static function ok(string $text): self
    {
        return new self(self::OK, $text);
    }

    public function isOk(): bool
    {
        return $this->status === self::OK;
    }
}
