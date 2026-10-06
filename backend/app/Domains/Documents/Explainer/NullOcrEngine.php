<?php

namespace App\Domains\Documents\Explainer;

use App\Domains\Documents\Contracts\OcrEngine;

/** Default: no OCR on this server. The client is told and falls back to pasting the text. */
class NullOcrEngine implements OcrEngine
{
    public function extract(string $absolutePath, string $mime): OcrResult
    {
        return new OcrResult(OcrResult::UNAVAILABLE);
    }
}
