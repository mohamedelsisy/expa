<?php

namespace Tests\Feature\Notifications;

use App\Domains\Notifications\Contracts\PushSender;
use App\Domains\Notifications\Models\DeviceToken;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Notifications\Services\NotificationService;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use App\Notifications\UserNotificationMail;
use Database\Seeders\DocumentTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use RuntimeException;
use Tests\TestCase;

class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DocumentTypeSeeder::class);
    }

    private function user(array $consents = [], array $attrs = []): User
    {
        $u = User::factory()->create($attrs);
        app(ConsentService::class)->record($u, array_merge(['document_storage' => true], $consents));
        $this->actingAs($u, 'sanctum');

        return $u;
    }

    private function notify(User $u, string $type = 'document_reminder', array $data = []): UserNotification
    {
        return app(NotificationService::class)->notify($u, $type, array_merge(['document_id' => null, 'name' => 'Permit', 'days' => 30, 'expiry_date' => '2027-03-01'], $data));
    }

    private function device(User $u, string $token, string $platform = 'ios'): DeviceToken
    {
        $d = new DeviceToken(['platform' => $platform, 'token' => $token]);
        $d->user_id = $u->id; // ownership is guarded against mass assignment
        $d->save();

        return $d;
    }

    private function fakePush(array $invalid = []): object
    {
        $fake = new class($invalid) implements PushSender
        {
            public array $calls = [];

            public function __construct(private array $invalid) {}

            public function send(array $tokens, string $title, string $body, array $data = []): array
            {
                $this->calls[] = compact('tokens', 'title', 'body', 'data');

                return $this->invalid;
            }
        };
        $this->app->instance(PushSender::class, $fake);

        return $fake;
    }

    // ---- inbox API ----------------------------------------------------------------------------

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/v1/notifications')->assertUnauthorized();
        $this->postJson('/api/v1/notifications/read-all')->assertUnauthorized();
        $this->postJson('/api/v1/devices', [])->assertUnauthorized();
    }

    public function test_inbox_is_localized_at_read_time_and_newest_first(): void
    {
        $u = $this->user();
        $this->notify($u, 'document_reminder', ['name' => 'Old', 'days' => 90]);
        $this->travel(1)->minute();
        $this->notify($u, 'document_expired', ['name' => 'Permesso']);

        $en = $this->getJson('/api/v1/notifications', ['Accept-Language' => 'en'])->assertOk();
        $this->assertSame('"Permesso" has expired', $en->json('data.0.title'));
        $this->assertSame('"Old" expires in 90 days', $en->json('data.1.title'));

        // Same stored rows, other languages: no re-sending, text follows the reader's language.
        $this->assertSame('«Permesso» è scaduto', $this->getJson('/api/v1/notifications', ['Accept-Language' => 'it'])->json('data.0.title'));
        $ar = $this->getJson('/api/v1/notifications', ['Accept-Language' => 'ar'])->json('data.0.title');
        $this->assertMatchesRegularExpression('/\p{Arabic}/u', $ar);
        $this->assertStringContainsString('Permesso', $ar);
        $this->assertStringNotContainsString('notifications.types', json_encode($this->getJson('/api/v1/notifications')->json()));
    }

    public function test_unread_filter_counts_and_pagination(): void
    {
        $u = $this->user();
        foreach (range(1, 5) as $i) {
            $this->notify($u);
        }
        UserNotification::first()->update(['read_at' => now()]);

        $this->getJson('/api/v1/notifications?unread=1')->assertJsonPath('meta.total', 4)->assertJsonPath('meta.unread', 4);
        $this->getJson('/api/v1/notifications?per_page=2&page=2')->assertJsonCount(2, 'data')->assertJsonPath('meta.last_page', 3);
        $this->getJson('/api/v1/notifications?per_page=500')->assertStatus(422);
    }

    public function test_mark_read_read_all_and_delete(): void
    {
        $u = $this->user();
        $a = $this->notify($u);
        $this->notify($u);

        $this->postJson("/api/v1/notifications/{$a->id}/read")->assertNoContent();
        $this->assertNotNull($a->fresh()->read_at);
        $this->getJson('/api/v1/notifications')->assertJsonPath('meta.unread', 1);

        $this->postJson('/api/v1/notifications/read-all')->assertNoContent();
        $this->getJson('/api/v1/notifications')->assertJsonPath('meta.unread', 0);

        $this->deleteJson("/api/v1/notifications/{$a->id}")->assertNoContent();
        $this->assertSame(1, UserNotification::count());
    }

    public function test_other_users_notifications_are_not_reachable(): void
    {
        $owner = $this->user();
        $n = $this->notify($owner);

        $this->user();
        $this->postJson("/api/v1/notifications/{$n->id}/read")->assertNotFound();
        $this->deleteJson("/api/v1/notifications/{$n->id}")->assertNotFound();
        $this->getJson('/api/v1/notifications')->assertJsonPath('meta.total', 0);
        $this->postJson('/api/v1/notifications/read-all')->assertNoContent();
        $this->assertNull($n->fresh()->read_at); // read-all only touches the caller's rows
        $this->postJson('/api/v1/notifications/not-a-uuid/read')->assertNotFound();
    }

    public function test_cta_points_to_the_document_only_while_it_exists(): void
    {
        $u = $this->user();
        $doc = $this->postJson('/api/v1/my-documents', ['type' => 'passport', 'expiry_date' => now()->addDays(40)->toDateString()])->json('data');
        $this->notify($u, 'document_reminder', ['document_id' => $doc['id']]);

        $this->assertSame(['type' => 'route', 'target' => 'my-documents/'.$doc['id']], $this->getJson('/api/v1/notifications')->json('data.0.cta'));

        $this->deleteJson("/api/v1/my-documents/{$doc['id']}")->assertNoContent();
        $this->assertNull($this->getJson('/api/v1/notifications')->json('data.0.cta'));
    }

    public function test_inbox_does_not_n_plus_one(): void
    {
        $u = $this->user();
        foreach (range(1, 15) as $i) {
            $this->notify($u);
        }
        $count = 0;
        DB::listen(function () use (&$count) {
            $count++;
        });
        $this->getJson('/api/v1/notifications?per_page=15')->assertOk();

        $this->assertLessThanOrEqual(6, $count, "ran $count queries");
    }

    // ---- channels -----------------------------------------------------------------------------

    public function test_in_app_is_always_recorded_but_email_and_push_need_consent(): void
    {
        Notification::fake();
        $push = $this->fakePush();
        $u = $this->user(); // no email/push consent
        $this->device($u, 'tok-12345678', 'ios');

        $this->notify($u);

        $this->assertSame(1, UserNotification::count());
        Notification::assertNothingSent();
        $this->assertSame([], $push->calls);
    }

    public function test_email_is_sent_with_consent_and_verified_address_only(): void
    {
        Notification::fake();
        $verified = $this->user(['email_reminders' => true]);
        $unverified = $this->user(['email_reminders' => true], ['email_verified_at' => null]);

        $this->notify($verified);
        $this->notify($unverified);

        Notification::assertSentTo($verified, UserNotificationMail::class);
        Notification::assertNotSentTo($unverified, UserNotificationMail::class);
        $this->assertSame(2, UserNotification::count()); // both still get the in-app copy
    }

    public function test_email_is_localized_to_the_users_language_and_links_to_the_document(): void
    {
        config(['expa.frontend_url' => 'https://app.expa.test']);
        $u = $this->user(['email_reminders' => true], ['locale' => 'it', 'name' => 'Sara']);
        $doc = $this->postJson('/api/v1/my-documents', ['type' => 'passport', 'label' => 'Passaporto', 'expiry_date' => now()->addDays(40)->toDateString()])->json('data');
        $n = $this->notify($u, 'document_reminder', ['document_id' => $doc['id'], 'name' => 'Passaporto', 'days' => 30]);

        app()->setLocale('it');
        $mail = (new UserNotificationMail($n))->toMail($u);

        $this->assertSame('«Passaporto» scade tra 30 giorni', $mail->subject);
        $this->assertSame('Ciao Sara,', $mail->greeting);
        $this->assertSame('https://app.expa.test/it/my-documents/'.$doc['id'], $mail->actionUrl);
        $this->assertSame('Apri il documento', $mail->actionText);
    }

    public function test_push_is_sent_with_consent_and_never_leaks_document_details(): void
    {
        $push = $this->fakePush();
        $u = $this->user(['push_notifications' => true], ['locale' => 'it']);
        $this->device($u, 'tok-aaaaaaaa', 'android');
        $this->device($u, 'tok-bbbbbbbb', 'ios');

        $n = $this->notify($u, 'document_reminder', ['name' => 'Permesso di Mohamed', 'expiry_date' => '2027-03-01']);

        $this->assertCount(1, $push->calls);
        $call = $push->calls[0];
        $this->assertEqualsCanonicalizing(['tok-aaaaaaaa', 'tok-bbbbbbbb'], $call['tokens']);
        $this->assertSame('Un tuo documento sta per scadere.', $call['body']); // user's locale
        $this->assertSame(['notification_id' => (string) $n->id, 'type' => 'document_reminder'], $call['data']);
        $blob = json_encode($call);
        $this->assertStringNotContainsString('Mohamed', $blob);
        $this->assertStringNotContainsString('2027', $blob);
    }

    public function test_push_without_registered_devices_is_a_noop(): void
    {
        $push = $this->fakePush();
        $this->notify($this->user(['push_notifications' => true]));
        $this->assertSame([], $push->calls);
    }

    public function test_invalid_push_tokens_reported_by_the_provider_are_pruned(): void
    {
        $this->fakePush(invalid: ['tok-dead0000']);
        $u = $this->user(['push_notifications' => true]);
        $this->device($u, 'tok-dead0000', 'ios');
        $this->device($u, 'tok-alive000', 'ios');

        $this->notify($u);

        $this->assertSame(['tok-alive000'], DeviceToken::pluck('token')->all());
    }

    public function test_a_failing_channel_never_blocks_the_others(): void
    {
        $this->app->instance(PushSender::class, new class implements PushSender
        {
            public function send(array $tokens, string $title, string $body, array $data = []): array
            {
                throw new RuntimeException('FCM down');
            }
        });
        Notification::fake();
        $u = $this->user(['push_notifications' => true, 'email_reminders' => true]);
        $this->device($u, 'tok-12345678', 'ios');

        $this->notify($u);

        $this->assertSame(1, UserNotification::count());
        Notification::assertSentTo($u, UserNotificationMail::class);
    }

    public function test_every_notification_type_is_translated_in_every_locale(): void
    {
        foreach (array_keys(config('expa.locales')) as $locale) {
            app()->setLocale($locale);
            foreach (['document_reminder', 'document_expired'] as $type) {
                foreach (['title', 'body', 'push'] as $f) {
                    $this->assertNotSame("notifications.types.$type.$f", __("notifications.types.$type.$f"), "$locale $type.$f");
                }
            }
            foreach (['notifications.mail.open', 'notifications.mail.footer', 'notifications.push.title'] as $k) {
                $this->assertNotSame($k, __($k), $locale);
            }
        }
    }

    // ---- devices ------------------------------------------------------------------------------

    public function test_device_registration_needs_push_consent_and_valid_input(): void
    {
        $this->user();
        $this->postJson('/api/v1/devices', ['token' => 'tok-12345678', 'platform' => 'ios'])
            ->assertForbidden()->assertJsonPath('error.code', 'consent_required')->assertJsonPath('error.details.purpose.0', 'push_notifications');

        $u = auth()->user();
        app(ConsentService::class)->record($u, ['push_notifications' => true]);
        $this->postJson('/api/v1/devices', ['token' => 'short', 'platform' => 'ios'])->assertStatus(422);
        $this->postJson('/api/v1/devices', ['token' => 'tok-12345678', 'platform' => 'windows'])->assertStatus(422);
        $this->postJson('/api/v1/devices', ['token' => 'tok-12345678', 'platform' => 'ios'])->assertCreated();
        $this->postJson('/api/v1/devices', ['token' => 'tok-12345678', 'platform' => 'ios'])->assertCreated(); // idempotent
        $this->assertSame(1, DeviceToken::count());
    }

    public function test_a_token_moving_to_another_account_has_one_owner_only(): void
    {
        $a = $this->user(['push_notifications' => true]);
        $this->postJson('/api/v1/devices', ['token' => 'tok-shared00', 'platform' => 'ios'])->assertCreated();
        $b = $this->user(['push_notifications' => true]);
        $this->postJson('/api/v1/devices', ['token' => 'tok-shared00', 'platform' => 'ios'])->assertCreated();

        $this->assertSame([$b->id], DeviceToken::pluck('user_id')->all());
        $this->assertNotSame($a->id, DeviceToken::first()->user_id);
    }

    public function test_user_can_only_remove_their_own_device(): void
    {
        $a = $this->user(['push_notifications' => true]);
        $this->device($a, 'tok-12345678', 'ios');

        $this->user();
        $this->deleteJson('/api/v1/devices', ['token' => 'tok-12345678'])->assertNoContent();
        $this->assertSame(1, DeviceToken::count());

        $this->actingAs($a, 'sanctum')->deleteJson('/api/v1/devices', ['token' => 'tok-12345678'])->assertNoContent();
        $this->assertSame(0, DeviceToken::count());
    }

    // ---- privacy & date regression ------------------------------------------------------------

    public function test_export_and_erasure_cover_notifications_and_devices(): void
    {
        $u = $this->user(['push_notifications' => true]);
        $this->device($u, 'tok-secret00', 'ios');
        $this->notify($u);

        $export = $this->getJson('/api/v1/profile/export')->assertOk();
        $export->assertJsonPath('data.notifications.inbox.0.type', 'document_reminder')->assertJsonPath('data.notifications.devices.0.platform', 'ios');
        $this->assertStringNotContainsString('tok-secret00', $export->getContent());

        $this->deleteJson('/api/v1/profile', ['password' => 'password'])->assertStatus(202);
        $this->assertSame(0, UserNotification::where('user_id', $u->id)->count());
        $this->assertSame(0, DeviceToken::where('user_id', $u->id)->count());
    }

    public function test_boundary_day_is_included_in_status_filter_and_dashboard_actions(): void
    {
        $this->user(['profile_personalization' => true]);
        $d = $this->postJson('/api/v1/my-documents', ['type' => 'passport', 'label' => 'Edge', 'expiry_date' => now()->addDays(90)->toDateString()])->json('data');

        $this->assertSame('expiring_soon', $d['status']);
        $this->getJson('/api/v1/my-documents?filter[status]=expiring_soon')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/my-documents?filter[status]=valid')->assertJsonPath('meta.total', 0);
        $this->assertContains('document.'.$d['id'], array_column($this->getJson('/api/v1/dashboard')->json('data.next_actions'), 'key'));
    }
}
