<?php

namespace App\Domains\Patente\Services;

use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteTopic;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PatenteProgress
{
    public function summary(User $user): array
    {
        $exams = PatenteExam::where('user_id', $user->id)->where('mode', 'exam')->whereNotNull('finished_at')->orderByDesc('finished_at')->orderByDesc('id')->get();
        $recent = $exams->take(5);

        return [
            'exams_taken' => $exams->count(),
            'exams_passed' => $exams->where('passed', true)->count(),
            'average_errors' => $exams->count() ? round($exams->avg('errors'), 1) : null,
            'recent_pass_rate' => $recent->count() ? (int) round($recent->where('passed', true)->count() / $recent->count() * 100) : null,
            'practice_sessions' => PatenteExam::where('user_id', $user->id)->where('mode', 'practice')->whereNotNull('finished_at')->count(),
        ];
    }

    /** Per-topic accuracy over every answer ever given; weakest first. Topics never attempted are listed last. */
    public function topics(User $user): array
    {
        $stats = DB::table('patente_exam_answers')->where('user_id', $user->id)
            ->selectRaw('patente_topic_id, count(*) as answered, sum(case when correct then 1 else 0 end) as correct')
            ->groupBy('patente_topic_id')->get()->keyBy('patente_topic_id');

        $rows = PatenteTopic::published()->with('translations')->orderBy('sort_order')->get()->map(function ($t) use ($stats) {
            $s = $stats[$t->id] ?? null;
            $answered = (int) ($s->answered ?? 0);
            $accuracy = $answered ? (int) round($s->correct / $answered * 100) : null;

            return [
                'topic' => ['slug' => $t->slug, 'title' => $t->localized('title')],
                'answered' => $answered,
                'correct' => (int) ($s->correct ?? 0),
                'accuracy' => $accuracy,
                'weak' => $answered >= config('patente.weak_min_answers') && $accuracy < config('patente.weak_accuracy_percent'),
            ];
        })->all();

        usort($rows, fn ($a, $b) => [$a['accuracy'] ?? 101, $b['answered']] <=> [$b['accuracy'] ?? 101, $a['answered']]);

        return $rows;
    }

    /**
     * Weak-topic analysis: topics with enough answers and accuracy below the configured threshold (weakest first), plus
     * topics never attempted. Only published topics/questions are considered; nothing is inferred without answers.
     *
     * @return array{threshold:int,min_answers:int,weak:list<array>,untouched:list<array>,recommended:?string}
     */
    public function weakAnalysis(User $user): array
    {
        $available = DB::table('patente_questions')->where('status', 'published')->whereNull('deleted_at')
            ->selectRaw('patente_topic_id, count(*) as n')->groupBy('patente_topic_id')->pluck('n', 'patente_topic_id');
        $ids = PatenteTopic::published()->pluck('id', 'slug');

        $rows = array_map(fn ($r) => $r + ['available_questions' => (int) ($available[$ids[$r['topic']['slug']] ?? 0] ?? 0)], $this->topics($user));
        $weak = array_values(array_filter($rows, fn ($r) => $r['weak']));
        $untouched = array_values(array_filter($rows, fn ($r) => $r['answered'] === 0 && $r['available_questions'] > 0));

        return [
            'threshold' => (int) config('patente.weak_accuracy_percent'),
            'min_answers' => (int) config('patente.weak_min_answers'),
            'weak' => $weak,
            'untouched' => $untouched,
            'recommended' => $weak[0]['topic']['slug'] ?? ($untouched[0]['topic']['slug'] ?? null),
        ];
    }
}
