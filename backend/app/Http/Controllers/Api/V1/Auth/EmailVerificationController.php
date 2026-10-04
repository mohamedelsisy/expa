<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /** Signed GET: callable without a session so links work from any device. */
    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::find($id);

        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return ApiResponse::error('invalid_verification_link', __('errors.invalid_verification_link'), 422);
        }

        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return ApiResponse::data(['verified' => true]);
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return ApiResponse::data(['message' => __('messages.verification_sent')], status: 202);
    }
}
