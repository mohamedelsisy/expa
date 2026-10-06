<?php

namespace App\Domains\Reminders\Models;

use App\Casts\DateOnly;
use App\Domains\Documents\Models\UserDocument;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $guarded = ['id'];

    /** After this many failed deliveries a reminder stops retrying and is left as `failed` (visible to admins). */
    public const MAX_ATTEMPTS = 5;

    /** A `dispatched` reminder with no `notified_at` for this long is assumed lost (worker killed) and re-queued. */
    public const STALE_AFTER_MINUTES = 90;

    public function releaseForRetry(): void
    {
        $attempts = $this->attempts + 1;
        $this->forceFill([
            'attempts' => $attempts,
            'status' => $attempts >= self::MAX_ATTEMPTS ? 'failed' : 'pending',
            'dispatched_at' => null,
        ])->save();
    }

    protected function casts(): array
    {
        return ['remind_on' => DateOnly::class, 'dispatched_at' => 'datetime', 'notified_at' => 'datetime'];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(UserDocument::class, 'user_document_id');
    }
}
