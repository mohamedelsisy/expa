<?php

namespace App\Domains\Moderation\Services;

use App\Exceptions\ApiException;
use Illuminate\Support\Facades\DB;

/**
 * Shared anti-abuse text pipeline for user-generated content.
 *  - strips HTML, control characters and runs of blank lines; enforces length;
 *  - non-https links are removed (and the text flagged), https links are allowed up to a limit;
 *  - URL shorteners are rejected (`link_not_allowed`);
 *  - duplicate detection by hash of the normalised text.
 */
class ContentSanitizer
{
    private const URL_PATTERN = '~(?:https?://|www\.)[^\s<>"\')\]]+~iu';

    /** @return array{text:string,flagged:bool,links:list<string>,hash:string} */
    public function clean(string $text, int $min, int $max): array
    {
        $text = strip_tags($text);
        // Markdown link/image targets must be http(s), mailto, tel, relative or an anchor: `[x](javascript:...)` and
        // `[x](data:...)` are neutralised in case a client renders this text as markdown.
        $text = preg_replace('/\]\(\s*(?!https?:|mailto:|tel:|\/|#|\.)[a-z][a-z0-9+.\-]*:[^)]*\)/i', '](#)', $text) ?? '';
        $text = preg_replace('/^\s*\[[^\]]+\]:\s*(?!https?:|mailto:|tel:|\/|#|\.)[a-z][a-z0-9+.\-]*:\S*/im', '', $text) ?? ''; // reference-style definitions
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text) ?? '';
        $text = preg_replace("/\r\n?/", "\n", $text) ?? '';
        $text = trim(preg_replace("/\n{3,}/", "\n\n", $text) ?? '');

        $flagged = false;
        $links = [];
        $text = preg_replace_callback(self::URL_PATTERN, function (array $m) use (&$flagged, &$links) {
            $url = rtrim($m[0], '.,;:!?');
            $tail = substr($m[0], strlen($url));
            $host = strtolower((string) parse_url(str_starts_with($url, 'www.') ? 'http://'.$url : $url, PHP_URL_HOST));
            foreach (config('moderation.blocked_link_hosts') as $blocked) {
                if ($host === $blocked || str_ends_with($host, '.'.$blocked)) {
                    throw new ApiException('link_not_allowed', __('moderation.link_not_allowed'), 422);
                }
            }
            $flagged = true;
            if (! str_starts_with(strtolower($url), 'https://')) {
                return '[link removed]'.$tail; // plain http or scheme-less: never kept
            }
            $links[] = $url;

            return $url.$tail;
        }, $text) ?? $text;

        if (count($links) > (int) config('moderation.max_links')) {
            throw new ApiException('too_many_links', __('moderation.too_many_links', ['max' => config('moderation.max_links')]), 422);
        }
        $len = mb_strlen($text);
        if ($len < $min || $len > $max) {
            throw new ApiException('invalid_length', __('moderation.invalid_length', ['min' => $min, 'max' => $max]), 422);
        }

        return ['text' => $text, 'flagged' => $flagged, 'links' => $links, 'hash' => $this->hash($text)];
    }

    public function hash(string $text): string
    {
        return hash('sha256', mb_strtolower(preg_replace('/\s+/u', ' ', trim($text)) ?? ''));
    }

    /** True when the same text was already stored in `$table.$column` within the duplicate window (any author). */
    public function isDuplicate(string $table, string $hash, string $hashColumn = 'content_hash'): bool
    {
        return DB::table($table)->where($hashColumn, $hash)
            ->where('created_at', '>=', now()->subHours((int) config('moderation.duplicate_window_hours')))->exists();
    }

    public function assertNotDuplicate(string $table, string $hash, string $hashColumn = 'content_hash'): void
    {
        if ($this->isDuplicate($table, $hash, $hashColumn)) {
            throw new ApiException('duplicate_content', __('moderation.duplicate_content'), 422);
        }
    }
}
