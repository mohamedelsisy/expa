<?php

namespace App\Domains\Documents\Explainer;

/** Data minimisation before text leaves for the LLM: direct identifiers are replaced, dates and amounts are kept. */
class TextRedactor
{
    public function redact(string $text): string
    {
        $mark = '[redacted]';
        $text = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/iu', $mark, $text) ?? $text;
        $text = preg_replace('/\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,4})?\b/u', $mark, $text) ?? $text;           // IBAN
        $text = preg_replace('/\b[A-Za-z]{6}\d{2}[A-Za-z]\d{2}[A-Za-z]\d{3}[A-Za-z]\b/u', $mark, $text) ?? $text;                 // codice fiscale
        $text = preg_replace_callback('/(?<![\w])\+?\d[\d\s().\-]{7,}\d/u', function ($m) use ($mark) {
            if (preg_match('~^\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\s*$~', $m[0])) {
                return $m[0]; // a date
            }

            return strlen(preg_replace('/\D/', '', $m[0])) >= 9 ? $mark : $m[0];
        }, $text) ?? $text;

        return preg_replace('/\b\d{9,}\b/u', $mark, $text) ?? $text;
    }
}
