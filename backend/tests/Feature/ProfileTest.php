<?php

namespace Tests\Feature;

use App\Domains\Profile\Models\UserProfile;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function user(bool $personalization = true): User
    {
        $u = User::factory()->create();
        if ($personalization) {
            app(ConsentService::class)->record($u, ['profile_personalization' => true]);
        }

        return $u;
    }

    public function test_endpoints_require_authentication(): void
    {
        foreach ([['get', 'profile'], ['patch', 'profile'], ['post', 'profile/onboarding/skip'], ['post', 'profile/onboarding/complete'], ['get', 'profile/consents'], ['put', 'profile/consents']] as [$m, $uri]) {
            $this->json($m, "/api/v1/$uri")->assertUnauthorized();
        }
    }

    public function test_show_creates_empty_profile_with_pending_onboarding(): void
    {
        $res = $this->actingAs($this->user(), 'sanctum')->getJson('/api/v1/profile')->assertOk();

        $res->assertJsonPath('data.segment', null)
            ->assertJsonPath('data.goals', [])
            ->assertJsonPath('data.onboarding.completed', false)
            ->assertJsonPath('data.onboarding.required_complete', false)
            ->assertJsonPath('data.onboarding.progress_percent', 0)
            ->assertJsonPath('data.onboarding.steps.0', ['key' => 'status', 'required' => true, 'status' => 'pending']);
    }

    public function test_update_requires_personalization_consent(): void
    {
        $this->actingAs($this->user(false), 'sanctum')
            ->patchJson('/api/v1/profile', ['segment' => 'worker'], ['Accept-Language' => 'en'])
            ->assertForbidden()
            ->assertJsonPath('error.code', 'consent_required')
            ->assertJsonPath('error.details.purpose.0', 'profile_personalization');
    }

    public function test_account_fields_do_not_require_consent(): void
    {
        $this->actingAs($this->user(false), 'sanctum')
            ->patchJson('/api/v1/profile', ['name' => 'New Name', 'locale' => 'it'])
            ->assertOk()->assertJsonPath('data.user.name', 'New Name')->assertJsonPath('data.user.locale', 'it');
    }

    public function test_update_stores_personalization_data_and_encrypts_sensitive_columns(): void
    {
        $user = $this->user();
        $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', [
            'segment' => 'student', 'nationality' => 'eg', 'residence_type' => 'permesso',
            'italian_level' => 'a2', 'english_level' => 'c1', 'age_range' => '25_34', 'goals' => ['study', 'italian'],
        ])->assertOk()
            ->assertJsonPath('data.nationality', 'EG')
            ->assertJsonPath('data.italian_level', 'a2')
            ->assertJsonPath('data.goals', ['study', 'italian'])
            ->assertJsonPath('data.onboarding.required_complete', true);

        $raw = DB::table('user_profiles')->where('user_id', $user->id)->first();
        $this->assertStringNotContainsString('EG', $raw->nationality);
        $this->assertStringNotContainsString('permesso', $raw->residence_type);
        $this->assertSame('EG', UserProfile::where('user_id', $user->id)->first()->nationality);
    }

    public function test_update_validation(): void
    {
        $this->actingAs($this->user(), 'sanctum')->patchJson('/api/v1/profile', [
            'segment' => 'astronaut', 'nationality' => 'EGY', 'italian_level' => 'c2', 'goals' => ['work', 'work', 'flying'],
            'age_range' => '5', 'locale' => 'fr',
        ])->assertStatus(422)->assertJsonStructure(['error' => ['details' => [
            'segment', 'nationality', 'italian_level', 'goals.0', 'goals.2', 'age_range', 'locale',
        ]]]);
    }

    public function test_user_can_only_modify_their_own_profile(): void
    {
        $a = $this->user();
        $b = $this->user();
        $this->actingAs($a, 'sanctum')->patchJson('/api/v1/profile', ['segment' => 'worker'])->assertOk();

        $this->actingAs($b, 'sanctum')->getJson('/api/v1/profile')->assertJsonPath('data.segment', null);
        $this->assertSame(1, UserProfile::whereNotNull('segment')->count());
        $this->assertSame('worker', $a->profile->segment->value);
    }

    public function test_clearing_data_is_allowed_without_consent(): void
    {
        $user = $this->user();
        $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['segment' => 'worker', 'goals' => ['work']])->assertOk();
        app(ConsentService::class)->record($user, ['profile_personalization' => false]);

        $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['segment' => null, 'goals' => null])
            ->assertOk()->assertJsonPath('data.segment', null);
    }

    public function test_onboarding_skip_only_allowed_for_optional_steps(): void
    {
        $user = $this->user();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/profile/onboarding/skip', ['step' => 'status'])->assertStatus(422);
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/profile/onboarding/skip', ['step' => 'nope'])->assertStatus(422);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/profile/onboarding/skip', ['step' => 'nationality'])
            ->assertOk()->assertJsonPath('data.onboarding.steps.1.status', 'skipped')
            ->assertJsonPath('data.onboarding.progress_percent', 14);
    }

    public function test_complete_requires_required_steps_then_succeeds(): void
    {
        $user = $this->user();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/profile/onboarding/complete', [], ['Accept-Language' => 'it'])
            ->assertStatus(422)->assertJsonPath('error.code', 'onboarding_incomplete')
            ->assertJsonPath('error.message', 'Completa prima i passaggi obbligatori.');

        $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['segment' => 'worker']);
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/profile/onboarding/complete')
            ->assertOk()->assertJsonPath('data.onboarding.completed', true);
    }

    public function test_onboarding_can_complete_with_every_optional_step_skipped(): void
    {
        $user = $this->user();
        $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['segment' => 'family']);
        foreach (['nationality', 'city', 'residence', 'language', 'goals', 'age'] as $step) {
            $this->actingAs($user, 'sanctum')->postJson('/api/v1/profile/onboarding/skip', ['step' => $step]);
        }
        $this->actingAs($user, 'sanctum')->getJson('/api/v1/profile')->assertJsonPath('data.onboarding.progress_percent', 100);
    }

    public function test_options_are_localized_and_keep_italian_terms_in_arabic(): void
    {
        $ar = $this->getJson('/api/v1/profile/options', ['Accept-Language' => 'ar'])->assertOk();
        $labels = collect($ar->json('data.residence_type'))->pluck('label', 'value');
        $this->assertStringContainsString('Permesso di soggiorno', $labels['permesso']);
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $labels['permesso']);

        $it = $this->getJson('/api/v1/profile/options', ['Accept-Language' => 'it']);
        $this->assertSame('Lavoro', collect($it->json('data.goals'))->pluck('label', 'value')['work']);
        $this->assertStringNotContainsString('profile.', $it->getContent());
    }

    public function test_every_enum_option_and_step_has_translations_in_all_locales(): void
    {
        foreach (['ar', 'en', 'it'] as $locale) {
            $res = $this->getJson('/api/v1/profile/options', ['Accept-Language' => $locale]);
            $this->assertStringNotContainsString('profile.options', $res->getContent(), $locale);
            $this->assertStringNotContainsString('profile.steps', $res->getContent(), $locale);
            $this->assertCount(7, $res->json('data.onboarding_steps'));
            $this->assertTrue($res->json('data.onboarding_steps.0.required'));
        }
    }
}
