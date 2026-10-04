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
}
