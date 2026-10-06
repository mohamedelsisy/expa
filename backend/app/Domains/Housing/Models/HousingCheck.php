<?php

namespace App\Domains\Housing\Models;

use Illuminate\Database\Eloquent\Model;

/** A result the user explicitly chose to save. Contains findings only, never the pasted listing text. */
class HousingCheck extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return ['label' => 'encrypted', 'result' => 'encrypted:array', 'expires_at' => 'datetime'];
    }
}
