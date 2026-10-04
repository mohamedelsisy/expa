<?php

namespace App\Domains\Content\Services;

use App\Enums\SourceType;
use Illuminate\Database\Eloquent\Model;

/** Decides whether an item may go live. Returns machine-readable problems (empty = OK). */
class PublishGuard
{
    /** @return array<int,array{code:string,field?:string,locale?:string}> */
    public function problems(Model $item): array
    {
        $problems = [];

        if (method_exists($item, 'translations')) {
            $item->unsetRelation('translations');
            $required = method_exists($item, 'requiredLocales') ? $item->requiredLocales() : config('content.required_locales_to_publish');
            foreach ($required as $locale) {
                $t = $item->translation($locale);
                $empty = ! $t || collect($item->translatableFields())->filter(fn ($f) => $this->isRequiredField($item, $f))
                    ->contains(fn ($f) => blank($t->{$f}));
                if ($empty) {
                    $problems[] = ['code' => 'missing_translation', 'locale' => $locale];
                }
            }
        }

        if (method_exists($item, 'requiresSource') && $item->requiresSource()) {
            array_push($problems, ...$this->sourceProblems($item));
        }

        if (method_exists($item, 'extraPublishProblems')) {
            array_push($problems, ...$item->extraPublishProblems());
        }

        if (method_exists($item, 'urlFields')) {
            foreach ($item->urlFields() as $field) {
                if (filled($item->{$field}) && $this->httpsHost($item->{$field}) === null) {
                    $problems[] = ['code' => 'invalid_url', 'field' => $field];
                }
            }
        }

        return $problems;
    }

    private function isRequiredField(Model $item, string $field): bool
    {
        return in_array($field, $item->requiredTranslatableFields ?? $item->translatableFields(), true);
    }

    private function sourceProblems(Model $item): array
    {
        $p = [];
        foreach (['source_name', 'source_url', 'source_type', 'last_verified_at'] as $f) {
            if (blank($item->{$f})) {
                $p[] = ['code' => 'missing_source_field', 'field' => $f];
            }
        }
        if ($p) {
            return $p;
        }

        $host = $this->httpsHost($item->source_url);
        if ($host === null) {
            return [['code' => 'invalid_source_url', 'field' => 'source_url']];
        }
        if ($item->source_type === SourceType::Official && ! $this->isOfficialHost($host)) {
            $p[] = ['code' => 'source_domain_not_official', 'field' => 'source_url'];
        }
        if ($item->last_verified_at->isFuture()) {
            $p[] = ['code' => 'verified_in_future', 'field' => 'last_verified_at'];
        }

        return $p;
    }

    public function httpsHost(?string $url): ?string
    {
        $parts = parse_url((string) $url);
        if (! $parts || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) || isset($parts['user'])) {
            return null;
        }

        return strtolower($parts['host']);
    }

    public function isOfficialHost(string $host): bool
    {
        foreach (config('content.official_domains') as $domain) {
            if ($host === $domain || str_ends_with($host, '.'.$domain)) {
                return true;
            }
        }

        foreach (config('content.official_domain_patterns', []) as $pattern) {
            if (preg_match($pattern, $host)) {
                return true;
            }
        }

        return false;
    }
}
