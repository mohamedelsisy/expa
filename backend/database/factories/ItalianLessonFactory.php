<?php

namespace Database\Factories;

use App\Domains\Learning\Enums\LessonType;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Profile\Enums\CefrLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * TEST DATA ONLY: placeholder text, never use in seeders.
 *
 * @extends Factory<ItalianLesson>
 */
class ItalianLessonFactory extends Factory
{
    protected $model = ItalianLesson::class;

    public function definition(): array
    {
        return [
            'slug' => 'test-lesson-'.fake()->unique()->numberBetween(1, 999999),
            'level' => CefrLevel::A0,
            'type' => LessonType::Vocabulary,
            'duration_minutes' => 2,
        ];
    }

    public function translated(array $locales = ['ar', 'en', 'it']): static
    {
        return $this->afterCreating(function (ItalianLesson $l) use ($locales) {
            $l->setTranslations(collect($locales)->mapWithKeys(fn ($loc) => [$loc => [
                'title' => "[$loc] Test lesson {$l->id}", 'summary' => "[$loc] summary",
                'items' => [['it' => 'parola', 'gloss' => "[$loc] gloss"]],
            ]])->all());
        });
    }

    public function published(): static
    {
        return $this->translated()->afterCreating(fn (ItalianLesson $l) => $l->forceFill(['status' => 'published', 'published_at' => now()])->save());
    }

    public function of(string $level, string $type, int $order = 0): static
    {
        return $this->state(['level' => $level, 'type' => $type, 'sort_order' => $order]);
    }
}
