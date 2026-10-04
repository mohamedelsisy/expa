<?php

namespace App\Domains\Ai\Services;

use App\Domains\Ai\Models\KnowledgeChunk;
use Illuminate\Support\Collection;

/**
 * The only producer of citable sources. It drops anything without a name and an https URL, merges chunks of
 * the same item into one numbered source, and records freshness so stale material is visible to the user.
 */
class SourceVerifier
{
    private const ROUTE_PREFIX = [
        'guide' => 'guides', 'government_service' => 'government/services',
        'government_office' => 'government/offices', 'appointment_guide' => 'appointments/guides',
    ];

    /**
     * @param  Collection<int,array{chunk:KnowledgeChunk,score:float}>  $retrieved
     * @return list<array{n:int,title:string,type:string,ref:array,source:array,excerpts:list<string>}>
     */
    public function verify(Collection $retrieved): array
    {
        $byItem = [];
        foreach ($retrieved as $r) {
            $c = $r['chunk'];
            if (blank($c->source_name) || ! str_starts_with((string) $c->source_url, 'https://')) {
                continue;
            }
            $key = $c->item_type.':'.$c->item_id;
            $byItem[$key] ??= [
                'title' => $c->title,
                'type' => $c->item_type,
                'ref' => ['type' => $c->item_type, 'slug' => $c->item_slug, 'route' => (self::ROUTE_PREFIX[$c->item_type] ?? 'guides').'/'.$c->item_slug],
                'source' => [
                    'name' => $c->source_name,
                    'url' => $c->source_url,
                    'type' => $c->source_type->value,
                    'last_verified_at' => $c->last_verified_at?->toDateString(),
                    'freshness' => $this->freshness($c),
                ],
                'excerpts' => [],
            ];
            $byItem[$key]['excerpts'][] = $c->content;
        }

        $out = [];
        foreach (array_values($byItem) as $i => $s) {
            $out[] = ['n' => $i + 1] + $s;
        }

        return $out;
    }

    private function freshness(KnowledgeChunk $c): string
    {
        if (! $c->last_verified_at) {
            return 'unverified';
        }
        $days = $c->last_verified_at->diffInDays(now(), true);

        return match (true) {
            $days >= config('content.freshness.outdated_after_days') => 'outdated',
            $days >= config('content.freshness.stale_after_days') => 'stale',
            default => 'fresh',
        };
    }
}
