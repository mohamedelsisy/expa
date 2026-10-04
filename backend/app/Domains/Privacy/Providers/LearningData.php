<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Learning\Models\LessonProgress;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class LearningData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'learning_progress';
    }

    public function export(User $user): array
    {
        return LessonProgress::where('user_id', $user->id)->join('italian_lessons', 'italian_lessons.id', '=', 'lesson_progress.italian_lesson_id')
            ->orderBy('lesson_progress.id')->get(['italian_lessons.slug as lesson', 'lesson_progress.status', 'lesson_progress.score', 'lesson_progress.completed_at'])
            ->map(fn ($r) => ['lesson' => $r->lesson, 'status' => $r->status, 'score' => $r->score, 'completed_at' => $r->completed_at])->all();
    }

    public function erase(User $user): void
    {
        LessonProgress::where('user_id', $user->id)->delete();
    }
}
