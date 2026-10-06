<?php

namespace App\Domains\Learning\Services;

use App\Domains\Learning\Enums\ExerciseType;
use App\Domains\Learning\Models\ItalianExercise;
use App\Support\Text\TextNormalizer;

/**
 * Builds the learner-facing form of an exercise (WITHOUT its answers) and grades attempts server-side.
 *
 * content by type (language-neutral, Italian):
 *   multiple_choice : {stem?, choices?:[it], correct_index}  (+ translation.options = localised choices)
 *   listening       : {choices:[it], correct_index}           (+ audio_url when a recording exists)
 *   fill_blank      : {sentence:"... ___ ...", answers:[...]}
 *   match           : {left:[it...]}                          (+ translation.options = right-hand glosses, same order)
 */
class ExerciseGrader
{
    public function __construct(private TextNormalizer $normalizer) {}

    /** @return list<string> machine codes; empty = structurally sound */
    public function structureProblems(ItalianExercise $e): array
    {
        $c = (array) $e->content;
        $problems = [];
        $e->unsetRelation('translations');
        $optionSets = $e->translations->filter(fn ($t) => is_array($t->options))->map(fn ($t) => count($t->options));

        switch ($e->type) {
            case ExerciseType::MultipleChoice:
            case ExerciseType::Listening:
                $n = count($c['choices'] ?? []) ?: ($optionSets->first() ?? 0);
                if ($n < 2) {
                    $problems[] = 'exercise_needs_two_choices';
                }
                if (! isset($c['correct_index']) || ! is_int($c['correct_index']) || $c['correct_index'] < 0 || $c['correct_index'] >= max($n, 1)) {
                    $problems[] = 'exercise_invalid_correct_index';
                }
                if ($optionSets->contains(fn ($count) => $count !== $n)) {
                    $problems[] = 'exercise_options_length_mismatch';
                }
                break;
            case ExerciseType::FillBlank:
                if (substr_count((string) ($c['sentence'] ?? ''), '___') !== 1) {
                    $problems[] = 'exercise_needs_one_blank';
                }
                if (! array_filter((array) ($c['answers'] ?? []), fn ($a) => is_string($a) && trim($a) !== '')) {
                    $problems[] = 'exercise_needs_answers';
                }
                break;
            case ExerciseType::Match:
                $n = count($c['left'] ?? []);
                if ($n < 2) {
                    $problems[] = 'exercise_needs_two_pairs';
                }
                if ($optionSets->isEmpty() || $optionSets->contains(fn ($count) => $count !== $n)) {
                    $problems[] = 'exercise_options_length_mismatch';
                }
                break;
        }

        return $problems;
    }

    /** Public form: no answers, no correct index. */
    public function publicForm(ItalianExercise $e): array
    {
        $c = (array) $e->content;
        $options = $e->localized('options');
        $form = [];

        switch ($e->type) {
            case ExerciseType::MultipleChoice:
            case ExerciseType::Listening:
                $choices = is_array($options) && $options ? $options : ($c['choices'] ?? []);
                $form = ['stem' => $c['stem'] ?? null, 'choices' => array_map(fn ($text, $i) => ['index' => $i, 'text' => $text], $choices, array_keys($choices))];
                break;
            case ExerciseType::FillBlank:
                $form = ['sentence' => $c['sentence'] ?? ''];
                break;
            case ExerciseType::Match:
                $perm = $this->permutation($e);
                $options = array_values((array) $options);
                $form = [
                    'left' => array_map(fn ($t, $i) => ['index' => $i, 'text' => $t], (array) ($c['left'] ?? []), array_keys((array) ($c['left'] ?? []))),
                    // Right-hand items are shown in a fixed shuffled order; their ids are positions in that order.
                    'right' => array_map(fn ($originalIndex, $k) => ['id' => $k, 'text' => $options[$originalIndex] ?? ''], $perm, array_keys($perm)),
                ];
                break;
        }

        return $form;
    }

    /**
     * @return array{correct:bool,correct_answer:mixed}
     */
    public function grade(ItalianExercise $e, mixed $answer): array
    {
        $c = (array) $e->content;

        return match ($e->type) {
            ExerciseType::MultipleChoice, ExerciseType::Listening => [
                'correct' => is_int($answer) && $answer === ($c['correct_index'] ?? -1),
                'correct_answer' => ['index' => $c['correct_index'] ?? null],
            ],
            ExerciseType::FillBlank => $this->gradeBlank($c, $answer),
            ExerciseType::Match => $this->gradeMatch($e, $c, $answer),
        };
    }

    private function gradeBlank(array $c, mixed $answer): array
    {
        $accepted = array_map(fn ($a) => $this->norm((string) $a), (array) ($c['answers'] ?? []));
        $ok = is_string($answer) && $this->norm($answer) !== '' && in_array($this->norm($answer), $accepted, true);

        return ['correct' => $ok, 'correct_answer' => ['answers' => array_values((array) ($c['answers'] ?? []))]];
    }

    private function gradeMatch(ItalianExercise $e, array $c, mixed $answer): array
    {
        $perm = $this->permutation($e);
        $n = count((array) ($c['left'] ?? []));
        $truth = [];
        foreach ($perm as $token => $original) {
            $truth[$original] = $token;
        }
        ksort($truth);
        $ok = is_array($answer) && count($answer) === $n && array_values($answer) === array_values(array_map('intval', $truth)) && ! array_filter($answer, fn ($a) => ! is_int($a));

        return ['correct' => $ok, 'correct_answer' => ['right_ids' => array_values($truth)]];
    }

    /** Deterministic shuffle of right-hand items (stable per exercise, never the identity for n >= 2). @return list<int> original index at each displayed position */
    private function permutation(ItalianExercise $e): array
    {
        $n = count((array) ($e->content['left'] ?? []));
        $idx = range(0, max(0, $n - 1));
        usort($idx, fn ($a, $b) => crc32($e->id.'-'.$a) <=> crc32($e->id.'-'.$b) ?: $a <=> $b);
        if ($n >= 2 && $idx === range(0, $n - 1)) {
            $idx = [...array_slice($idx, 1), $idx[0]];
        }

        return $idx;
    }

    private function norm(string $s): string
    {
        return rtrim($this->normalizer->normalize($s), ' .!?,;:');
    }
}
