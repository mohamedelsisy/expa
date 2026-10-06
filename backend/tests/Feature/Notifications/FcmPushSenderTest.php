<?php

namespace Tests\Feature\Notifications;

use App\Domains\Notifications\Contracts\PushSender;
use App\Domains\Notifications\Models\DeviceToken;
use App\Domains\Notifications\Services\FcmPushSender;
use App\Domains\Notifications\Services\LogPushSender;
use App\Domains\Notifications\Services\NotificationService;
use App\Domains\Profile\Services\ConsentService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class FcmPushSenderTest extends TestCase
{
    use RefreshDatabase;

    private $publicKey;

    private array $config;

    protected function setUp(): void
    {
        parent::setUp();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $private);
        $this->publicKey = openssl_pkey_get_details($key)['key'];
        $this->config = [
            'credentials_json' => json_encode(['type' => 'service_account', 'project_id' => 'expa-test', 'client_email' => 'push@expa-test.iam.gserviceaccount.com', 'private_key' => $private, 'token_uri' => 'https://oauth2.googleapis.com/token']),
            'api_base' => 'https://fcm.googleapis.com', 'timeout' => 5, 'retry_sleep_ms' => 0,
        ];
        Cache::flush();
    }

    private function fakeOk(): void
    {
        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'ya29.test-access', 'expires_in' => 3599]),
            'fcm.googleapis.com/*' => Http::response(['name' => 'projects/expa-test/messages/1']),
        ]);
    }

    public function test_it_exchanges_a_signed_jwt_for_a_token_and_sends_one_message_per_device(): void
    {
        $this->fakeOk();

        $invalid = (new FcmPushSender($this->config))->send(['tok-a', 'tok-b'], 'EXPA', 'Generic body', ['notification_id' => 7, 'type' => 'document_reminder']);

        $this->assertSame([], $invalid);
        Http::assertSent(function (Request $r) {
            if ($r->url() !== 'https://oauth2.googleapis.com/token') {
                return false;
            }
            parse_str($r->body(), $form);
            [$h, $c, $s] = explode('.', $form['assertion']);
            $dec = fn ($x) => base64_decode(strtr($x, '-_', '+/'));
            $claims = json_decode($dec($c), true);

            return $form['grant_type'] === 'urn:ietf:params:oauth:grant-type:jwt-bearer'
                && json_decode($dec($h), true)['alg'] === 'RS256'
                && $claims['iss'] === 'push@expa-test.iam.gserviceaccount.com' && $claims['scope'] === 'https://www.googleapis.com/auth/firebase.messaging'
                && $claims['exp'] - $claims['iat'] === 3600
                && openssl_verify("$h.$c", $dec($s), $this->publicKey, OPENSSL_ALGO_SHA256) === 1;
        });
        Http::assertSent(fn (Request $r) => $r->url() === 'https://fcm.googleapis.com/v1/projects/expa-test/messages:send'
            && $r->hasHeader('Authorization', 'Bearer ya29.test-access')
            && ($m = json_decode($r->body(), true)['message'])['token'] === 'tok-a' && $m['notification']['body'] === 'Generic body' && $m['data']['notification_id'] === '7');
        Http::assertSentCount(3); // 1 token exchange (cached) + 2 messages
    }

    public function test_the_access_token_is_cached_across_calls(): void
    {
        $this->fakeOk();
        $s = new FcmPushSender($this->config);
        $s->send(['a'], 't', 'b');
        $s->send(['b'], 't', 'b');
        Http::assertSentCount(3);
    }

    public function test_unregistered_tokens_are_reported_for_pruning_but_payload_errors_are_not(): void
    {
        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'x', 'expires_in' => 3599]),
            'fcm.googleapis.com/*' => Http::sequence()
                ->push(['error' => ['code' => 404, 'status' => 'NOT_FOUND', 'details' => [['errorCode' => 'UNREGISTERED']]]], 404)
                ->push(['error' => ['status' => 'INVALID_ARGUMENT', 'message' => 'The registration token is not a valid FCM registration token', 'details' => [['field' => 'message.token']]]], 400)
                ->push(['error' => ['status' => 'INVALID_ARGUMENT', 'message' => 'Invalid JSON payload received.']], 400)
                ->push(['name' => 'ok']),
        ]);

        $invalid = (new FcmPushSender($this->config))->send(['gone', 'garbage', 'payload-problem', 'good'], 't', 'b');

        $this->assertSame(['gone', 'garbage'], $invalid);
    }

    public function test_transient_errors_are_retried_with_backoff_and_then_succeed(): void
    {
        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'x', 'expires_in' => 3599]),
            'fcm.googleapis.com/*' => Http::sequence()->push([], 503)->push([], 429)->push(['name' => 'ok']),
        ]);
        $this->assertSame([], (new FcmPushSender($this->config))->send(['tok'], 't', 'b'));
        Http::assertSentCount(4); // token + 3 attempts
    }

    public function test_a_401_refreshes_the_access_token_once(): void
    {
        Http::fake([
            'oauth2.googleapis.com/*' => Http::sequence()->push(['access_token' => 'old', 'expires_in' => 3599])->push(['access_token' => 'new', 'expires_in' => 3599]),
            'fcm.googleapis.com/*' => Http::sequence()->push(['error' => ['status' => 'UNAUTHENTICATED']], 401)->push(['name' => 'ok']),
        ]);
        $this->assertSame([], (new FcmPushSender($this->config))->send(['tok'], 't', 'b'));
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'messages:send') && $r->hasHeader('Authorization', 'Bearer new'));
    }

    public function test_bad_credentials_throw_without_leaking_secrets(): void
    {
        Http::fake();
        foreach ([['credentials_json' => null], ['credentials_json' => '{"client_email":"a@b","private_key":"not a key"}'], ['credentials_json' => base64_encode('{}')]] as $override) {
            try {
                (new FcmPushSender($override + $this->config + ['credentials_json' => null]))->send(['tok-secret'], 't', 'b');
                $this->fail('expected an exception');
            } catch (\RuntimeException $e) {
                $this->assertStringNotContainsString('tok-secret', $e->getMessage());
                $this->assertStringNotContainsString('not a key', $e->getMessage());
            }
        }
        Http::assertNothingSent();
    }

    public function test_base64_credentials_and_a_credentials_file_are_supported(): void
    {
        $this->fakeOk();
        $json = $this->config['credentials_json'];
        $this->assertSame([], (new FcmPushSender(['credentials_json' => base64_encode($json)] + $this->config))->send(['t'], 't', 'b'));
        Cache::flush();
        $path = tempnam(sys_get_temp_dir(), 'fcm');
        file_put_contents($path, $json);
        $this->assertSame([], (new FcmPushSender(['credentials_json' => null, 'credentials_path' => $path] + $this->config))->send(['t'], 't', 'b'));
        unlink($path);
    }

    public function test_tokens_are_never_logged(): void
    {
        $this->fakeOk();
        Log::spy();
        (new FcmPushSender($this->config))->send(['super-secret-device-token'], 'Title', 'Body');
        Log::shouldHaveReceived('info')->withArgs(fn ($msg, $ctx = []) => $msg === 'push.fcm' && ! str_contains(json_encode($ctx), 'super-secret') && $ctx['recipients'] === 1);
    }

    public function test_the_driver_is_selected_by_config_and_invalid_tokens_are_deleted_by_the_notification_service(): void
    {
        config(['notifications.push_driver' => 'log']);
        $this->assertInstanceOf(LogPushSender::class, $this->app->make(PushSender::class));

        config(['notifications.push_driver' => 'fcm', 'notifications.fcm' => $this->config]);
        $this->assertInstanceOf(FcmPushSender::class, $this->app->make(PushSender::class));

        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'x', 'expires_in' => 3599]),
            'fcm.googleapis.com/*' => Http::response(['error' => ['details' => [['errorCode' => 'UNREGISTERED']]]], 404),
        ]);
        $user = User::factory()->create();
        app(ConsentService::class)->record($user, ['push_notifications' => true]);
        $d = new DeviceToken(['platform' => 'android', 'token' => 'dead-token']);
        $d->user_id = $user->id;
        $d->save();

        app(NotificationService::class)->notify($user, 'document_reminder', ['name' => 'X', 'days' => 3, 'expiry_date' => '2026-12-01', 'document_id' => 1]);

        $this->assertSame(0, DeviceToken::count(), 'UNREGISTERED tokens are pruned');
    }
}
