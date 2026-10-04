<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Patente\Services\ExamService;
use App\Domains\Patente\Services\PatenteProgress;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PatenteController extends Controller
{
    // ---- public learning content --------------------------------------------------------------

    public function categories()
    {
        return ApiResponse::data(PatenteCategory::published()->with('translations')->orderBy('sort_order')->get()->map(fn ($c) => $this->item($c))->values())
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function category(string $slug)
    {
        $c = PatenteCategory::published()->with('translations')->where('slug', $slug)->firstOrFail();

        return ApiResponse::data($this->item($c, true))->header('Cache-Control', 'public, max-age=300');
    }

    public function topics()
    {
        return ApiResponse::data(PatenteTopic::published()->with('translations')->withCount(['questions as question_count' => fn ($q) => $q->published()])
            ->orderBy('sort_order')->get()->map(fn ($t) => $this->item($t) + ['question_count' => $t->question_count])->values())
            ->header('Cache-Control', 'public, max-age=300');
    }

    public function topic(string $slug)
    {
        $t = PatenteTopic::published()->with('translations')->where('slug', $slug)->firstOrFail();

        return ApiResponse::data($this->item($t, true))->header('Cache-Control', 'public, max-age=300');
    }

    // ---- exams --------------------------------------------------------------------------------

    public function rules()
    {
        return ApiResponse::data(config('patente.exam') + ['practice_max_questions' => config('patente.practice_max_questions')]);
    }

    public function start(Request $request, ExamService $exams)
    {
        $data = $request->validate([
            'mode' => ['required', Rule::in(['exam', 'practice'])],
            'topics' => ['required_if:mode,practice', 'array', 'min:1', 'max:30'],
            'topics.*' => ['string', Rule::exists('patente_topics', 'slug')],
            'size' => ['nullable', 'integer', 'min:1', 'max:'.config('patente.practice_max_questions')],
        ]);

        $topicIds = $data['mode'] === 'practice' ? PatenteTopic::whereIn('slug', $data['topics'])->pluck('id')->all() : [];
        $exam = $exams->start($request->user(), $data['mode'], $topicIds, $data['size'] ?? null);

        return ApiResponse::data($this->examPayload($exam), status: 201);
    }

    public function exams(Request $request)
    {
        $page = PatenteExam::where('user_id', $request->user()->id)->whereNotNull('finished_at')->latest('finished_at')->latest('id')->paginate(20);

        return ApiResponse::data($page->getCollection()->map(fn ($e) => $this->summary($e))->values(), [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
        ]);
    }

    public function exam(Request $request, int $id)
    {
        $exam = PatenteExam::where('user_id', $request->user()->id)->findOrFail($id);

        return ApiResponse::data($exam->finished_at ? $this->resultPayload($exam) : $this->examPayload($exam));
    }

    public function submit(Request $request, ExamService $exams, int $id)
    {
        $data = $request->validate([
            'answers' => ['required', 'array', 'max:100'],
            'answers.*.question_id' => ['required', 'integer', 'distinct'],
            'answers.*.answer' => ['nullable', 'boolean'],
        ]);
        $exam = PatenteExam::where('user_id', $request->user()->id)->findOrFail($id);

        $given = [];
        foreach ($data['answers'] as $a) {
            $given[(int) $a['question_id']] = $a['answer'] ?? null;
        }

        return ApiResponse::data($this->resultPayload($exams->submit($exam, $given)));
    }

    public function progress(Request $request, PatenteProgress $progress)
    {
        return ApiResponse::data([
            'summary' => $progress->summary($request->user()),
            'topics' => $progress->topics($request->user()),
            'rules' => config('patente.exam'),
        ]);
    }

    // ---- payloads -----------------------------------------------------------------------------

    private function item($m, bool $full = false): array
    {
        $data = ['slug' => $m->slug, 'title' => $m->localized('title'), 'summary' => $m->localized('summary'),
            'locale' => $m->resolveLocale(), 'fallback' => $m->usesFallback(), 'source' => $m->sourcePayload()];
        if ($full) {
            $data['body'] = $m->localized('body');
        }

        return $data;
    }

    /** Questions of an unfinished exam: statements only, never the answers. */
    private function examPayload(PatenteExam $exam): array
    {
        $questions = PatenteQuestion::withTrashed()->with('translations')->whereIn('id', $exam->question_ids)->get()->keyBy('id');

        return [
            'id' => $exam->id,
            'mode' => $exam->mode,
            'finished' => false,
            'max_errors' => $exam->max_errors,
            'deadline_at' => $exam->deadline_at?->toIso8601String(),
            'questions' => collect($exam->question_ids)->map(fn ($id) => [
                'id' => $id,
                'statement' => $questions[$id]->localized('statement'),
                'statement_it' => $questions[$id]->translation('it')?->statement, // the Italian original is the real exam text
                'locale' => $questions[$id]->resolveLocale(),
            ])->all(),
        ];
    }

    private function summary(PatenteExam $e): array
    {
        return ['id' => $e->id, 'mode' => $e->mode, 'correct' => $e->correct, 'errors' => $e->errors, 'total' => count($e->question_ids),
            'passed' => $e->passed, 'timed_out' => $e->timed_out, 'finished_at' => $e->finished_at?->toIso8601String()];
    }

    private function resultPayload(PatenteExam $exam): array
    {
        $answers = $exam->answers()->get()->keyBy('patente_question_id');
        $questions = PatenteQuestion::withTrashed()->with('translations')->whereIn('id', $exam->question_ids)->get()->keyBy('id');

        return $this->summary($exam) + [
            'max_errors' => $exam->max_errors,
            'finished' => true,
            'review' => collect($exam->question_ids)->map(fn ($id) => [
                'question_id' => $id,
                'statement' => $questions[$id]->localized('statement'),
                'statement_it' => $questions[$id]->translation('it')?->statement,
                'your_answer' => $answers[$id]->answer ?? null,
                'correct_answer' => $questions[$id]->is_true,
                'correct' => (bool) ($answers[$id]->correct ?? false),
                'explanation' => $questions[$id]->localized('explanation'),
            ])->all(),
        ];
    }
}
