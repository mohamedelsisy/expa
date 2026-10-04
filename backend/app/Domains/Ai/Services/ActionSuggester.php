<?php

namespace App\Domains\Ai\Services;

use App\Support\Text\TextNormalizer;

class ActionSuggester
{
    private const EXPIRY_WORDS = ['scadenza', 'scade', 'scadere', 'rinnovo', 'rinnovare', 'expire', 'expires', 'expiry', 'renew', 'renewal', 'انتهاء', 'تنتهي', 'تجديد', 'اجدد'];

    public function __construct(private TextNormalizer $normalizer) {}

    /**
     * @param  list<array>  $sources
     * @return list<array{type:string,target:string,label:string}>
     */
    public function suggest(string $intent, string $message, array $sources): array
    {
        $out = [];
        foreach ($sources as $s) {
            $out[] = ['type' => $s['ref']['type'] === 'guide' ? 'guide' : 'route', 'target' => $s['ref']['type'] === 'guide' ? $s['ref']['slug'] : $s['ref']['route'], 'label' => $s['title']];
        }

        $tokens = $this->normalizer->tokens($message);
        $mentionsExpiry = collect($tokens)->contains(fn ($t) => collect(self::EXPIRY_WORDS)->contains(fn ($w) => $this->normalizer->matches($t, $this->normalizer->normalize($w))));
        if ($mentionsExpiry && in_array($intent, ['immigration', 'documents'], true)) {
            $out[] = ['type' => 'route', 'target' => 'my-documents', 'label' => __('ai.actions.track_document')];
        }

        $byIntent = [
            'appointments' => ['appointments', 'appointments'],
            'learning' => ['learn-italian', 'learn_italian'],
            'jobs' => ['jobs', 'jobs'],
            'patente' => ['patente', 'patente'],
            'study' => ['study', 'study'],
        ];
        if (isset($byIntent[$intent])) {
            [$route, $key] = $byIntent[$intent];
            $out[] = ['type' => 'route', 'target' => $route, 'label' => __("ai.actions.$key")];
        }

        $seen = [];

        return array_slice(array_values(array_filter($out, function ($a) use (&$seen) {
            $k = $a['type'].':'.$a['target'];

            return ! isset($seen[$k]) && ($seen[$k] = true);
        })), 0, 4);
    }
}
