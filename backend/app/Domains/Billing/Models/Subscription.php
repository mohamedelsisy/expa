<?php

namespace App\Domains\Billing\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return [
            'current_period_start' => 'datetime', 'current_period_end' => 'datetime', 'canceled_at' => 'datetime',
            'trial_ends_at' => 'datetime', 'cancel_at_period_end' => 'boolean', 'past_due_since' => 'datetime', 'grace_ends_at' => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(SubscriptionItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /** Grants entitlements: active/trialing, or canceled-at-period-end until the period actually ends. */
    public function grantsAccess(): bool
    {
        if (! in_array($this->status, ['active', 'trialing', 'past_due'], true)) {
            return false;
        }

        // past_due is a grace period: access continues only until grace_ends_at (no end date = still in grace).
        if ($this->status === 'past_due' && $this->grace_ends_at && $this->grace_ends_at->isPast()) {
            return false;
        }

        return ! $this->current_period_end || $this->current_period_end->isFuture() || $this->status === 'past_due';
    }
}
