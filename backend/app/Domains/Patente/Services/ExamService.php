<?php

namespace App\Domains\Patente\Services;

use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteExamAnswer;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ExamService
{
    /**
     * @param  list<int>  $topicIds  practice mode only
     */
    public function start(User $user, string $mode, array $topicIds = [], ?int $size = null): PatenteExam
    {
        $q = PatenteQuestion::published()->whereHas('topic', fn ($t) => $t->published());

        if ($mode === 'practice') {
            $q->whereIn('patente_topic_id', $topicIds);
            $size = min($size ?? 20, config('patente.practice_max_questions'));
        } else {
            $size = config('patente.exam.questions');
        }

        $ids = $q->inRandomOrder()->limit($size)->pluck('id')->all();

        // A "mock exam" with fewer questions than the real one would be misleading: refuse instead of shrinking.
        if (! $ids || ($mode === 'exam' && count($ids) < $size)) {
            throw new ApiException('not_enough_questions', __('errors.not_enough_questions'), 422, ['available' => [(string) count($ids)], 'required' => [(string) ($mode === 'exam' ? $size : 1)]]);
        }

        $exam = new PatenteExam([
            'mode' => $mode,
            'question_ids' => $ids,
            'max_errors' => $mode === 'exam' ? config('patente.exam.max_errors') : null,
            'deadline_at' => $mode === 'exam' ? now()->addMinutes(config('patente.exam.minutes')) : null,
        ]);
        $exam->user_id = $user->id;
        $exam->save();

        return $exam;
    }

    /**
     * @param  array<int,bool|null>  $given  question_id => answer
     */
    public function submit(PatenteExam $exam, array $given): PatenteExam
    {
        if ($exam->finished_at) {
            throw new ApiException('exam_already_finished', __('errors.exam_already_finished'), 409);
        }

        $unknown = array_diff(array_keys($given), $exam->question_ids);
        if ($unknown) {
            throw new ApiException('validation_failed', __('errors.validation_failed'), 422, ['answers' => [__('errors.exam_unknown_question')]]);
        }

        return DB::transaction(function () use ($exam, $given) {
            $questions = PatenteQuestion::withTrashed()->whereIn('id', $exam->question_ids)->get()->keyBy('id');
            $correct = 0;

            foreach ($exam->question_ids as $qid) {
                $q = $questions[$qid];
                $answer = $given[$qid] ?? null;
                $ok = $answer !== null && $answer === $q->is_true;
                $correct += $ok ? 1 : 0;

                $row = new PatenteExamAnswer(['answer' => $answer, 'correct' => $ok, 'patente_topic_id' => $q->patente_topic_id]);
                $row->user_id = $exam->user_id;
                $row->patente_exam_id = $exam->id;
                $row->patente_question_id = $qid;
                $row->save();
            }

            $total = count($exam->question_ids);
            $timedOut = $exam->deadline_at !== null && now()->greaterThan($exam->deadline_at->copy()->addSeconds(config('patente.exam.late_grace_seconds')));

            $exam->forceFill([
                'finished_at' => now(),
                'correct' => $correct,
                'errors' => $total - $correct,
                'timed_out' => $timedOut,
                'passed' => $exam->mode === 'exam' ? (! $timedOut && ($total - $correct) <= $exam->max_errors) : null,
            ])->save();

            return $exam;
        });
    }
}
