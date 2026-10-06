<?php

namespace Tests\Feature\Content;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Geo\Models\City;
use App\Domains\Guides\Models\Guide;
use App\Enums\ContentStatus;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuideAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
    }

    private function as(string $role): User
    {
        $u = User::factory()->create();
        $u->syncRoleKeys([$role]);
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function payload(array $over = []): array
    {
        return array_replace_recursive([
            'slug' => 'codice-fiscale',
            'category' => 'documents',
            'italian_term' => 'Codice fiscale',
            'source_name' => 'Agenzia delle Entrate',
            'source_url' => 'https://www.agenziaentrate.gov.it/portale/test',
            'source_type' => 'official',
            'last_verified_at' => now()->subDay()->toDateString(),
            'translations' => [
                'ar' => ['title' => 'الرقم الضريبي', 'summary' => 'ملخص', 'what_is' => 'ما هو',
                    'required_documents' => ['جواز السفر'], 'steps' => [['title' => 'الخطوة الأولى', 'text' => 'نص']]],
                'it' => ['title' => 'Codice fiscale'],
            ],
        ], $over);
    }

    private function create(array $over = []): array
    {
        return $this->postJson('/api/v1/admin/guides', $this->payload($over))->assertCreated()->json('data');
    }

    // ---- access -------------------------------------------------------------------------------

    public function test_guests_users_and_unrelated_staff_are_rejected(): void
    {
        $this->getJson('/api/v1/admin/guides')->assertUnauthorized();
        $this->as('user');
        $this->getJson('/api/v1/admin/guides')->assertForbidden();
        $this->postJson('/api/v1/admin/guides', $this->payload())->assertForbidden();
        $this->as('support_agent');
        $this->getJson('/api/v1/admin/guides')->assertForbidden();
    }

    public function test_translator_can_view_but_not_create(): void
    {
        $this->as('translator');
        $this->getJson('/api/v1/admin/guides')->assertOk();
        $this->postJson('/api/v1/admin/guides', $this->payload())->assertForbidden();
    }

    // ---- create / validate --------------------------------------------------------------------

    public function test_editor_creates_draft_guide_with_translations_and_audit(): void
    {
        $editor = $this->as('editor');
        $data = $this->create();

        $this->assertSame('draft', $data['status']);
        $this->assertSame($editor->id, $data['created_by']);
        $this->assertSame(['en'], $data['missing_locales']);
        $this->assertSame('الرقم الضريبي', $data['translations']['ar']['title']);
        $this->assertSame(['جواز السفر'], $data['translations']['ar']['required_documents']);
        $this->assertDatabaseHas('guides', ['slug' => 'codice-fiscale', 'italian_term' => 'Codice fiscale']);

        $this->assertNotNull(AuditLog::firstWhere('action', 'guide.created'));
        $this->assertNotNull(AuditLog::firstWhere('action', 'guidetranslation.created'));
        $this->getJson('/api/v1/guides/codice-fiscale')->assertNotFound(); // drafts are never public
    }

    public function test_status_cannot_be_set_via_create_or_update(): void
    {
        $this->as('editor');
        $data = $this->create(['status' => 'published', 'published_at' => now()->toDateTimeString()]);
        $this->assertSame('draft', $data['status']);

        $this->patchJson("/api/v1/admin/guides/{$data['id']}", ['status' => 'published'])->assertOk();
        $this->assertSame(ContentStatus::Draft, Guide::first()->status);
    }

    public function test_validation_rules(): void
    {
        $this->as('editor');
        $bad = fn (array $o) => $this->postJson('/api/v1/admin/guides', $this->payload($o))->assertStatus(422);

        $bad(['slug' => 'Bad Slug!']);
        $bad(['slug' => 'trailing-']);
        $bad(['category' => 'nonsense']);
        $bad(['source_url' => 'http://insecure.example.com']);
        $bad(['source_url' => 'javascript:alert(1)']);
        $bad(['source_type' => 'made_up']);
        $bad(['last_verified_at' => now()->addDay()->toDateString()]);
        $bad(['translations' => ['fr' => ['title' => 'Titre']]]);
        $bad(['translations' => ['ar' => ['title' => '']]]);
        $noTitleStep = $this->payload();
        $noTitleStep['translations']['ar']['steps'] = [['text' => 'no title']];
        $this->postJson('/api/v1/admin/guides', $noTitleStep)->assertStatus(422);
        $bad(['region_id' => 9999]);

        $this->postJson('/api/v1/admin/guides', ['slug' => 'x'])->assertStatus(422)
            ->assertJsonStructure(['error' => ['details' => ['category', 'translations']]]);
    }

    public function test_slug_must_be_unique_including_soft_deleted(): void
    {
        $this->as('editor');
        $data = $this->create();
        $this->postJson('/api/v1/admin/guides', $this->payload())->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['slug']]]);

        $this->as('admin');
        $this->deleteJson("/api/v1/admin/guides/{$data['id']}")->assertNoContent();
        // deleting frees the slug (there is no restore endpoint), and the trashed row keeps a unique tombstone slug
        $this->assertStringContainsString('~deleted~', Guide::withTrashed()->find($data['id'])->slug);
        $this->postJson('/api/v1/admin/guides', $this->payload())->assertCreated();
    }

    public function test_html_is_stripped_from_text_fields(): void
    {
        $this->as('editor');
        $data = $this->create(['translations' => ['ar' => [
            'summary' => 'ملخص <script>alert(1)</script><b>مهم</b>',
            'required_documents' => ['<img src=x onerror=alert(1)>جواز'],
            'steps' => [['title' => '<i>خطوة</i>', 'text' => '<a href="javascript:x">نص</a>']],
        ]], 'source_name' => '<b>INPS</b>']);

        $this->assertSame('ملخص alert(1)مهم', $data['translations']['ar']['summary']);
        $this->assertSame(['جواز'], $data['translations']['ar']['required_documents']);
        $this->assertSame('خطوة', $data['translations']['ar']['steps'][0]['title']);
        $this->assertSame('INPS', Guide::first()->source_name);
        $this->assertStringNotContainsString('<', json_encode($data['translations']));
    }

    public function test_city_must_belong_to_region(): void
    {
        $this->as('editor');
        $roma = City::firstWhere('slug', 'roma');
        $milano = City::firstWhere('slug', 'milano');

        $this->postJson('/api/v1/admin/guides', $this->payload(['city_id' => $roma->id, 'region_id' => $milano->region_id]))
            ->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['city_id']]]);
        $this->postJson('/api/v1/admin/guides', $this->payload(['city_id' => $roma->id, 'region_id' => $roma->region_id]))->assertCreated();
    }

    // ---- update / lock ------------------------------------------------------------------------

    public function test_update_upserts_translations_and_can_remove_one(): void
    {
        $this->as('editor');
        $id = $this->create()['id'];

        $this->patchJson("/api/v1/admin/guides/$id", ['translations' => ['en' => ['title' => 'Tax code'], 'it' => null]])
            ->assertOk()->assertJsonPath('data.translations.en.title', 'Tax code')->assertJsonMissingPath('data.translations.it');
        $this->assertSame(['it'], Guide::first()->missingLocales());
    }

    public function test_partial_update_does_not_wipe_other_fields(): void
    {
        $this->as('editor');
        $id = $this->create()['id'];

        $this->patchJson("/api/v1/admin/guides/$id", ['italian_term' => 'CF'])->assertOk();
        $g = Guide::first();
        $this->assertSame('CF', $g->italian_term);
        $this->assertSame('Agenzia delle Entrate', $g->source_name);
        $this->assertCount(2, $g->translations);
    }

    public function test_editor_cannot_edit_live_content_but_content_manager_can(): void
    {
        $g = Guide::factory()->published()->create(['slug' => 'live']);

        $this->as('editor');
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'x'])
            ->assertForbidden()->assertJsonPath('error.code', 'content_locked');

        $g->forceFill(['status' => 'approved'])->save();
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'x'])->assertForbidden()->assertJsonPath('error.code', 'content_locked');

        $this->as('content_manager');
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'x'])->assertOk();
    }

    public function test_translator_cannot_update_guides_via_guide_endpoint(): void
    {
        $g = Guide::factory()->translated()->create();
        $this->as('translator');
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['italian_term' => 'x'])->assertForbidden();
    }

    public function test_translator_can_save_translation_text_through_the_translations_endpoint_only(): void
    {
        $g = Guide::factory()->translated()->create();
        $this->as('translator');
        $res = $this->patchJson("/api/v1/admin/guides/{$g->id}/translations", ['translations' => ['en' => ['title' => 'Translated by translator']], 'italian_term' => 'HACK', 'slug' => 'hacked', 'status' => 'published'])->assertOk();

        $this->assertSame('Translated by translator', $g->fresh()->translation('en')->title);
        $this->assertNotSame('HACK', $g->fresh()->italian_term, 'attributes are ignored in translation-only mode');
        $this->assertNotSame('hacked', $g->fresh()->slug);
        $this->assertSame($g->status->value, $g->fresh()->status->value);
        $this->assertSame($this->app['auth']->guard('sanctum')->id() ?? $g->fresh()->updated_by, $g->fresh()->updated_by);
    }

    public function test_translator_cannot_edit_live_content_and_other_roles_without_translation_rights_are_refused(): void
    {
        $g = Guide::factory()->published()->create();
        $this->as('translator');
        $this->patchJson("/api/v1/admin/guides/{$g->id}/translations", ['translations' => ['en' => ['title' => 'x']]])->assertForbidden()->assertJsonPath('error.code', 'content_locked');

        $draft = Guide::factory()->translated()->create();
        $this->as('support_agent');
        $this->patchJson("/api/v1/admin/guides/{$draft->id}/translations", ['translations' => ['en' => ['title' => 'x']]])->assertForbidden();
    }

    public function test_translation_save_cannot_remove_the_required_arabic_text_and_requires_translations(): void
    {
        $g = Guide::factory()->translated()->create();
        $this->as('translator');
        $this->patchJson("/api/v1/admin/guides/{$g->id}/translations", [])->assertStatus(422);
        $this->patchJson("/api/v1/admin/guides/{$g->id}/translations", ['translations' => ['en' => ['title' => '']]])->assertStatus(422);
    }

    public function test_cannot_remove_arabic_from_published_guide(): void
    {
        $g = Guide::factory()->published()->create();
        $this->as('content_manager');
        $this->patchJson("/api/v1/admin/guides/{$g->id}", ['translations' => ['ar' => null]])
            ->assertStatus(422)->assertJsonPath('error.code', 'cannot_remove_required_translation');
        $this->assertContains('ar', $g->fresh()->translatedLocales());
    }

    public function test_update_changes_are_audited_with_before_after(): void
    {
        $this->as('editor');
        $id = $this->create()['id'];
        $this->patchJson("/api/v1/admin/guides/$id", ['italian_term' => 'Nuovo'])->assertOk();

        $log = AuditLog::where('action', 'guide.updated')->latest('id')->first();
        $this->assertSame(['old' => 'Codice fiscale', 'new' => 'Nuovo'], $log->changes['italian_term']);
    }

    // ---- workflow -----------------------------------------------------------------------------

    public function test_full_workflow_across_roles_with_four_eyes(): void
    {
        $editor = $this->as('editor');
        $id = $this->create()['id'];
        $go = fn (string $to) => $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => $to]);

        $go('review')->assertOk()->assertJsonPath('data.status', 'review');
        $go('approved')->assertForbidden();              // editor cannot approve
        $go('published')->assertForbidden();

        $manager = $this->as('content_manager');
        $go('published')->assertStatus(422)->assertJsonPath('error.code', 'invalid_status_transition'); // review → published illegal
        $go('approved')->assertOk()->assertJsonPath('data.status', 'approved');
        $go('published')->assertOk()->assertJsonPath('data.status', 'published');

        $this->getJson('/api/v1/guides/codice-fiscale', ['Accept-Language' => 'ar'])->assertOk()->assertJsonPath('data.title', 'الرقم الضريبي');
        $go('archived')->assertOk();
        $this->getJson('/api/v1/guides/codice-fiscale')->assertNotFound();
        $this->assertNotSame($editor->id, $manager->id);
    }

    public function test_author_cannot_approve_own_guide_when_four_eyes_enabled(): void
    {
        $manager = $this->as('content_manager');
        $id = $this->create()['id'];
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'review'])->assertOk();

        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])->assertForbidden();

        config(['content.four_eyes' => false]);
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])->assertOk();
        $this->assertSame($manager->id, Guide::first()->created_by);
    }

    public function test_publishing_is_blocked_with_actionable_problems(): void
    {
        $this->as('editor');
        $id = $this->create(['source_name' => null, 'source_url' => 'https://evil-inps.com/x', 'translations' => ['ar' => ['summary' => '', 'what_is' => '']]])['id'];
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'review'])->assertOk();
        $this->as('content_manager');
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved'])->assertOk();

        $res = $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'published'], ['Accept-Language' => 'en'])
            ->assertStatus(422)->assertJsonPath('error.code', 'content_not_publishable');
        $codes = collect($res->json('error.details.problems'))->pluck('code')->all();
        $this->assertContains('missing_translation', $codes);
        $this->assertContains('missing_source_field', $codes);
        $this->assertSame(ContentStatus::Approved, Guide::first()->status);
    }

    public function test_official_source_on_non_official_domain_is_blocked(): void
    {
        $this->as('editor');
        $id = $this->create(['source_url' => 'https://inps-permessi.com/x'])['id'];
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'review']);
        $this->as('content_manager');
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved']);

        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'published'])
            ->assertStatus(422)->assertJsonFragment(['code' => 'source_domain_not_official']);
    }

    public function test_transition_validation(): void
    {
        $this->as('content_manager');
        $id = $this->create()['id'];
        $this->postJson("/api/v1/admin/guides/$id/transition", [])->assertStatus(422);
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'nonsense'])->assertStatus(422);
    }

    public function test_scheduling_publishes_later(): void
    {
        $this->as('editor');
        $id = $this->create()['id'];
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'review']);
        $this->as('content_manager');
        $this->postJson("/api/v1/admin/guides/$id/transition", ['to' => 'approved']);

        $this->postJson("/api/v1/admin/guides/$id/schedule", ['publish_at' => now()->subHour()->toIso8601String()])
            ->assertStatus(422)->assertJsonPath('error.code', 'invalid_schedule');
        $this->postJson("/api/v1/admin/guides/$id/schedule", ['publish_at' => now()->addHours(2)->toIso8601String()])->assertOk();

        $this->getJson('/api/v1/guides/codice-fiscale')->assertNotFound();
        $this->travel(3)->hours();
        $this->artisan('expa:publish-scheduled')->expectsOutputToContain('Published 1')->assertSuccessful();
        $this->getJson('/api/v1/guides/codice-fiscale')->assertOk();
    }

    public function test_editor_cannot_schedule(): void
    {
        $g = Guide::factory()->translated()->create();
        $g->forceFill(['status' => 'approved'])->save();
        $this->as('editor');
        $this->postJson("/api/v1/admin/guides/{$g->id}/schedule", ['publish_at' => now()->addDay()->toIso8601String()])->assertForbidden();
    }

    // ---- delete / list ------------------------------------------------------------------------

    public function test_delete_rules(): void
    {
        $draft = Guide::factory()->translated()->create();
        $live = Guide::factory()->published()->create();

        $this->as('editor');
        $this->deleteJson("/api/v1/admin/guides/{$draft->id}")->assertForbidden(); // editors cannot delete

        $this->as('content_manager');
        $this->deleteJson("/api/v1/admin/guides/{$live->id}")->assertStatus(422)->assertJsonPath('error.code', 'cannot_delete_live_content');
        $this->deleteJson("/api/v1/admin/guides/{$draft->id}")->assertNoContent();
        $this->assertSoftDeleted('guides', ['id' => $draft->id]);
    }

    public function test_admin_list_shows_all_statuses_with_filters_and_stale_flag(): void
    {
        Guide::factory()->translated()->create(['slug' => 'draft-one']);
        Guide::factory()->published()->create(['slug' => 'live-one', 'last_verified_at' => now()->subDays(300)]);
        Guide::factory()->published()->create(['slug' => 'live-two']);

        $this->as('editor');
        $this->getJson('/api/v1/admin/guides')->assertOk()->assertJsonPath('meta.total', 3);
        $this->getJson('/api/v1/admin/guides?filter[status]=draft')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/guides?filter[stale]=1')->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.slug', 'live-one');
        $this->getJson('/api/v1/admin/guides?filter[q]=two')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/guides?filter[status]=bogus')->assertStatus(422);
        $this->getJson('/api/v1/admin/guides?sort=password')->assertOk();

        $row = $this->getJson('/api/v1/admin/guides?filter[q]=draft-one')->json('data.0');
        $this->assertSame(['review'], $row['allowed_transitions']);
        $this->assertSame([], $row['missing_locales']);
        $this->assertArrayHasKey('ar', $row['titles']);
    }

    public function test_admin_show_includes_all_translations_and_404s_for_missing(): void
    {
        $g = Guide::factory()->translated()->create();
        $this->as('translator');
        $this->getJson("/api/v1/admin/guides/{$g->id}")->assertOk()->assertJsonCount(3, 'data.translations');
        $this->getJson('/api/v1/admin/guides/99999')->assertNotFound();
    }

    public function test_config_registers_guides_for_scheduler(): void
    {
        $this->assertContains(Guide::class, config('content.models'));
    }
}
