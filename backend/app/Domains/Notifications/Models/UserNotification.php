<?php

namespace App\Domains\Notifications\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    use HasUuids;

    public const UPDATED_AT = null;

    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return ['data' => 'array', 'read_at' => 'datetime'];
    }
}
