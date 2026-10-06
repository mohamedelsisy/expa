<?php

namespace App\Domains\Notifications\Services;

use App\Domains\Notifications\Contracts\PushSender;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Firebase Cloud Messaging, HTTP v1. A service-account JWT (RS256) is exchanged for an OAuth2 access token (cached until
 * shortly before it expires), then one message per device token is POSTed. Code complete and Http::fake-tested; live
 * behaviour is UNTESTED until a Firebase project and service account exist (docs/EXTERNAL_SERVICES.md).
 *
 * Security: tokens, the access token and the private key are never logged or put into exception messages. Only counts are.
 * The message carries a generic title/body and routing ids (see NotificationService): nothing sensitive on a lock screen.
 */
class FcmPushSender implements PushSender
{
    private const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    /** @param  array<string,mixed>  $config  config('notifications.fcm') */
    public function __construct(private array $config) {}

    public function send(array $tokens, string $title, string $body, array $data = []): array
    {
        $tokens = array_values(array_unique(array_filter($tokens, 'is_string')));
        if ($tokens === []) {
            return [];
        }
        $credentials = $this->credentials();
        $project = $this->config['project_id'] ?? null ?: ($credentials['project_id'] ?? null);
        if (! is_string($project) || $project === '') {
            throw new RuntimeException('FCM project id is not configured.');
        }
        $data = array_map('strval', $data); // FCM data values must be strings

        $invalid = [];
        $failed = 0;
        foreach ($tokens as $token) {
            $outcome = $this->sendOne($credentials, $project, $token, $title, $body, $data);
            if ($outcome === 'invalid') {
                $invalid[] = $token;
            } elseif ($outcome === 'failed') {
                $failed++;
            }
        }
        Log::info('push.fcm', ['recipients' => count($tokens), 'invalid' => count($invalid), 'failed' => $failed]);

        return $invalid;
    }

    /** @return 'ok'|'invalid'|'failed' */
    private function sendOne(array $credentials, string $project, string $token, string $title, string $body, array $data): string
    {
        $payload = ['message' => [
            'token' => $token,
            'notification' => ['title' => $title, 'body' => $body],
            'data' => (object) $data,
            'android' => ['priority' => 'HIGH'],
            'apns' => ['headers' => ['apns-priority' => '10']],
        ]];
        $url = rtrim((string) ($this->config['api_base'] ?? 'https://fcm.googleapis.com'), '/')."/v1/projects/$project/messages:send";

        for ($attempt = 0; $attempt < 2; $attempt++) {
            $res = $this->http()->withToken($this->accessToken($credentials))->asJson()->post($url, $payload);

            if ($res->status() === 401 && $attempt === 0) {
                Cache::forget($this->cacheKey($credentials)); // token revoked/expired early: fetch a new one once

                continue;
            }

            return $this->classify($res);
        }

        return 'failed';
    }

    /** @return 'ok'|'invalid'|'failed' */
    private function classify(Response $res): string
    {
        if ($res->successful()) {
            return 'ok';
        }
        $code = $this->errorCode($res);
        // UNREGISTERED / NOT_FOUND: the app was uninstalled or the token rotated -> prune it.
        if ($code === 'UNREGISTERED' || $res->status() === 404) {
            return 'invalid';
        }
        // INVALID_ARGUMENT is "bad token" only when it blames the token field; a malformed payload must not delete devices.
        if ($code === 'INVALID_ARGUMENT' && str_contains((string) $res->body(), 'message.token')) {
            return 'invalid';
        }

        return 'failed';
    }

    private function errorCode(Response $res): ?string
    {
        foreach ((array) $res->json('error.details', []) as $detail) {
            if (isset($detail['errorCode'])) {
                return (string) $detail['errorCode'];
            }
        }

        return $res->json('error.status');
    }

    private function http(): PendingRequest
    {
        return Http::timeout((int) ($this->config['timeout'] ?? 10))->acceptJson()
            ->retry(3, (int) ($this->config['retry_sleep_ms'] ?? 250), fn ($e) => $e instanceof ConnectionException
                || ($e instanceof RequestException && ($e->response->serverError() || $e->response->status() === 429)), throw: false);
    }

    /** @param  array<string,mixed>  $credentials */
    private function accessToken(array $credentials): string
    {
        return Cache::remember($this->cacheKey($credentials), 3300, function () use ($credentials) {
            $now = time();
            $tokenUri = (string) ($credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token');
            $claims = ['iss' => $credentials['client_email'], 'scope' => self::SCOPE, 'aud' => $tokenUri, 'iat' => $now, 'exp' => $now + 3600];
            $res = $this->http()->asForm()->post($tokenUri, ['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $this->jwt($claims, $credentials['private_key'])]);
            $token = $res->json('access_token');
            if (! $res->successful() || ! is_string($token) || $token === '') {
                throw new RuntimeException('FCM OAuth token request failed (HTTP '.$res->status().').');
            }

            return $token;
        });
    }

    private function cacheKey(array $credentials): string
    {
        return 'fcm:access_token:'.sha1((string) $credentials['client_email']);
    }

    private function jwt(array $claims, string $privateKey): string
    {
        $b64 = fn (string $s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
        $input = $b64(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])).'.'.$b64(json_encode($claims));
        $key = openssl_pkey_get_private($privateKey);
        if ($key === false || ! openssl_sign($input, $signature, $key, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('FCM service-account private key is invalid.');
        }

        return $input.'.'.$b64($signature);
    }

    /** @return array<string,mixed> */
    private function credentials(): array
    {
        $raw = null;
        if (! empty($this->config['credentials_json'])) {
            $json = (string) $this->config['credentials_json'];
            $raw = str_starts_with(ltrim($json), '{') ? $json : (string) base64_decode($json, true);
        } elseif (! empty($this->config['credentials_path']) && is_readable((string) $this->config['credentials_path'])) {
            $raw = (string) file_get_contents((string) $this->config['credentials_path']);
        }
        $c = $raw ? json_decode($raw, true) : null;
        if (! is_array($c) || empty($c['client_email']) || empty($c['private_key'])) {
            throw new RuntimeException('FCM credentials are missing or invalid (FCM_CREDENTIALS_PATH / FCM_CREDENTIALS_JSON).');
        }

        return $c;
    }
}
