<?php

namespace App\Domains\Housing\Services;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;

/**
 * Pasted text → facts → rule findings → cost → (optional) AI explanation. Stateless: nothing is persisted here.
 */
class HousingChecker
{
    public function __construct(
        private HousingExtractor $extractor,
        private HousingRuleEvaluator $rules,
        private HousingCostEstimator $costs,
        private HousingExplainer $explainer,
    ) {}

    /**
     * @param  array<string,float|int|null>  $extra  user-provided numbers
     */
    public function check(string $text, string $locale, array $extra = [], bool $explain = false): array
    {
        $x = $this->extractor->extract($text);
        $s = $x['signals'];
        $findings = $this->rules->evaluate($s);
        $cost = $this->costs->estimate($s, $extra);

        $detected = [];
        foreach ($s as $key => $v) {
            if ($v !== null && $v !== false && ! in_array($key, ['utilities_stated', 'utilities_excluded'], true)) {
                $detected[$key] = $v;
            }
        }
        $missing = array_values(array_filter(HousingExtractor::CORE, fn ($k) => ! ($s[$k] ?? false)));
        if (($s['utilities_stated'] ?? false) === false && ! isset($extra['utilities_monthly']) && ($s['utilities_included'] ?? false) !== true) {
            $missing[] = 'utilities_cost';
        }

        $result = [
            'language' => $x['language'],
            'facts' => $this->facts($s),
            'evidence' => $x['evidence'],
            'red_flags' => $findings['red_flags'],
            'questions' => $findings['questions'],
            'could_not_detect' => array_map(fn ($k) => ['key' => $k, 'label' => __("housing.signals.$k")], array_values(array_unique($missing))),
            'cost' => $cost,
            'confidence' => $this->confidence($s, $x['notes'], mb_strlen($text)),
            'notes' => array_map(fn ($n) => ['code' => $n, 'text' => __("housing.notes.$n")], $x['notes']),
            'explanation' => null,
            'disclaimer' => __('housing.disclaimer'),
            'persisted' => false,
        ];

        if ($explain) {
            $result['explanation'] = $this->explainer->explain($text, [
                'detected' => $detected,
                'red_flags' => array_column($findings['red_flags'], 'title'),
                'questions' => array_column($findings['questions'], 'title'),
                'could_not_detect' => $missing,
                'monthly_total' => $cost['monthly_total'],
            ], $locale);
            $result['explanation_status'] = $result['explanation'] ? 'ok' : 'unavailable';
        }

        app(Analytics::class)->system(AnalyticsEvent::HousingCheck);

        return $result;
    }

    /** Detected facts only, shaped for clients (no `false` noise). */
    private function facts(array $s): array
    {
        $types = array_values(array_filter([
            ($s['contract_type_4_4'] ?? false) ? '4+4' : null,
            ($s['contract_type_3_2'] ?? false) ? '3+2' : null,
            ($s['contract_type_transitory'] ?? false) ? 'transitory' : null,
            ($s['contract_type_student'] ?? false) ? 'student' : null,
        ]));

        return [
            'rent_monthly' => $s['rent_monthly'],
            'deposit_amount' => $s['deposit_amount'],
            'deposit_months' => $s['deposit_months'],
            'utilities' => ($s['utilities_included'] ?? false) ? 'included' : (($s['utilities_excluded'] ?? false) ? 'excluded' : null),
            'expenses_monthly' => $s['expenses_monthly'],
            'contract_keywords' => $types, // keywords found in the text, NOT a determination of the contract type
            'agency_fee_mentioned' => (bool) $s['agency_fee_mentioned'],
            'agency_fee_amount' => $s['agency_fee_amount'],
            'registration_mentioned' => (bool) $s['registration_mentioned'],
            'cedolare_secca_mentioned' => (bool) $s['cedolare_secca_mentioned'],
            'notice_period_mentioned' => (bool) $s['notice_period_mentioned'],
            'notice_period_months' => $s['notice_period_months'],
            'cash_payment_mentioned' => (bool) $s['cash_payment_mentioned'],
            'no_contract_mentioned' => (bool) $s['no_contract_mentioned'],
            'advance_payment_mentioned' => (bool) $s['advance_payment_mentioned'],
            'pressure_language' => (bool) $s['pressure_language'],
        ];
    }

    private function confidence(array $s, array $notes, int $length): string
    {
        $found = count(array_filter(HousingExtractor::CORE, fn ($k) => $s[$k] ?? false));
        $level = $length < 80 ? 0 : ($found >= 4 ? 2 : ($found >= 2 ? 1 : 0));
        if (in_array('rent_ambiguous', $notes, true) || in_array('utilities_ambiguous', $notes, true)) {
            $level = max(0, $level - 1);
        }

        return ['low', 'medium', 'high'][$level];
    }
}
