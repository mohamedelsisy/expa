<?php

namespace App\Domains\Ai\Services;

class ResponseProcessor
{
    /** Characters that may trail a URL in prose/markdown/Arabic/typographic punctuation and are not part of it. */
    private const TRAILING = ".,;:!?)]}\"'*_`~>»”’،؛؟…";

    /** Bare domains (no scheme) with a recognised TLD, optionally with a path. */
    private const BARE_DOMAIN = '~(?<![\w@./-])(?:[a-z0-9][a-z0-9-]*\.)+(?:it|com|org|net|eu|info|gov|edu|io|me|co|app|xyz|online|site|biz)\b(?:/[^\s<>"\')\]]*)?~iu';

    /**
     * Enforces "never invent URLs / contacts / citations" on whatever the model returned:
     *  - any link that is not one of the verified source URLs is removed (http(s), www., bare domains,
     *    javascript:/data:/vbscript:/mailto:/tel: schemes)
     *  - phone-number-like sequences that do not appear in the provided sources are removed
     *  - [n] markers that do not map to a provided source are removed
     *
     * @param  list<string>  $allowedUrls
     * @param  string  $sourceText  concatenated source excerpts: phone numbers are only allowed if quoted from here
     * @return array{text:string,cited:list<int>}
     */
    public function process(string $text, array $allowedUrls, int $sourceCount, string $sourceText = ''): array
    {
        $allowed = array_map(fn ($u) => $this->key($u), $allowedUrls);
        $marker = __('ai.link_removed');

        // 1) dangerous / unverifiable schemes
        $text = preg_replace('~\b(?:javascript|data|vbscript|mailto|tel|file|ftp):[^\s<>"\')\]]*~i', $marker, $text) ?? $text;

        // 2) http(s) and www URLs
        $text = preg_replace_callback('~(?:https?://|www\.)[^\s<>"\']+~iu', function ($m) use ($allowed, $marker) {
            [$url, $trail] = $this->splitTrailing($m[0]);

            return in_array($this->key($url), $allowed, true) ? $m[0] : $marker.$trail;
        }, $text) ?? $text;

        // 3) bare domains such as questure.example.it/path (skip the marker text itself)
        $text = preg_replace_callback(self::BARE_DOMAIN, function ($m) use ($allowed, $marker) {
            [$url, $trail] = $this->splitTrailing($m[0]);

            return in_array($this->key($url), $allowed, true) || $this->isAllowedHostOnly($url, $allowed) ? $m[0] : $marker.$trail;
        }, $text) ?? $text;

        // 4) phone numbers that the sources do not contain
        $sourceDigits = preg_replace('/\D+/', '', $sourceText);
        $text = preg_replace_callback('/(?<![\w])\+?\d[\d\s().\-]{6,}\d/u', function ($m) use ($sourceDigits) {
            $digits = preg_replace('/\D+/', '', $m[0]);
            $isDate = preg_match('~^\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\s*$~', $m[0]);
            if ($isDate || strlen($digits) < 8 || strlen($digits) > 15) {
                return $m[0]; // dates, amounts, years, ids: not phone numbers
            }

            return str_contains($sourceDigits, $digits) ? $m[0] : __('ai.contact_removed');
        }, $text) ?? $text;

        // 5) citations must point at a real source
        $cited = [];
        $text = preg_replace_callback('/\[(\d{1,2})\]/', function ($m) use ($sourceCount, &$cited) {
            $n = (int) $m[1];
            if ($n >= 1 && $n <= $sourceCount) {
                $cited[$n] = true;

                return $m[0];
            }

            return '';
        }, $text) ?? $text;

        $text = trim(preg_replace('/[ \t]{2,}/', ' ', $text) ?? $text);

        return ['text' => mb_substr($text, 0, 6000), 'cited' => array_keys($cited)];
    }

    /** @return array{0:string,1:string} url without trailing prose punctuation, and that punctuation */
    private function splitTrailing(string $url): array
    {
        $trail = '';
        while ($url !== '' && mb_strpos(self::TRAILING, mb_substr($url, -1)) !== false) {
            $trail = mb_substr($url, -1).$trail;
            $url = mb_substr($url, 0, -1);
        }

        return [$url, $trail];
    }

    /** Scheme-less, "www."-less, trailing-slash-less, lower-cased form used to compare URLs. */
    private function key(string $url): string
    {
        $u = mb_strtolower(preg_replace('~^https?://(www\.)?~i', '', trim($url)) ?? $url);

        return rtrim(preg_replace('~^www\.~', '', $u) ?? $u, '/');
    }

    /** "poliziadistato.it" alone is fine when a verified URL on that host exists. */
    private function isAllowedHostOnly(string $bare, array $allowed): bool
    {
        if (str_contains($bare, '/')) {
            return false;
        }
        foreach ($allowed as $a) {
            if (explode('/', $a)[0] === $this->key($bare)) {
                return true;
            }
        }

        return false;
    }
}
