<?php

namespace App\Policies;

use App\Domains\Guides\Models\Guide;
use App\Enums\ContentStatus;
use App\Models\User;

/**
 * Workflow separation of duties:
 *  - guides.update  : write drafts, submit for review
 *  - guides.review  : approve / reject
 *  - guides.publish : publish, unpublish, archive, edit live content
 * Editors cannot touch live content; authors cannot approve their own work when content.four_eyes is on.
 */
class GuidePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('guides.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('guides.create');
    }

    public function update(User $user, Guide $guide): bool
    {
        return $user->hasPermission('guides.update');
    }

    /** Live (approved/published) content is editable only by people who may publish. */
    public function isLockedFor(User $user, Guide $guide): bool
    {
        return in_array($guide->status, [ContentStatus::Approved, ContentStatus::Published], true)
            && ! $user->hasPermission('guides.publish');
    }

    public function delete(User $user, Guide $guide): bool
    {
        return $user->hasPermission('guides.delete');
    }

    public function transition(User $user, Guide $guide, ContentStatus $to): bool
    {
        $from = $guide->status;

        $needed = match (true) {
            $from === ContentStatus::Draft && $to === ContentStatus::Review => 'guides.update',
            $to === ContentStatus::Published, $to === ContentStatus::Archived, $from === ContentStatus::Published => 'guides.publish',
            default => 'guides.review',
        };

        if (! $user->hasPermission($needed)) {
            return false;
        }

        // Four-eyes: the author may not approve their own work.
        if ($to === ContentStatus::Approved && config('content.four_eyes') && $guide->created_by === $user->id) {
            return false;
        }

        return true;
    }
}
