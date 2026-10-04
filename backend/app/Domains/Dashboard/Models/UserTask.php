<?php

namespace App\Domains\Dashboard\Models;

use Illuminate\Database\Eloquent\Model;

class UserTask extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }
}
