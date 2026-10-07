<?php

namespace Tests\Feature;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Guides\Models\Guide;
use App\Domains\Learning\Models\ItalianLesson;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\MarketplaceFixtures;
use Tests\TestCase;

class RecommendationsTest extends TestCase
{
    use MarketplaceFixtures, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function user(array $profile = [], bool $consent = true): User
    {
        $u = User::factory()->create();
        if ($consent) {
            app(ConsentService::class)->record($u, ['profile_personalization' => true]);
        }
        if ($profile) {
            $u->profile()->create($profile);
        }
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/v1/recommendations')->assertUnauthorized();
    }

    public function test_without_consent_only_universal_published_items_with_reasons(): void
    {
        Guide::factory()->published()->create(['slug' => 'codice-fiscale']);
        Guide::factory()->published()->create(['slug' => 'goal-guide', 'category' => 'driving']);
        Guide::factory()->translated()->create(['slug' => 'spid']); // draft: never recommended
        $this->user(['goals' => ['driving']], consent: false);

        $r = $this->getJson('/api/v1/recommendations', ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.personalization.enabled', false)->assertJsonPath('data.services', []);
        $slugs = collect($r->json('data.guides'))->pluck('slug')->all();
        $this->assertContains('codice-fiscale', $slugs);
        $this->assertNotContains('spid', $slugs);
        $this->assertNotContains('goal-guide', $slugs); // goals are not read without consent
        $this->assertSame('setup_task', $r->json('data.guides.0.reason.code'));
    }

    public function test_with_consent_goals_level_and_services_drive_recommendations(): void
    {
        Guide::factory()->published()->create(['slug' => 'goal-guide', 'category' => 'driving']);
        Guide::factory()->published()->create(['slug' => 'other-guide', 'category' => 'travel']);
        ItalianLesson::factory()->published()->of('a2', 'vocabulary')->create(['slug' => 'lesson-a2']);
        ItalianLesson::factory()->published()->of('b2', 'vocabulary')->create(['slug' => 'lesson-b2']);
        $this->provider(['category' => 'driving_school', 'display_name' => 'Fake Driving School']);
        $this->provider(['category' => 'cleaning', 'display_name' => 'Fake Cleaning']);
        $this->user(['goals' => ['driving'], 'italian_level' => 'a2']);

        $d = $this->getJson('/api/v1/recommendations', ['Accept-Language' => 'en'])->assertOk()->json('data');
        $this->assertTrue($d['personalization']['enabled']);
        $guides = collect($d['guides'])->keyBy('slug');
        $this->assertSame('goal', $guides['goal-guide']['reason']['code']);
        $this->assertArrayNotHasKey('other-guide', $guides->all());
        $this->assertSame(['lesson-a2'], collect($d['lessons'])->pluck('slug')->all());
        $this->assertSame('level', $d['lessons'][0]['reason']['code']);
        $this->assertSame(['Fake Driving School'], collect($d['services'])->pluck('title')->all());
        $this->assertSame('third_party', $d['services'][0]['label']);
        $this->assertArrayNotHasKey('contact_email', $d['services'][0]);
    }

    public function test_reminder_recommendations_for_documents(): void
    {
        $this->seed(DocumentTypeSeeder::class);
        $u = $this->user();
        app(ConsentService::class)->record($u, ['document_storage' => true]);
        $this->postJson('/api/v1/my-documents', ['type' => 'residence_permit'])->assertCreated();

        $r = $this->getJson('/api/v1/recommendations')->assertOk();
        $this->assertSame('missing_expiry', $r->json('data.reminders.0.reason.code'));
    }
}
