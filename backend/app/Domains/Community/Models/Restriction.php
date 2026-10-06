<?php

namespace App\Domains\Community\Models;

use Illuminate\Database\Eloquent\Model;

class Restriction extends Model
{
    protected $table = 'community_restrictions';

    protected $guarded = ['id', 'user_id', 'set_by'];

    protected function casts(): array
    {
        return ['shadow_banned' => 'boolean', 'muted_until' => 'datetime'];
    }

    public function isMuted(): bool
    {
        return $this->muted_until !== null && $this->muted_until->isFuture();
    }
}
