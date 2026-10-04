<?php

namespace App\Domains\Ai\Models;

use Illuminate\Database\Eloquent\Model;

class AiMessage extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = ['id', 'user_id', 'ai_conversation_id'];

    protected function casts(): array
    {
        return ['content' => 'encrypted', 'sources' => 'array', 'actions' => 'array', 'degraded' => 'boolean'];
    }
}
