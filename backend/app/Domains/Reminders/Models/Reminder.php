<?php

namespace App\Domains\Reminders\Models;

use App\Casts\DateOnly;
use App\Domains\Documents\Models\UserDocument;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['remind_on' => DateOnly::class, 'dispatched_at' => 'datetime'];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(UserDocument::class, 'user_document_id');
    }
}
