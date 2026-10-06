<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Audit\Services\AuditLogger;
use App\Http\Controllers\Controller;
use App\Jobs\BroadcastAnnouncement;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class NotificationAdminController extends Controller
{
    /** `notifications.send`: manual in-app announcement. Arabic text is mandatory (Arabic-first); en/it optional. */
    public function broadcast(Request $request, AuditLogger $audit)
    {
        $data = $request->validate([
            'title' => ['required', 'array'], 'title.*' => ['nullable', 'string', 'max:120'],
            'body' => ['required', 'array'], 'body.*' => ['nullable', 'string', 'max:1000'],
            'role' => ['nullable', 'string', Rule::exists('roles', 'key')],
        ]);
        $locales = array_keys(config('expa.locales'));
        $clean = fn (array $m) => collect($m)->only($locales)->map(fn ($v) => trim(strip_tags((string) $v)))->filter()->all();
        $title = $clean($data['title']);
        $body = $clean($data['body']);
        if (! isset($title['ar'], $body['ar'])) {
            throw ValidationException::withMessages(['title' => [__('validation.required', ['attribute' => 'title.ar'])]]);
        }

        $audience = User::where('status', 'active')->when($data['role'] ?? null, fn ($q, $r) => $q->whereHas('roles', fn ($x) => $x->where('key', $r)))->count();
        BroadcastAnnouncement::dispatch($title, $body, $data['role'] ?? null);
        $audit->log('admin.notification.broadcast', null, ['role' => $data['role'] ?? 'all', 'recipients' => $audience, 'locales' => array_keys($title)]);

        return ApiResponse::data(['queued' => true, 'recipients' => $audience], status: 202);
    }
}
