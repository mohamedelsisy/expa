<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Learning\Enums\LessonType;
use App\Domains\Learning\Enums\Scenario;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\LessonProgress;
use App\Domains\Learning\Services\DailyPlanService;
use App\Domains\Learning\Services\ProgressService;
use App\Http\Controllers\Controller;
use App\Http\Resources\ItalianLessonResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItalianController extends Controller
{
    private const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'];

    public function levels()
    {
        $counts = ItalianLesson::published()->selectRaw('level, count(*) as n')->groupBy('level')->pluck('n', 'level');

        return ApiResponse::data(collect(self::LEVELS)->map(fn ($l) => [
            'level' => $l, 'label' => __("italian.levels.$l"), 'lessons' => (int) ($counts[$l] ?? 0),
        ])->all())->header('Cache-Control', 'public, max-age=300');
    }

    public function meta()
    {
        return ApiResponse::data([
            'types' => collect(LessonType::cases())->map(fn ($t) => ['value' => $t->value, 'label' => __("italian.types.{$t->value}")])->all(),
            'scenarios' => collect(Scenario::cases())->map(fn ($s) => ['value' => $s->value, 'label' => __("italian.scenarios.{$s->value}")])->all(),
        ]);
    }

    public function lessons(Request $request)
    {
        $request->validate([
            'level' => ['nullable', Rule::in(self::LEVELS)],
            'type' => ['nullable', Rule::enum(LessonType::class)],
            'scenario' => ['nullable', Rule::enum(Scenario::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $q = ItalianLesson::published()->with('translations');
        foreach (['level', 'type', 'scenario'] as $f) {
            if ($v = $request->query($f)) {
                $q->where($f, $v);
            }
        }
        $page = $q->orderBy('level')->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 30));

        // One query for the learner's progress on this page (token optional on this public route).
        $user = $request->user('sanctum');
        $progress = $user ? LessonProgress::where('user_id', $user->id)->whereIn('italian_lesson_id', $page->getCollection()->pluck('id'))->get()->keyBy('italian_lesson_id')->toArray() : [];

        return ApiResponse::data(
            $page->getCollection()->map(fn ($l) => (new ItalianLessonResource($l, progress: $progress))->toArray($request))->values(),
            ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()],
        );
    }

    /** Public, but when a valid token is sent the learner's own progress is attached. */
    public function lesson(Request $request, string $slug)
    {
        $lesson = ItalianLesson::published()->with('translations')->where('slug', $slug)->firstOrFail();
        $user = $request->user('sanctum');
        $progress = $user ? LessonProgress::where('user_id', $user->id)->where('italian_lesson_id', $lesson->id)->get()->keyBy('italian_lesson_id')->toArray() : [];

        return ApiResponse::data(new ItalianLessonResource($lesson, full: true, progress: $progress));
    }

    public function record(Request $request, ProgressService $progress, string $slug)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['started', 'completed'])],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);
        $lesson = ItalianLesson::published()->where('slug', $slug)->firstOrFail();

        $p = $progress->record($request->user(), $lesson, $data['status'], $data['score'] ?? null);

        return ApiResponse::data(['status' => $p->status, 'score' => $p->score, 'completed_at' => $p->completed_at?->toIso8601String(), 'streak' => $progress->streak($request->user())]);
    }

    public function progress(Request $request, ProgressService $progress)
    {
        $user = $request->user();

        return ApiResponse::data([
            'levels' => collect($progress->byLevel($user))->map(fn ($l) => $l + ['label' => __("italian.levels.{$l['level']}")])->all(),
            'streak' => $progress->streak($user),
            'completed_today' => $progress->completedToday($user),
        ]);
    }

    public function daily(Request $request, DailyPlanService $plan)
    {
        return ApiResponse::data($plan->plan($request->user()));
    }
}
