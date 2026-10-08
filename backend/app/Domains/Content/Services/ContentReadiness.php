<?php

namespace App\Domains\Content\Services;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobSource;
use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Operational "is the content real and current?" report. Counts only: it never reads or exposes content bodies.
 * A type is `ready` only when something is published AND no published row lacks verification or has gone stale
 * (for types that must carry a source). Nothing here seeds or invents official data.
 */
class ContentReadiness
{
    /** @return array{generated_at:string,stale_after_days:int,types:array<int,array<string,mixed>>,jobs:array<string,mixed>,totals:array<string,int>} */
    public function report(): array
    {
        $types = collect(config('content.models'))->map(fn (string $class) => $this->forModel($class))->values()->all();

        return [
            'generated_at' => now()->toIso8601String(),
            'stale_after_days' => (int) config('content.freshness.stale_after_days'),
            'types' => $types,
            'jobs' => $this->jobs(),
            'totals' => [
                'published' => array_sum(array_column($types, 'published')),
                'draft' => array_sum(array_column($types, 'draft')),
                'review' => array_sum(array_column($types, 'review')),
                'stale' => array_sum(array_column($types, 'stale')),
                'unverified' => array_sum(array_column($types, 'unverified')),
            ],
        ];
    }

    /** @param  class-string<Model>  $class */
    public function forModel(string $class): array
    {
        /** @var Model $probe */
        $probe = new $class;
        $table = $probe->getTable();
        $counts = $class::query()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $hasSource = Schema::hasColumn($table, 'last_verified_at');
        $requiresSource = $probe->requiresSource();

        $stale = $unverified = 0;
        if ($hasSource) {
            $published = fn () => $class::query()->where('status', ContentStatus::Published->value);
            $unverified = $published()->whereNull('last_verified_at')->count();
            $stale = $published()->where('last_verified_at', '<', now()->subDays((int) config('content.freshness.stale_after_days')))->count();
        }
        $pub = (int) ($counts[ContentStatus::Published->value] ?? 0);

        return [
            'type' => Str::snake(class_basename($class)),
            'requires_source' => $requiresSource,
            'draft' => (int) ($counts[ContentStatus::Draft->value] ?? 0),
            'review' => (int) ($counts[ContentStatus::Review->value] ?? 0),
            'approved' => (int) ($counts[ContentStatus::Approved->value] ?? 0),
            'published' => $pub,
            'archived' => (int) ($counts[ContentStatus::Archived->value] ?? 0),
            'stale' => $stale,
            'unverified' => $unverified,
            'ready' => $pub > 0 && (! $requiresSource || ($stale === 0 && $unverified === 0)),
        ];
    }

    /** Job ingestion readiness: every active source must document a legal basis; failing sources are surfaced. */
    private function jobs(): array
    {
        return [
            'sources_total' => JobSource::count(),
            'sources_active' => JobSource::where('active', true)->count(),
            'active_without_legal_basis' => JobSource::where('active', true)->where(fn ($q) => $q->whereNull('legal_basis')->orWhereRaw('length(trim(legal_basis)) < 20'))->count(),
            'sources_failing' => JobSource::where('consecutive_failures', '>', 0)->count(),
            'listings_listed' => JobListing::listed()->count(),
        ];
    }
}
