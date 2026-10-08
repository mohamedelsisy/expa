<?php

namespace Tests\Feature\Security;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Housing\Models\HousingCheck;
use App\Domains\Marketplace\Models\ProviderReview;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

/**
 * IDOR matrix for the newer modules: user B holding a valid token must never read or change user A's resource by id.
 * (Older modules - documents, attachments, AI conversations, exams, notifications - are covered next to their own tests.)
 */
class IdorMatrixTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
        $this->seed(GeographySeeder::class);
        Storage::fake('documents');
        config(['community.enabled' => true, 'community.premoderation' => 'none']);
    }

    public function test_housing_checks_of_another_user_are_not_reachable(): void
    {
        [$a, $b] = [$this->member(), $this->member()];
        $row = new HousingCheck(['label' => 'mine', 'locale' => 'en', 'result' => ['x' => 1], 'expires_at' => now()->addDay()]);
        $row->user_id = $a->id;
        $row->save();

        $this->actingAs($b, 'sanctum');
        $this->getJson("/api/v1/housing/checks/{$row->id}")->assertNotFound();
        $this->deleteJson("/api/v1/housing/checks/{$row->id}")->assertNotFound();
        $this->assertSame([], $this->getJson('/api/v1/housing/checks')->json('data'));
        $this->assertDatabaseHas('housing_checks', ['id' => $row->id]);
        $this->actingAs($a, 'sanctum')->getJson("/api/v1/housing/checks/{$row->id}")->assertOk();
    }

    public function test_provider_b_cannot_touch_provider_a_evidence_or_reviews(): void
    {
        [$ownerA, $ownerB] = [$this->member(), $this->member()];
        $a = $this->provider([], $ownerA);
        $this->provider([], $ownerB);
        $this->actingAs($ownerA, 'sanctum');
        $pdf = UploadedFile::fake()->createWithContent('licence.pdf', "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
        $this->postJson('/api/v1/provider/verification/documents', ['file' => $pdf])->assertCreated();
        $docId = $a->evidence()->value('id');

        $reviewer = $this->member();
        $review = new ProviderReview(['rating' => 4, 'body' => 'Fine work overall']);
        $review->service_provider_id = $a->id;
        $review->user_id = $reviewer->id;
        $review->status = 'approved';
        $review->save();

        $this->actingAs($ownerB, 'sanctum');
        $this->deleteJson("/api/v1/provider/verification/documents/$docId")->assertNotFound();
        $this->postJson("/api/v1/provider/reviews/{$review->id}/reply", ['body' => 'Hello'])->assertNotFound();
        $this->assertSame([], $this->getJson('/api/v1/provider/verification/documents')->json('data'));
        $this->assertSame([], $this->getJson('/api/v1/provider/reviews')->json('data'));
        $this->assertDatabaseHas('provider_verification_documents', ['id' => $docId]);

        // a stranger cannot delete somebody else's review of a provider
        $this->actingAs($this->member(), 'sanctum')->deleteJson("/api/v1/my/provider-reviews/{$review->id}")->assertNotFound();
        $this->assertDatabaseHas('provider_reviews', ['id' => $review->id]);
    }

    public function test_community_content_and_blocks_belong_to_their_author(): void
    {
        [$a, $b] = [$this->member(), $this->member()];
        $qid = $this->actingAs($a, 'sanctum')->postJson('/api/v1/community/questions', [
            'title' => 'How do I book the Questura appointment?', 'body' => 'I arrived last week and need to start my permit paperwork.', 'topic' => 'immigration', 'tags' => ['permesso'],
        ])->assertCreated()->json('data.id');
        $cid = $this->postJson("/api/v1/community/questions/$qid/comments", ['body' => 'A comment by A'])->assertCreated()->json('data.id');

        $this->actingAs($b, 'sanctum');
        $this->assertContains($this->deleteJson("/api/v1/community/questions/$qid")->status(), [403, 404]);
        $this->assertContains($this->deleteJson("/api/v1/community/comments/$cid")->status(), [403, 404]);
        $this->assertDatabaseHas('community_questions', ['id' => $qid, 'deleted_at' => null]);
        $this->assertContains($this->putJson("/api/v1/community/questions/$qid/accepted-answer", ['answer_id' => 1])->status(), [403, 404, 422]);

        // blocks: B cannot remove A's block rows
        $this->actingAs($b, 'sanctum')->postJson('/api/v1/community/blocks', ['type' => 'question', 'id' => $qid])->assertCreated();
        $blockId = $this->getJson('/api/v1/community/blocks')->json('data.0.id');
        $this->assertContains($this->actingAs($a, 'sanctum')->deleteJson("/api/v1/community/blocks/$blockId")->status(), [204, 404]); // idempotent, scoped to the caller
        $this->assertDatabaseCount('community_blocks', 1);
    }

    public function test_an_ordinary_user_cannot_self_grant_roles_or_provider_status_through_any_write_endpoint(): void
    {
        $u = $this->member();
        $this->actingAs($u, 'sanctum');
        $this->patchJson('/api/v1/profile', ['roles' => ['super_admin'], 'role' => 'admin', 'is_admin' => true, 'email_verified_at' => now()->toDateTimeString()]);   // unknown/privileged keys are ignored, never applied
        $this->assertSame([], $u->fresh()->roles->pluck('key')->diff(['user'])->all());
        $this->assertTrue($u->fresh()->hasVerifiedEmail() === $u->hasVerifiedEmail());
        $this->putJson("/api/v1/admin/users/{$u->id}/roles", ['roles' => ['super_admin']])->assertForbidden();
        $this->patchJson("/api/v1/admin/users/{$u->id}", ['status' => 'active'])->assertForbidden();
        $this->assertFalse($u->fresh()->hasRole('super_admin'));
        // provider portal needs the provider role granted by applying; moderators/content managers have no implicit provider rights
        $this->getJson('/api/v1/provider/profile')->assertForbidden();
        $mod = $this->staff('moderator');
        $this->actingAs($mod, 'sanctum')->getJson('/api/v1/provider/profile')->assertForbidden();
        $this->putJson("/api/v1/admin/users/{$mod->id}/roles", ['roles' => ['admin']])->assertForbidden();
    }
}
