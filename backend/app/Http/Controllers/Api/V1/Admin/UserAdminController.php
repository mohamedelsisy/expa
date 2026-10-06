<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Access\Models\Role;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Privacy\Services\UserEraser;
use App\Enums\UserStatus;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\AdminUserResource;
use App\Jobs\EraseUserData;
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

    /**
     * Invariants enforced here, outside the Gate (BE-18): Gate::before lets super_admin pass every policy, including the
     * "not yourself" guards, so these cannot live only in UserPolicy.
     */
    private function guardSuperAdminInvariants(Request $request, User $target, bool $losesSuperAdmin): void
    {
        if ($request->user()->id === $target->id) {
            throw new ApiException('cannot_modify_self', __('errors.cannot_modify_self'), 403);
        }
        if ($losesSuperAdmin && $target->isSuperAdmin()
            && User::whereHas('roles', fn ($r) => $r->where('key', 'super_admin'))->where('status', UserStatus::Active->value)->where('id', '!=', $target->id)->doesntExist()) {
            throw new ApiException('last_super_admin', __('errors.last_super_admin'), 422);
        }
    }

    public function update(Request $request, User $user, AuditLogger $audit)
    {
        Gate::authorize('update', $user);
        if ($user->status === UserStatus::PendingErasure) {
            throw new ApiException('account_pending_erasure', __('errors.account_pending_erasure'), 422);
        }
        $data = $request->validate(['status' => ['required', Rule::in([UserStatus::Active->value, UserStatus::Suspended->value])]]);
        $this->guardSuperAdminInvariants($request, $user, $data['status'] === UserStatus::Suspended->value);

        $old = $user->status->value;
        $user->forceFill($data)->save(); // status is deliberately not mass-assignable
        $audit->log('admin.user.status_changed', $user, ['status' => ['old' => $old, 'new' => $data['status']]]);
        if ($data['status'] === UserStatus::Suspended->value) {
            $user->tokens()->delete(); // suspension takes effect immediately
        }

        return ApiResponse::data(new AdminUserResource($user->load('roles')));
    }

    /** `users.delete`: starts the same two-phase GDPR erasure the user can request themselves (lock now, erase queued). */
    public function destroy(Request $request, User $user, UserEraser $eraser)
    {
        Gate::authorize('delete', $user);
        $this->guardSuperAdminInvariants($request, $user, true);
        if ($user->status === UserStatus::PendingErasure) {
            throw new ApiException('account_pending_erasure', __('errors.account_pending_erasure'), 422);
        }
        $eraser->lockForErasure($user);
        EraseUserData::dispatch($user->id);

        return ApiResponse::data(['message' => __('messages.erasure_started')], status: 202);
    }

    public function syncRoles(Request $request, User $user, AuditLogger $audit)
    {
        $data = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', Rule::exists('roles', 'key')],
        ]);

        Gate::authorize('assignRoles', [$user, $data['roles']]);
        $this->guardSuperAdminInvariants($request, $user, ! in_array('super_admin', $data['roles'], true));

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
