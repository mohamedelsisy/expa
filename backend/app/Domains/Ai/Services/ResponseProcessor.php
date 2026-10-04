<?php

namespace App\Domains\Ai\Services;

class ResponseProcessor
{
    /**
     * Enforces "never invent URLs / never fabricate citations" on whatever the model returned:
     *  - any URL that is not one of the verified source URLs is removed
     *  - [n] markers that do not map to a provided source are removed
     *
     * @param  list<string>  $allowedUrls
     * @return array{text:string,cited:list<int>,removed_urls:int}
     */
    public function process(string $text, array $allowedUrls, int $sourceCount): array
    {
        $allowed = array_map(fn ($u) => rtrim($u, '/'), $allowedUrls);
        $removed = 0;

        $text = preg_replace_callback('~(?:https?://|www\.)[^\s<>\)\]"\']+~iu', function ($m) use ($allowed, &$removed) {
            $url = $m[0];
            $trail = '';
            while ($url !== '' && str_contains('.,;:!?', substr($url, -1))) {
                $trail = substr($url, -1).$trail;
                $url = substr($url, 0, -1);
            }
            if (in_array(rtrim($url, '/'), $allowed, true)) {
                return $m[0];
            }
            $removed++;

            return __('ai.link_removed').$trail;
        }, $text) ?? $text;

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

        return ['text' => mb_substr($text, 0, 6000), 'cited' => array_keys($cited), 'removed_urls' => $removed];
    }
}
