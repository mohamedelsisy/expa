<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Learning\Models\ItalianExerciseAttempt;
use App\Domains\Learning\Models\ItalianVocabProgress;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

/** Vocabulary spaced-repetition state and exercise attempts (right/wrong only; answers are not stored). */
class ItalianPracticeData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'italian_practice';
    }

    public function export(User $user): array
    {
        return [
            'vocabulary' => ItalianVocabProgress::where('italian_vocab_progress.user_id', $user->id)
                ->join('italian_vocabularies', 'italian_vocabularies.id', '=', 'italian_vocab_progress.italian_vocabulary_id')
                ->orderBy('italian_vocab_progress.id')
                ->get(['italian_vocabularies.slug as word', 'italian_vocab_progress.box', 'italian_vocab_progress.due_at', 'italian_vocab_progress.correct_count', 'italian_vocab_progress.wrong_count', 'italian_vocab_progress.last_reviewed_at'])
                ->map(fn ($r) => ['word' => $r->word, 'box' => $r->box, 'due_at' => $r->due_at, 'correct' => $r->correct_count, 'wrong' => $r->wrong_count, 'last_reviewed_at' => $r->last_reviewed_at])->all(),
            'exercise_attempts' => ItalianExerciseAttempt::where('italian_exercise_attempts.user_id', $user->id)
                ->join('italian_exercises', 'italian_exercises.id', '=', 'italian_exercise_attempts.italian_exercise_id')
                ->orderBy('italian_exercise_attempts.id')
                ->get(['italian_exercises.slug as exercise', 'italian_exercise_attempts.correct', 'italian_exercise_attempts.created_at'])
                ->map(fn ($r) => ['exercise' => $r->exercise, 'correct' => (bool) $r->correct, 'at' => $r->created_at])->all(),
        ];
    }

    public function erase(User $user): void
    {
        ItalianVocabProgress::where('user_id', $user->id)->delete();
        ItalianExerciseAttempt::where('user_id', $user->id)->delete();
    }
}
