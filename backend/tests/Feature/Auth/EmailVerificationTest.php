<?php

namespace Tests\Feature\Auth;

use App\Http\Middleware\EnsureEmailIsVerified;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function signedUrl(User $user, int $minutes = 60): string
    {
        return URL::temporarySignedRoute('verification.verify', now()->addMinutes($minutes),
            ['id' => $user->id, 'hash' => sha1($user->email)]);
    }

    public function test_valid_signed_link_verifies_email_without_login(): void
    {
        $user = User::factory()->unverified()->create();

        $this->getJson($this->signedUrl($user))->assertOk()->assertJsonPath('data.verified', true);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_tampered_signature_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $this->getJson($this->signedUrl($user).'x')->assertForbidden();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_wrong_hash_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addHour(), ['id' => $user->id, 'hash' => 'deadbeef']);

        $this->getJson($url)->assertStatus(422)->assertJsonPath('error.code', 'invalid_verification_link');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_expired_link_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = $this->signedUrl($user, 1);

        $this->travel(2)->minutes();
        $this->getJson($url)->assertForbidden();
    }

    public function test_link_for_another_users_hash_cannot_verify_a_different_account(): void
    {
        $a = User::factory()->unverified()->create();
        $b = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addHour(), ['id' => $b->id, 'hash' => sha1($a->email)]);

        $this->getJson($url)->assertStatus(422);
        $this->assertFalse($b->fresh()->hasVerifiedEmail());
    }

    public function test_resend_sends_for_unverified_and_not_for_verified(): void
    {
        Notification::fake();
        $unverified = User::factory()->unverified()->create();
        $verified = User::factory()->create();

        $this->actingAs($unverified, 'sanctum')->postJson('/api/v1/auth/resend-verification')->assertStatus(202);
        Notification::assertSentTo($unverified, VerifyEmailNotification::class);

        $this->actingAs($verified, 'sanctum')->postJson('/api/v1/auth/resend-verification')->assertStatus(202);
        Notification::assertNotSentTo($verified, VerifyEmailNotification::class);
    }

    public function test_resend_requires_auth(): void
    {
        $this->postJson('/api/v1/auth/resend-verification')->assertUnauthorized();
    }

    public function test_mail_is_localized_and_links_to_frontend_with_user_locale(): void
    {
        config(['expa.frontend_url' => 'https://app.expa.test']);
        foreach (['ar' => 'تأكيد البريد الإلكتروني', 'en' => 'Verify email', 'it' => 'Verifica email'] as $locale => $action) {
            $user = User::factory()->unverified()->create(['locale' => $locale, 'name' => 'Sara']);
            app()->setLocale($locale);
            $mail = (new VerifyEmailNotification)->toMail($user);

            $this->assertSame($action, $mail->actionText);
            $this->assertStringStartsWith("https://app.expa.test/$locale/verify-email?url=", $mail->actionUrl);
        }
        $this->assertInstanceOf(VerifyEmail::class, new VerifyEmailNotification);
    }

    public function test_verified_middleware_blocks_unverified_users_with_specific_code(): void
    {
        Route::middleware(['api', 'auth:sanctum', EnsureEmailIsVerified::class])
            ->get('api/v1/_test/verified-only', fn () => 'ok');

        $this->actingAs(User::factory()->unverified()->create(), 'sanctum')
            ->getJson('/api/v1/_test/verified-only')->assertForbidden()->assertJsonPath('error.code', 'email_not_verified');
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->getJson('/api/v1/_test/verified-only')->assertOk();
    }
}
