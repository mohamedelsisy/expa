<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserDocumentRequest extends FormRequest
{
    public function rules(): array
    {
        $req = $this->isMethod('POST') ? 'required' : 'sometimes';
        $existing = $this->isMethod('POST') ? null : $this->user()->documents()->find($this->route('document'));
        $issue = $this->input('issue_date', $existing?->issue_date?->toDateString());

        return [
            'type' => [$req, 'string', Rule::exists('document_types', 'key')],
            'label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'issue_date' => ['sometimes', 'nullable', 'date', 'after:1900-01-01', 'before_or_equal:today'],
            'expiry_date' => ['sometimes', 'nullable', 'date', 'before:'.now()->addYears(100)->toDateString(),
                $issue ? 'after_or_equal:'.$issue : 'after:1900-01-01'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'reminders_enabled' => ['sometimes', 'boolean'],
            'reminder_offsets' => ['sometimes', 'nullable', 'array', 'max:10'],
            'reminder_offsets.*' => ['integer', 'min:0', 'max:730', 'distinct'],
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['label', 'notes'] as $f) {
            if (is_string($this->input($f))) {
                $this->merge([$f => trim(strip_tags($this->input($f)))]);
            }
        }
    }
}
