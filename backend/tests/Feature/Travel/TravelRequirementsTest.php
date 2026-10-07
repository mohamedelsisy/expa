<?php

namespace Tests\Feature\Travel;

use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Travel\Models\TravelRequirement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** FAKE fixtures only; EXPA seeds no travel data. */
class TravelRequirementsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app(AccessSynchronizer::class)->sync();
    }

    private function entry(array $over = [], bool $publish = true): TravelRequirement
    {
        $r = new TravelRequirement($over + ['slug' => 'fake-'.uniqid(), 'nationality' => 'XA', 'destination' => 'XB', 'residence_status' => 'any',
            'source_name' => 'FAKE', 'source_url' => 'https://example.test/t', 'source_type' => 'official', 'last_verified_at' => now()->subDay()]);
        $r->save();
        $r->setTranslations(['ar' => ['title' => 'عنوان', 'summary' => 'ملخص'], 'en' => ['title' => 'Fake title', 'summary' => 'Fake summary', 'requirements' => 'Fake req']]);
        if ($publish) {
            $r->forceFill(['status' => 'published', 'published_at' => now()])->save();
        }

        return $r;
    }

    public function test_empty_state_is_honest_and_never_claims_eligibility(): void
    {
        $this->entry([], publish: false); // draft is invisible
        $this->getJson('/api/v1/travel/requirements?nationality=XA&destination=XB', ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.available', false)->assertJsonPath('data.items', [])->assertJsonStructure(['data' => ['message', 'disclaimer']]);
    }

    public function test_lookup_matches_nationality_destination_and_status_with_source(): void
    {
        $this->entry(['slug' => 'a']);
        $this->entry(['slug' => 'b', 'residence_status' => 'residence_permit']);
        $this->entry(['slug' => 'c', 'nationality' => '*']);
        $this->entry(['slug' => 'd', 'nationality' => 'XZ']);
        $this->entry(['slug' => 'e', 'destination' => 'XY']);

        $r = $this->getJson('/api/v1/travel/requirements?nationality=xa&destination=xb', ['Accept-Language' => 'en'])->assertOk()
            ->assertJsonPath('data.available', true);
        $this->assertEqualsCanonicalizing(['a', 'b', 'c'], collect($r->json('data.items'))->pluck('slug')->all());
        $this->assertSame('FAKE', $r->json('data.items.0.source.name'));

        $r = $this->getJson('/api/v1/travel/requirements?nationality=XA&destination=XB&residence_status=visa')->assertOk();
        $this->assertEqualsCanonicalizing(['a', 'c'], collect($r->json('data.items'))->pluck('slug')->all());

        $this->getJson('/api/v1/travel/requirements?nationality=X&destination=XB')->assertUnprocessable();
        $this->getJson('/api/v1/travel/requirements')->assertUnprocessable();
    }

    public function test_admin_lifecycle_requires_source_and_permissions(): void
    {
        $this->getJson('/api/v1/admin/travel/requirements')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/v1/admin/travel/requirements')->assertForbidden();

        $a = User::factory()->create();
        $a->syncRoleKeys(['admin']);
        $this->actingAs($a, 'sanctum');
        $id = $this->postJson('/api/v1/admin/travel/requirements', ['slug' => 'fake', 'nationality' => 'XA', 'destination' => 'XB',
            'translations' => ['ar' => ['title' => 'ع', 'summary' => 'م'], 'en' => ['title' => 'T', 'summary' => 'S']]])->assertCreated()->json('data.id');
        $this->postJson('/api/v1/admin/travel/requirements', ['slug' => 'bad', 'nationality' => 'egypt', 'destination' => 'XB', 'translations' => ['ar' => ['title' => 'ع']]])->assertUnprocessable();
        $this->postJson("/api/v1/admin/travel/requirements/$id/transition", ['to' => 'review'])->assertOk();
        $b = User::factory()->create();
        $b->syncRoleKeys(['admin']);
        $this->actingAs($b, 'sanctum');
        $this->postJson("/api/v1/admin/travel/requirements/$id/transition", ['to' => 'approved'])->assertOk();
        $this->postJson("/api/v1/admin/travel/requirements/$id/transition", ['to' => 'published'])->assertUnprocessable()
            ->assertJsonFragment(['code' => 'missing_source_field']);
    }
}
