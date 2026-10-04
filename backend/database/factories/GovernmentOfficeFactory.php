<?php

namespace Database\Factories;

use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use App\Domains\Government\Models\GovernmentOffice;
use App\Enums\SourceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * TEST DATA ONLY: placeholder text, never use in seeders.
 *
 * @extends Factory<GovernmentOffice>
 */
class GovernmentOfficeFactory extends Factory
{
    protected $model = GovernmentOffice::class;

    public function definition(): array
    {
        return [
            'slug' => 'test-office-'.fake()->unique()->numberBetween(1, 999999),
            'office_type' => OfficeType::Questura,
            'booking_method' => BookingMethod::Online,
            'official_url' => 'https://www.poliziadistato.it/test',
            'booking_url' => 'https://www.poliziadistato.it/test/booking',
            'source_name' => 'Test Source', 'source_url' => 'https://www.poliziadistato.it/test',
            'source_type' => SourceType::Official, 'last_verified_at' => now()->subDays(5),
        ];
    }

    public function translated(array $locales = ['ar', 'en', 'it']): static
    {
        return $this->afterCreating(function (GovernmentOffice $o) use ($locales) {
            $o->setTranslations(collect($locales)->mapWithKeys(fn ($l) => [$l => ['name' => "[$l] Test office {$o->id}"]])->all());
        });
    }

    public function published(): static
    {
        return $this->translated()->afterCreating(fn (GovernmentOffice $o) => $o->forceFill(['status' => 'published', 'published_at' => now()])->save());
    }
}
