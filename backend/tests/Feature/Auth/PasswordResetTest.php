<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_response_is_identical_for_known_and_unknown_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'a@example.com']);

        $known = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'a@example.com'], ['Accept-Language' => 'en']);
        $unknown = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'zzz@example.com'], ['Accept-Language' => 'en']);

        $known->assertOk();
        $this->assertSame($known->json(), $unknown->json());
        Notification::assertSentTo($user, ResetPasswordNotification::class);
        Notification::assertCount(1);
    }

    public function test_forgot_password_validates_email(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', [])->assertStatus(422);
    }

    public function test_reset_with_valid_token_changes_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com', 'password' => 'Str0ngPassw0rd']);
        $user->createToken('phone');
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token, 'email' => 'A@example.com',
            'password' => 'Br4ndNewPassword', 'password_confirmation' => 'Br4ndNewPassword',
        ])->assertOk();

        $this->assertTrue(\Hash::check('Br4ndNewPassword', $user->fresh()->password));
        $this->assertSame(0, $user->tokens()->count());
        $this->postJson('/api/v1/auth/login', ['email' => 'a@example.com', 'password' => 'Br4ndNewPassword'])->assertOk();
    }

    public function test_reset_token_is_single_use(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com']);
        $token = Password::createToken($user);
        $body = ['token' => $token, 'email' => 'a@example.com', 'password' => 'Br4ndNewPassword', 'password_confirmation' => 'Br4ndNewPassword'];

        $this->postJson('/api/v1/auth/reset-password', $body)->assertOk();
        $this->postJson('/api/v1/auth/reset-password', $body)->assertStatus(422)->assertJsonPath('error.code', 'invalid_reset_token');
    }

    public function test_reset_with_bad_token_or_weak_password_fails(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com']);
        $good = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'nope', 'email' => 'a@example.com',
            'password' => 'Br4ndNewPassword', 'password_confirmation' => 'Br4ndNewPassword',
        ])->assertStatus(422)->assertJsonPath('error.code', 'invalid_reset_token');

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $good, 'email' => 'a@example.com', 'password' => 'weak', 'password_confirmation' => 'weak',
        ])->assertStatus(422)->assertJsonPath('error.code', 'validation_failed');
    }

    public function test_expired_token_fails(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com']);
        $token = Password::createToken($user);

        $this->travel(config('auth.passwords.users.expire') + 1)->minutes();
        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token, 'email' => 'a@example.com',
            'password' => 'Br4ndNewPassword', 'password_confirmation' => 'Br4ndNewPassword',
        ])->assertStatus(422)->assertJsonPath('error.code', 'invalid_reset_token');
    }

    public function test_reset_mail_is_localized_and_links_to_frontend(): void
    {
        config(['expa.frontend_url' => 'https://app.expa.test']);
        foreach (['ar' => 'إعادة تعيين كلمة المرور', 'en' => 'Reset password', 'it' => 'Reimposta password'] as $locale => $action) {
            $user = User::factory()->create(['locale' => $locale, 'email' => "$locale@example.com"]);
            app()->setLocale($locale);
            $mail = (new ResetPasswordNotification('tok123'))->toMail($user);

            $this->assertSame($action, $mail->actionText);
            $this->assertStringStartsWith("https://app.expa.test/$locale/reset-password?token=tok123&email=", $mail->actionUrl);
        }
        $this->assertInstanceOf(ResetPassword::class, new ResetPasswordNotification('x'));
    }
}
