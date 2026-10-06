<?php

namespace App\Domains\Community\Models;

use App\Domains\Community\Concerns\IsCommunityPost;
use App\Domains\Geo\Models\City;
use App\Domains\Guides\Models\Guide;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Question extends Model
{
    use IsCommunityPost;

    protected $table = 'community_questions';

    protected $guarded = ['id', 'user_id', 'status', 'moderation_reason', 'moderated_by', 'moderated_at', 'flagged', 'shadowed', 'official_guide_id', 'accepted_answer_id', 'answers_count', 'votes_count'];

    protected function casts(): array
    {
        return ['flagged' => 'boolean', 'shadowed' => 'boolean', 'moderated_at' => 'datetime'];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function officialGuide(): BelongsTo
    {
        return $this->belongsTo(Guide::class, 'official_guide_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class, 'question_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'question_id');
    }

    /** @return list<string> */
    public function tagList(): array
    {
        return DB::table('community_question_tags')->where('question_id', $this->id)->orderBy('tag')->pluck('tag')->all();
    }

    public function refreshCounts(): void
    {
        $this->forceFill([
            'answers_count' => $this->answers()->public()->count(),
            'votes_count' => (int) DB::table('community_votes')->where('votable_type', 'question')->where('votable_id', $this->id)->count(),
        ])->saveQuietly();
    }
}
