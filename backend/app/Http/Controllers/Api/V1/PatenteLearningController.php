<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Patente\Services\ExamService;
use App\Domains\Patente\Services\PatenteProgress;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\ItalianVocabularyResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

/** Learning layer on top of the exam engine: weak topics, per-topic practice, instant feedback, Italian → Arabic glossary. */
class PatenteLearningController extends Controller
{
    public function weakTopics(Request $request, PatenteProgress $progress)
    {
        return ApiResponse::data($progress->weakAnalysis($request->user()));
    }

    /** POST /patente/topics/{slug}/practice — a non-exam session on one topic (no timer, no pass/fail). */
    public function practiceTopic(Request $request, ExamService $exams, string $slug)
    {
        $data = $request->validate(['size' => ['nullable', 'integer', 'min:1', 'max:'.config('patente.practice_max_questions')]]);
        $topic = PatenteTopic::published()->where('slug', $slug)->firstOrFail();

        return $this->started($request, $exams->start($request->user(), 'practice', [$topic->id], $data['size'] ?? null));
    }

    /** POST /patente/practice/weak — a session built from the learner's weak topics. */
    public function practiceWeak(Request $request, ExamService $exams, PatenteProgress $progress)
    {
        $data = $request->validate(['size' => ['nullable', 'integer', 'min:1', 'max:'.config('patente.practice_max_questions')]]);
        $slugs = array_map(fn ($r) => $r['topic']['slug'], $progress->weakAnalysis($request->user())['weak']);
        if (! $slugs) {
            throw new ApiException('no_weak_topics', __('errors.no_weak_topics'), 422);
        }
        $ids = PatenteTopic::published()->whereIn('slug', $slugs)->pluck('id')->all();

        return $this->started($request, $exams->start($request->user(), 'practice', $ids, $data['size'] ?? null));
    }

    /** POST /patente/exams/{id}/check — instant feedback on one question of an unfinished PRACTICE session. */
    public function check(Request $request, int $id)
    {
        $data = $request->validate(['question_id' => ['required', 'integer'], 'answer' => ['required', 'boolean']]);
        $exam = PatenteExam::where('user_id', $request->user()->id)->findOrFail($id);
        if ($exam->mode !== 'practice' || $exam->finished_at) {
            throw new ApiException('practice_only', __('errors.practice_only'), 409);
        }
        if (! in_array((int) $data['question_id'], $exam->question_ids, true)) {
            throw new ApiException('validation_failed', __('errors.validation_failed'), 422, ['question_id' => [__('errors.exam_question_not_in_session')]]);
        }

        $q = PatenteQuestion::withTrashed()->with('translations')->findOrFail($data['question_id']);
        $answer = filter_var($data['answer'], FILTER_VALIDATE_BOOLEAN);
        app(Analytics::class)->system(AnalyticsEvent::PatentePractice);

        return ApiResponse::data([
            'question_id' => $q->id,
            'correct' => $answer === $q->is_true,
            'correct_answer' => $q->is_true,
            'explanation' => $q->localized('explanation'),
            // Arabic, Italian and English side by side (those that exist): the Italian original teaches the exam wording.
            'explanations' => collect(['ar', 'it', 'en'])->mapWithKeys(fn ($l) => [$l => $q->translation($l)?->explanation])->filter()->all(),
        ]);
    }

    /** Italian → Arabic/English glossary of driving vocabulary (the vocabulary module, category `patente`). */
    public function glossary(Request $request)
    {
        $words = ItalianVocabulary::published()->with('translations')->where('category', 'patente')->orderBy('level')->orderBy('sort_order')->orderBy('id')->get();

        return ApiResponse::data($words->map(fn ($w) => (new ItalianVocabularyResource($w))->toArray($request))->values())
            ->header('Cache-Control', 'public, max-age=300');
    }

    private function started(Request $request, PatenteExam $exam)
    {
        return app(PatenteController::class)->exam($request, $exam->id)->setStatusCode(201);
    }
}
