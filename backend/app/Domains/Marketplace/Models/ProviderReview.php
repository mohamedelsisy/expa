<?php

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProviderReview extends Model
{
    protected $guarded = ['id', 'service_provider_id', 'user_id', 'status', 'moderated_by', 'moderated_at', 'moderation_reason', 'provider_reply_status'];

    protected function casts(): array
    {
        return ['moderated_at' => 'datetime', 'provider_reply_at' => 'datetime'];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class, 'service_provider_id');
    }
}
