<?php

namespace Tests\Feature\Content;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Appointments\Models\AppointmentGuide;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Content\Services\PublishGuard;
use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Enums\ContentStatus;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/** The generic content workflow, exercised once per module that uses it. */
class ContentModulesAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    public static function modules(): array
    {
        $source = ['source_name' => 'Test Source', 'source_url' => 'https://www.interno.gov.it/x', 'source_type' => 'official', 'last_verified_at' => '2026-09-01'];

        return [
            'government services' => ['government/services', GovernmentService::class, fn () => $source + [
                'slug' => 'permesso-test', 'domain' => 'immigration', 'italian_term' => 'Permesso',
                'translations' => ['ar' => ['name' => 'تصريح', 'summary' => 'ملخص', 'how_to_apply' => 'كيفية']],
            ], 'name'],
            'government offices' => ['government/offices', GovernmentOffice::class, fn () => $source + [
                'slug' => 'questura-test', 'office_type' => 'questura', 'booking_method' => 'online',
                'official_url' => 'https://questure.poliziadistato.it/test', 'booking_url' => 'https://www.portaleimmigrazione.it/b',
                'translations' => ['ar' => ['name' => 'مديرية الأمن']],
            ], 'name'],
            'appointment guides' => ['appointments/guides', AppointmentGuide::class, fn () => $source + [
                'slug' => 'questura-booking', 'office_type' => 'questura', 'booking_method' => 'online',
                'booking_portal_url' => 'https://www.portaleimmigrazione.it/b',
                'translations' => ['ar' => ['title' => 'حجز موعد', 'summary' => 'ملخص', 'steps' => [['title' => 'خطوة', 'text' => 'نص']]]],
            ], 'title'],
        ];
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    #[DataProvider('modules')]
    public function test_access_control(string $uri, string $class, \Closure $payload, string $primary = ''): void
    {
        $this->getJson("/api/v1/admin/$uri")->assertUnauthorized();
        $this->as('user');
        $this->getJson("/api/v1/admin/$uri")->assertForbidden();
        $this->as('support_agent');
        $this->getJson("/api/v1/admin/$uri")->assertForbidden();
        $this->as('translator');
        $this->getJson("/api/v1/admin/$uri")->assertOk();
        $this->postJson("/api/v1/admin/$uri", $payload())->assertForbidden();
    }

    #[DataProvider('modules')]
    public function test_editor_creates_draft_and_workflow_needs_a_second_person(string $uri, string $class, \Closure $payload, string $primary = ''): void
    {
        $this->as('editor');
        $created = $this->postJson("/api/v1/admin/$uri", $payload())->assertCreated();
        $id = $created->json('data.id');
        $this->assertSame('draft', $created->json('data.status'));
        $this->assertSame(['en', 'it'], $created->json('data.missing_locales'));

        $go = fn (string $to) => $this->postJson("/api/v1/admin/$uri/$id/transition", ['to' => $to]);
        $go('review')->assertOk();
        $go('approved')->assertForbidden();      // editor cannot approve
        // editing content that is under review sends it back to draft: a reviewer can never approve text that changed under them
        $this->patchJson("/api/v1/admin/$uri/$id", ['sort_order' => 3])->assertOk()->assertJsonPath('data.status', 'draft');
        $go('review')->assertOk();

        $this->as('content_manager');
        $go('approved')->assertOk();
        $go('published')->assertOk()->assertJsonPath('data.status', 'published');

        $this->as('editor');
        $this->patchJson("/api/v1/admin/$uri/$id", ['sort_order' => 4])->assertForbidden()->assertJsonPath('error.code', 'content_locked');
    }

    #[DataProvider('modules')]
    public function test_author_cannot_approve_own_item(string $uri, string $class, \Closure $payload, string $primary = ''): void
    {
        $this->as('content_manager');
        $id = $this->postJson("/api/v1/admin/$uri", $payload())->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/$uri/$id/transition", ['to' => 'review'])->assertOk();
        $this->postJson("/api/v1/admin/$uri/$id/transition", ['to' => 'approved'])->assertForbidden();
    }

    #[DataProvider('modules')]
    public function test_publish_is_blocked_without_source_or_arabic(string $uri, string $class, \Closure $payload, string $primary = ''): void
    {
        $this->as('content_manager');
        $p = $payload();
        unset($p['source_url']);
        $id = $this->postJson("/api/v1/admin/$uri", $p)->assertCreated()->json('data.id');
        $this->as('editor');
        $this->postJson("/api/v1/admin/$uri/$id/transition", ['to' => 'review'])->assertOk();
        $this->as('content_manager');
        $this->postJson("/api/v1/admin/$uri/$id/transition", ['to' => 'approved'])->assertOk();

        $this->postJson("/api/v1/admin/$uri/$id/transition", ['to' => 'published'])
            ->assertStatus(422)->assertJsonPath('error.code', 'content_not_publishable')
            ->assertJsonFragment(['code' => 'missing_source_field', 'field' => 'source_url']);
    }

    #[DataProvider('modules')]
    public function test_validation_slug_html_and_unique(string $uri, string $class, \Closure $payload, string $primary): void
    {
        $this->as('editor');
        $this->postJson("/api/v1/admin/$uri", ['slug' => 'Bad Slug'] + $payload())->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['slug']]]);
        $this->postJson("/api/v1/admin/$uri", ['source_url' => 'http://insecure.example'] + $payload())->assertStatus(422);
        $this->postJson("/api/v1/admin/$uri", [])->assertStatus(422);

        $p = $payload();
        $p['translations']['ar'][$primary] = '<b>عنوان</b><script>x</script>';
        $res = $this->postJson("/api/v1/admin/$uri", $p)->assertCreated();
        $this->assertSame('عنوانx', $res->json("data.translations.ar.$primary"));
        $this->postJson("/api/v1/admin/$uri", $payload())->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['slug']]]);
    }

    #[DataProvider('modules')]
    public function test_delete_rules_and_audit(string $uri, string $class, \Closure $payload, string $primary = ''): void
    {
        $this->as('editor');
        $id = $this->postJson("/api/v1/admin/$uri", $payload())->assertCreated()->json('data.id');
        $this->deleteJson("/api/v1/admin/$uri/$id")->assertForbidden();

        $this->as('content_manager');
        $this->deleteJson("/api/v1/admin/$uri/$id")->assertNoContent();
        $this->assertSoftDeleted((new $class)->getTable(), ['id' => $id]);
        $this->assertNotNull(AuditLog::where('action', 'like', '%.created')->first());
    }

    #[DataProvider('modules')]
    public function test_list_filters_and_status(string $uri, string $class, \Closure $payload, string $primary = ''): void
    {
        $this->as('editor');
        $this->postJson("/api/v1/admin/$uri", $payload())->assertCreated();
        $this->getJson("/api/v1/admin/$uri?filter[status]=draft")->assertJsonPath('meta.total', 1);
        $this->getJson("/api/v1/admin/$uri?filter[status]=published")->assertJsonPath('meta.total', 0);
        $this->getJson("/api/v1/admin/$uri?filter[status]=bogus")->assertStatus(422);
        $this->getJson("/api/v1/admin/$uri?filter[q]=test")->assertOk();
        $this->getJson("/api/v1/admin/$uri/99999")->assertNotFound();
    }

    public function test_service_links_offices_and_validates_ids(): void
    {
        $o1 = GovernmentOffice::factory()->translated()->create();
        $o2 = GovernmentOffice::factory()->translated()->create();
        $this->as('editor');
        [$uri, , $payload] = self::modules()['government services'];

        $id = $this->postJson("/api/v1/admin/$uri", $payload() + ['office_ids' => [$o1->id, $o2->id]])->assertCreated()
            ->assertJsonPath('data.office_ids', [$o1->id, $o2->id])->json('data.id');
        $this->patchJson("/api/v1/admin/$uri/$id", ['office_ids' => [$o2->id]])->assertOk()->assertJsonPath('data.office_ids', [$o2->id]);
        $this->postJson("/api/v1/admin/$uri", ['slug' => 'other'] + $payload() + ['office_ids' => [99999]])->assertStatus(422);
    }

    public function test_office_field_validation_and_publish_url_guard(): void
    {
        $this->as('editor');
        [$uri, , $payload] = self::modules()['government offices'];
        $bad = fn (array $o) => $this->postJson("/api/v1/admin/$uri", array_merge($payload(), ['slug' => 'o'.random_int(1, 99999)], $o))->assertStatus(422);

        $bad(['postal_code' => '1234']);
        $bad(['phone' => 'call me maybe!']);
        $bad(['email' => 'not-an-email']);
        $bad(['booking_url' => 'http://insecure.example/b']);
        $bad(['booking_url' => 'javascript:alert(1)']);
        $bad(['booking_method' => 'telepathy']);
        $bad(['office_type' => 'castle']);

        // a URL that bypassed validation (legacy data) is still caught at publish time
        $o = GovernmentOffice::factory()->translated()->create(['booking_url' => 'http://insecure.example']);
        $o->forceFill(['status' => 'approved'])->save();
        $this->expectException(ApiException::class);
        $o->transitionTo(ContentStatus::Published);
    }

    public function test_municipal_domains_count_as_official_but_look_alikes_do_not(): void
    {
        $guard = app(PublishGuard::class);
        foreach (['www.comune.padova.it', 'comune.roma.it', 'www.regione.toscana.it', 'servizi.comune.firenze.fi.it', 'questure.poliziadistato.it', 'sub.agenziaentrate.gov.it'] as $h) {
            $this->assertTrue($guard->isOfficialHost($h), $h);
        }
        foreach (['comune.padova.it.evil.com', 'comune-padova.it', 'fakecomune.padova.it.example.org', 'notgov.it', 'gov.it.attacker.net', 'comune.evil.com'] as $h) {
            $this->assertFalse($guard->isOfficialHost($h), $h);
        }
    }
}
