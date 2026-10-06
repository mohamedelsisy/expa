<?php

namespace App\Domains\Community\Models;

use App\Domains\Community\Concerns\IsCommunityPost;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use IsCommunityPost;

    protected $table = 'community_comments';

    protected $guarded = ['id', 'user_id', 'question_id', 'answer_id', 'status', 'moderation_reason', 'moderated_by', 'moderated_at', 'flagged', 'shadowed'];

    protected function casts(): array
    {
        return ['flagged' => 'boolean', 'shadowed' => 'boolean', 'moderated_at' => 'datetime'];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
