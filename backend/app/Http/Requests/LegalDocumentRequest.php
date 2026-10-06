<?php

namespace App\Http\Requests;

use App\Domains\Legal\Models\LegalDocument;
use Illuminate\Validation\Rule;

class LegalDocumentRequest extends ContentRequest
{
    protected function table(): string
    {
        return 'legal_documents';
    }

    protected function primaryField(): string
    {
        return 'title';
    }

    protected function hasPlace(): bool
    {
        return false;
    }

    public function rules(): array
    {
        $rules = parent::rules();
        // `slug` names the document and repeats across versions: uniqueness is on (slug, version) instead.
        $req = $this->isMethod('POST') ? 'required' : 'sometimes';
        $existing = $this->routeItemId() ? LegalDocument::withTrashed()->find($this->routeItemId()) : null;
        $slug = $this->input('slug', $existing?->slug);
        $rules['slug'] = [$req, 'string', Rule::in(config('legal.slugs'))];
        $rules['version'] = [$req, 'string', 'max:20', 'regex:/^[A-Za-z0-9][A-Za-z0-9._-]*$/',
            Rule::unique('legal_documents', 'version')->where('slug', $slug)->ignore($this->routeItemId())];

        return $rules;
    }

    protected function attributeRules(bool $creating): array
    {
        return [];
    }

    protected function translationFieldRules(): array
    {
        return ['body' => ['nullable', 'string', 'max:'.config('legal.max_body_chars')]];
    }

    protected function plainTextAttributes(): array
    {
        return ['version'];
    }
}
