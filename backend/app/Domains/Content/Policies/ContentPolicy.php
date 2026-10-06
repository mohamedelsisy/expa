<?php

namespace App\Domains\Content\Policies;

use App\Enums\ContentStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Workflow separation of duties shared by every content module (permission prefix = resource key):
 *  - {p}.update  : write drafts, submit for review
 *  - {p}.review  : approve / reject
 *  - {p}.publish : publish, unpublish, archive, edit live content
 * Editors cannot touch live content; authors cannot approve their own work when content.four_eyes is on.
 * (super_admin short-circuits through Gate::before.)
 */
abstract class ContentPolicy
{
    abstract protected function prefix(): string;

    public function viewAny(User $user): bool
    {
        return $user->hasPermission($this->prefix().'.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission($this->prefix().'.create');
    }

    public function update(User $user, Model $item): bool
    {
        return $user->hasPermission($this->prefix().'.update');
    }

    /**
     * MVP-5: translators (`translations.update`) may change the TEXT of translations only, through the dedicated
     * translations endpoint; they still cannot touch live content (isLockedFor) and cannot move workflow states.
     */
    public function translate(User $user, Model $item): bool
    {
        return $user->hasPermission($this->prefix().'.update') || $user->hasPermission('translations.update');
    }

    public function delete(User $user, Model $item): bool
    {
        return $user->hasPermission($this->prefix().'.delete');
    }

    /** Live (approved/published) content is editable only by people who may publish. */
    public function isLockedFor(User $user, Model $item): bool
    {
        return in_array($item->status, [ContentStatus::Approved, ContentStatus::Published], true)
            && ! $user->hasPermission($this->prefix().'.publish');
    }

    public function transition(User $user, Model $item, ContentStatus $to): bool
    {
        $from = $item->status;
        $p = $this->prefix();

        $needed = match (true) {
            $from === ContentStatus::Draft && $to === ContentStatus::Review => "$p.update",
            $to === ContentStatus::Published, $to === ContentStatus::Archived, $from === ContentStatus::Published => "$p.publish",
            default => "$p.review",
        };

        if (! $user->hasPermission($needed)) {
            return false;
        }

        return ! $this->violatesFourEyes($user, $item, $to);
    }

    /**
     * Four-eyes: neither the author nor the last editor may approve (otherwise a second person could rewrite
     * someone's draft and approve their own text). Public so the controller can report a distinct error code.
     */
    public function violatesFourEyes(User $user, Model $item, ContentStatus $to): bool
    {
        return $to === ContentStatus::Approved && config('content.four_eyes')
            && in_array($user->id, array_filter([$item->created_by, $item->updated_by]), true);
    }

    /** True when the actor holds the permission this transition needs (ignoring four-eyes). */
    public function hasTransitionPermission(User $user, Model $item, ContentStatus $to): bool
    {
        $p = $this->prefix();

        return $user->hasPermission(match (true) {
            $item->status === ContentStatus::Draft && $to === ContentStatus::Review => "$p.update",
            $to === ContentStatus::Published, $to === ContentStatus::Archived, $item->status === ContentStatus::Published => "$p.publish",
            default => "$p.review",
        });
    }
}
