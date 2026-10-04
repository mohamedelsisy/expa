<?php

namespace App\Domains\Jobs\Models;

use Illuminate\Database\Eloquent\Model;

class JobImportRun extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['error_samples' => 'array', 'started_at' => 'datetime', 'finished_at' => 'datetime'];
    }
}
