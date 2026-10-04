<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Patente\Models\PatenteExam;
use App\Domains\Patente\Models\PatenteExamAnswer;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class PatenteData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'patente';
    }

    public function export(User $user): array
    {
        return PatenteExam::where('user_id', $user->id)->orderBy('id')->get()->map(fn ($e) => [
            'mode' => $e->mode, 'questions' => count($e->question_ids), 'correct' => $e->correct, 'errors' => $e->errors,
            'passed' => $e->passed, 'timed_out' => $e->timed_out, 'finished_at' => $e->finished_at?->toIso8601String(),
        ])->all();
    }

    public function erase(User $user): void
    {
        PatenteExamAnswer::where('user_id', $user->id)->delete();
        PatenteExam::where('user_id', $user->id)->delete();
    }
}
