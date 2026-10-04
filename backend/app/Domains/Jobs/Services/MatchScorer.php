<?php

namespace App\Domains\Jobs\Services;

use App\Domains\Jobs\Models\JobListing;
use App\Domains\Jobs\Models\JobProfile;
use App\Support\Text\TextNormalizer;

/**
 * Explainable job↔candidate match. Each criterion yields match / partial / mismatch / unknown plus a reason;
 * criteria where either side has no data are `unknown` and are EXCLUDED from the score (never penalized),
 * while `confidence` reports how much of the weight could actually be evaluated.
 */
class MatchScorer
{
    private const LEVELS = ['a0' => 0, 'a1' => 1, 'a2' => 2, 'b1' => 3, 'b2' => 4, 'c1' => 5, 'c2' => 6];

    public function __construct(private TextNormalizer $n) {}

    /**
     * @param  array{italian_level:?string,english_level:?string,city_id:?int}  $profile  identity-free profile facts
     * @return array{score:?int,confidence:int,reasons:list<array>}
     */
    public function score(JobListing $job, ?JobProfile $jp, array $profile): array
    {
        $w = config('jobs.match_weights');
        $r = [
            'skills' => $this->skills($job, $jp),
            'experience' => $this->experience($job, $jp),
            'italian' => $this->language($job->italian_level?->value, $profile['italian_level'] ?? null),
            'english' => $this->language($job->english_level?->value, $profile['english_level'] ?? null),
            'remote' => $this->remote($job, $jp),
            'employment' => $this->employment($job, $jp),
            'salary' => $this->salary($job, $jp),
            'location' => $this->location($job, $jp, $profile),
        ];

        $total = array_sum($w);
        $known = 0.0;
        $earned = 0.0;
        $reasons = [];
        foreach ($r as $key => [$status, $detail]) {
            $reasons[] = ['key' => $key, 'status' => $status, 'detail' => $detail];
            if ($status === 'unknown') {
                continue;
            }
            $known += $w[$key];
            $earned += $w[$key] * match ($status) {
                'match' => 1.0, 'partial' => 0.5, default => 0.0
            };
        }

        return [
            'score' => $known > 0 ? (int) round($earned / $known * 100) : null,
            'confidence' => (int) round($known / $total * 100),
            'reasons' => $reasons,
        ];
    }

    private function skills(JobListing $job, ?JobProfile $jp): array
    {
        $needed = $job->skills ?? [];
        $mine = array_map(fn ($s) => $this->n->normalize($s), $jp?->skills ?? []);
        if (! $needed || ! $mine) {
            return ['unknown', null];
        }
        $hit = array_values(array_intersect($needed, $mine));
        $ratio = count($hit) / count($needed);

        return [$ratio >= 0.6 ? 'match' : ($ratio > 0 ? 'partial' : 'mismatch'), $hit ?: null];
    }

    private function experience(JobListing $job, ?JobProfile $jp): array
    {
        if ($job->experience_years === null || $jp?->experience_years === null) {
            return ['unknown', null];
        }
        $have = $jp->experience_years;
        $need = $job->experience_years;

        return [$have >= $need ? 'match' : ($have >= $need - 1 ? 'partial' : 'mismatch'), ['have' => $have, 'need' => $need]];
    }

    private function language(?string $required, ?string $have): array
    {
        if (! $required || ! $have) {
            return ['unknown', $required ? ['required' => $required] : null];
        }
        $gap = self::LEVELS[$required] - self::LEVELS[$have];

        return [$gap <= 0 ? 'match' : ($gap === 1 ? 'partial' : 'mismatch'), ['required' => $required, 'have' => $have]];
    }

    private function remote(JobListing $job, ?JobProfile $jp): array
    {
        $pref = $jp?->remote_preference;
        if (! $pref || $pref === 'any') {
            return ['unknown', $job->remote_mode->value];
        }
        $mode = $job->remote_mode->value;
        $ok = ($pref === 'remote_only' && $mode === 'remote') || ($pref === 'onsite_only' && $mode === 'onsite');
        $partial = $mode === 'hybrid';

        return [$ok ? 'match' : ($partial ? 'partial' : 'mismatch'), ['job' => $mode, 'preference' => $pref]];
    }

    private function employment(JobListing $job, ?JobProfile $jp): array
    {
        $types = $jp?->employment_types ?? [];
        if (! $types || $job->employment_type->value === 'other') {
            return ['unknown', null];
        }

        return [in_array($job->employment_type->value, $types, true) ? 'match' : 'mismatch', ['job' => $job->employment_type->value]];
    }

    private function salary(JobListing $job, ?JobProfile $jp): array
    {
        $yearly = $this->yearlyMax($job);
        if (! $jp?->salary_min_year || $yearly === null) {
            return ['unknown', null];
        }

        return [$yearly >= $jp->salary_min_year ? 'match' : ($yearly >= $jp->salary_min_year * 0.9 ? 'partial' : 'mismatch'),
            ['job_max_year' => $yearly, 'expected_min_year' => $jp->salary_min_year]];
    }

    /** Annualized upper bound, only when the period is stated (never guessed). */
    private function yearlyMax(JobListing $job): ?int
    {
        $v = $job->salary_max ?? $job->salary_min;
        if ($v === null || $job->salary_currency !== 'EUR') {
            return null;
        }

        return match ($job->salary_period) {
            'year' => $v, 'month' => $v * 12, default => null
        };
    }

    private function location(JobListing $job, ?JobProfile $jp, array $profile): array
    {
        if ($job->remote_mode->value === 'remote') {
            return ['match', ['remote' => true]];
        }
        $city = $jp?->city_id ?? ($profile['city_id'] ?? null);
        if (! $city || ! $job->city_id) {
            return ['unknown', null];
        }

        return [$job->city_id === $city ? 'match' : 'mismatch', null];
    }
}
