<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Profile\Services\ConsentService;
use App\Domains\TwoFactor\Services\TwoFactorService;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\LoginGuard;
use App\Support\TokenIssuer;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function __construct(private AuditLogger $audit) {}

    /** Valid bcrypt hash (cost 12) of a throwaway string, used to equalize timing for unknown emails. */
    private const DUMMY_HASH = '$2y$12$aGl2olzmzKbNcBiR100xZe8LS6/GawaP0hWOd9DyENlUV2IaTR446';

    public function register(RegisterRequest $request, ConsentService $consents)
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'locale' => $request->validated('locale') ?? app()->getLocale(),
        ]);

        $user->syncRoleKeys([config('permissions.default_role')]);
        $consents->record($user, ['terms' => true, 'privacy' => true], $request->ip(), (string) $request->header('X-Client', 'api'));

        $this->audit->log('auth.registered', $user, actor: $user);
        app(Analytics::class)->system(AnalyticsEvent::Signup);

        event(new Registered($user)); // sends the verification mail

        return ApiResponse::data([
            'user' => new UserResource($user),
            'token' => $this->issueToken($user, $request->validated('device_name')),
        ], status: 201);
    }

    public function login(LoginRequest $request, LoginGuard $guard)
    {
        $email = LoginGuard::normalise($request->validated('email'));
        if (! $guard->mayVerify($email, (string) $request->ip())) {
            return ApiResponse::error('too_many_requests', __('errors.too_many_requests'), 429)
                ->withHeaders(['Retry-After' => $guard->retryAfter($email)]);
        }

        $user = User::where('email', $request->validated('email'))->first();

        // Always run a hash comparison so response time does not reveal whether the email exists.
        $hash = $user?->password ?? self::DUMMY_HASH;
        $passwordOk = Hash::check($request->validated('password'), $hash);

        if (! $user || ! $passwordOk) {
            $guard->failed($email);
            $this->audit->log('auth.login_failed', $user, ['email_hash' => $this->audit->hash($request->validated('email'))], actor: $user);

            return ApiResponse::error('invalid_credentials', __('errors.invalid_credentials'), 401);
        }

        // Accounts being erased look like any unknown account.
        if ($user->status === UserStatus::PendingErasure) {
            return ApiResponse::error('invalid_credentials', __('errors.invalid_credentials'), 401);
        }

        if (! $user->isActive()) {
            $this->audit->log('auth.login_blocked_suspended', $user, actor: $user);

            return ApiResponse::error('account_suspended', __('errors.account_suspended'), 403);
        }

        // Accounts with 2FA get a short-lived single-use challenge instead of a token; the token is issued only after the code.
        if (app(TwoFactorService::class)->isEnabled($user)) {
            return ApiResponse::data([
                'two_factor_required' => true,
                'challenge_token' => app(TwoFactorService::class)->issueChallenge($user, $request->validated('device_name')),
                'expires_in' => (int) config('auth.two_factor.challenge_ttl', 300),
            ]);
        }

        $guard->succeeded($email, (string) $request->ip());

        if (Hash::needsRehash($user->password)) {
            $user->password = $request->validated('password');
        }
        $user->last_login_at = now();
        $user->save();
        $this->audit->log('auth.login', $user, actor: $user);
        app(Analytics::class)->system(AnalyticsEvent::Login);

        return ApiResponse::data([
            'user' => new UserResource($user),
            'token' => $this->issueToken($user, $request->validated('device_name')),
        ]);
    }

    public function me(Request $request)
    {
        return ApiResponse::data(new UserResource($request->user()));
    }

    public function logout(Request $request)
    {
        $this->audit->log('auth.logout', $request->user());
        $token = $request->user()->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->noContent();
    }

    public function logoutAll(Request $request)
    {
        $this->audit->log('auth.logout_all', $request->user());
        $request->user()->tokens()->delete();

        return response()->noContent();
    }

    private function issueToken(User $user, ?string $device): string
    {
        return app(TokenIssuer::class)->issue($user, $device);
    }

    /** The user's signed-in devices (no secrets). */
    public function tokens(Request $request)
    {
        $current = $request->user()->currentAccessToken()?->id;

        return ApiResponse::data($request->user()->tokens()->orderByDesc('id')->get()->map(fn ($t) => [
            'id' => $t->id, 'name' => $t->name, 'last_used_at' => $t->last_used_at?->toIso8601String(),
            'created_at' => $t->created_at?->toIso8601String(), 'expires_at' => $t->expires_at?->toIso8601String(), 'current' => $t->id === $current,
        ])->values());
    }

    public function revokeToken(Request $request, int $id)
    {
        $request->user()->tokens()->whereKey($id)->firstOrFail()->delete();
        $this->audit->log('auth.token_revoked', $request->user());

        return response()->noContent();
    }
}
