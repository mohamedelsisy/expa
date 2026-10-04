<?php

namespace App\Domains\Privacy\Services;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserEraser
{
    /** @param  iterable<PersonalDataProvider>  $providers */
    public function __construct(private iterable $providers, private AuditLogger $audit) {}

    /** Step 1 (synchronous): block access immediately and revoke every credential. */
    public function lockForErasure(User $user): void
    {
        $user->forceFill(['status' => UserStatus::PendingErasure])->save();
        $user->tokens()->delete();
        $this->audit->log('privacy.erasure_requested', $user, actor: $user);
    }

    /** Step 2 (queued, idempotent): erase module data, then anonymize the account stub. */
    public function erase(User $user): void
    {
        DB::transaction(function () use ($user) {
            foreach ($this->providers as $provider) {
                $provider->erase($user);
            }

            $user->forceFill([
                'name' => 'Deleted user',
                'email' => "deleted-{$user->id}@erased.invalid",
                'password' => Str::random(64),
                'remember_token' => null,
                'last_login_at' => null,
                'email_verified_at' => null,
                'status' => UserStatus::PendingErasure,
            ])->save();
            $user->delete(); // soft delete: the anonymized stub keeps foreign keys valid
        });

        // Logged after the transaction, without an actor: the person no longer exists.
        $this->audit->log('privacy.erased', $user, actor: null);
    }
}
