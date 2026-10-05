<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'locale' => $this->locale,
            'email_verified' => $this->hasVerifiedEmail(),
            // Own roles/permissions so clients can show only the actions this person may perform (the API still enforces them).
            'roles' => $this->roles->pluck('key')->sort()->values(),
            'is_super_admin' => $this->isSuperAdmin(),
            'permissions' => $this->isSuperAdmin() ? config('permissions.permissions') : $this->roles->load('permissions')->flatMap(fn ($r) => $r->permissions->pluck('key'))->unique()->sort()->values(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
