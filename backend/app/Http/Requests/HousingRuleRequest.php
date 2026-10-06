<?php

namespace App\Http\Requests;

use App\Domains\Housing\Models\HousingRule;
use App\Domains\Housing\Services\HousingExtractor;
use Illuminate\Validation\Rule;

class HousingRuleRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'housing_rules';
    }

    protected function primaryField(): string
    {
        return 'title';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    protected function attributeRules(bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';

        return [
            'kind' => [$req, Rule::in(HousingRule::KINDS)],
            'signal' => [$req, Rule::in(HousingExtractor::SIGNALS)],
            'condition' => [$req, Rule::in(HousingRule::CONDITIONS)],
            'threshold' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1000000'],
            'severity' => ['sometimes', Rule::in(HousingRule::SEVERITIES)],
            'basis' => ['sometimes', Rule::in(HousingRule::BASES)],
        ];
    }

    protected function translationFieldRules(): array
    {
        return ['explanation' => ['nullable', 'string', 'max:3000'], 'question' => ['nullable', 'string', 'max:500']];
    }
}
