<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    protected $signature = 'expa:make-admin {email} {--role=super_admin}';

    protected $description = 'Grant a privileged role to an existing user (bootstrap the first admin)';

    public function handle(): int
    {
        $user = User::where('email', mb_strtolower($this->argument('email')))->first();
        if (! $user) {
            $this->error('No user with that email. Register the account first.');

            return self::FAILURE;
        }

        $role = $this->option('role');
        if (! array_key_exists($role, config('permissions.roles'))) {
            $this->error("Unknown role [$role].");

            return self::FAILURE;
        }

        $user->syncRoleKeys(array_unique([...$user->roles->pluck('key')->all(), $role]));
        $this->info("{$user->email} now has role: $role");

        return self::SUCCESS;
    }
}
