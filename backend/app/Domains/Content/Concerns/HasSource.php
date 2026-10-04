<?php

namespace App\Domains\Content\Concerns;

use App\Enums\SourceType;

/**
 * Columns (see Blueprint::sourceFields): source_name, source_url, source_type, last_verified_at.
 * Official/legal information must be traceable and its age must be visible.
 */
trait HasSource
{
    public function initializeHasSource(): void
    {
        $this->casts['source_type'] = SourceType::class;
        $this->casts['last_verified_at'] = 'datetime';
    }

    /** fresh | stale | outdated | unverified */
    public function freshness(): string
    {
        if (! $this->last_verified_at) {
            return 'unverified';
        }

        $days = $this->last_verified_at->diffInDays(now(), absolute: true);

        return match (true) {
            $days >= config('content.freshness.outdated_after_days') => 'outdated',
            $days >= config('content.freshness.stale_after_days') => 'stale',
            default => 'fresh',
        };
    }

    public function sourcePayload(): array
    {
        return [
            'name' => $this->source_name,
            'url' => $this->source_url,
            'type' => $this->source_type?->value,
            'last_verified_at' => $this->last_verified_at?->toDateString(),
            'freshness' => $this->freshness(),
        ];
    }
}
