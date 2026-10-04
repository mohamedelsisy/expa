<?php

namespace App\Domains\Learning\Models;

use Illuminate\Database\Eloquent\Model;

class LessonProgress extends Model
{
    protected $table = 'lesson_progress';

    protected $guarded = ['id', 'user_id', 'italian_lesson_id'];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime', 'score' => 'integer'];
    }
}
