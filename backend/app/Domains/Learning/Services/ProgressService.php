<?php

namespace App\Domains\Learning\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\LessonProgress;
use App\Models\User;

class ProgressService
{
    public function record(User $user, ItalianLesson $lesson, string $status, ?int $score): LessonProgress
    {
        $p = LessonProgress::firstOrNew(['user_id' => $user->id, 'italian_lesson_id' => $lesson->id]);
        $p->user_id = $user->id;
        $p->italian_lesson_id = $lesson->id;

        // A completed lesson never goes back to "started"; re-completing keeps the best score.
        if ($p->status !== 'completed') {
            $p->status = $status;
        }
        if ($status === 'completed') {
            $p->completed_at ??= now();
            $p->score = $score !== null ? max($score, (int) $p->score) : $p->score;
        }
        $wasNew = ! $p->exists;
        $wasCompleted = $p->getOriginal('status') === 'completed';
        $p->save();

        $analytics = app(Analytics::class);
        if ($wasNew && $status === 'started') {
            $analytics->system(AnalyticsEvent::LessonStarted, $lesson->slug);
        }
        if ($status === 'completed' && ! $wasCompleted) {
            $analytics->system(AnalyticsEvent::LessonCompleted, $lesson->slug);
        }

        return $p;
    }

    /** Consecutive days with a completed lesson, ending today (or yesterday if nothing is done yet today). */
    public function streak(User $user): int
    {
        $days = LessonProgress::where('user_id', $user->id)->whereNotNull('completed_at')
            ->where('completed_at', '>=', now()->subDays(400)->startOfDay())
            ->pluck('completed_at')->map(fn ($d) => $d->toDateString())->unique()->flip();

        $cursor = now()->startOfDay();
        if (! $days->has($cursor->toDateString())) {
            $cursor = $cursor->subDay();
        }
        $streak = 0;
        while ($days->has($cursor->toDateString())) {
            $streak++;
            $cursor = $cursor->subDay();
        }

        return $streak;
    }

    /** @return list<array{level:string,total:int,completed:int,percent:int}> */
    public function byLevel(User $user): array
    {
        $totals = ItalianLesson::published()->selectRaw('level, count(*) as n')->groupBy('level')->pluck('n', 'level');
        $done = LessonProgress::where('lesson_progress.user_id', $user->id)->where('lesson_progress.status', 'completed')
            ->join('italian_lessons', 'italian_lessons.id', '=', 'lesson_progress.italian_lesson_id')
            ->where('italian_lessons.status', 'published')->whereNull('italian_lessons.deleted_at')
            ->selectRaw('italian_lessons.level as level, count(*) as n')->groupBy('italian_lessons.level')->pluck('n', 'level');

        return collect(['a0', 'a1', 'a2', 'b1', 'b2', 'c1'])->map(fn ($l) => [
            'level' => $l,
            'total' => (int) ($totals[$l] ?? 0),
            'completed' => (int) ($done[$l] ?? 0),
            'percent' => ($totals[$l] ?? 0) ? (int) round(($done[$l] ?? 0) / $totals[$l] * 100) : 0,
        ])->all();
    }

    public function completedToday(User $user): bool
    {
        return LessonProgress::where('user_id', $user->id)->where('completed_at', '>=', now()->startOfDay())->exists();
    }
}
