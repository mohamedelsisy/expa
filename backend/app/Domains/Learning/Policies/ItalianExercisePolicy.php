<?php

namespace App\Domains\Learning\Policies;

use App\Domains\Content\Policies\ContentPolicy;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ItalianExercisePolicy extends ContentPolicy
{
    protected function prefix(): string
    {
        return 'italian_lessons';
    }

    /** Confirming that a qualified teacher reviewed the item (teacher-review endpoints). */
    public function review(User $user, Model $item): bool
    {
        return $user->hasPermission('italian_lessons.review');
    }
}
