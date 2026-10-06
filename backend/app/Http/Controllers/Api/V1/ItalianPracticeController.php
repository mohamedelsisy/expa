<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Learning\Enums\ExerciseType;
use App\Domains\Learning\Enums\Scenario;
use App\Domains\Learning\Models\ItalianExercise;
use App\Domains\Learning\Models\ItalianExerciseAttempt;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Learning\Models\ItalianVocabProgress;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Learning\Services\DailyPlanService;
use App\Domains\Learning\Services\ExerciseGrader;
use App\Domains\Learning\Services\LeitnerService;
use App\Http\Controllers\Controller;
use App\Http\Requests\ItalianVocabularyRequest;
use App\Http\Resources\ItalianExerciseResource;
use App\Http\Resources\ItalianVocabularyResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Vocabulary, exercises and spaced repetition. Content endpoints are public; practice endpoints need a login. */
class ItalianPracticeController extends Controller
{
    private const LEVELS = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1'];

    /** Real-life scenario categories with how much published material each has (data, not hard-coded UI). */
    public function scenarios()
    {
        $lessons = ItalianLesson::published()->whereNotNull('scenario')->selectRaw('scenario, count(*) as n')->groupBy('scenario')->pluck('n', 'scenario');
        $vocab = ItalianVocabulary::published()->whereNotNull('category')->selectRaw('category, count(*) as n')->groupBy('category')->pluck('n', 'category');
        $exercises = ItalianExercise::published()->whereNotNull('scenario')->selectRaw('scenario, count(*) as n')->groupBy('scenario')->pluck('n', 'scenario');

        $items = collect(Scenario::cases())->map(fn (Scenario $s) => [
            'value' => $s->value, 'label' => __("italian.scenarios.{$s->value}"),
            'lessons' => (int) ($lessons[$s->value] ?? 0), 'vocabulary' => (int) ($vocab[$s->value] ?? 0), 'exercises' => (int) ($exercises[$s->value] ?? 0),
        ]);
        foreach (config('learning.vocabulary_extra_categories') as $extra) {
            $items->push(['value' => $extra, 'label' => __("italian.categories.$extra"), 'lessons' => 0, 'vocabulary' => (int) ($vocab[$extra] ?? 0), 'exercises' => 0]);
        }

        return ApiResponse::data($items->values())->header('Cache-Control', 'public, max-age=300');
    }

    public function vocabulary(Request $request)
    {
        $request->validate([
            'level' => ['nullable', Rule::in(self::LEVELS)],
            'category' => ['nullable', Rule::in(ItalianVocabularyRequest::categories())],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $q = ItalianVocabulary::published()->with('translations');
        foreach (['level', 'category'] as $f) {
            if ($v = $request->query($f)) {
                $q->where($f, $v);
            }
        }
        if ($term = trim((string) $request->query('q'))) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('lemma', 'like', $like)->orWhereHas('translations', fn ($t) => $t->where('gloss', 'like', $like)));
        }
        $page = $q->orderBy('level')->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 50));
        $progress = $this->progressFor($request, $page->getCollection()->pluck('id')->all());

        return ApiResponse::data(
            $page->getCollection()->map(fn ($v) => (new ItalianVocabularyResource($v, $progress))->toArray($request))->values(),
            ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()],
        );
    }

    public function vocabularyItem(Request $request, string $slug)
    {
        $v = ItalianVocabulary::published()->with('translations')->where('slug', $slug)->firstOrFail();

        return ApiResponse::data(new ItalianVocabularyResource($v, $this->progressFor($request, [$v->id])));
    }

    public function exercises(Request $request)
    {
        $request->validate([
            'level' => ['nullable', Rule::in(self::LEVELS)],
            'type' => ['nullable', Rule::enum(ExerciseType::class)],
            'scenario' => ['nullable', Rule::enum(Scenario::class)],
            'vocabulary' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $q = ItalianExercise::published()->with(['translations', 'vocabulary']);
        foreach (['level', 'type', 'scenario'] as $f) {
            if ($v = $request->query($f)) {
                $q->where($f, $v);
            }
        }
        if ($slug = $request->query('vocabulary')) {
            $q->whereHas('vocabulary', fn ($v) => $v->where('slug', $slug));
        }
        $page = $q->orderBy('level')->orderBy('sort_order')->orderBy('id')->paginate((int) $request->query('per_page', 30));

        return ApiResponse::data(
            $page->getCollection()->map(fn ($e) => (new ItalianExerciseResource($e))->toArray($request))->values(),
            ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()],
        );
    }

    public function exercise(string $slug)
    {
        $e = ItalianExercise::published()->with(['translations', 'vocabulary'])->where('slug', $slug)->firstOrFail();

        return ApiResponse::data(new ItalianExerciseResource($e));
    }

    // ---- practice (login required) -------------------------------------------------------------------

    /** Today's flashcards: due cards first, then a few new ones at the learner's level. */
    public function review(Request $request, LeitnerService $leitner, DailyPlanService $plan)
    {
        $data = $request->validate(['limit' => ['nullable', 'integer', 'min:1', 'max:'.config('learning.review_batch_max')]]);
        $user = $request->user();
        $queue = $leitner->queue($user, $plan->level($user), (int) ($data['limit'] ?? config('learning.review_batch')));

        return ApiResponse::data([
            'cards' => $queue->map(fn ($c) => (new ItalianVocabularyResource($c['vocabulary']))->toArray($request) + ['box' => $c['box'], 'new' => $c['new']])->values(),
            'stats' => $leitner->stats($user),
        ]);
    }

    public function recordReview(Request $request, LeitnerService $leitner, string $slug)
    {
        $data = $request->validate(['correct' => ['required', 'boolean']]);
        $v = ItalianVocabulary::published()->where('slug', $slug)->firstOrFail();
        $p = $leitner->record($request->user(), $v, (bool) $data['correct']);

        return ApiResponse::data(['slug' => $v->slug, 'box' => $p->box, 'due_at' => $p->due_at->toIso8601String(), 'mastered' => $p->box === LeitnerService::MAX_BOX]);
    }

    public function attempt(Request $request, ExerciseGrader $grader, LeitnerService $leitner, string $slug)
    {
        $e = ItalianExercise::published()->with(['translations', 'vocabulary'])->where('slug', $slug)->firstOrFail();
        $rules = match ($e->type) {
            ExerciseType::MultipleChoice, ExerciseType::Listening => ['answer' => ['required', 'integer', 'min:0', 'max:20']],
            ExerciseType::FillBlank => ['answer' => ['required', 'string', 'max:200']],
            ExerciseType::Match => ['answer' => ['required', 'array', 'max:10'], 'answer.*' => ['integer', 'min:0', 'max:20']],
        };
        $data = $request->validate($rules);

        $result = $grader->grade($e, $data['answer']);

        $attempt = new ItalianExerciseAttempt(['correct' => $result['correct']]);
        $attempt->user_id = $request->user()->id;
        $attempt->italian_exercise_id = $e->id;
        $attempt->save();

        $box = null;
        if ($e->vocabulary && $e->vocabulary->status->value === 'published') {
            $p = $leitner->record($request->user(), $e->vocabulary, $result['correct']);
            $box = ['slug' => $e->vocabulary->slug, 'box' => $p->box, 'due_at' => $p->due_at->toIso8601String()];
        }

        return ApiResponse::data([
            'correct' => $result['correct'],
            'correct_answer' => $result['correct_answer'], // revealed only after an attempt
            'explanation' => $e->localized('explanation'),
            'vocabulary' => $box,
        ]);
    }

    public function progress(Request $request, LeitnerService $leitner)
    {
        $user = $request->user();
        $row = DB::table('italian_exercise_attempts')->where('user_id', $user->id)
            ->selectRaw('count(*) as n, sum(case when correct then 1 else 0 end) as c')->first();
        $n = (int) ($row->n ?? 0);

        return ApiResponse::data([
            'vocabulary' => $leitner->stats($user),
            'exercises' => ['attempts' => $n, 'correct' => (int) ($row->c ?? 0), 'accuracy' => $n ? (int) round((int) $row->c / $n * 100) : null],
        ]);
    }

    private function progressFor(Request $request, array $ids): array
    {
        $user = $request->user('sanctum');
        if (! $user || ! $ids) {
            return [];
        }

        return ItalianVocabProgress::where('user_id', $user->id)->whereIn('italian_vocabulary_id', $ids)->get()
            ->mapWithKeys(fn ($p) => [$p->italian_vocabulary_id => ['box' => $p->box, 'due_at' => $p->due_at->toIso8601String()]])->all();
    }
}
