<?php

namespace Tests\Feature\Content;

use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Geo\Models\City;
use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use App\Domains\Government\Enums\ServiceDomain;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GovernmentPublicApiTest extends TestCase
{
    use RefreshDatabase;

    private City $roma;

    private City $milano;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(GeographySeeder::class);
        $this->roma = City::firstWhere('slug', 'roma');
        $this->milano = City::firstWhere('slug', 'milano');
    }

    public function test_only_published_items_are_public(): void
    {
        GovernmentService::factory()->published()->create(['slug' => 'live']);
        GovernmentService::factory()->translated()->create(['slug' => 'draft']);
        GovernmentOffice::factory()->published()->create(['slug' => 'live-o']);
        GovernmentOffice::factory()->translated()->create(['slug' => 'draft-o']);
        AppointmentGuide::factory()->published()->create(['slug' => 'live-a']);
        AppointmentGuide::factory()->translated()->create(['slug' => 'draft-a']);

        $this->getJson('/api/v1/government/services')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/government/offices')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/appointments/guides')->assertJsonPath('meta.total', 1);
        foreach (['government/services/draft', 'government/offices/draft-o', 'appointments/guides/draft-a'] as $uri) {
            $this->getJson("/api/v1/$uri")->assertNotFound();
        }
    }

    public function test_every_booking_payload_states_that_expa_does_not_book(): void
    {
        GovernmentOffice::factory()->published()->create(['slug' => 'q', 'booking_url' => 'https://www.portaleimmigrazione.it/b']);
        AppointmentGuide::factory()->published()->create(['slug' => 'a']);

        foreach ([['en', 'EXPA does not book for you'], ['it', 'EXPA non prenota al posto tuo'], ['ar', 'لا تقوم EXPA بالحجز']] as [$lang, $text]) {
            $office = $this->getJson('/api/v1/government/offices/q', ['Accept-Language' => $lang])->assertOk()->json('data.booking');
            $guide = $this->getJson('/api/v1/appointments/guides/a', ['Accept-Language' => $lang])->json('data.booking');
            foreach ([$office, $guide] as $b) {
                $this->assertFalse($b['booked_by_expa']);
                $this->assertStringContainsString($text, $b['notice']);
            }
        }
        $this->assertSame('https://www.portaleimmigrazione.it/b', $this->getJson('/api/v1/government/offices/q')->json('data.booking.url'));
    }

    public function test_service_detail_includes_published_guide_link_and_offices_filtered_by_city(): void
    {
        $guide = Guide::factory()->published()->create(['slug' => 'permesso-guide']);
        $svc = GovernmentService::factory()->published()->create(['slug' => 'permesso', 'guide_id' => $guide->id, 'italian_term' => 'Permesso di soggiorno']);
        $inRoma = GovernmentOffice::factory()->published()->create(['slug' => 'q-roma', 'city_id' => $this->roma->id, 'region_id' => $this->roma->region_id]);
        $inMilano = GovernmentOffice::factory()->published()->create(['slug' => 'q-milano', 'city_id' => $this->milano->id, 'region_id' => $this->milano->region_id]);
        $draft = GovernmentOffice::factory()->translated()->create(['slug' => 'q-draft', 'city_id' => $this->roma->id]);
        $svc->offices()->sync([$inRoma->id, $inMilano->id, $draft->id]);

        $all = $this->getJson('/api/v1/government/services/permesso')->assertOk();
        $all->assertJsonPath('data.guide.slug', 'permesso-guide')->assertJsonPath('data.italian_term', 'Permesso di soggiorno');
        $this->assertEqualsCanonicalizing(['q-roma', 'q-milano'], array_column($all->json('data.offices'), 'slug')); // draft hidden

        $this->assertSame(['q-roma'], array_column($this->getJson('/api/v1/government/services/permesso?city=roma')->json('data.offices'), 'slug'));

        $guide->forceFill(['status' => 'draft'])->save();
        $this->assertNull($this->getJson('/api/v1/government/services/permesso')->json('data.guide'));
    }

    public function test_service_list_filters_by_domain_place_and_search(): void
    {
        GovernmentService::factory()->published()->create(['slug' => 'nat', 'domain' => 'tax']);
        GovernmentService::factory()->published()->create(['slug' => 'lazio', 'domain' => 'immigration', 'region_id' => $this->roma->region_id]);
        GovernmentService::factory()->published()->create(['slug' => 'roma', 'domain' => 'immigration', 'city_id' => $this->roma->id, 'region_id' => $this->roma->region_id]);
        GovernmentService::factory()->published()->create(['slug' => 'milano', 'domain' => 'immigration', 'city_id' => $this->milano->id, 'region_id' => $this->milano->region_id]);

        $slugs = fn (string $qs) => collect($this->getJson("/api/v1/government/services?$qs")->assertOk()->json('data'))->pluck('slug')->sort()->values()->all();
        $this->assertSame(['lazio', 'nat', 'roma'], $slugs('city=roma'));
        $this->assertSame(['milano', 'nat'], $slugs('city=milano'));
        $this->assertSame(['lazio', 'nat'], $slugs('region=lazio'));
        $this->assertSame(['nat'], $slugs('domain=tax'));
        $this->assertSame([], $slugs('city=atlantis'));
        $this->getJson('/api/v1/government/services?domain=nope')->assertStatus(422);
        $this->getJson('/api/v1/government/services?q=%25')->assertJsonPath('meta.total', 0);
    }

    public function test_office_list_serves_city_and_region_level_offices(): void
    {
        GovernmentOffice::factory()->published()->create(['slug' => 'roma-office', 'city_id' => $this->roma->id, 'office_type' => 'comune']);
        GovernmentOffice::factory()->published()->create(['slug' => 'lazio-office', 'region_id' => $this->roma->region_id, 'office_type' => 'comune']);
        GovernmentOffice::factory()->published()->create(['slug' => 'milano-office', 'city_id' => $this->milano->id, 'office_type' => 'comune']);
        GovernmentOffice::factory()->published()->create(['slug' => 'roma-poste', 'city_id' => $this->roma->id, 'office_type' => 'poste']);

        $slugs = fn (string $qs) => collect($this->getJson("/api/v1/government/offices?$qs")->json('data'))->pluck('slug')->sort()->values()->all();
        $this->assertSame(['lazio-office', 'roma-office', 'roma-poste'], $slugs('city=roma'));
        $this->assertSame(['lazio-office', 'roma-office'], $slugs('city=roma&type=comune'));
        $this->getJson('/api/v1/government/offices?type=castle')->assertStatus(422);
    }

    public function test_localization_fallback_and_labels(): void
    {
        $o = GovernmentOffice::factory()->create(['slug' => 'only-ar', 'office_type' => 'questura']);
        $o->setTranslations(['ar' => ['name' => 'مكتب']]);
        $o->forceFill(['status' => 'published'])->save();

        $it = $this->getJson('/api/v1/government/offices/only-ar', ['Accept-Language' => 'it'])->assertOk();
        $it->assertJsonPath('data.name', 'مكتب')->assertJsonPath('data.fallback', true)->assertJsonPath('data.office_type_label', 'Questura');
        $this->assertSame('مديرية الأمن (Questura)', $this->getJson('/api/v1/government/offices/only-ar', ['Accept-Language' => 'ar'])->json('data.office_type_label'));
    }

    public function test_source_and_freshness_are_exposed(): void
    {
        GovernmentService::factory()->published()->create(['slug' => 'old', 'last_verified_at' => now()->subDays(500)]);
        $this->getJson('/api/v1/government/services/old')->assertJsonPath('data.source.freshness', 'outdated')->assertJsonPath('data.source.type', 'official');
    }

    public function test_appointment_hub(): void
    {
        $guide = AppointmentGuide::factory()->published()->create(['slug' => 'questura-how', 'office_type' => 'questura']);
        AppointmentGuide::factory()->published()->create(['slug' => 'comune-how', 'office_type' => 'comune']);
        GovernmentOffice::factory()->published()->create(['slug' => 'q-roma', 'city_id' => $this->roma->id, 'office_type' => 'questura']);
        GovernmentOffice::factory()->published()->create(['slug' => 'q-milano', 'city_id' => $this->milano->id, 'office_type' => 'questura']);

        $res = $this->getJson('/api/v1/appointments/hub?type=questura&city=roma', ['Accept-Language' => 'en'])->assertOk();
        $res->assertJsonPath('data.guide.slug', $guide->slug)->assertJsonPath('data.city.name', 'Rome');
        $this->assertSame(['q-roma'], array_column($res->json('data.offices'), 'slug'));
        $this->assertStringContainsString('does not book', $res->json('data.notice'));
        $this->assertNotEmpty($res->json('data.guide.steps'));

        $this->getJson('/api/v1/appointments/hub?type=questura&city=atlantis')->assertNotFound();
        $this->getJson('/api/v1/appointments/hub?type=questura')->assertStatus(422);
        $this->getJson('/api/v1/appointments/hub?city=roma')->assertStatus(422);
        $this->getJson('/api/v1/appointments/hub?type=poste&city=roma')->assertOk()->assertJsonPath('data.guide', null)->assertJsonPath('data.offices', []);
    }

    public function test_appointment_guide_filter_and_detail(): void
    {
        AppointmentGuide::factory()->published()->create(['slug' => 'a1', 'office_type' => 'asl']);
        AppointmentGuide::factory()->published()->create(['slug' => 'a2', 'office_type' => 'comune']);

        $this->getJson('/api/v1/appointments/guides?office_type=asl')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'a1');
        $this->getJson('/api/v1/appointments/guides/a2')->assertOk()->assertJsonStructure(['data' => ['steps', 'tips', 'cautions', 'booking']]);
        $this->getJson('/api/v1/appointments/guides?office_type=x')->assertStatus(422);
    }

    public function test_list_endpoints_do_not_n_plus_one(): void
    {
        GovernmentOffice::factory()->published()->count(12)->create(['city_id' => $this->roma->id]);
        GovernmentService::factory()->published()->count(12)->create(['city_id' => $this->roma->id]);
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/government/offices?per_page=12')->assertOk();
        $this->getJson('/api/v1/government/services?per_page=12')->assertOk();

        $this->assertLessThanOrEqual(14, $count, "ran $count queries");
    }

    public function test_every_label_exists_in_all_locales(): void
    {
        foreach (array_keys(config('expa.locales')) as $locale) {
            app()->setLocale($locale);
            foreach (ServiceDomain::cases() as $c) {
                $this->assertNotSame('government.domains.'.$c->value, __('government.domains.'.$c->value), "$locale $c->value");
            }
            foreach (OfficeType::cases() as $c) {
                $this->assertNotSame('government.office_types.'.$c->value, __('government.office_types.'.$c->value), "$locale $c->value");
            }
            foreach (BookingMethod::cases() as $c) {
                $this->assertNotSame('government.booking_methods.'.$c->value, __('government.booking_methods.'.$c->value), "$locale $c->value");
            }
            $this->assertNotSame('government.booking_notice', __('government.booking_notice'));
        }
    }
}
