<?php

namespace App\Domains\Jobs\Models;

use App\Domains\Geo\Models\City;
use App\Domains\Jobs\Enums\EmploymentType;
use App\Domains\Jobs\Enums\RemoteMode;
use App\Domains\Profile\Enums\CefrLevel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobListing extends Model
{
    protected $table = 'job_listings';

    protected $guarded = ['id', 'apply_clicks'];

    protected function casts(): array
    {
        return [
            'remote_mode' => RemoteMode::class, 'employment_type' => EmploymentType::class,
            'italian_level' => CefrLevel::class, 'english_level' => CefrLevel::class,
            'skills' => 'array', 'visa_sponsorship_stated' => 'boolean',
            'published_at' => 'datetime', 'expires_at' => 'datetime',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(JobSource::class, 'job_source_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /** Listed publicly: published, not past its expiry, and not older than the default lifetime when no expiry is given. */
    public function scopeListed(Builder $q): Builder
    {
        return $q->where('status', 'published')
            ->where(fn ($w) => $w->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }
}
