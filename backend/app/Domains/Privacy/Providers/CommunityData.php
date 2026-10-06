<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Community\Models\Answer;
use App\Domains\Community\Models\Comment;
use App\Domains\Community\Models\Question;
use App\Domains\Community\Models\Restriction;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Community data of a person. Export: everything they wrote (any status, including soft-deleted by themselves),
 * their votes, blocks and any moderation restriction. Erasure ANONYMISES authored content: the author link is removed
 * and the thread stays intact (answers other people rely on keep making sense); votes, blocks and restrictions are deleted.
 * Free text can contain personal data typed by the author: the author can delete individual posts beforehand, and
 * `community.erase_text` (default off) additionally blanks the text of their posts on erasure.
 */
class CommunityData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'community';
    }

    public function export(User $user): array
    {
        $own = fn ($class) => $class::withTrashed()->where('user_id', $user->id)->orderBy('id');

        return [
            'questions' => $own(Question::class)->get()->map(fn ($q) => ['title' => $q->title, 'body' => $q->body, 'topic' => $q->topic, 'status' => $q->status, 'created_at' => $q->created_at?->toIso8601String(), 'deleted_by_you' => $q->trashed()])->all(),
            'answers' => $own(Answer::class)->get()->map(fn ($a) => ['question_id' => $a->question_id, 'body' => $a->body, 'status' => $a->status, 'created_at' => $a->created_at?->toIso8601String(), 'deleted_by_you' => $a->trashed()])->all(),
            'comments' => $own(Comment::class)->get()->map(fn ($c) => ['question_id' => $c->question_id, 'body' => $c->body, 'status' => $c->status, 'created_at' => $c->created_at?->toIso8601String(), 'deleted_by_you' => $c->trashed()])->all(),
            'votes_count' => DB::table('community_votes')->where('user_id', $user->id)->count(),
            'blocked_members_count' => DB::table('community_blocks')->where('user_id', $user->id)->count(),
            'restriction' => ($r = Restriction::where('user_id', $user->id)->first()) ? ['shadow_banned' => $r->shadow_banned, 'muted_until' => $r->muted_until?->toIso8601String(), 'reason' => $r->reason] : null,
        ];
    }

    public function erase(User $user): void
    {
        $blank = config('community.erase_text');
        foreach ([Question::class, Answer::class, Comment::class] as $class) {
            $q = $class::withTrashed()->where('user_id', $user->id);
            $q->update($blank ? ['user_id' => null, 'body' => '[deleted]', 'content_hash' => hash('sha256', 'deleted')] : ['user_id' => null]);
        }
        $voted = DB::table('community_votes')->where('user_id', $user->id)->get();
        DB::table('community_votes')->where('user_id', $user->id)->delete();
        foreach ($voted as $v) {
            $item = ['question' => Question::class, 'answer' => Answer::class][$v->votable_type]::find($v->votable_id);
            $item?->refreshCounts();
        }
        DB::table('community_blocks')->where('user_id', $user->id)->orWhere('blocked_user_id', $user->id)->delete();
        Restriction::where('user_id', $user->id)->delete();
    }
}
