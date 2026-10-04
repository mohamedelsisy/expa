<?php

namespace Database\Factories;

use App\Domains\Government\Enums\ServiceDomain;
use App\Domains\Government\Models\GovernmentService;
use App\Enums\SourceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * TEST DATA ONLY: placeholder text, never use in seeders.
 *
 * @extends Factory<GovernmentService>
 */
class GovernmentServiceFactory extends Factory
{
    protected $model = GovernmentService::class;

    public function definition(): array
    {
        return [
            'slug' => 'test-service-'.fake()->unique()->numberBetween(1, 999999),
            'domain' => ServiceDomain::Immigration,
            'source_name' => 'Test Source', 'source_url' => 'https://www.interno.gov.it/test',
            'source_type' => SourceType::Official, 'last_verified_at' => now()->subDays(5),
        ];
    }

    public function translated(array $locales = ['ar', 'en', 'it']): static
    {
        return $this->afterCreating(function (GovernmentService $s) use ($locales) {
            $s->setTranslations(collect($locales)->mapWithKeys(fn ($l) => [$l => [
                'name' => "[$l] Test service {$s->id}", 'summary' => "[$l] summary", 'how_to_apply' => "[$l] how",
                'required_documents' => ["[$l] doc"],
            ]])->all());
        });
    }

    public function published(): static
    {
        return $this->translated()->afterCreating(fn (GovernmentService $s) => $s->forceFill(['status' => 'published', 'published_at' => now()])->save());
    }
}
