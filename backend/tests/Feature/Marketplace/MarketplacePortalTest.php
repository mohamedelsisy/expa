<?php

namespace Tests\Feature\Marketplace;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Marketplace\Models\ProviderLead;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Domains\Privacy\Providers\MarketplaceData;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

class MarketplacePortalTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
        Storage::fake('documents');
    }

    private function applyPayload(array $over = []): array
    {
        return array_replace_recursive([
            'category' => 'translator', 'display_name' => 'Studio Test', 'serves_online' => true, 'languages' => ['ar', 'it'],
            'contact_email' => 'studio@example.test', 'website' => 'https://studio.example.test',
            'translations' => ['ar' => ['headline' => 'استوديو الترجمة', 'description' => 'وصف']],
            'services' => [['price_from_eur' => 40, 'translations' => ['ar' => ['name' => 'ترجمة محلفة']]]],
        ], $over);
    }

    public function test_apply_creates_private_draft_and_grants_provider_role_only(): void
    {
        $u = $this->member();
        $this->actingAs($u, 'sanctum');
        $this->postJson('/api/v1/provider/apply', ['category' => 'pirate'])->assertUnprocessable();
        $r = $this->postJson('/api/v1/provider/apply', $this->applyPayload())->assertCreated()->assertJsonPath('data.status', 'draft');
        $this->assertArrayNotHasKey('commission_percent', $r->json('data'));
        $this->assertTrue($u->fresh()->hasRole('provider'));
        $this->assertFalse($u->fresh()->hasPermission('providers.view'));
        $this->postJson('/api/v1/provider/apply', $this->applyPayload())->assertStatus(409);
        $this->getJson('/api/v1/providers/'.$r->json('data.slug'))->assertNotFound(); // not public
        $this->getJson('/api/v1/admin/marketplace/providers')->assertForbidden();
        $this->assertDatabaseHas('audit_logs', ['action' => 'marketplace.provider_applied']);
    }

    public function test_non_provider_is_rejected_and_owner_cannot_set_admin_fields(): void
    {
        $this->actingAs($this->member(), 'sanctum')->getJson('/api/v1/provider/profile')->assertForbidden()->assertJsonPath('error.code', 'provider_account_required');
        $u = $this->member();
        $this->actingAs($u, 'sanctum')->postJson('/api/v1/provider/apply', $this->applyPayload())->assertCreated();
        $this->putJson('/api/v1/provider/profile', ['commission_percent' => 50, 'slug' => 'hacked', 'verification_status' => 'verified', 'status' => 'published', 'user_id' => 1, 'display_name' => '<i>Renamed</i>'])->assertOk();
        $p = ServiceProvider::where('user_id', $u->id)->first();
        $this->assertNull($p->commission_percent);
        $this->assertNotSame('hacked', $p->slug);
        $this->assertSame('unverified', $p->verification_status->value);
        $this->assertSame('draft', $p->status->value);
        $this->assertSame('Renamed', $p->display_name);
        $this->putJson('/api/v1/provider/profile', ['website' => 'http://insecure.test'])->assertUnprocessable();
        $this->putJson('/api/v1/provider/profile', ['languages' => ['arabic']])->assertUnprocessable();
    }

    public function test_full_listing_workflow_with_admin_approval_and_pending_changes(): void
    {
        $u = $this->member();
        $this->actingAs($u, 'sanctum')->postJson('/api/v1/provider/apply', $this->applyPayload())->assertCreated();
        $this->postJson('/api/v1/provider/profile/submit')->assertOk()->assertJsonPath('data.status', 'review');
        $p = ServiceProvider::where('user_id', $u->id)->first();

        // owner cannot publish; ordinary staff without providers.review cannot either
        $this->postJson("/api/v1/admin/marketplace/providers/{$p->id}/transition", ['to' => 'approved'])->assertForbidden();
        $admin = $this->staff('admin');
        $this->actingAs($admin, 'sanctum');
        foreach (['approved', 'published'] as $to) {
            $this->postJson("/api/v1/admin/marketplace/providers/{$p->id}/transition", ['to' => $to])->assertOk();
        }
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/providers/{$p->slug}")->assertOk()->assertJsonPath('data.headline', 'استوديو الترجمة')->assertJsonPath('data.verification.status', 'unverified');

        // an edit to a LIVE listing does not change the public version until approved
        $this->actingAs($u, 'sanctum')->putJson('/api/v1/provider/profile', ['translations' => ['ar' => ['headline' => 'عنوان جديد']]])
            ->assertOk()->assertJsonPath('meta.pending_admin_approval', true);
        $this->getJson("/api/v1/providers/{$p->slug}")->assertJsonPath('data.headline', 'استوديو الترجمة');
        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/marketplace/providers/{$p->id}/changes", ['action' => 'approve'])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/providers/{$p->slug}")->assertJsonPath('data.headline', 'عنوان جديد');
        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/marketplace/providers/{$p->id}/changes", ['action' => 'approve'])->assertNotFound();
        $this->assertDatabaseHas('audit_logs', ['action' => 'marketplace.changes_approved']);
    }

    public function test_incomplete_listing_cannot_be_submitted(): void
    {
        $u = $this->member();
        $this->actingAs($u, 'sanctum')->postJson('/api/v1/provider/apply', ['category' => 'lawyer', 'display_name' => 'No contact', 'translations' => ['ar' => ['headline' => 'x']]])->assertCreated();
        $this->postJson('/api/v1/provider/profile/submit')->assertUnprocessable()->assertJsonPath('error.code', 'listing_incomplete');
    }

    public function test_verification_flow_evidence_encrypted_and_admin_only(): void
    {
        $owner = $this->member();
        $p = $this->provider([], $owner);
        $this->actingAs($owner, 'sanctum');
        $this->postJson('/api/v1/provider/verification/request')->assertUnprocessable()->assertJsonPath('error.code', 'verification_evidence_required');
        $this->postJson('/api/v1/provider/verification/documents', ['file' => UploadedFile::fake()->create('x.exe', 5, 'application/x-msdownload')])->assertUnprocessable();
        $pdf = UploadedFile::fake()->createWithContent('licence.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
        $this->postJson('/api/v1/provider/verification/documents', ['file' => $pdf])->assertCreated();
        $doc = $p->evidence()->first();
        $this->assertStringEndsWith('.enc', $doc->storage_path);
        $this->assertStringNotContainsString('%PDF', Storage::disk('documents')->get($doc->storage_path));
        $this->postJson('/api/v1/provider/verification/request')->assertOk()->assertJsonPath('data.verification_status', 'pending');
        $this->postJson('/api/v1/provider/verification/request')->assertStatus(409);
        $this->getJson('/api/v1/provider/verification/documents')->assertJsonCount(1, 'data');

        // evidence is invisible to the provider's API payloads and to staff without providers.verify
        $this->assertArrayNotHasKey('storage_path', $this->getJson('/api/v1/provider/verification/documents')->json('data.0'));
        foreach (['content_manager', 'moderator', 'editor'] as $role) {
            $this->actingAs($this->staff($role), 'sanctum')->getJson("/api/v1/admin/marketplace/providers/{$p->id}/evidence/{$doc->id}")->assertForbidden();
        }
        $this->actingAs($owner, 'sanctum')->getJson("/api/v1/admin/marketplace/providers/{$p->id}/evidence")->assertForbidden();

        $admin = $this->staff('admin');
        $this->actingAs($admin, 'sanctum');
        $this->getJson('/api/v1/admin/marketplace/verification-queue')->assertJsonCount(1, 'data.pending');
        $dl = $this->get("/api/v1/admin/marketplace/providers/{$p->id}/evidence/{$doc->id}")->assertOk();
        $this->assertStringContainsString('%PDF-1.4', $dl->getContent());
        $this->assertDatabaseHas('audit_logs', ['action' => 'marketplace.evidence_downloaded']);

        $this->postJson("/api/v1/admin/marketplace/providers/{$p->id}/verification", ['action' => 'approve'])->assertUnprocessable(); // basis required
        $this->postJson("/api/v1/admin/marketplace/providers/{$p->id}/verification", ['action' => 'approve', 'basis' => 'Checked the professional register entry on the issuing body website'])->assertOk()
            ->assertJsonPath('data.verification_status', 'verified')->assertJsonPath('data.verified_by', $admin->id);
        $fresh = $p->fresh();
        $this->assertTrue($fresh->isVerified());
        $this->assertTrue($fresh->verification_expires_at->isFuture());
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/providers/{$p->slug}")->assertJsonPath('data.verification.status', 'verified');
        $this->assertStringNotContainsString('register entry', json_encode($this->getJson("/api/v1/providers/{$p->slug}")->json()));

        $this->travel(13)->months(); // re-verification expiry
        $this->assertFalse($p->fresh()->isVerified());
        $this->travelBack();
        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/marketplace/providers/{$p->id}/verification", ['action' => 'reject', 'reason' => 'revoked'])->assertOk()->assertJsonPath('data.verification_status', 'unverified');
    }

    public function test_admin_cannot_verify_a_listing_they_own(): void
    {
        $admin = $this->staff('admin');
        $p = $this->provider([], $admin);
        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/marketplace/providers/{$p->id}/verification", ['action' => 'approve', 'basis' => 'self verification attempt text'])->assertForbidden();
    }

    public function test_admin_crud_assigns_owner_and_sets_commission_config(): void
    {
        $admin = $this->staff('admin');
        $owner = $this->member();
        $this->actingAs($admin, 'sanctum');
        $r = $this->postJson('/api/v1/admin/marketplace/providers', $this->applyPayload(['slug' => 'studio-test', 'owner_user_id' => $owner->id, 'commission_percent' => 7.5, 'commission_note' => 'pilot'])
            + [])->assertCreated()->assertJsonPath('data.owner_user_id', $owner->id)->assertJsonPath('data.commission_percent', '7.50');
        $this->assertTrue($owner->fresh()->hasRole('provider'));
        $this->postJson('/api/v1/admin/marketplace/providers', $this->applyPayload(['slug' => 'other', 'owner_user_id' => $owner->id]))->assertUnprocessable(); // one listing per account
        $this->postJson('/api/v1/admin/marketplace/providers', $this->applyPayload(['slug' => 'bad', 'commission_percent' => 150]))->assertUnprocessable();
        $this->getJson('/api/v1/admin/marketplace/providers?filter.stale=1')->assertOk();
        $this->getJson('/api/v1/admin/marketplace/providers?filter.category=translator')->assertJsonCount(1, 'data');
        $this->actingAs($this->staff('translator'), 'sanctum')->postJson('/api/v1/admin/marketplace/providers', $this->applyPayload(['slug' => 'z']))->assertForbidden();
        $this->assertNotNull($r->json('data.id'));
    }

    public function test_erasure_anonymises_reviews_deletes_leads_and_removes_owned_listing(): void
    {
        $author = $this->member();
        $owner = $this->member();
        $p = $this->provider([], $owner);
        $other = $this->provider();
        $review = new ProviderReview(['rating' => 4, 'body' => 'My phone number is 333 123 4567']);
        $review->service_provider_id = $other->id;
        $review->user_id = $author->id;
        $review->status = 'approved';
        $review->save();
        $other->refreshRating();
        $lead = new ProviderLead(['message' => 'hello provider', 'contact_name' => 'N', 'contact_email' => 'e@example.test', 'consent_given_at' => now(), 'consent_version' => 'v1']);
        $lead->service_provider_id = $other->id;
        $lead->user_id = $author->id;
        $lead->save();

        $export = app(MarketplaceData::class)->export($author);
        $this->assertCount(1, $export['reviews']);
        $this->assertCount(1, $export['contact_requests']);
        app(MarketplaceData::class)->erase($author);
        $this->assertNull($review->fresh()->user_id);
        $this->assertNull($review->fresh()->body);
        $this->assertSame(4, $review->fresh()->rating);
        $this->assertSame(1, $other->fresh()->rating_count); // aggregate not silently altered
        $this->assertSame(0, ProviderLead::count());

        app(MarketplaceData::class)->erase($owner);
        $gone = ServiceProvider::withTrashed()->find($p->id);
        $this->assertNull($gone->user_id);
        $this->assertNull($gone->contact_email);
        $this->assertTrue($gone->trashed());
        $this->getJson("/api/v1/providers/{$p->slug}")->assertNotFound();
    }

    public function test_lead_retention_command_prunes_old_requests_only(): void
    {
        $p = $this->provider();
        $u = $this->member();
        foreach ([400, 10] as $days) {
            $l = new ProviderLead(['message' => 'hello there provider', 'contact_name' => 'N', 'contact_email' => 'e@example.test', 'consent_given_at' => now(), 'consent_version' => 'v1']);
            $l->service_provider_id = $p->id;
            $l->user_id = $u->id;
            $l->created_at = now()->subDays($days);
            $l->save();
        }
        $this->artisan('expa:prune-marketplace-leads')->expectsOutputToContain('Pruned 1')->assertSuccessful();
        $this->assertSame(1, ProviderLead::count());
    }
}
