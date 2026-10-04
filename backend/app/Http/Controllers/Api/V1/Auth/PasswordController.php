<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordController extends Controller
{
    public function forgot(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'string', 'email', 'max:254']]);

        // The result is deliberately ignored: the response must not reveal whether the account exists.
        Password::sendResetLink(['email' => mb_strtolower(trim($data['email']))]);

        return ApiResponse::data(['message' => __('messages.reset_link_generic')]);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:200'],
            'email' => ['required', 'string', 'email', 'max:254'],
            'password' => ['required', 'string', 'confirmed', PasswordRule::defaults()],
        ]);
        $data['email'] = mb_strtolower(trim($data['email']));

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill([
                'password' => $password,
                'remember_token' => Str::random(60),
            ])->save();
            $user->tokens()->delete(); // sign out everywhere
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            return ApiResponse::error('invalid_reset_token', __('errors.invalid_reset_token'), 422);
        }

        return ApiResponse::data(['message' => __('messages.password_reset_done')]);
    }

    public function change(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', 'different:current_password', PasswordRule::defaults()],
        ]);

        $user = $request->user();
        if (! Hash::check($data['current_password'], $user->password)) {
            return ApiResponse::error('validation_failed', __('errors.validation_failed'), 422, [
                'current_password' => [__('errors.current_password_incorrect')],
            ]);
        }

        $user->update(['password' => $data['password']]);
        // Keep only the token used for this request.
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->noContent();
    }
}
