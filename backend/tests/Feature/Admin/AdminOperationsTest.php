<?php

namespace Tests\Feature\Admin;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Ai\Models\AiConversation;
use App\Domains\Ai\Models\AiMessage;
use App\Domains\Audit\Models\AuditLog;
use App\Domains\Geo\Models\City;
use App\Domains\Geo\Models\Region;
use App\Domains\Guides\Models\Guide;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Notifications\Services\NotificationPresenter;
use App\Domains\Profile\Services\ConsentService;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminOperationsTest extends TestCase
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

    private function region(): Region
    {
        $r = Region::create(['code' => '12', 'slug' => 'lazio']);
        $r->setTranslations(['ar' => ['name' => 'لاتسيو'], 'en' => ['name' => 'Lazio']]);

        return $r;
    }

    // ---- geography ----------------------------------------------------------------------------

    public function test_cities_can_be_managed_by_content_staff_with_the_right_permission(): void
    {
        $r = $this->region();
        $this->as('content_manager');
        $id = $this->postJson('/api/v1/admin/cities', ['slug' => 'roma', 'region_id' => $r->id, 'translations' => ['ar' => ['name' => 'روما'], 'it' => ['name' => '<b>Roma</b>']]])
            ->assertCreated()->assertJsonPath('data.translations.it', 'Roma')->json('data.id');
        $this->putJson("/api/v1/admin/cities/$id", ['slug' => 'roma', 'region_id' => $r->id, 'translations' => ['ar' => ['name' => 'روما العاصمة']]])->assertOk();
        $this->getJson('/api/v1/admin/cities?q='.rawurlencode('العاصمة'))->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/admin/regions')->assertOk()->assertJsonPath('data.0.cities', 1);
        $this->deleteJson("/api/v1/admin/cities/$id")->assertNoContent();
        $this->assertNotNull(AuditLog::firstWhere('action', 'admin.city.deleted'));
    }

    public function test_city_validation_requires_arabic_unique_slug_and_a_real_region(): void
    {
        $r = $this->region();
        $this->as('admin');
        $this->postJson('/api/v1/admin/cities', ['slug' => 'Bad Slug', 'region_id' => $r->id, 'translations' => ['ar' => ['name' => 'x']]])->assertStatus(422);
        $this->postJson('/api/v1/admin/cities', ['slug' => 'roma', 'region_id' => 999, 'translations' => ['ar' => ['name' => 'x']]])->assertStatus(422);
        $this->postJson('/api/v1/admin/cities', ['slug' => 'roma', 'region_id' => $r->id, 'translations' => ['en' => ['name' => 'Rome']]])->assertStatus(422);
        $this->postJson('/api/v1/admin/cities', ['slug' => 'roma', 'region_id' => $r->id, 'translations' => ['ar' => ['name' => 'روما']]])->assertCreated();
        $this->postJson('/api/v1/admin/cities', ['slug' => 'roma', 'region_id' => $r->id, 'translations' => ['ar' => ['name' => 'روما']]])->assertStatus(422);
        $this->as('translator');
        $this->postJson('/api/v1/admin/cities', ['slug' => 'x', 'region_id' => $r->id, 'translations' => ['ar' => ['name' => 'x']]])->assertForbidden();
    }

    public function test_a_city_in_use_cannot_be_deleted(): void
    {
        $r = $this->region();
        $c = new City(['slug' => 'roma']);
        $c->region_id = $r->id;
        $c->save();
        $g = Guide::factory()->create();
        $g->forceFill(['city_id' => $c->id])->save();
        $this->as('admin');
        $this->deleteJson("/api/v1/admin/cities/{$c->id}")->assertStatus(409)->assertJsonPath('error.code', 'city_in_use');
    }

    // ---- user deletion ------------------------------------------------------------------------

    public function test_admin_can_start_gdpr_erasure_of_a_user_but_not_of_staff_or_themselves(): void
    {
        $admin = $this->as('admin');
        $victim = User::factory()->create();
        $this->deleteJson("/api/v1/admin/users/{$victim->id}")->assertStatus(202);
        // erasure runs on the queue (sync in tests): the account is locked, then anonymised and soft-deleted
        $this->assertTrue($victim->fresh() === null || $victim->fresh()->status === UserStatus::PendingErasure);
        $this->assertNull(User::find($victim->id)?->email === $victim->email ? $victim : null, 'the e-mail address no longer identifies the account');
        $this->assertNotNull(AuditLog::firstWhere('action', 'privacy.erasure_requested'));

        $this->deleteJson("/api/v1/admin/users/{$admin->id}")->assertForbidden();
        $other = User::factory()->create();
        $other->syncRoleKeys(['admin']);
        $this->deleteJson("/api/v1/admin/users/{$other->id}")->assertForbidden();

        $this->as('support_agent');
        $this->deleteJson('/api/v1/admin/users/'.User::factory()->create()->id)->assertForbidden();
    }

    // ---- broadcast ----------------------------------------------------------------------------

    public function test_broadcast_is_in_app_only_localized_and_audited(): void
    {
        $u = User::factory()->create(['locale' => 'it']);
        app(ConsentService::class)->record($u, ['email_reminders' => true]);
        Notification::fake();
        $this->as('admin');

        $this->postJson('/api/v1/admin/notifications/broadcast', ['title' => ['ar' => 'صيانة', 'it' => '<i>Manutenzione</i>'], 'body' => ['ar' => 'نص', 'it' => 'Testo']])
            ->assertStatus(202);

        $n = UserNotification::where('user_id', $u->id)->first();
        $this->assertSame('announcement', $n->type);
        app()->setLocale('it');
        $this->assertSame('Manutenzione', app(NotificationPresenter::class)->title($n));
        app()->setLocale('en');
        $this->assertSame('صيانة', app(NotificationPresenter::class)->title($n), 'falls back to the Arabic text');
        Notification::assertNothingSent();
        $this->assertNotNull(AuditLog::firstWhere('action', 'admin.notification.broadcast'));
    }

    public function test_broadcast_needs_arabic_text_a_valid_role_and_the_permission(): void
    {
        $this->as('admin');
        $this->postJson('/api/v1/admin/notifications/broadcast', ['title' => ['en' => 'x'], 'body' => ['en' => 'y']])->assertStatus(422);
        $this->postJson('/api/v1/admin/notifications/broadcast', ['title' => ['ar' => 'x'], 'body' => ['ar' => 'y'], 'role' => 'nope'])->assertStatus(422);
        $this->as('content_manager');
        $this->postJson('/api/v1/admin/notifications/broadcast', ['title' => ['ar' => 'x'], 'body' => ['ar' => 'y']])->assertForbidden();
    }

    // ---- settings / AI ------------------------------------------------------------------------

    public function test_settings_are_read_only_and_never_contain_secrets(): void
    {
        config(['ai.anthropic.api_key' => 'sk-secret-value', 'billing.stripe.secret_key' => 'sk_live_secret', 'documents.clamav.host' => 'clam.internal']);
        $this->as('admin');
        $res = $this->getJson('/api/v1/admin/settings')->assertOk()->assertJsonPath('data.ai.driver', 'fake');
        foreach (['sk-secret-value', 'sk_live_secret', 'clam.internal', config('app.key')] as $secret) {
            $this->assertStringNotContainsString((string) $secret, $res->getContent());
        }
        $this->putJson('/api/v1/admin/settings', [])->assertStatus(405);
        $this->as('support_agent');
        $this->getJson('/api/v1/admin/settings')->assertForbidden();
    }

    public function test_ai_admin_exposes_metadata_never_conversation_content(): void
    {
        $user = User::factory()->create();
        $c = new AiConversation(['locale' => 'ar', 'title' => 'TOP-SECRET-TITLE']);
        $c->user_id = $user->id;
        $c->save();
        $m = new AiMessage(['role' => 'user', 'content' => 'TOP-SECRET-QUESTION', 'intent' => 'documents', 'degraded' => false]);
        $m->ai_conversation_id = $c->id;
        $m->user_id = $user->id;
        $m->save();

        $this->as('support_agent');
        $res = $this->getJson('/api/v1/admin/ai/conversations')->assertOk()->assertJsonPath('data.0.messages', 1);
        $this->assertStringNotContainsString('TOP-SECRET', $res->getContent());
        $this->getJson('/api/v1/admin/ai/usage')->assertOk()->assertJsonPath('data.questions_30d', 1);
        $this->getJson('/api/v1/admin/ai/knowledge')->assertForbidden(); // knowledge needs ai.manage_knowledge

        $this->as('admin');
        $this->getJson('/api/v1/admin/ai/knowledge')->assertOk()->assertJsonStructure(['data', 'meta' => ['chunks_total']]);
        $this->postJson('/api/v1/admin/ai/knowledge/reindex')->assertOk();
        $this->assertNotNull(AuditLog::firstWhere('action', 'admin.ai.knowledge_reindexed'));
    }
}
