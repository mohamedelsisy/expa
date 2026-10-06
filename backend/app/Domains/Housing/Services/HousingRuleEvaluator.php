<?php

namespace App\Domains\Housing\Services;

use App\Domains\Housing\Models\HousingRule;

/** Applies the published rule table to extracted signals. Pure data-driven: no rule is hard-coded here. */
class HousingRuleEvaluator
{
    /**
     * @param  array<string,bool|float|null>  $signals
     * @return array{red_flags:list<array>,questions:list<array>}
     */
    public function evaluate(array $signals): array
    {
        $out = ['red_flags' => [], 'questions' => []];
        $rules = HousingRule::published()->with('translations')->orderBy('sort_order')->orderBy('id')->get();

        foreach ($rules as $rule) {
            if (! $this->matches($rule, $signals[$rule->signal] ?? null)) {
                continue;
            }
            $item = [
                'id' => $rule->slug,
                'severity' => $rule->severity,
                'title' => $rule->localized('title'),
                'explanation' => $rule->localized('explanation'),
                // `general_guidance`: practical advice only, no legal claim. `sourced`: backed by the cited source.
                'basis' => $rule->basis,
                'source' => $rule->sourceForResponse(),
            ];
            if ($rule->kind === 'question') {
                $item['question'] = $rule->localized('question');
                $out['questions'][] = $item;
            } else {
                $out['red_flags'][] = $item;
            }
        }

        return $out;
    }

    private function matches(HousingRule $rule, bool|float|int|null $value): bool
    {
        return match ($rule->condition) {
            'present' => $value !== null && $value !== false,
            'absent' => $value === null || $value === false,
            'gt' => $value !== null && is_numeric($value) && (float) $value > (float) $rule->threshold,
            'lt' => $value !== null && is_numeric($value) && (float) $value < (float) $rule->threshold,
            default => false,
        };
    }
}
