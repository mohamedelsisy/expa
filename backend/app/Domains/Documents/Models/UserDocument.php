<?php

namespace App\Domains\Documents\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class UserDocument extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return [
            'label' => 'encrypted',
            'notes' => 'encrypted',
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'reminders_enabled' => 'boolean',
            'reminder_offsets' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(DocumentAttachment::class);
    }

    /** Whole days until expiry (negative = already expired); null when the document does not expire. */
    public function daysRemaining(?Carbon $today = null): ?int
    {
        if (! $this->expiry_date) {
            return null;
        }
        $today ??= now()->startOfDay();

        return (int) $today->diffInDays($this->expiry_date->copy()->startOfDay(), absolute: false);
    }

    /** valid | expiring_soon | expired | no_expiry */
    public function status(): string
    {
        $days = $this->daysRemaining();

        return match (true) {
            $days === null => 'no_expiry',
            $days < 0 => 'expired',
            $days <= config('documents.expiring_soon_days') => 'expiring_soon',
            default => 'valid',
        };
    }

    /** @return list<int> offsets in days, descending */
    public function effectiveOffsets(): array
    {
        $offsets = $this->reminder_offsets ?? config('documents.default_reminder_offsets');
        rsort($offsets);

        return array_values(array_unique(array_map('intval', $offsets)));
    }

    /** Display name: the user's own label if given, else the localized type name. */
    public function displayName(): string
    {
        return $this->label ?: (string) $this->type->localized('name');
    }
}
