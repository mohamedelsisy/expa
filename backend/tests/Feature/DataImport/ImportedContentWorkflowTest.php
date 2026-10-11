<?php

namespace Tests\Feature\DataImport;

use App\Domains\Content\Services\PublishGuard;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Registry data is imported in Italian only. It must be approvable through the normal review workflow (the guard
 * requires the registry's own language), while curated content keeps requiring Arabic. And a region filter must show
 * every office of the region, including those attached to a city.
 */
class ImportedContentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private const SOURCE = [
        'source_name' => 'Fixture registry', 'source_url' => 'https://www.mur.gov.it/fixture', 'source_type' => 'official',
        'last_verified_at' => '2026-10-11',
    ];

    private function missingLocales($item): array
    {
        return collect(app(PublishGuard::class)->problems($item))->where('code', 'missing_translation')->pluck('locale')->values()->all();
    }

    public function test_imported_records_require_italian_while_curated_records_still_require_arabic(): void
    {
        $makers = [
            'office' => [fn (?string $sid) => GovernmentOffice::factory()->create(['source_id' => $sid]), ['name' => 'Ufficio di Fixture']],
            'university' => [fn (?string $sid) => tap((new University)->forceFill(['slug' => 'uni-'.uniqid(), 'kind' => 'public', 'source_id' => $sid] + self::SOURCE))->save(), ['name' => 'Università di Fixture', 'summary' => 'Ateneo']],
        ];
        foreach ($makers as $label => [$make, $italian]) {
            $imported = $make("fixture:$label");
            $imported->setTranslations(['it' => $italian]);
            $this->assertSame([], $this->missingLocales($imported), "$label imported with only Italian can be published");

            $curated = $make(null);
            $curated->setTranslations(['it' => $italian]);
            $this->assertSame(['ar'], $this->missingLocales($curated), "$label curated still needs Arabic");
        }
    }

    public function test_imported_study_program_does_not_need_arabic(): void
    {
        $uni = tap((new University)->forceFill(['slug' => 'uni-x', 'kind' => 'public'] + self::SOURCE))->save();
        $p = tap((new StudyProgram)->forceFill([
            'slug' => 'prog-x', 'university_id' => $uni->id, 'degree_level' => 'bachelor', 'field' => 'other',
            'instruction_language' => 'it', 'source_id' => 'fixture:p1',
        ] + self::SOURCE))->save();
        $p->setTranslations(['it' => ['title' => 'Informatica', 'summary' => 'Corso di laurea']]);

        $this->assertSame([], $this->missingLocales($p));
    }

    public function test_region_filter_includes_offices_attached_to_a_city_of_that_region(): void
    {
        $lazio = tap((new Region)->forceFill(['code' => '12', 'slug' => 'lazio-fixture']))->save();
        $abruzzo = tap((new Region)->forceFill(['code' => '13', 'slug' => 'abruzzo-fixture']))->save();
        $roma = tap((new City)->forceFill(['region_id' => $lazio->id, 'slug' => 'roma-fixture']))->save();

        GovernmentOffice::factory()->published()->create(['region_id' => $lazio->id, 'city_id' => $roma->id, 'slug' => 'office-in-city']);
        GovernmentOffice::factory()->published()->create(['region_id' => $lazio->id, 'city_id' => null, 'slug' => 'office-regional']);
        GovernmentOffice::factory()->published()->create(['region_id' => $abruzzo->id, 'city_id' => null, 'slug' => 'office-other-region']);

        $slugs = fn (string $qs) => collect($this->getJson("/api/v1/government/offices?$qs")->assertOk()->json('data'))->pluck('slug')->sort()->values()->all();

        $this->assertSame(['office-in-city', 'office-regional'], $slugs('region=lazio-fixture'), 'region filter shows city offices too');
        $this->assertSame(['office-in-city', 'office-regional'], $slugs('city=roma-fixture'), 'a city shows its offices plus region-level ones');
        $this->assertSame(['office-other-region'], $slugs('region=abruzzo-fixture'));
    }
}
