<?php

namespace App\Domains\Access\Services;

use App\Domains\Access\Models\Permission;
use App\Domains\Access\Models\Role;

class AccessSynchronizer
{
    /** Guard for code paths that need a role to exist (e.g. signup on a fresh deploy before seeding). */
    public function ensureRole(string $key): Role
    {
        $role = Role::firstWhere('key', $key);
        if (! $role) {
            $this->sync();
            $role = Role::where('key', $key)->firstOrFail();
        }

        return $role;
    }

    /** Make roles/permissions tables match config/permissions.php. Safe to run repeatedly. */
    public function sync(): void
    {
        $keys = config('permissions.permissions');
        foreach ($keys as $key) {
            Permission::firstOrCreate(['key' => $key]);
        }
        Permission::whereNotIn('key', $keys)->delete();

        $ids = Permission::pluck('id', 'key');

        foreach (config('permissions.roles') as $key => $def) {
            $role = Role::updateOrCreate(['key' => $key], ['label' => $def['label'], 'is_privileged' => $def['privileged']]);
            $role->permissions()->sync(collect($def['permissions'])->map(fn ($p) => $ids[$p])->all());
        }
        Role::whereNotIn('key', array_keys(config('permissions.roles')))->get()->each->delete();
    }
}
