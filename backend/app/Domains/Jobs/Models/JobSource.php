<?php

namespace App\Domains\Jobs\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobSource extends Model
{
    use Auditable;

    /** Config holds URLs/tokens: never written to the audit trail. */
    protected array $auditExcept = ['config'];

    protected $guarded = ['id', 'last_run_at', 'last_status', 'consecutive_failures'];

    /** Mirror the column defaults so freshly created instances behave like loaded ones. */
    protected $attributes = ['active' => false, 'schedule_hours' => 6, 'consecutive_failures' => 0];

    protected function casts(): array
    {
        // Config may hold URLs with tokens/headers: encrypted at rest, never returned by the API.
        return ['config' => 'encrypted:array', 'active' => 'boolean', 'last_run_at' => 'datetime'];
    }

    public function runs(): HasMany
    {
        return $this->hasMany(JobImportRun::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(JobListing::class);
    }

    public function isDue(): bool
    {
        return $this->active && (! $this->last_run_at || $this->last_run_at->lte(now()->subHours($this->schedule_hours ?: config('jobs.default_schedule_hours'))));
    }
}
