<?php

namespace App\Domains\Notifications\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceToken extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return ['token' => 'string', 'last_used_at' => 'datetime'];
    }
}
