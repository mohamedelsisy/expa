<?php

namespace App\Domains\Search\Models;

use Illuminate\Database\Eloquent\Model;

class SearchDocument extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }
}
