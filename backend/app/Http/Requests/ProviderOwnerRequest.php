<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ProviderFieldRules;
use Illuminate\Foundation\Http\FormRequest;

/** The provider editing their OWN listing: no slug, owner, commission, verification or status fields. */
class ProviderOwnerRequest extends FormRequest
{
    use ProviderFieldRules;

    public function authorize(): bool
    {
        return true; // ownership is resolved from the authenticated user, never from the URL
    }

    protected function prepareForValidation(): void
    {
        $this->stripProviderText();
    }

    public function rules(): array
    {
        return $this->providerRules($this->isMethod('POST')) + $this->providerTranslationRules();
    }
}
