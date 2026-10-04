<?php

namespace App\Domains\Jobs\Models;

use Illuminate\Database\Eloquent\Model;

class JobProfile extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return ['skills' => 'array', 'employment_types' => 'array'];
    }
}
