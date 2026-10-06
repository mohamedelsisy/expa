<?php

namespace App\Domains\Learning\Models;

use Illuminate\Database\Eloquent\Model;

/** One graded answer. The answer itself is not stored: only whether it was right (data minimisation). */
class ItalianExerciseAttempt extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = ['id', 'user_id', 'italian_exercise_id'];

    protected function casts(): array
    {
        return ['correct' => 'boolean'];
    }
}
