<?php

namespace App\Models;

use App\Domains\Access\Models\Role;
use App\Domains\Access\Services\AccessSynchronizer;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Profile\Models\UserProfile;
use App\Enums\UserStatus;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'locale'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements HasLocalePreference, MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /** @var array<int,string>|null */
    private ?array $permissionKeysCache = null;

    public function hasRole(string ...$keys): bool
    {
        return $this->roles->pluck('key')->intersect($keys)->isNotEmpty();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /** True if the user holds any role flagged privileged (admin, super_admin). */
    public function hasPrivilegedRole(): bool
    {
        return $this->roles->contains('is_privileged', true);
    }

    /** Staff = super admin or any non-default role that carries admin-area permissions (drives mandatory 2FA). */
    public function isStaff(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->roles()->where('key', '!=', config('permissions.default_role'))->whereHas('permissions')->exists();
    }

    public function hasPermission(string $key): bool
    {
        $this->permissionKeysCache ??= $this->roles()->with('permissions')->get()
            ->flatMap(fn (Role $r) => $r->permissions->pluck('key'))->unique()->values()->all();

        return in_array($key, $this->permissionKeysCache, true);
    }

    /** @param  array<int,string>  $keys */
    public function syncRoleKeys(array $keys): void
    {
        $sync = app(AccessSynchronizer::class);
        $ids = collect($keys)->map(fn ($k) => $sync->ensureRole($k)->id)->all();
        $this->roles()->sync($ids);
        $this->unsetRelation('roles');
        $this->permissionKeysCache = null;
    }

    public function preferredLocale(): string
    {
        return $this->locale ?: config('expa.default_locale');
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::Active;
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
