<?php

namespace Database\Factories;

use App\Domains\Guides\Enums\GuideCategory;
use App\Domains\Guides\Models\Guide;
use App\Enums\SourceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * TEST DATA ONLY. Text is obviously placeholder; never use in seeders (EXPA must not ship invented procedures).
 *
 * @extends Factory<Guide>
 */
class GuideFactory extends Factory
{
    protected $model = Guide::class;

    public function definition(): array
    {
        return [
            'slug' => 'test-guide-'.fake()->unique()->numberBetween(1, 999999),
            'category' => GuideCategory::Documents,
            'italian_term' => null,
            'source_name' => 'Test Source',
            'source_url' => 'https://www.inps.it/test-page',
            'source_type' => SourceType::Official,
            'last_verified_at' => now()->subDays(5),
        ];
    }

    /** Adds ar/en/it placeholder translations. */
    public function translated(array $locales = ['ar', 'en', 'it']): static
    {
        return $this->afterCreating(function (Guide $g) use ($locales) {
            $g->setTranslations(collect($locales)->mapWithKeys(fn ($l) => [$l => [
                'title' => "[$l] Test title {$g->id}",
                'summary' => "[$l] Test summary",
                'what_is' => "[$l] Test what is",
                'required_documents' => ["[$l] doc A", "[$l] doc B"],
                'steps' => [['title' => "[$l] step 1", 'text' => 'x']],
            ]])->all());
        });
    }

    public function published(): static
    {
        return $this->translated()->afterCreating(function (Guide $g) {
            $g->forceFill(['status' => 'published', 'published_at' => now()])->save();
        });
    }
}
