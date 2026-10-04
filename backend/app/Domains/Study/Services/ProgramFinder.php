<?php

namespace App\Domains\Study\Services;

use App\Domains\Study\Models\StudyProgram;
use Illuminate\Support\Collection;

/**
 * "AI Study Finder" without hidden magic: only criteria the user supplied are evaluated; criteria where the
 * program does not state the needed fact are `unknown` (excluded from the score, never penalized).
 */
class ProgramFinder
{
    private const LEVELS = ['a0' => 0, 'a1' => 1, 'a2' => 2, 'b1' => 3, 'b2' => 4, 'c1' => 5, 'c2' => 6];

    private const MUST_MATCH = ['field', 'degree', 'language'];

    private const WEIGHTS = ['field' => 25, 'degree' => 25, 'language' => 15, 'budget' => 15, 'city' => 10, 'italian' => 5, 'english' => 5];

    /**
     * @param  array{field?:string,degree?:string,language?:string,budget?:int,city?:string,italian_level?:string,english_level?:string}  $c
     * @return Collection<int,array{program:StudyProgram,score:?int,confidence:int,reasons:list<array>}>
     */
    public function find(array $c, int $minScore = 40): Collection
    {
        $programs = StudyProgram::published()->whereHas('university', fn ($u) => $u->published())
            ->with(['translations', 'university.translations', 'university.city.translations'])->limit(500)->get();

        $total = array_sum(array_intersect_key(self::WEIGHTS, array_filter([
            'field' => isset($c['field']), 'degree' => isset($c['degree']), 'language' => isset($c['language']) && $c['language'] !== 'any',
            'budget' => isset($c['budget']), 'city' => isset($c['city']), 'italian' => isset($c['italian_level']), 'english' => isset($c['english_level']),
        ])));

        return $programs->map(fn (StudyProgram $p) => ['program' => $p] + $this->score($p, $c, $total))
            // Field, degree level and language of instruction are must-haves: a law course is not a "partial match"
            // for a computer-science search. Budget, city and language levels only rank.
            ->reject(fn ($r) => collect($r['reasons'])->contains(fn ($x) => in_array($x['key'], self::MUST_MATCH, true) && $x['status'] === 'mismatch'))
            ->filter(fn ($r) => $total === 0 || ($r['score'] !== null && $r['score'] >= $minScore))
            ->sortByDesc(fn ($r) => [$r['score'] ?? 0, $r['confidence']])->values();
    }

    /** @return array{score:?int,confidence:int,reasons:list<array>} */
    private function score(StudyProgram $p, array $c, int $total): array
    {
        $r = [];
        if (isset($c['field'])) {
            $r['field'] = [$p->field->value === $c['field'] ? 'match' : 'mismatch', ['program' => $p->field->value]];
        }
        if (isset($c['degree'])) {
            $r['degree'] = [$p->degree_level->value === $c['degree'] ? 'match' : 'mismatch', ['program' => $p->degree_level->value]];
        }
        if (isset($c['language']) && $c['language'] !== 'any') {
            $r['language'] = [in_array($p->instruction_language, [$c['language'], 'both'], true) ? 'match' : 'mismatch', ['program' => $p->instruction_language]];
        }
        if (isset($c['budget'])) {
            $r['budget'] = $this->budget($p, (int) $c['budget']);
        }
        if (isset($c['city'])) {
            $slug = $p->university->city?->slug;
            $r['city'] = $slug ? [$slug === $c['city'] ? 'match' : 'mismatch', ['program' => $slug]] : ['unknown', null];
        }
        if (isset($c['italian_level'])) {
            $r['italian'] = $this->language($p->required_italian_level?->value, $c['italian_level'], $p->instruction_language !== 'en');
        }
        if (isset($c['english_level'])) {
            $r['english'] = $this->language($p->required_english_level?->value, $c['english_level'], $p->instruction_language !== 'it');
        }

        $known = 0.0;
        $earned = 0.0;
        $reasons = [];
        foreach ($r as $key => [$status, $detail]) {
            $reasons[] = ['key' => $key, 'status' => $status, 'detail' => $detail];
            if ($status !== 'unknown') {
                $known += self::WEIGHTS[$key];
                $earned += self::WEIGHTS[$key] * match ($status) {
                    'match' => 1.0, 'partial' => 0.5, default => 0.0
                };
            }
        }

        return ['score' => $known > 0 ? (int) round($earned / $known * 100) : null, 'confidence' => $total ? (int) round($known / $total * 100) : 0, 'reasons' => $reasons];
    }

    private function budget(StudyProgram $p, int $budget): array
    {
        if ($p->tuition_min_year === null && $p->tuition_max_year === null) {
            return ['unknown', null]; // tuition not stated by the source: never guessed
        }
        $min = $p->tuition_min_year ?? $p->tuition_max_year;
        $max = $p->tuition_max_year ?? $p->tuition_min_year;
        $detail = ['min' => $min, 'max' => $max, 'budget' => $budget];

        return [$min > $budget ? 'mismatch' : ($max > $budget ? 'partial' : 'match'), $detail];
    }

    private function language(?string $required, string $have, bool $relevant): array
    {
        if (! $required || ! $relevant) {
            return ['unknown', null];
        }
        $gap = self::LEVELS[$required] - self::LEVELS[$have];

        return [$gap <= 0 ? 'match' : ($gap === 1 ? 'partial' : 'mismatch'), ['required' => $required, 'have' => $have]];
    }
}
