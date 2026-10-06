<?php

namespace Tests\Feature\Marketplace;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Geo\Models\City;
use App\Domains\Marketplace\Models\ProviderLead;
use App\Domains\Marketplace\Models\ProviderReview;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

class MarketplaceDirectoryTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
    }

    public function test_public_listing_shows_only_published_and_never_leaks_private_fields(): void
    {
        $this->provider(['commission_percent' => 12.5, 'commission_note' => 'secret deal']);
        $this->provider([], null, false);
        $r = $this->getJson('/api/v1/providers')->assertOk()->assertJsonCount(1, 'data');
        $json = json_encode($r->json());
        $this->assertStringNotContainsString('commission', $json);
        $this->assertStringNotContainsString('provider1@example.test', $json);
        $this->assertStringNotContainsString('verification_basis', $json);
        $r->assertJsonPath('data.0.source_type', 'third_party')->assertJsonPath('data.0.official', false)
            ->assertJsonPath('data.0.verification.status', 'unverified');
        $this->assertNotEmpty($r->json('data.0.notice'));

        $show = $this->getJson('/api/v1/providers/test-provider-1')->assertOk();
        $this->assertSame([], array_diff(array_keys($show->json('data.contact')), ['website'])); // only the opted-in website
        $this->getJson('/api/v1/providers/test-provider-2')->assertNotFound();
    }

    public function test_contact_is_exposed_only_when_provider_opted_in(): void
    {
        $this->provider(['show_email' => true, 'show_phone' => true]);
        $this->getJson('/api/v1/providers/test-provider-1')->assertJsonPath('data.contact.email', 'provider1@example.test')
            ->assertJsonPath('data.contact.phone', '+39 000 000 0001');
    }

    public function test_unverified_listing_can_be_hidden_by_config_and_expired_verification_is_not_verified(): void
    {
        $verified = $this->provider();
        $verified->forceFill(['verification_status' => 'verified', 'verified_at' => now(), 'verification_expires_at' => now()->addMonth(), 'verified_by' => 1])->save();
        $this->provider();
        config(['marketplace.list_unverified' => false]);
        $this->getJson('/api/v1/providers')->assertJsonCount(1, 'data')->assertJsonPath('data.0.verification.status', 'verified');

        $this->travel(2)->months();
        $this->getJson('/api/v1/providers')->assertJsonCount(0, 'data');
        config(['marketplace.list_unverified' => true]);
        $this->getJson('/api/v1/providers/test-provider-1')->assertJsonPath('data.verification.status', 'expired')->assertJsonPath('data.verification.verified_at', null);
        $this->travelBack();
    }

    public function test_filters_coverage_sort_and_pagination(): void
    {
        $rome = City::firstWhere('slug', 'roma');
        $milan = City::firstWhere('slug', 'milano');
        $a = $this->provider(['category' => 'lawyer', 'city_id' => $rome->id, 'serves_online' => false, 'languages' => ['ar']]);
        $b = $this->provider(['category' => 'lawyer', 'serves_online' => false, 'languages' => ['en']]);
        $b->areas()->create(['city_id' => $milan->id]);
        $c = $this->provider(['category' => 'cleaning', 'serves_online' => true, 'languages' => ['it']]);
        $a->forceFill(['rating_avg' => 4.5, 'rating_count' => 2])->save();

        $this->getJson('/api/v1/providers?category=lawyer')->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/providers?city=roma')->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', $a->slug);
        $this->getJson('/api/v1/providers?city=milano')->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', $b->slug);
        $this->getJson('/api/v1/providers?city=milano&online=1')->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/providers?city=nowhere')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/providers?language=ar')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/providers?sort=-rating')->assertJsonPath('data.0.slug', $a->slug);
        $this->getJson('/api/v1/providers?sort=name')->assertOk();
        $this->getJson('/api/v1/providers?sort=commission_percent')->assertUnprocessable();
        $this->getJson('/api/v1/providers?category=pirate')->assertUnprocessable();
        $this->getJson('/api/v1/providers?per_page=1')->assertJsonPath('meta.total', 3)->assertJsonPath('meta.last_page', 3);
        $this->getJson('/api/v1/providers/meta')->assertJsonCount(11, 'data.categories');
    }

    // ---- reviews -----------------------------------------------------------------------------

    public function test_review_rules_and_aggregate_from_approved_only(): void
    {
        $p = $this->provider();
        $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5])->assertUnauthorized();

        $this->actingAs($this->member(['email_verified_at' => null]), 'sanctum')->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5])->assertForbidden();
        $this->actingAs($this->member(['created_at' => now()]), 'sanctum')->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5])->assertForbidden()->assertJsonPath('error.code', 'account_too_new');

        $u = $this->member();
        $this->actingAs($u, 'sanctum');
        $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 6])->assertUnprocessable();
        $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5, 'body' => 'Great work, thanks a lot'])->assertCreated()->assertJsonPath('data.status', 'pending');
        $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 4])->assertStatus(409);
        $this->getJson("/api/v1/providers/{$p->slug}/reviews")->assertJsonCount(0, 'data');
        $this->getJson("/api/v1/providers/{$p->slug}")->assertJsonPath('data.rating.count', 0);

        $u2 = $this->member();
        $this->actingAs($u2, 'sanctum')->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 1, 'body' => 'Terrible experience here'])->assertCreated();

        $mod = $this->staff('moderator');
        $this->actingAs($mod, 'sanctum');
        $queue = $this->getJson('/api/v1/admin/marketplace/reviews')->assertOk()->assertJsonCount(2, 'data')->json('data');
        $this->postJson("/api/v1/admin/marketplace/reviews/{$queue[0]['id']}/moderate", ['decision' => 'approved'])->assertOk()->assertJsonPath('data.provider_rating.count', 1);
        $this->postJson("/api/v1/admin/marketplace/reviews/{$queue[1]['id']}/moderate", ['decision' => 'rejected'])->assertUnprocessable(); // reason required
        $this->postJson("/api/v1/admin/marketplace/reviews/{$queue[1]['id']}/moderate", ['decision' => 'rejected', 'reason' => 'Not about the service'])->assertOk();

        $this->app['auth']->forgetGuards();
        $public = $this->getJson("/api/v1/providers/{$p->slug}/reviews")->assertJsonCount(1, 'data');
        $this->assertArrayNotHasKey('user_id', $public->json('data.0'));
        $this->getJson("/api/v1/providers/{$p->slug}")->assertJsonPath('data.rating.count', 1)->assertJsonPath('data.rating.average', 5);
    }

    public function test_owner_cannot_review_own_listing_and_review_text_is_sanitised(): void
    {
        $owner = $this->member();
        $p = $this->provider([], $owner);
        $this->actingAs($owner, 'sanctum')->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5])->assertForbidden()->assertJsonPath('error.code', 'cannot_review_own_provider');

        $other = $this->provider();
        $u = $this->member();
        $this->actingAs($u, 'sanctum');
        $this->postJson("/api/v1/providers/{$other->slug}/reviews", ['rating' => 5, 'body' => 'See https://bit.ly/abc for details'])->assertUnprocessable()->assertJsonPath('error.code', 'link_not_allowed');
        $this->postJson("/api/v1/providers/{$other->slug}/reviews", ['rating' => 5, 'body' => '<b>Good</b> service, visit http://spam.test now'])->assertCreated();
        $this->assertSame('Good service, visit [link removed] now', ProviderReview::first()->body);
        $dup = $this->member();
        $this->actingAs($dup, 'sanctum')->postJson("/api/v1/providers/{$other->slug}/reviews", ['rating' => 5, 'body' => 'Good service, visit [link removed] now'])->assertUnprocessable()->assertJsonPath('error.code', 'duplicate_content');
    }

    public function test_review_rate_limit_and_own_review_deletion_recomputes(): void
    {
        $u = $this->member();
        $this->actingAs($u, 'sanctum');
        for ($i = 0; $i < 5; $i++) {
            $p = $this->provider();
            $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5])->assertCreated();
        }
        $p = $this->provider();
        $this->postJson("/api/v1/providers/{$p->slug}/reviews", ['rating' => 5])->assertStatus(429);

        $r = ProviderReview::first();
        $other = $this->member();
        $this->actingAs($other, 'sanctum')->deleteJson("/api/v1/my/provider-reviews/{$r->id}")->assertNotFound(); // IDOR
        $this->actingAs($u, 'sanctum')->deleteJson("/api/v1/my/provider-reviews/{$r->id}")->assertNoContent();
        $this->assertSame(4, ProviderReview::count());
    }

    public function test_provider_reply_needs_moderation_and_is_scoped_to_own_reviews(): void
    {
        $owner = $this->member();
        $p = $this->provider([], $owner);
        $rival = $this->member();
        $this->provider([], $rival);
        $author = $this->member();
        $review = new ProviderReview(['rating' => 4, 'body' => 'Fine work overall']);
        $review->service_provider_id = $p->id;
        $review->user_id = $author->id;
        $review->status = 'approved';
        $review->save();
        $p->refreshRating();

        $this->actingAs($rival, 'sanctum')->postJson("/api/v1/provider/reviews/{$review->id}/reply", ['body' => 'hijack reply'])->assertNotFound();
        $this->actingAs($owner, 'sanctum')->postJson("/api/v1/provider/reviews/{$review->id}/reply", ['body' => 'Thank you for the feedback'])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/providers/{$p->slug}/reviews")->assertJsonPath('data.0.reply', null);

        $this->actingAs($this->staff('moderator'), 'sanctum')->postJson("/api/v1/admin/marketplace/reviews/{$review->id}/reply-moderate", ['decision' => 'approved'])->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/v1/providers/{$p->slug}/reviews")->assertJsonPath('data.0.reply.body', 'Thank you for the feedback');
    }

    public function test_reports_and_moderator_permission_boundaries(): void
    {
        $p = $this->provider();
        $author = $this->member();
        $review = new ProviderReview(['rating' => 1, 'body' => 'Offensive text here ok']);
        $review->service_provider_id = $p->id;
        $review->user_id = $author->id;
        $review->status = 'approved';
        $review->save();
        $p->refreshRating();

        $reporter = $this->member();
        $this->actingAs($reporter, 'sanctum');
        $this->postJson("/api/v1/provider-reviews/{$review->id}/report", ['reason' => 'nonsense'])->assertUnprocessable();
        $this->postJson("/api/v1/provider-reviews/{$review->id}/report", ['reason' => 'abuse'])->assertCreated();
        $this->postJson("/api/v1/provider-reviews/{$review->id}/report", ['reason' => 'abuse'])->assertStatus(409);

        $this->actingAs($reporter, 'sanctum')->getJson('/api/v1/admin/marketplace/reports')->assertForbidden();
        $this->actingAs($this->staff('content_manager'), 'sanctum')->getJson('/api/v1/admin/marketplace/reviews')->assertForbidden();
        $mod = $this->staff('moderator');
        $this->actingAs($mod, 'sanctum');
        $rid = $this->getJson('/api/v1/admin/marketplace/reports')->assertJsonCount(1, 'data')->json('data.0.id');
        $this->postJson("/api/v1/admin/marketplace/reports/{$rid}/resolve", ['status' => 'resolved', 'reject_review' => true, 'reason' => 'abuse'])->assertOk();
        $this->assertSame('rejected', $review->fresh()->status);
        $this->assertSame(0, $p->fresh()->rating_count);
        $this->assertDatabaseHas('audit_logs', ['action' => 'marketplace.review_rejected']);
        // moderators cannot verify providers or see evidence
        $this->postJson("/api/v1/admin/marketplace/providers/{$p->id}/verification", ['action' => 'reject', 'reason' => 'x'])->assertForbidden();
        $this->getJson("/api/v1/admin/marketplace/providers/{$p->id}/evidence")->assertForbidden();
    }

    // ---- leads -------------------------------------------------------------------------------

    public function test_lead_requires_consent_is_encrypted_and_visible_only_to_the_addressed_provider(): void
    {
        $ownerA = $this->member();
        $ownerB = $this->member();
        $a = $this->provider([], $ownerA);
        $this->provider([], $ownerB);
        $user = $this->member();
        $payload = ['message' => 'I need help translating a contract', 'consent_share_contact' => true, 'contact_phone' => '+39 333 1234567'];

        $this->postJson("/api/v1/providers/{$a->slug}/leads", $payload)->assertUnauthorized();
        $this->actingAs($user, 'sanctum');
        $this->postJson("/api/v1/providers/{$a->slug}/leads", ['message' => 'I need help translating a contract'])->assertUnprocessable();
        $this->postJson("/api/v1/providers/{$a->slug}/leads", ['message' => 'short', 'consent_share_contact' => true])->assertUnprocessable();
        $r = $this->postJson("/api/v1/providers/{$a->slug}/leads", $payload)->assertCreated()->assertJsonPath('data.status', 'new');
        $this->assertNotEmpty($r->json('data.notice'));
        $this->postJson("/api/v1/providers/{$a->slug}/leads", $payload)->assertStatus(429)->assertJsonPath('error.code', 'lead_cooldown');

        $raw = \DB::table('provider_leads')->first();
        $this->assertStringNotContainsString('translating', $raw->message);
        $this->assertStringNotContainsString('1234567', (string) $raw->contact_phone);
        $this->assertSame('v1', $raw->consent_version);
        $this->assertNotNull($raw->consent_given_at);

        $this->actingAs($ownerA, 'sanctum');
        $list = $this->getJson('/api/v1/provider/leads')->assertOk()->assertJsonCount(1, 'data');
        $list->assertJsonPath('data.0.contact.phone', '+39 333 1234567')->assertJsonPath('data.0.contact.email', $user->email);
        $id = $list->json('data.0.id');
        $this->actingAs($ownerB, 'sanctum');
        $this->getJson('/api/v1/provider/leads')->assertJsonCount(0, 'data');
        $this->patchJson("/api/v1/provider/leads/{$id}", ['status' => 'seen'])->assertNotFound(); // IDOR
        $this->actingAs($ownerA, 'sanctum')->patchJson("/api/v1/provider/leads/{$id}", ['status' => 'seen'])->assertOk()->assertJsonPath('data.status', 'seen');
        $this->patchJson("/api/v1/provider/leads/{$id}", ['status' => 'new'])->assertUnprocessable();
        $this->actingAs($user, 'sanctum')->getJson('/api/v1/my/provider-leads')->assertJsonCount(1, 'data')->assertJsonPath('data.0.status', 'seen');
        // a plain user is not a provider
        $this->getJson('/api/v1/provider/leads')->assertForbidden();
    }

    public function test_lead_blocked_for_unlisted_provider_own_listing_and_unverified_email(): void
    {
        $owner = $this->member();
        $own = $this->provider([], $owner);
        $draft = $this->provider([], null, false);
        $payload = ['message' => 'I need help translating a contract', 'consent_share_contact' => true];
        $this->actingAs($owner, 'sanctum')->postJson("/api/v1/providers/{$own->slug}/leads", $payload)->assertForbidden();
        $u = $this->member();
        $this->actingAs($u, 'sanctum')->postJson("/api/v1/providers/{$draft->slug}/leads", $payload)->assertNotFound();
        $this->actingAs($this->member(['email_verified_at' => null]), 'sanctum')->postJson("/api/v1/providers/{$own->slug}/leads", $payload)->assertForbidden();
        $this->assertSame(0, ProviderLead::count());
    }
}
