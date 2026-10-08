<?php

namespace App\Domains\TwoFactor\Models;

use Illuminate\Database\Eloquent\Model;

class RecoveryCode extends Model
{
    protected $table = 'user_recovery_codes';

    protected $guarded = [];

    protected $hidden = ['code_hash'];

    protected function casts(): array
    {
        return ['used_at' => 'datetime'];
    }
}
