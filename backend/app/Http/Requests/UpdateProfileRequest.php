<?php

namespace App\Http\Requests;

use App\Domains\Profile\Enums\AgeRange;
use App\Domains\Profile\Enums\CefrLevel;
use App\Domains\Profile\Enums\Goal;
use App\Domains\Profile\Enums\ResidenceType;
use App\Domains\Profile\Enums\Segment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /** Account fields live on `users`; everything else is personalization data (consent-gated). */
    public const ACCOUNT_FIELDS = ['name', 'locale'];

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:100'],
            'locale' => ['sometimes', Rule::in(array_keys(config('expa.locales')))],
            'segment' => ['sometimes', 'nullable', Rule::enum(Segment::class)],
            'nationality' => ['sometimes', 'nullable', 'string', 'size:2', 'alpha:ascii'],
            'city_id' => ['sometimes', 'nullable', 'integer', Rule::exists('cities', 'id')],
            'residence_type' => ['sometimes', 'nullable', Rule::enum(ResidenceType::class)],
            'age_range' => ['sometimes', 'nullable', Rule::enum(AgeRange::class)],
            'italian_level' => ['sometimes', 'nullable', Rule::enum(CefrLevel::class)->only([
                CefrLevel::A0, CefrLevel::A1, CefrLevel::A2, CefrLevel::B1, CefrLevel::B2, CefrLevel::C1,
            ])],
            'english_level' => ['sometimes', 'nullable', Rule::enum(CefrLevel::class)],
            'goals' => ['sometimes', 'nullable', 'array', 'max:9'],
            'goals.*' => ['distinct', Rule::enum(Goal::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->nationality)) {
            $this->merge(['nationality' => strtoupper($this->nationality)]);
        }
    }

    public function accountData(): array
    {
        return array_intersect_key($this->validated(), array_flip(self::ACCOUNT_FIELDS));
    }

    public function profileData(): array
    {
        return array_diff_key($this->validated(), array_flip(self::ACCOUNT_FIELDS));
    }
}
