<?php

namespace App\Domains\Community\Models;

use App\Domains\Community\Concerns\IsCommunityPost;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Answer extends Model
{
    use IsCommunityPost;

    protected $table = 'community_answers';

    protected $guarded = ['id', 'user_id', 'question_id', 'status', 'moderation_reason', 'moderated_by', 'moderated_at', 'flagged', 'shadowed', 'votes_count'];

    protected function casts(): array
    {
        return ['flagged' => 'boolean', 'shadowed' => 'boolean', 'moderated_at' => 'datetime'];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function refreshCounts(): void
    {
        $this->forceFill(['votes_count' => (int) DB::table('community_votes')->where('votable_type', 'answer')->where('votable_id', $this->id)->count()])->saveQuietly();
    }
}
