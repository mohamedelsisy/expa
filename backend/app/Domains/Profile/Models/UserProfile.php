<?php

namespace App\Domains\Profile\Models;

use App\Domains\Profile\Enums\AgeRange;
use App\Domains\Profile\Enums\CefrLevel;
use App\Domains\Profile\Enums\ResidenceType;
use App\Domains\Profile\Enums\Segment;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return [
            // Immigration-related attributes are special-risk data: encrypted at rest, never queried in SQL.
            'nationality' => 'encrypted',
            'residence_type' => 'encrypted',
            'segment' => Segment::class,
            'age_range' => AgeRange::class,
            'italian_level' => CefrLevel::class,
            'english_level' => CefrLevel::class,
            'goals' => 'array',
            'onboarding_skipped' => 'array',
            'onboarding_completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function residenceType(): ?ResidenceType
    {
        return $this->residence_type ? ResidenceType::tryFrom($this->residence_type) : null;
    }
}
