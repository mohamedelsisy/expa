<?php

namespace App\Domains\Documents\Contracts;

use App\Domains\Documents\Explainer\OcrResult;

/** Turns an already validated image/PDF into text. Implementations must not store the file or log its content. */
interface OcrEngine
{
    /** @param  string  $absolutePath  a private temp copy that the caller deletes */
    public function extract(string $absolutePath, string $mime): OcrResult;
}
