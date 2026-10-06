<?php

namespace App\Policies;

use App\Models\User;

/**
 * Permission gates (`users.update`, `roles.assign`) say what an actor may do in general;
 * this policy adds the target-specific rules that prevent privilege escalation.
 * (super_admin short-circuits everything through Gate::before.)
 */
class UserPolicy
{
    public function view(User $actor, User $target): bool
    {
        return $actor->hasPermission('users.view');
    }

    public function update(User $actor, User $target): bool
    {
        return $actor->hasPermission('users.update')
            && $actor->id !== $target->id          // cannot suspend/modify own account here
            && ! $target->hasPrivilegedRole();      // only super_admin (via Gate::before) may touch admins
    }

    public function delete(User $actor, User $target): bool
    {
        return $actor->hasPermission('users.delete') && $actor->id !== $target->id && ! $target->hasPrivilegedRole();
    }

    /** @param  array<int,string>  $newRoleKeys */
    public function assignRoles(User $actor, User $target, array $newRoleKeys): bool
    {
        if (! $actor->hasPermission('roles.assign') || $actor->id === $target->id) {
            return false;
        }

        $privileged = array_keys(array_filter(config('permissions.roles'), fn ($r) => $r['privileged']));

        // Granting or revoking a privileged role is reserved for super_admin.
        return ! $target->hasRole(...$privileged) && array_intersect($newRoleKeys, $privileged) === [];
    }
}
