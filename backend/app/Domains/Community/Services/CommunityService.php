<?php

namespace App\Domains\Community\Services;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Community\Models\Answer;
use App\Domains\Community\Models\Comment;
use App\Domains\Community\Models\Question;
use App\Domains\Community\Models\Restriction;
use App\Domains\Moderation\Services\ContentSanitizer;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Posting rules (anti-abuse), votes, accepted answer and moderation actions. */
class CommunityService
{
    public function __construct(private ContentSanitizer $text, private AuditLogger $audit) {}

    public static function modelFor(string $type): string
    {
        return ['question' => Question::class, 'answer' => Answer::class, 'comment' => Comment::class][$type] ?? throw new ApiException('not_found', __('moderation.not_found'), 404);
    }

    public function restriction(User $user): ?Restriction
    {
        return Restriction::where('user_id', $user->id)->first();
    }

    // ---- creating content --------------------------------------------------------------------

    public function createQuestion(User $user, array $d): Question
    {
        $cfg = config('community.limits');
        $title = $this->text->clean($d['title'], ...$cfg['title']);
        $body = $this->text->clean($d['body'], ...$cfg['question']);
        $hash = $this->text->hash($title['text']."\n".$body['text']);
        $this->guardPosting($user, 'questions', 'community_questions', $hash);

        return DB::transaction(function () use ($user, $d, $title, $body, $hash) {
            [$status, $shadowed] = $this->initialState($user, $title['flagged'] || $body['flagged']);
            $q = new Question(['locale' => $d['locale'] ?? app()->getLocale(), 'title' => $title['text'], 'body' => $body['text'], 'topic' => $d['topic'] ?? null,
                'city_id' => $d['city_id'] ?? null, 'content_hash' => $hash]);
            $q->user_id = $user->id;
            $q->status = $status;
            $q->shadowed = $shadowed;
            $q->flagged = $title['flagged'] || $body['flagged'];
            $q->save();
            DB::table('community_question_tags')->insert(collect($d['tags'] ?? [])->unique()->map(fn ($t) => ['question_id' => $q->id, 'tag' => $t])->all());

            return $q;
        });
    }

    public function createAnswer(User $user, Question $q, string $body): Answer
    {
        $clean = $this->text->clean($body, ...config('community.limits.answer'));
        $hash = $this->text->hash($clean['text']);
        $this->guardPosting($user, 'answers', 'community_answers', $hash);

        return DB::transaction(function () use ($user, $q, $clean, $hash) {
            [$status, $shadowed] = $this->initialState($user, $clean['flagged']);
            $a = new Answer(['locale' => app()->getLocale(), 'body' => $clean['text'], 'content_hash' => $hash]);
            $a->user_id = $user->id;
            $a->question_id = $q->id;
            $a->status = $status;
            $a->shadowed = $shadowed;
            $a->flagged = $clean['flagged'];
            $a->save();
            $q->refreshCounts();

            return $a;
        });
    }

    public function createComment(User $user, Question $q, ?Answer $a, string $body): Comment
    {
        $clean = $this->text->clean($body, ...config('community.limits.comment'));
        $hash = $this->text->hash($clean['text']);
        $this->guardPosting($user, 'comments', 'community_comments', $hash);

        [$status, $shadowed] = $this->initialState($user, $clean['flagged']);
        $c = new Comment(['body' => $clean['text'], 'content_hash' => $hash]);
        $c->user_id = $user->id;
        $c->question_id = $q->id;
        $c->answer_id = $a?->id;
        $c->status = $status;
        $c->shadowed = $shadowed;
        $c->flagged = $clean['flagged'];
        $c->save();

        return $c;
    }

    /** Email verified, not muted, new-account hourly caps, duplicate text. */
    private function guardPosting(User $user, string $kind, string $table, string $hash): void
    {
        if (! $user->hasVerifiedEmail()) {
            throw new ApiException('email_not_verified', __('errors.email_not_verified'), 403);
        }
        $r = $this->restriction($user);
        if ($r && $r->isMuted()) {
            throw new ApiException('community_muted', __('community.muted'), 403);
        }
        $newAccount = $user->created_at && $user->created_at->gt(now()->subDays((int) config('moderation.new_account_days')));
        if ($newAccount) {
            $cap = (int) config("community.new_account_hourly.$kind");
            $recent = DB::table($table)->where('user_id', $user->id)->where('created_at', '>=', now()->subHour())->count();
            if ($recent >= $cap) {
                throw new ApiException('new_account_throttled', __('community.new_account_throttled'), 429);
            }
        }
        $this->text->assertNotDuplicate($table, $hash);
    }

    /** @return array{0:string,1:bool} status, shadowed */
    private function initialState(User $user, bool $flagged): array
    {
        $r = $this->restriction($user);
        if ($r?->shadow_banned) {
            return ['approved', true]; // the author sees it as normal; nobody else does, and nothing tells them
        }
        $mode = config('community.premoderation');
        $trusted = $this->approvedPosts($user) >= (int) config('community.trusted_after_approved_posts')
            && (! $user->created_at || $user->created_at->lte(now()->subDays((int) config('moderation.new_account_days'))));
        $hold = $flagged || $mode === 'all' || ($mode === 'new_users' && ! $trusted);

        return [$hold ? 'pending' : 'approved', false];
    }

    private function approvedPosts(User $user): int
    {
        return DB::table('community_questions')->where('user_id', $user->id)->where('status', 'approved')->count()
            + DB::table('community_answers')->where('user_id', $user->id)->where('status', 'approved')->count();
    }

    // ---- votes / accepted answer -------------------------------------------------------------

    public function vote(User $user, string $type, Model $item): void
    {
        if (! $item->isPublic() || $item->user_id === $user->id) {
            throw new ApiException('vote_not_allowed', __('community.vote_not_allowed'), 403);
        }
        DB::table('community_votes')->insertOrIgnore(['user_id' => $user->id, 'votable_type' => $type, 'votable_id' => $item->id, 'created_at' => now(), 'updated_at' => now()]);
        $item->refreshCounts();
    }

    public function unvote(User $user, string $type, Model $item): void
    {
        DB::table('community_votes')->where(['user_id' => $user->id, 'votable_type' => $type, 'votable_id' => $item->id])->delete();
        $item->refreshCounts();
    }

    public function accept(User $user, Question $q, ?Answer $a): void
    {
        if ($q->user_id !== $user->id) {
            throw new ApiException('forbidden', __('community.only_author_accepts'), 403);
        }
        if ($a && ($a->question_id !== $q->id || ! $a->isPublic())) {
            throw new ApiException('invalid_answer', __('community.invalid_answer'), 422);
        }
        $q->forceFill(['accepted_answer_id' => $a?->id])->saveQuietly();
    }

    // ---- blocking ---------------------------------------------------------------------------

    /** @return list<int> */
    public function blockedBy(?User $viewer): array
    {
        return $viewer ? DB::table('community_blocks')->where('user_id', $viewer->id)->pluck('blocked_user_id')->all() : [];
    }

    public function block(User $user, Model $content): int
    {
        $target = $content->user_id;
        if (! $target) {
            throw new ApiException('not_found', __('moderation.not_found'), 404);
        }
        if ($target === $user->id) {
            throw new ApiException('cannot_block_self', __('community.cannot_block_self'), 422);
        }
        DB::table('community_blocks')->insertOrIgnore(['user_id' => $user->id, 'blocked_user_id' => $target, 'created_at' => now(), 'updated_at' => now()]);

        return (int) DB::table('community_blocks')->where(['user_id' => $user->id, 'blocked_user_id' => $target])->value('id');
    }

    // ---- moderation --------------------------------------------------------------------------

    public function moderate(Model $item, User $moderator, string $action, ?string $reason): Model
    {
        $status = ['approve' => 'approved', 'hide' => 'hidden', 'remove' => 'removed'][$action];
        $item->forceFill(['status' => $status, 'moderated_by' => $moderator->id, 'moderated_at' => now(), 'moderation_reason' => $reason ? mb_substr(strip_tags($reason), 0, 255) : null])->save();
        if ($item instanceof Answer) {
            $item->question->refreshCounts();
            if ($status !== 'approved' && $item->question->accepted_answer_id === $item->id) {
                $item->question->forceFill(['accepted_answer_id' => null])->saveQuietly();
            }
        }
        $this->audit->log("community.{$action}", $item, ['status' => $status, 'reason' => $reason], $moderator);

        return $item;
    }
}
