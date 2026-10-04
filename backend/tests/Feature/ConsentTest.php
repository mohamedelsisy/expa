<?php

namespace Tests\Feature;

use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Models\Consent;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsentTest extends TestCase
{
    use RefreshDatabase;

    public function test_purposes_are_public_localized_and_complete(): void
    {
        foreach (['ar', 'en', 'it'] as $locale) {
            $res = $this->getJson('/api/v1/privacy/purposes', ['Accept-Language' => $locale])->assertOk();
            $purposes = collect($res->json('data.purposes'));

            $this->assertCount(count(ConsentPurpose::cases()), $purposes);
            $this->assertStringNotContainsString('privacy.purposes', $res->getContent(), $locale);
            foreach ($purposes as $p) {
                $this->assertNotEmpty($p['title']);
                $this->assertNotEmpty($p['why']);
                $this->assertNotEmpty($p['data']);
            }
            $this->assertTrue($purposes->firstWhere('key', 'terms')['required']);
            $this->assertFalse($purposes->firstWhere('key', 'marketing')['required']);
            $this->assertSame('consent', $purposes->firstWhere('key', 'analytics')['legal_basis']);
        }
    }

    public function test_show_lists_every_purpose_defaulting_to_not_granted(): void
    {
        $res = $this->actingAs(User::factory()->create(), 'sanctum')->getJson('/api/v1/profile/consents')->assertOk();

        $this->assertCount(count(ConsentPurpose::cases()), $res->json('data.consents'));
        $this->assertFalse($res->json('data.consents.marketing.granted'));
        $this->assertFalse($res->json('data.consents.marketing.decided'));
    }

    public function test_grant_and_withdraw_append_rows_and_never_update(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->putJson('/api/v1/profile/consents', ['consents' => ['marketing' => true, 'analytics' => true]])
            ->assertOk()->assertJsonPath('data.consents.marketing.granted', true);
        $this->putJson('/api/v1/profile/consents', ['consents' => ['marketing' => false]])
            ->assertOk()->assertJsonPath('data.consents.marketing.granted', false)
            ->assertJsonPath('data.consents.analytics.granted', true);

        $this->assertSame(2, Consent::where('user_id', $user->id)->where('purpose', 'marketing')->count());
        $this->assertSame(1, Consent::where('user_id', $user->id)->where('purpose', 'analytics')->count());
    }

    public function test_unchanged_decisions_do_not_create_rows(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $this->putJson('/api/v1/profile/consents', ['consents' => ['analytics' => true]]);
        $this->putJson('/api/v1/profile/consents', ['consents' => ['analytics' => true]]);

        $this->assertSame(1, Consent::where('user_id', $user->id)->count());
    }

    public function test_required_consents_cannot_be_withdrawn(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->putJson('/api/v1/profile/consents', ['consents' => ['terms' => false]], ['Accept-Language' => 'en'])
            ->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['consents.terms']]]);
    }

    public function test_unknown_purpose_and_non_boolean_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->putJson('/api/v1/profile/consents', ['consents' => ['tracking_everything' => true]])->assertStatus(422);
        $this->putJson('/api/v1/profile/consents', ['consents' => ['marketing' => 'maybe']])->assertStatus(422);
        $this->putJson('/api/v1/profile/consents', [])->assertStatus(422);
        $this->assertSame(0, Consent::count());
    }

    public function test_policy_version_change_marks_consent_outdated_and_reconfirmation_appends(): void
    {
        $user = User::factory()->create();
        $svc = app(ConsentService::class);
        config(['privacy.policy_version' => 'v1']);
        $svc->record($user, ['analytics' => true]);

        config(['privacy.policy_version' => 'v2']);
        $this->assertTrue($svc->current($user)['analytics']['outdated']);

        $svc->record($user, ['analytics' => true]);
        $this->assertFalse($svc->current($user)['analytics']['outdated']);
        $this->assertSame(2, Consent::where('user_id', $user->id)->count());
    }

    public function test_has_reflects_latest_decision_and_ip_is_stored_hashed_only(): void
    {
        $user = User::factory()->create();
        $svc = app(ConsentService::class);
        $this->assertFalse($svc->has($user, ConsentPurpose::AiPersonalization));

        $svc->record($user, ['ai_personalization' => true], '203.0.113.9', 'web');
        $this->assertTrue($svc->has($user, ConsentPurpose::AiPersonalization));
        $row = Consent::first();
        $this->assertSame('web', $row->source);
        $this->assertNotSame('203.0.113.9', $row->ip_hash);
        $this->assertSame(64, strlen($row->ip_hash));

        $svc->record($user, ['ai_personalization' => false]);
        $this->assertFalse($svc->has($user, ConsentPurpose::AiPersonalization));
    }

    public function test_arbitrary_client_source_is_normalized(): void
    {
        $user = User::factory()->create();
        app(ConsentService::class)->record($user, ['analytics' => true], null, str_repeat('x', 200));
        $this->assertSame('api', Consent::first()->source);
    }

    public function test_users_cannot_see_each_others_consents(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        app(ConsentService::class)->record($a, ['marketing' => true]);

        $this->actingAs($b, 'sanctum')->getJson('/api/v1/profile/consents')
            ->assertJsonPath('data.consents.marketing.granted', false);
    }
}
