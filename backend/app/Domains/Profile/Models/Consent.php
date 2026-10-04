<?php

namespace App\Domains\Profile\Models;

use App\Domains\Profile\Enums\ConsentPurpose;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Append-only ledger: rows are never updated or deleted (except by account erasure). */
class Consent extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['purpose' => ConsentPurpose::class, 'granted' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
