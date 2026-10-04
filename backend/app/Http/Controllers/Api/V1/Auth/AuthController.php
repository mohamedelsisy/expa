<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Profile\Services\ConsentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
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

        event(new Registered($user)); // sends the verification mail

        return ApiResponse::data([
            'user' => new UserResource($user),
            'token' => $this->issueToken($user, $request->validated('device_name')),
        ], status: 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->validated('email'))->first();

        // Always run a hash comparison so response time does not reveal whether the email exists.
        $hash = $user?->password ?? self::DUMMY_HASH;
        $passwordOk = Hash::check($request->validated('password'), $hash);

        if (! $user || ! $passwordOk) {
            $this->audit->log('auth.login_failed', $user, ['email_hash' => $this->audit->hash($request->validated('email'))], actor: $user);

            return ApiResponse::error('invalid_credentials', __('errors.invalid_credentials'), 401);
        }

        if (! $user->isActive()) {
            $this->audit->log('auth.login_blocked_suspended', $user, actor: $user);

            return ApiResponse::error('account_suspended', __('errors.account_suspended'), 403);
        }

        RateLimiter::clear('login:'.$request->validated('email').'|'.$request->ip());

        if (Hash::needsRehash($user->password)) {
            $user->password = $request->validated('password');
        }
        $user->last_login_at = now();
        $user->save();
        $this->audit->log('auth.login', $user, actor: $user);

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
        return $user->createToken($device ?: 'api')->plainTextToken;
    }
}
