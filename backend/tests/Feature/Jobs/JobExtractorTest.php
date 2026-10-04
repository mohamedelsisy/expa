<?php

namespace Tests\Feature\Jobs;

use App\Domains\Jobs\Services\JobExtractor;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class JobExtractorTest extends TestCase
{
    private function x(string $title, string $desc = ''): array
    {
        return app(JobExtractor::class)->extract(['title' => $title, 'description' => $desc]);
    }

    public static function levels(): array
    {
        return [
            ['Richiesto italiano B1', 'italian_level', 'b1'],
            ['Lingua italiana livello B2 richiesta', 'italian_level', 'b2'],
            ['Italian C1 required', 'italian_level', 'c1'],
            ['Ottima conoscenza dell\'italiano, madrelingua', 'italian_level', 'c2'],
            ['Cerchiamo persona con buon italiano', 'italian_level', null],   // no explicit level → no guess
            ['Inglese B2 gradito', 'english_level', 'b2'],
            ['Fluent English required', 'english_level', null],
            ['Italiano A2, inglese C1', 'english_level', 'c1'],
            ['Italiano A2, inglese C1', 'italian_level', 'a2'],
        ];
    }

    #[DataProvider('levels')]
    public function test_language_levels_only_from_explicit_wording(string $text, string $field, ?string $expected): void
    {
        $this->assertSame($expected, $this->x('Role', $text)[$field]);
    }

    public static function modes(): array
    {
        return [
            ['Lavoro in smart working', 'remote'], ['Full remote position', 'remote'], ['Posizione da remoto', 'remote'],
            ['Modalità ibrida, 2 giorni in sede', 'hybrid'], ['Hybrid working', 'hybrid'], ['In sede a Roma', 'onsite'], ['', 'onsite'],
        ];
    }

    #[DataProvider('modes')]
    public function test_remote_mode(string $text, string $expected): void
    {
        $this->assertSame($expected, $this->x('Role', $text)['remote_mode']);
    }

    public static function employment(): array
    {
        return [
            ['Contratto a tempo pieno', 'full_time'], ['Part-time 20 ore', 'part_time'], ['Stage di 6 mesi', 'internship'], ['Tirocinio curriculare', 'internship'],
            ['Collaborazione con Partita IVA', 'freelance'], ['Contratto a tempo determinato', 'contract'], ['Cerchiamo persona', 'other'],
        ];
    }

    #[DataProvider('employment')]
    public function test_employment_type(string $text, string $expected): void
    {
        $this->assertSame($expected, $this->x('Role', $text)['employment_type']);
    }

    public function test_experience_years(): void
    {
        $this->assertSame(3, $this->x('R', 'Almeno 3 anni di esperienza nel ruolo')['experience_years']);
        $this->assertSame(5, $this->x('R', 'Experience: 5+ years in sales')['experience_years']);
        $this->assertSame(2, $this->x('R', 'esperienza di 2 anni')['experience_years']);
        $this->assertNull($this->x('R', 'Cerchiamo persona motivata, 3 anni in azienda')['experience_years']); // not about experience
        $this->assertNull($this->x('R', 'esperienza di 99 anni')['experience_years']);
    }

    public function test_salary_requires_an_explicit_euro_amount_and_states_period_only_when_given(): void
    {
        $r = $this->x('R', 'Offriamo RAL €28.000 - €32.000 annui');
        $this->assertSame([28000, 32000, 'EUR', 'year'], [$r['salary_min'], $r['salary_max'], $r['salary_currency'], $r['salary_period']]);

        $r = $this->x('R', 'Retribuzione 1.800 euro al mese');
        $this->assertSame([1800, null, 'month'], [$r['salary_min'], $r['salary_max'], $r['salary_period']]);

        $r = $this->x('R', 'Stipendio €2500');
        $this->assertSame([2500, null], [$r['salary_min'], $r['salary_period']]); // amount without a stated period stays period-less

        $this->assertArrayNotHasKey('salary_min', $this->x('R', 'Ottimo stipendio competitivo'));
        $this->assertArrayNotHasKey('salary_min', $this->x('R', 'Bonus €100'));         // < 500 is not a salary
        $this->assertArrayNotHasKey('salary_min', $this->x('R', '€40.000 - €20.000'));   // inverted range
    }

    public function test_skills_match_whole_tokens_only(): void
    {
        $r = $this->x('Backend developer', 'Stack: PHP, Laravel, MySQL, Docker e Git. Conoscenza di patente B e HACCP.');
        $this->assertEqualsCanonicalizing(['php', 'laravel', 'mysql', 'docker', 'git', 'patente b', 'haccp'], $r['skills']);

        $this->assertSame([], $this->x('Role', 'Lavoriamo con phpstorm e javascripting')['skills']); // substrings are not skills
        $this->assertContains('c#', $this->x('Role', 'Esperienza con C# e .NET')['skills']);
    }

    public function test_sponsorship_is_never_extracted_from_text(): void
    {
        $this->assertArrayNotHasKey('visa_sponsorship_stated', $this->x('Role', 'We offer visa sponsorship for foreign candidates.'));
    }
}
