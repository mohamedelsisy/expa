<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\TwoFactor\Services\TwoFactorService as TwoFactor;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\LoginGuard;
use App\Support\TokenIssuer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class TwoFactorController extends Controller
{
    public function __construct(private TwoFactor $tf, private AuditLogger $audit) {}

    public function status(Request $request)
    {
        $user = $request->user();
        $cred = $this->tf->credential($user);
        $enabled = $cred?->confirmed_at !== null;

        return ApiResponse::data([
            'enabled' => $enabled,
            'confirmed_at' => $cred?->confirmed_at?->toIso8601String(),
            'setup_pending' => $cred !== null && ! $enabled,
            'recovery_codes_remaining' => $enabled ? $this->tf->recoveryRemaining($user) : 0,
            'required' => $this->tf->isRequiredFor($user),
            'setup_required' => $this->tf->setupRequired($user),
        ]);
    }

    public function setup(Request $request)
    {
        $user = $request->user();
        if ($this->tf->isEnabled($user)) {
            return ApiResponse::error('two_factor_already_enabled', __('errors.two_factor_already_enabled'), 409);
        }

        return ApiResponse::data($this->tf->beginSetup($user));
    }

    public function confirm(Request $request)
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:20']]);
        $user = $request->user();
        if ($this->tf->isEnabled($user)) {
            return ApiResponse::error('two_factor_already_enabled', __('errors.two_factor_already_enabled'), 409);
        }
        if ($blocked = $this->throttled($user, $request)) {
            return $blocked;
        }

        $codes = $this->tf->confirm($user, TwoFactor::normaliseCode($data['code']));
        if ($codes === null) {
            $this->tf->hitFailure($user, (string) $request->ip());
            $this->audit->log('auth.2fa_failed', $user, ['stage' => 'confirm']);

            return $this->invalidCode();
        }

        $this->tf->clearFailures($user, (string) $request->ip());
        $this->revokeOtherTokens($user);
        $this->audit->log('auth.2fa_enabled', $user);

        return ApiResponse::data(['enabled' => true, 'recovery_codes' => $codes]);
    }

    public function disable(Request $request)
    {
        $user = $request->user();
        if ($error = $this->reauthenticate($request, 'disable')) {
            return $error;
        }

        $this->tf->disable($user);
        $this->revokeOtherTokens($user);
        $this->audit->log('auth.2fa_disabled', $user);

        return response()->noContent();
    }

    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();
        if ($error = $this->reauthenticate($request, 'regenerate')) {
            return $error;
        }

        $codes = $this->tf->generateRecoveryCodes($user);
        $this->audit->log('auth.2fa_recovery_regenerated', $user);

        return ApiResponse::data(['recovery_codes' => $codes]);
    }

    /** Second step of a login for accounts with 2FA: the only place a token is issued for them. */
    public function challenge(Request $request)
    {
        $data = $request->validate([
            'challenge_token' => ['required', 'string', 'max:100'],
            'code' => ['nullable', 'string', 'max:20', 'required_without:recovery_code'],
            'recovery_code' => ['nullable', 'string', 'max:32', 'required_without:code'],
        ]);
        $ip = (string) $request->ip();

        $challenge = $this->tf->peekChallenge($data['challenge_token']);
        $user = $challenge ? User::find($challenge['user_id']) : null;
        if (! $challenge || ! $user || $user->status === UserStatus::PendingErasure || ! $this->tf->isEnabled($user)) {
            return ApiResponse::error('invalid_challenge', __('errors.invalid_challenge'), 401);
        }
        if ($user->status !== UserStatus::Active) {
            $this->audit->log('auth.login_blocked_suspended', $user, actor: $user);

            return ApiResponse::error('account_suspended', __('errors.account_suspended'), 403);
        }
        if ($blocked = $this->throttled($user, $request)) {
            return $blocked;
        }

        $method = $this->tf->verify($user, TwoFactor::normaliseCode($data['code'] ?? null), TwoFactor::normaliseRecovery($data['recovery_code'] ?? null));
        if ($method === null) {
            $this->tf->hitFailure($user, $ip);
            $this->tf->failChallenge($data['challenge_token']);
            $this->audit->log('auth.2fa_failed', $user, ['stage' => 'challenge'], actor: $user);

            return $this->invalidCode();
        }
        if (! $this->tf->consumeChallenge($data['challenge_token'])) { // lost a race with a parallel request
            return ApiResponse::error('invalid_challenge', __('errors.invalid_challenge'), 401);
        }

        $this->tf->clearFailures($user, $ip);
        app(LoginGuard::class)->succeeded(LoginGuard::normalise($user->email), $ip);
        $user->last_login_at = now();
        $user->save();
        $this->audit->log('auth.login', $user, ['two_factor' => $method], actor: $user);
        if ($method === 'recovery') {
            $this->audit->log('auth.2fa_recovery_used', $user, ['remaining' => $this->tf->recoveryRemaining($user)], actor: $user);
        }

        return ApiResponse::data([
            'user' => new UserResource($user),
            'token' => app(TokenIssuer::class)->issue($user, $challenge['device']),
            'recovery_codes_remaining' => $this->tf->recoveryRemaining($user),
        ]);
    }

    /** Password + (TOTP or recovery code) for sensitive 2FA changes. Returns an error response or null. */
    private function reauthenticate(Request $request, string $stage)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'max:200'],
            'code' => ['nullable', 'string', 'max:20', 'required_without:recovery_code'],
            'recovery_code' => ['nullable', 'string', 'max:32', 'required_without:code'],
        ]);
        $user = $request->user();
        if (! $this->tf->isEnabled($user)) {
            return ApiResponse::error('two_factor_not_enabled', __('errors.two_factor_not_enabled'), 409);
        }
        if ($blocked = $this->throttled($user, $request)) {
            return $blocked;
        }
        if (! Hash::check($data['password'], $user->password)) {
            $this->tf->hitFailure($user, (string) $request->ip());

            return ApiResponse::error('validation_failed', __('errors.validation_failed'), 422, ['password' => [__('errors.current_password_incorrect')]]);
        }
        $method = $this->tf->verify($user, TwoFactor::normaliseCode($data['code'] ?? null), TwoFactor::normaliseRecovery($data['recovery_code'] ?? null));
        if ($method === null) {
            $this->tf->hitFailure($user, (string) $request->ip());
            $this->audit->log('auth.2fa_failed', $user, ['stage' => $stage]);

            return $this->invalidCode();
        }
        if ($method === 'recovery') {
            $this->audit->log('auth.2fa_recovery_used', $user, ['stage' => $stage]);
        }
        $this->tf->clearFailures($user, (string) $request->ip());

        return null;
    }

    private function throttled(User $user, Request $request)
    {
        $ip = (string) $request->ip();
        if (! $this->tf->tooManyFailures($user, $ip)) {
            return null;
        }

        return ApiResponse::error('too_many_requests', __('errors.too_many_requests'), 429)
            ->withHeaders(['Retry-After' => $this->tf->retryAfter($user, $ip)]);
    }

    private function invalidCode()
    {
        return ApiResponse::error('invalid_two_factor_code', __('errors.invalid_two_factor_code'), 422);
    }

    private function revokeOtherTokens(User $user): void
    {
        $current = $user->currentAccessToken();
        $user->tokens()->when($current instanceof PersonalAccessToken, fn ($q) => $q->where('id', '!=', $current->id))->delete();
    }
}
