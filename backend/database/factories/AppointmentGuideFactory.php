<?php

namespace Database\Factories;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use App\Enums\SourceType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * TEST DATA ONLY: placeholder text, never use in seeders.
 *
 * @extends Factory<AppointmentGuide>
 */
class AppointmentGuideFactory extends Factory
{
    protected $model = AppointmentGuide::class;

    public function definition(): array
    {
        return [
            'slug' => 'test-appt-'.fake()->unique()->numberBetween(1, 999999),
            'office_type' => OfficeType::Questura,
            'booking_method' => BookingMethod::Online,
            'booking_portal_url' => 'https://www.portaleimmigrazione.it/test',
            'source_name' => 'Test Source', 'source_url' => 'https://www.portaleimmigrazione.it/test',
            'source_type' => SourceType::Official, 'last_verified_at' => now()->subDays(5),
        ];
    }

    public function translated(array $locales = ['ar', 'en', 'it']): static
    {
        return $this->afterCreating(function (AppointmentGuide $g) use ($locales) {
            $g->setTranslations(collect($locales)->mapWithKeys(fn ($l) => [$l => [
                'title' => "[$l] Test appointment guide {$g->id}", 'summary' => "[$l] summary", 'steps' => [['title' => "[$l] step", 'text' => 'x']],
            ]])->all());
        });
    }

    public function published(): static
    {
        return $this->translated()->afterCreating(fn (AppointmentGuide $g) => $g->forceFill(['status' => 'published', 'published_at' => now()])->save());
    }
}
