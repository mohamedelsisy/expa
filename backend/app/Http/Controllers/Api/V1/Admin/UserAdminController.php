<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Access\Models\Role;
use App\Domains\Audit\Services\AuditLogger;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminUserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserAdminController extends Controller
{
    private const SORTABLE = ['id', 'name', 'email', 'created_at', 'last_login_at'];

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort' => ['nullable', 'string'],
            'filter.status' => ['nullable', Rule::enum(UserStatus::class)],
            'filter.role' => ['nullable', 'string', 'max:50'],
            'filter.q' => ['nullable', 'string', 'max:100'],
        ]);

        $query = User::query()->with('roles');

        if ($q = $request->input('filter.q')) {
            $like = '%'.addcslashes($q, '%_\\').'%';
            $query->where(fn ($w) => $w->where('email', 'like', $like)->orWhere('name', 'like', $like));
        }
        if ($status = $request->input('filter.status')) {
            $query->where('status', $status);
        }
        if ($role = $request->input('filter.role')) {
            $query->whereHas('roles', fn ($r) => $r->where('key', $role));
        }

        $sort = (string) $request->input('sort', '-id');
        $column = ltrim($sort, '-');
        $query->orderBy(in_array($column, self::SORTABLE, true) ? $column : 'id', str_starts_with($sort, '-') ? 'desc' : 'asc');

        return ApiResponse::paginated($query->paginate((int) $request->input('per_page', 20)), AdminUserResource::class);
    }

    public function show(User $user)
    {
        Gate::authorize('view', $user);

        return ApiResponse::data(new AdminUserResource($user->load('roles')));
    }

    public function update(Request $request, User $user, AuditLogger $audit)
    {
        Gate::authorize('update', $user);
        $data = $request->validate(['status' => ['required', Rule::in([UserStatus::Active->value, UserStatus::Suspended->value])]]);

        $old = $user->status->value;
        $user->forceFill($data)->save(); // status is deliberately not mass-assignable
        $audit->log('admin.user.status_changed', $user, ['status' => ['old' => $old, 'new' => $data['status']]]);
        if ($data['status'] === UserStatus::Suspended->value) {
            $user->tokens()->delete(); // suspension takes effect immediately
        }

        return ApiResponse::data(new AdminUserResource($user->load('roles')));
    }

    public function syncRoles(Request $request, User $user, AuditLogger $audit)
    {
        $data = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', Rule::exists('roles', 'key')],
        ]);

        Gate::authorize('assignRoles', [$user, $data['roles']]);

        $old = $user->roles->pluck('key')->sort()->values()->all();
        $user->syncRoleKeys(array_values(array_unique($data['roles'])));
        $audit->log('admin.user.roles_changed', $user, ['roles' => ['old' => $old, 'new' => $user->roles()->pluck('key')->sort()->values()->all()]]);

        return ApiResponse::data(new AdminUserResource($user->load('roles')));
    }

    public function roles()
    {
        return ApiResponse::data(Role::with('permissions')->orderBy('id')->get()->map(fn (Role $r) => [
            'key' => $r->key,
            'label' => $r->label,
            'privileged' => $r->is_privileged,
            'permissions' => $r->permissions->pluck('key')->sort()->values(),
        ]));
    }
}
