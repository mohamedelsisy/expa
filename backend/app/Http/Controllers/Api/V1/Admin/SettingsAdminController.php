<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Legal\Services\PolicyVersion;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;

/** `settings.view`: read-only, allow-listed view of effective configuration. Never secrets, keys, hosts or paths. */
class SettingsAdminController extends Controller
{
    public function show()
    {
        return ApiResponse::data([
            'environment' => app()->environment(),
            'locales' => array_keys(config('expa.locales')),
            'default_locale' => config('expa.default_locale'),
            'content' => ['four_eyes' => (bool) config('content.four_eyes'), 'required_locales_to_publish' => config('content.required_locales_to_publish'), 'stale_after_days' => config('content.freshness.stale_after_days'), 'outdated_after_days' => config('content.freshness.outdated_after_days')],
            'ai' => ['driver' => config('ai.driver'), 'daily_limits' => config('ai.daily_limits'), 'max_message_chars' => config('ai.max_message_chars'), 'daily_token_budget_enabled' => (int) config('ai.daily_token_budget') > 0],
            'billing' => ['provider' => config('billing.provider'), 'currency' => config('billing.currency'), 'grace_days' => config('billing.dunning.grace_days'), 'vat_configured' => (bool) config('billing.tax.country')],
            'documents' => ['scanner' => config('documents.scanner'), 'max_file_kb' => config('documents.max_file_kb'), 'encrypted_at_rest' => (bool) config('documents.encrypt_at_rest')],
            'notifications' => ['push_driver' => config('notifications.push_driver'), 'mail_transport' => config('mail.default')],
            'privacy' => ['policy_version' => PolicyVersion::current(), 'retention' => config('privacy.retention')],
            'analytics' => ['system_events' => (bool) config('analytics.system_events')],
            'queue' => ['connection' => config('queue.default'), 'cache' => config('cache.default')],
        ]);
    }
}
