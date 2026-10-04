<?php

namespace App\Domains\Content\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use InvalidArgumentException;

/**
 * Per-entity translation table: `<entity>_translations(<entity>_id, locale, ...translatable fields)`
 * with a unique (<entity>_id, locale). The translation model defaults to `<Model>Translation`.
 *
 * Models declare: `protected array $translatable = ['title', 'body'];`
 */
trait HasTranslations
{
    public function translations(): HasMany
    {
        return $this->hasMany($this->translationModelClass());
    }

    protected function translationModelClass(): string
    {
        return static::class.'Translation';
    }

    public function scopeWithTranslations(Builder $query): Builder
    {
        return $query->with('translations');
    }

    public function translation(string $locale): ?Model
    {
        return $this->translations->firstWhere('locale', $locale);
    }

    /** The locale whose translation will actually be served for $locale (requested first, then the fallback chain). */
    public function resolveLocale(?string $locale = null): ?string
    {
        $locale ??= app()->getLocale();
        $chain = [$locale, ...(config("content.fallbacks.$locale") ?? [])];

        foreach ($chain as $candidate) {
            if ($this->translation($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    public function usesFallback(?string $locale = null): bool
    {
        $resolved = $this->resolveLocale($locale);

        return $resolved !== null && $resolved !== ($locale ?? app()->getLocale());
    }

    /** Value of $field in the best available language; null when the item has no translation at all. */
    public function localized(string $field, ?string $locale = null): mixed
    {
        $this->assertTranslatable($field);
        $resolved = $this->resolveLocale($locale);

        return $resolved ? $this->translation($resolved)->{$field} : null;
    }

    /**
     * Upsert translations: ['ar' => ['title' => ...], 'en' => [...]].
     * Only declared translatable fields are accepted; unknown locales are rejected.
     */
    public function setTranslations(array $byLocale): void
    {
        $allowed = array_keys(config('expa.locales'));

        foreach ($byLocale as $locale => $fields) {
            if (! in_array($locale, $allowed, true)) {
                throw new InvalidArgumentException("Unsupported locale [$locale].");
            }
            foreach (array_keys($fields) as $field) {
                $this->assertTranslatable($field);
            }
            $this->translations()->updateOrCreate(['locale' => $locale], $fields);
        }

        $this->unsetRelation('translations');
    }

    /** @return array<int,string> */
    public function translatedLocales(): array
    {
        return $this->translations->pluck('locale')->all();
    }

    /** @return array<int,string> */
    public function missingLocales(): array
    {
        return array_values(array_diff(array_keys(config('expa.locales')), $this->translatedLocales()));
    }

    public function translatableFields(): array
    {
        return $this->translatable ?? [];
    }

    private function assertTranslatable(string $field): void
    {
        if (! in_array($field, $this->translatableFields(), true)) {
            throw new InvalidArgumentException("[$field] is not a translatable field of ".static::class);
        }
    }

    /** Localized values for several fields at once + metadata clients need to flag fallbacks. */
    public function localizedPayload(?string $locale = null): array
    {
        $out = ['locale' => $this->resolveLocale($locale), 'fallback' => $this->usesFallback($locale), 'available_locales' => $this->translatedLocales()];
        foreach ($this->translatableFields() as $f) {
            $out[$f] = $this->localized($f, $locale);
        }

        return $out;
    }

    public static function translationsCollectionLocales(Collection $items): array
    {
        return $items->flatMap->translatedLocales()->unique()->values()->all();
    }
}
