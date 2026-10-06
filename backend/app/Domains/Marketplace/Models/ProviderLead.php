<?php

namespace App\Domains\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProviderLead extends Model
{
    protected $guarded = ['id', 'service_provider_id', 'user_id', 'status'];

    protected function casts(): array
    {
        return [
            'message' => 'encrypted', 'contact_name' => 'encrypted', 'contact_email' => 'encrypted', 'contact_phone' => 'encrypted',
            'consent_given_at' => 'datetime', 'seen_at' => 'datetime',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class, 'service_provider_id');
    }
}
