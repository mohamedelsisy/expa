<?php

namespace Tests\Feature\Legal;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Legal\Models\LegalDocument;
use App\Domains\Legal\Services\PolicyVersion;
use App\Domains\Profile\Models\Consent;
use App\Enums\ContentStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegalDocumentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
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
        return array_merge([
            'slug' => 'privacy', 'version' => '2026-11-01',
            'translations' => [
                'ar' => ['title' => 'سياسة الخصوصية (نص اختباري)', 'body' => "# عنوان\nنص اختباري فقط"],
                'en' => ['title' => 'Privacy policy (test text)', 'body' => "# Heading\nTest text only"],
            ],
        ], $over);
    }

    private function publish(array $over = []): LegalDocument
    {
        $d = new LegalDocument(['slug' => $over['slug'] ?? 'privacy', 'version' => $over['version'] ?? 'v1']);
        $d->save();
        $d->setTranslations($over['translations'] ?? $this->payload()['translations']);
        $d->forceFill(['status' => 'published', 'published_at' => now()])->save();

        return $d->fresh();
    }

    public function test_nothing_is_seeded_and_unpublished_documents_are_404(): void
    {
        $this->seed();
        $this->assertSame(0, LegalDocument::count());
        foreach (['privacy', 'terms', 'cookies'] as $slug) {
            $this->getJson("/api/v1/legal/$slug")->assertNotFound()->assertJsonPath('error.code', 'not_found');
        }
        $draft = new LegalDocument(['slug' => 'terms', 'version' => 'v1']);
        $draft->save();
        $draft->setTranslations($this->payload()['translations']);
        $this->getJson('/api/v1/legal/terms')->assertNotFound();
        $this->getJson('/api/v1/legal/unknown')->assertNotFound();
    }

    public function test_public_contract_localisation_and_cache(): void
    {
        $this->publish(['slug' => 'terms', 'version' => '2026-11-01']);

        $r = $this->getJson('/api/v1/legal/terms', ['Accept-Language' => 'ar'])->assertOk()
            ->assertJsonPath('data.slug', 'terms')->assertJsonPath('data.format', 'markdown')
            ->assertJsonPath('data.version', '2026-11-01')->assertJsonPath('data.title', 'سياسة الخصوصية (نص اختباري)');
        $this->assertNotNull($r->json('data.published_at'));
        $this->assertArrayNotHasKey('source', $r->json('data'));
        $this->assertStringContainsString('max-age', $r->headers->get('Cache-Control'));

        $this->getJson('/api/v1/legal/terms', ['Accept-Language' => 'en'])->assertJsonPath('data.title', 'Privacy policy (test text)');
        // Italian missing: falls back (en first) and says so
        $this->getJson('/api/v1/legal/terms', ['Accept-Language' => 'it'])->assertOk()->assertJsonPath('data.fallback', true)->assertJsonPath('data.locale', 'en');
    }

    public function test_admin_workflow_requires_arabic_four_eyes_and_permission(): void
    {
        $this->as('editor');
        $this->postJson('/api/v1/admin/legal', $this->payload())->assertForbidden(); // editors have no legal permission

        $author = $this->as('content_manager');
        $en = $this->payload(['translations' => ['en' => ['title' => 'Only English', 'body' => 'x']]]);
        $id = $this->postJson('/api/v1/admin/legal', $en)->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'review'])->assertOk();

        $this->assertNotNull($author);
        $reviewer = $this->as('admin');
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'approved'])->assertOk(); // different person than the author
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'published'])->assertStatus(422)
            ->assertJsonPath('error.code', 'content_not_publishable')
            ->assertJsonFragment(['code' => 'missing_translation', 'locale' => 'ar']);
        $this->assertNotNull($reviewer);

        $this->patchJson("/api/v1/admin/legal/$id/translations", ['translations' => ['ar' => ['title' => 'العنوان', 'body' => 'نص']]])->assertOk();
        // edit of approved content by a publisher is allowed; publish now works
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'published'])->assertOk()->assertJsonPath('data.status', 'published');
        $this->getJson('/api/v1/legal/privacy')->assertOk();
    }

    public function test_author_cannot_approve_own_document_and_content_manager_cannot_publish(): void
    {
        $this->as('admin');
        $id = $this->postJson('/api/v1/admin/legal', $this->payload())->assertCreated()->json('data.id');
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'review'])->assertOk();
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'approved'])->assertForbidden(); // four-eyes

        $this->as('content_manager');
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/legal/$id/transition", ['to' => 'published'])->assertForbidden(); // counsel-approved publishing is admin-only
    }

    public function test_validation_slug_version_uniqueness_and_markup_stripping(): void
    {
        $this->as('admin');
        $this->postJson('/api/v1/admin/legal', $this->payload(['slug' => 'imprint']))->assertStatus(422);
        $this->postJson('/api/v1/admin/legal', $this->payload(['version' => 'bad version!']))->assertStatus(422);
        $res = $this->postJson('/api/v1/admin/legal', $this->payload(['translations' => ['ar' => ['title' => 'عنوان', 'body' => 'مرحبا <script>alert(1)</script> [x](javascript:alert(1))']]]))->assertCreated();
        $body = $res->json('data.translations.ar.body');
        $this->assertStringNotContainsString('<script', $body);
        $this->assertStringNotContainsString('javascript:', $body);
        $this->postJson('/api/v1/admin/legal', $this->payload())->assertStatus(422); // same slug+version
        $this->postJson('/api/v1/admin/legal', $this->payload(['slug' => 'terms']))->assertCreated(); // same version, other document
    }

    public function test_publishing_a_new_version_archives_the_previous_one(): void
    {
        $this->as('admin');
        $old = $this->publish(['version' => 'v1']);
        $new = $this->publish(['version' => 'v2']);
        $new->forceFill(['status' => 'approved', 'published_at' => null])->save();
        $new->transitionTo(ContentStatus::Published);

        $this->assertSame(ContentStatus::Archived, $old->fresh()->status);
        $this->assertSame(1, LegalDocument::published()->where('slug', 'privacy')->count());
        $this->getJson('/api/v1/legal/privacy')->assertJsonPath('data.version', 'v2');
    }

    public function test_consent_policy_version_follows_the_published_privacy_document_and_falls_back_to_config(): void
    {
        config(['privacy.policy_version' => 'cfg-draft']);
        $this->assertSame('cfg-draft', PolicyVersion::current());
        $this->getJson('/api/v1/privacy/purposes')->assertJsonPath('data.policy_version', 'cfg-draft');

        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')->putJson('/api/v1/profile/consents', ['consents' => ['analytics' => true]])->assertOk()
            ->assertJsonPath('data.policy_version', 'cfg-draft')->assertJsonPath('data.consents.analytics.outdated', false);

        $this->publish(['slug' => 'terms', 'version' => 'terms-1']); // terms do not affect consents
        $this->assertSame('cfg-draft', PolicyVersion::current());

        $this->publish(['version' => '2026-11-01']);
        $this->assertSame('2026-11-01', PolicyVersion::current());
        $this->getJson('/api/v1/privacy/purposes')->assertJsonPath('data.policy_version', '2026-11-01');
        $this->getJson('/api/v1/profile/consents')->assertJsonPath('data.consents.analytics.outdated', true); // re-consent required

        $this->putJson('/api/v1/profile/consents', ['consents' => ['analytics' => true]])->assertOk()->assertJsonPath('data.consents.analytics.outdated', false);
        $this->assertSame('2026-11-01', Consent::where('user_id', $user->id)->latest('id')->value('policy_version'));
    }

    public function test_publishing_is_audited_and_deleting_live_content_is_refused(): void
    {
        $this->as('admin');
        $d = $this->publish();
        $this->assertDatabaseHas('audit_logs', ['subject_id' => $d->id, 'action' => 'legaldocument.created']);
        $this->deleteJson("/api/v1/admin/legal/{$d->id}")->assertStatus(422);
    }
}
