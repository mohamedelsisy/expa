<?php

namespace Tests\Feature\Auth;

use App\Enums\UserStatus;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $over = []): array
    {
        return array_merge([
            'name' => 'Mohamed Ali',
            'email' => 'Mohamed@Example.com',
            'password' => 'Str0ngPassw0rd',
            'password_confirmation' => 'Str0ngPassw0rd',
            'accept_terms' => true,
            'accept_privacy' => true,
        ], $over);
    }

    public function test_register_creates_user_returns_token_and_sends_verification(): void
    {
        Notification::fake();

        $res = $this->postJson('/api/v1/auth/register', $this->payload(), ['Accept-Language' => 'it'])
            ->assertCreated()
            ->assertJsonPath('data.user.email', 'mohamed@example.com')
            ->assertJsonPath('data.user.locale', 'it')
            ->assertJsonPath('data.user.email_verified', false)
            ->assertJsonStructure(['data' => ['token']]);

        $this->assertStringNotContainsString('password', json_encode($res->json('data.user')));
        $user = User::firstWhere('email', 'mohamed@example.com');
        $this->assertNotSame('Str0ngPassw0rd', $user->password);
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_register_requires_terms_and_privacy_acceptance_and_logs_consent(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload(['accept_terms' => false, 'accept_privacy' => null]))
            ->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['accept_terms', 'accept_privacy']]]);
        $this->assertSame(0, User::count());

        $this->postJson('/api/v1/auth/register', $this->payload())->assertCreated();
        $user = User::first();
        $this->assertDatabaseHas('consents', ['user_id' => $user->id, 'purpose' => 'terms', 'granted' => true, 'policy_version' => config('privacy.policy_version')]);
        $this->assertDatabaseHas('consents', ['user_id' => $user->id, 'purpose' => 'privacy', 'granted' => true]);
        $this->assertDatabaseMissing('consents', ['purpose' => 'marketing']);
    }

    public function test_register_defaults_locale_to_arabic_and_honours_explicit_locale(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload(), ['Accept-Language' => ''])
            ->assertJsonPath('data.user.locale', 'ar');
        $this->postJson('/api/v1/auth/register', $this->payload(['email' => 'b@example.com', 'locale' => 'en']))
            ->assertJsonPath('data.user.locale', 'en');
    }

    public function test_register_validation(): void
    {
        $this->postJson('/api/v1/auth/register', [])->assertStatus(422)
            ->assertJsonStructure(['error' => ['details' => ['name', 'email', 'password']]]);
        $this->postJson('/api/v1/auth/register', $this->payload(['password' => 'short1', 'password_confirmation' => 'short1']))
            ->assertJsonStructure(['error' => ['details' => ['password']]]);
        $this->postJson('/api/v1/auth/register', $this->payload(['password' => 'onlyletterspassword', 'password_confirmation' => 'onlyletterspassword']))
            ->assertJsonStructure(['error' => ['details' => ['password']]]);
        $this->postJson('/api/v1/auth/register', $this->payload(['locale' => 'fr']))
            ->assertJsonStructure(['error' => ['details' => ['locale']]]);
    }

    public function test_register_rejects_duplicate_email_case_insensitively(): void
    {
        User::factory()->create(['email' => 'mohamed@example.com']);
        $this->postJson('/api/v1/auth/register', $this->payload())
            ->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['email']]]);
    }

    public function test_validation_messages_are_translated_not_raw_keys(): void
    {
        $r = $this->postJson('/api/v1/auth/register', [], ['Accept-Language' => 'ar'])->json('error.details.email.0');
        $this->assertStringNotContainsString('validation.', $r);
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $r);
    }

    public function test_login_success_updates_last_login_and_returns_token(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com', 'password' => 'Str0ngPassw0rd']);

        $this->postJson('/api/v1/auth/login', ['email' => 'A@example.com', 'password' => 'Str0ngPassw0rd'])
            ->assertOk()->assertJsonStructure(['data' => ['token', 'user' => ['id']]]);

        $this->assertNotNull($user->fresh()->last_login_at);
    }

    public function test_login_failure_is_generic_for_wrong_password_and_unknown_email(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'Str0ngPassw0rd']);

        $a = $this->postJson('/api/v1/auth/login', ['email' => 'a@example.com', 'password' => 'wrong'], ['Accept-Language' => 'en']);
        $b = $this->postJson('/api/v1/auth/login', ['email' => 'nobody@example.com', 'password' => 'wrong'], ['Accept-Language' => 'en']);

        $a->assertUnauthorized()->assertJsonPath('error.code', 'invalid_credentials');
        $this->assertSame($a->json(), $b->json());
    }

    public function test_suspended_user_cannot_login(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => 'Str0ngPassw0rd', 'status' => UserStatus::Suspended]);
        $this->postJson('/api/v1/auth/login', ['email' => 'a@example.com', 'password' => 'Str0ngPassw0rd'])
            ->assertForbidden()->assertJsonPath('error.code', 'account_suspended');
    }

    public function test_login_is_throttled_after_five_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'a@example.com', 'password' => 'x'])->assertUnauthorized();
        }
        $this->postJson('/api/v1/auth/login', ['email' => 'a@example.com', 'password' => 'x'])
            ->assertStatus(429)->assertJsonPath('error.code', 'too_many_requests');
    }

    public function test_me_requires_authentication_and_returns_user(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();

        $this->actingAs(User::factory()->create(['name' => 'Sara']), 'sanctum')
            ->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.name', 'Sara');
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();
        $t1 = $user->createToken('phone')->plainTextToken;
        $user->createToken('laptop');

        $this->withToken($t1)->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->assertSame(1, $user->tokens()->count());
        $this->app['auth']->forgetGuards();
        $this->withToken($t1)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_logout_all_revokes_every_token(): void
    {
        $user = User::factory()->create();
        $user->createToken('a');
        $t = $user->createToken('b')->plainTextToken;

        $this->withToken($t)->postJson('/api/v1/auth/logout-all')->assertNoContent();
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_tokens_expire(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('x')->plainTextToken;

        $this->travel(config('sanctum.expiration') + 1)->minutes();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_change_password_requires_current_password_and_revokes_other_tokens(): void
    {
        $user = User::factory()->create(['password' => 'Str0ngPassw0rd']);
        $other = $user->createToken('other');
        $current = $user->createToken('current')->plainTextToken;
        $body = ['current_password' => 'Str0ngPassw0rd', 'password' => 'N3wStr0ngPassword', 'password_confirmation' => 'N3wStr0ngPassword'];

        $this->withToken($current)->postJson('/api/v1/auth/change-password', array_merge($body, ['current_password' => 'bad']))
            ->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['current_password']]]);

        $this->withToken($current)->postJson('/api/v1/auth/change-password', $body)->assertNoContent();

        $this->assertNull($user->tokens()->find($other->accessToken->id));
        $this->assertSame(1, $user->tokens()->count());
        $this->assertTrue(\Hash::check('N3wStr0ngPassword', $user->fresh()->password));
    }

    public function test_user_payload_never_exposes_secrets(): void
    {
        $user = User::factory()->create();
        $json = json_encode($this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me')->json());
        $this->assertStringNotContainsString('password', $json);
        $this->assertStringNotContainsString('remember_token', $json);
    }
}
