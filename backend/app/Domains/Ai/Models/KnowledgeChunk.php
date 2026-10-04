<?php

namespace App\Domains\Ai\Models;

use App\Enums\SourceType;
use Illuminate\Database\Eloquent\Model;

class KnowledgeChunk extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['source_type' => SourceType::class, 'last_verified_at' => 'datetime'];
    }
}
