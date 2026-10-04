<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Models\AuditLog;
use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'filter.action' => ['nullable', 'string', 'max:80'],
            'filter.actor_id' => ['nullable', 'integer'],
            'filter.subject_type' => ['nullable', 'string', 'max:120'],
            'filter.subject_id' => ['nullable', 'integer'],
            'filter.from' => ['nullable', 'date'],
            'filter.to' => ['nullable', 'date'],
        ]);

        $q = AuditLog::query()->latest('id');

        foreach (['actor_id', 'subject_type', 'subject_id'] as $f) {
            if ($request->filled("filter.$f")) {
                $q->where($f, $request->input("filter.$f"));
            }
        }
        if ($action = $request->input('filter.action')) {
            // exact match or prefix ("auth." matches every auth event)
            str_ends_with($action, '.') ? $q->where('action', 'like', $action.'%') : $q->where('action', $action);
        }
        if ($from = $request->input('filter.from')) {
            $q->where('created_at', '>=', $from);
        }
        if ($to = $request->input('filter.to')) {
            $q->where('created_at', '<=', $to);
        }

        return ApiResponse::paginated($q->paginate((int) $request->input('per_page', 25)), AuditLogResource::class);
    }
}
