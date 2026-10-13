<?php

namespace Tests\Feature\DataImport;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\GovernmentImport\Content\AppointmentGuideContent;
use App\Domains\GovernmentImport\Services\AppointmentGuidesImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Offline: checks the authored content (URL patterns, hosts, languages, wording). It never calls the live web. */
class AppointmentGuidesTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_url_is_https_on_an_official_host_and_matches_expected_patterns(): void
    {
        $guard = app(PublishGuard::class);
        $this->assertGreaterThanOrEqual(5, count(AppointmentGuideContent::all()));
        foreach (AppointmentGuideContent::all() as $g) {
            foreach (['source_url', 'booking_portal_url'] as $f) {
                $url = $g[$f];
                $this->assertStringStartsWith('https://', $url, "{$g['source_id']} $f");
                $this->assertDoesNotMatchRegularExpression('/[\s"<>]|@|\.\./', $url, "{$g['source_id']} $f has suspicious characters");
                $host = $guard->httpsHost($url);
                $this->assertNotNull($host, "{$g['source_id']} $f");
                $this->assertTrue($guard->isOfficialHost($host), "{$g['source_id']} $f host $host is not an official host");
            }
        }
        // the exact hosts we verified, nothing else may slip in unnoticed
        $hosts = collect(AppointmentGuideContent::all())->flatMap(fn ($g) => [parse_url($g['source_url'], PHP_URL_HOST), parse_url($g['booking_portal_url'], PHP_URL_HOST)])->unique()->sort()->values()->all();
        $this->assertSame([
            'www.agenziaentrate.gov.it', 'www.cartaidentita.interno.gov.it', 'www.comune.milano.it', 'www.comune.roma.it',
            'www.inps.it', 'www.portaleimmigrazione.it', 'www.prenotazionicie.interno.gov.it',
        ], $hosts);
    }

    public function test_content_is_complete_in_three_languages_and_never_implies_expa_books(): void
    {
        $ids = [];
        $slugs = [];
        foreach (AppointmentGuideContent::all() as $g) {
            $ids[] = $g['source_id'];
            $slugs[] = $g['slug'];
            $this->assertLessThanOrEqual(now()->toDateString(), AppointmentGuideContent::VERIFIED_AT);
            foreach (['ar', 'en', 'it'] as $l) {
                $t = $g['translations'][$l];
                $this->assertNotEmpty($t['steps'], "{$g['source_id']} $l");
                foreach ($t['steps'] as $s) {
                    $this->assertNotEmpty($s['title']);
                    $this->assertNotEmpty($s['text']);
                }
                $text = json_encode($t, JSON_UNESCAPED_UNICODE);
                $this->assertDoesNotMatchRegularExpression('/\b(we|EXPA) (will )?(book|booked|reserve)\b/i', $text);
            }
            $this->assertMatchesRegularExpression('/not legal advice|ليست استشارة|non consulenza/i', json_encode($g['translations'], JSON_UNESCAPED_UNICODE));
            $this->assertStringContainsString('EXPA does not book', $g['translations']['en']['summary'] ?? '', 'summary must say EXPA does not book');
        }
        $this->assertSame(count($ids), count(array_unique($ids)));
        $this->assertSame(count($slugs), count(array_unique($slugs)));
    }

    public function test_import_is_idempotent_and_published_locally(): void
    {
        $this->artisan('expa:import:appointment-guides', ['--dry-run' => true])->assertSuccessful();
        $this->assertSame(0, AppointmentGuide::count());

        $this->artisan('expa:import:appointment-guides')->assertSuccessful();
        $n = count(AppointmentGuideContent::all());
        $this->assertSame($n, AppointmentGuide::count());
        $this->assertSame($n, AppointmentGuide::published()->count());
        $this->assertSame($n * 3, DB::table('appointment_guide_translations')->count());

        $this->artisan('expa:import:appointment-guides')->assertSuccessful();
        $this->assertSame($n, AppointmentGuide::count());
        $run = DB::table('data_import_runs')->where('dataset', 'appointment-guides')->latest('id')->first();
        $this->assertSame([0, 0, $n], [(int) $run->added, (int) $run->updated, (int) $run->unchanged]);

        $g = AppointmentGuide::where('source_id', 'appt-agenzia-entrate')->firstOrFail();
        $this->assertSame(AppointmentGuideContent::VERIFIED_AT, $g->last_verified_at->toDateString());
        $this->assertSame([], app(PublishGuard::class)->problems($g)); // publishable as is (ar present, official host)
    }

    public function test_edited_text_updates_and_other_environments_use_review(): void
    {
        $this->artisan('expa:import:appointment-guides')->assertSuccessful();
        $g = AppointmentGuide::where('source_id', 'appt-inps-sportelli-di-sede')->firstOrFail();
        $g->setTranslations(['en' => ['summary' => 'Locally edited']]);
        $this->artisan('expa:import:appointment-guides')->assertSuccessful();
        $run = DB::table('data_import_runs')->where('dataset', 'appointment-guides')->latest('id')->first();
        $this->assertSame(1, (int) $run->updated);
        $this->assertStringContainsString('EXPA does not book', $g->fresh()->translation('en')->summary);

        foreach (['staging', 'production'] as $env) {
            DB::table('appointment_guide_translations')->delete();
            DB::table('appointment_guides')->delete();
            app()->detectEnvironment(fn () => $env);
            $this->artisan('expa:import:appointment-guides')->assertSuccessful();
            $this->assertSame(0, AppointmentGuide::published()->count(), $env);
            $this->assertSame('review', AppointmentGuide::first()->status->value, $env);
        }
    }

    public function test_a_changed_licence_or_source_type_alone_is_detected_as_an_update(): void
    {
        $importer = app(AppointmentGuidesImporter::class);
        $importer->run();
        $guide = AppointmentGuide::query()->firstOrFail();
        $guide->forceFill(['source_license' => 'stale-licence', 'source_type' => 'third_party'])->save();

        $second = $importer->run();
        $this->assertSame(1, $second['counts']['updated']);
        $this->assertSame(AppointmentGuideContent::LICENSE, $guide->fresh()->source_license);
        $this->assertSame('official', $guide->fresh()->source_type->value);

        $this->assertSame(0, $importer->run()['counts']['updated'], 'and the run after that is a no-op again');
    }
}
