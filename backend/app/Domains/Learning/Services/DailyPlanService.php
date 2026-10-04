<?php

namespace App\Domains\Learning\Services;

use App\Domains\Dashboard\Services\ProfileContext;
use App\Domains\Learning\Enums\LessonType;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\LessonProgress;
use App\Models\User;

/**
 * "Daily 10-minute Italian": 5 new words + 1 grammar concept + 1 conversation + 1 pronunciation exercise
 * + 1 real-life mission. Each slot is the first lesson of that type the learner has not completed at their
 * level (moving up a level when the current one is exhausted); lessons finished today stay visible as done.
 */
class DailyPlanService
{
    private const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'];

    public function __construct(private ProgressService $progress) {}

    public function level(User $user): string
    {
        $ctx = ProfileContext::for($user); // only reads the profile with personalization consent
        $level = $ctx->personalized ? $user->profile?->italian_level?->value : null;

        return in_array($level, self::LEVELS, true) ? $level : 'a0';
    }

    public function plan(User $user): array
    {
        $level = $this->level($user);
        $doneIds = LessonProgress::where('user_id', $user->id)->where('status', 'completed')->pluck('italian_lesson_id')->all();
        $todayIds = LessonProgress::where('user_id', $user->id)->where('completed_at', '>=', now()->startOfDay())->pluck('italian_lesson_id')->all();

        $slots = [];
        foreach (LessonType::cases() as $type) {
            $doneToday = $todayIds ? ItalianLesson::published()->whereIn('id', $todayIds)->where('type', $type->value)->with('translations')->first() : null;
            $lesson = $doneToday ?? $this->next($type, $level, $doneIds);

            $slots[] = [
                'slot' => $type->slot(),
                'type' => $type->value,
                'type_label' => __("italian.types.{$type->value}"),
                'lesson' => $lesson ? [
                    'slug' => $lesson->slug,
                    'level' => $lesson->level->value,
                    'title' => $lesson->localized('title'),
                    'duration_minutes' => $lesson->duration_minutes,
                ] : null,
                'done_today' => (bool) $doneToday,
            ];
        }

        $available = array_filter($slots, fn ($s) => $s['lesson']);

        return [
            'level' => $level,
            'level_label' => __("italian.levels.$level"),
            'slots' => $slots,
            'minutes' => (int) array_sum(array_map(fn ($s) => $s['lesson']['duration_minutes'], $available)),
            'done_today' => count(array_filter($slots, fn ($s) => $s['done_today'])),
            'total' => count($available),
            'streak' => $this->progress->streak($user),
        ];
    }

    private function next(LessonType $type, string $level, array $doneIds): ?ItalianLesson
    {
        foreach (array_slice(self::LEVELS, array_search($level, self::LEVELS, true)) as $l) {
            $lesson = ItalianLesson::published()->where('level', $l)->where('type', $type->value)
                ->when($doneIds, fn ($q) => $q->whereNotIn('id', $doneIds))
                ->orderBy('sort_order')->orderBy('id')->with('translations')->first();
            if ($lesson) {
                return $lesson;
            }
        }

        return null;
    }
}
