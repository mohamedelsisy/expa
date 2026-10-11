<?php

namespace App\Domains\DataImport\Models;

use Illuminate\Database\Eloquent\Model;

class DataImportRun extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'rejects' => 'array', 'source_published_at' => 'date', 'fetched_at' => 'datetime',
            'started_at' => 'datetime', 'finished_at' => 'datetime',
        ];
    }
}
