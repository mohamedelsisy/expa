<?php

namespace App\Domains\Community\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Shared moderation/visibility behaviour of questions, answers and comments. */
trait IsCommunityPost
{
    use SoftDeletes;

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * What `$viewer` may see: approved posts that are not shadowed and not written by someone they blocked,
     * plus their own posts in any non-removed state (an author always sees what they wrote and its status).
     *
     * @param  list<int>  $blocked
     */
    public function scopeVisibleTo(Builder $q, ?User $viewer, array $blocked = []): Builder
    {
        $t = $q->getModel()->getTable();

        return $q->where(function (Builder $w) use ($t, $viewer, $blocked) {
            $w->where(function (Builder $p) use ($t, $blocked) {
                $p->where("$t.status", 'approved')->where("$t.shadowed", false);
                if ($blocked) {
                    $p->where(fn ($b) => $b->whereNull("$t.user_id")->orWhereNotIn("$t.user_id", $blocked));
                }
            });
            if ($viewer) {
                $w->orWhere(fn ($own) => $own->where("$t.user_id", $viewer->id)->where("$t.status", '!=', 'removed'));
            }
        });
    }

    public function scopePublic(Builder $q): Builder
    {
        $t = $q->getModel()->getTable();

        return $q->where("$t.status", 'approved')->where("$t.shadowed", false);
    }

    public function isPublic(): bool
    {
        return $this->status === 'approved' && ! $this->shadowed;
    }
}
