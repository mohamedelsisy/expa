<?php

namespace App\Domains\Jobs\Services;

use App\Support\Text\TextNormalizer;

/**
 * Rule-based extraction of structured facts from title + description. Deterministic and cheap; it only fills
 * fields the source did not provide and only from EXPLICIT wording (e.g. a CEFR level), never from guesses.
 */
class JobExtractor
{
    public function __construct(private TextNormalizer $n) {}

    public function extract(array $job): array
    {
        $text = $this->n->normalize(($job['title'] ?? '').' . '.($job['description'] ?? ''));
        $tokens = $this->n->tokens($text);

        $job['remote_mode'] ??= $this->remote($text);
        $job['employment_type'] ??= $this->employment($text);
        $job['italian_level'] = $this->level($text, ['italiano', 'italian', 'lingua italiana']);
        $job['english_level'] = $this->level($text, ['inglese', 'english']);
        $job['experience_years'] = $this->experience($text);
        $job['skills'] = $this->skills($text, $tokens);

        if (($job['salary_min'] ?? null) === null && ($job['salary_max'] ?? null) === null) {
            $job = array_merge($job, $this->salary($job['description'] ?? ''));
        }
        $job['remote_mode'] ??= 'onsite';
        $job['employment_type'] ??= 'other';

        return $job;
    }

    private function remote(string $t): ?string
    {
        if (preg_match('/\b(ibrid[oa]|hybrid)\b/u', $t)) {
            return 'hybrid';
        }
        if (preg_match('/\b(full remote|fully remote|100% remote|da remoto|remoto|remote|smart ?working|telelavoro|work from home)\b/u', $t)) {
            return 'remote';
        }

        return null;
    }

    private function employment(string $t): ?string
    {
        return match (true) {
            (bool) preg_match('/\b(stage|tirocinio|internship|apprendistato)\b/u', $t) => 'internship',
            (bool) preg_match('/\b(partita iva|p\.? ?iva|freelance|libero professionista)\b/u', $t) => 'freelance',
            (bool) preg_match('/\b(part[ -]?time|tempo parziale)\b/u', $t) => 'part_time',
            (bool) preg_match('/\b(full[ -]?time|tempo pieno)\b/u', $t) => 'full_time',
            (bool) preg_match('/\b(tempo determinato|a termine|contract|contratto a progetto)\b/u', $t) => 'contract',
            default => null,
        };
    }

    /** Explicit CEFR mention next to the language word, or "native/madrelingua". */
    private function level(string $t, array $words): ?string
    {
        foreach ($words as $w) {
            $w = preg_quote($w, '/');
            if (preg_match("/\\b$w\\b[^.\\n]{0,40}?\\b([abc][12])\\b/u", $t, $m) || preg_match("/\\b([abc][12])\\b[^.\\n]{0,15}?\\b$w\\b/u", $t, $m)) {
                return $m[1];
            }
            if (preg_match("/\\b(madrelingua|native)\\b[^.\\n]{0,25}\\b$w\\b|\\b$w\\b[^.\\n]{0,25}\\b(madrelingua|native)\\b/u", $t)) {
                return 'c2';
            }
        }

        return null;
    }

    private function experience(string $t): ?int
    {
        if (preg_match('/\b(\d{1,2})\s?\+?\s?(anni|anno|years?)\b[^.\n]{0,40}\b(esperienza|experience)\b|\b(esperienza|experience)\b[^.\n]{0,40}\b(\d{1,2})\s?\+?\s?(anni|anno|years?)\b/u', $t, $m)) {
            $n = (int) ($m[1] !== '' ? $m[1] : $m[5]);

            return $n >= 0 && $n <= 40 ? $n : null;
        }

        return null;
    }

    /** @return list<string> */
    private function skills(string $text, array $tokens): array
    {
        $found = [];
        foreach (config('jobs.skills') as $skill) {
            $s = $this->n->normalize($skill);
            if (str_contains($s, ' ') || str_contains($s, '#') || str_contains($s, '.')) {
                if (str_contains($text, $s)) {
                    $found[$s] = true;
                }
            } elseif (in_array($s, $tokens, true)) {
                $found[$s] = true;
            }
        }

        return array_keys($found);
    }

    /** Salary only from an explicit € amount (or range); period only when stated. */
    private function salary(string $description): array
    {
        $d = $this->n->normalize($description);
        $amount = '(\d{1,3}(?:[.,]\d{3})+|\d{3,6})';
        $cur = '(?:€|eur(?:o|os)?)';
        // "€28.000 - €32.000" (currency first) or "1.800 euro" / "28.000 - 32.000 €" (currency after)
        if (! preg_match("/$cur\s?$amount(?:\s?(?:-|–|a|to)\s?$cur?\s?$amount)?/u", $d, $m)
            && ! preg_match("/$amount(?:\s?(?:-|–|a|to)\s?$amount)?\s?$cur/u", $d, $m)) {
            return [];
        }
        $num = fn ($s) => (int) preg_replace('/[.,]/', '', $s);
        $min = $num($m[1]);
        $max = isset($m[2]) && $m[2] !== '' ? $num($m[2]) : null;
        if ($min < 500 || ($max !== null && $max < $min)) {
            return [];
        }
        $period = match (true) {
            (bool) preg_match('/\b(annu\w*|anno|year|ral|per year|yearly)\b/u', $d) => 'year',
            (bool) preg_match('/\b(mese|mensil\w*|month|monthly)\b/u', $d) => 'month',
            default => null,
        };

        return ['salary_min' => $min, 'salary_max' => $max, 'salary_currency' => 'EUR', 'salary_period' => $period];
    }
}
