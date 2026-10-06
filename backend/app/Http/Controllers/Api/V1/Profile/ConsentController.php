<?php

namespace App\Http\Controllers\Api\V1\Profile;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Legal\Services\PolicyVersion;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ConsentController extends Controller
{
    public function __construct(private ConsentService $consents) {}

    /** Public: what we process, why, on which legal basis, and whether it is optional. */
    public function purposes()
    {
        return ApiResponse::data([
            'policy_version' => PolicyVersion::current(),
            'purposes' => collect(ConsentPurpose::cases())->map(fn (ConsentPurpose $p) => [
                'key' => $p->value,
                'required' => $p->isRequired(),
                'legal_basis' => $p->legalBasis(),
                'title' => __("privacy.purposes.{$p->value}.title"),
                'why' => __("privacy.purposes.{$p->value}.why"),
                'data' => __("privacy.purposes.{$p->value}.data"),
            ])->all(),
        ]);
    }

    public function show(Request $request)
    {
        return ApiResponse::data([
            'policy_version' => PolicyVersion::current(),
            'consents' => $this->consents->current($request->user()),
        ]);
    }

    public function update(Request $request, AuditLogger $audit)
    {
        $data = $request->validate([
            'consents' => ['required', 'array', 'min:1'],
            'consents.*' => ['boolean'],
        ]);

        $keys = array_keys($data['consents']);
        $valid = array_map(fn ($p) => $p->value, ConsentPurpose::cases());
        if ($unknown = array_diff($keys, $valid)) {
            return ApiResponse::error('validation_failed', __('errors.validation_failed'), 422, [
                'consents' => array_map(fn ($k) => __('errors.unknown_consent', ['purpose' => $k]), array_values($unknown)),
            ]);
        }

        foreach ($data['consents'] as $key => $granted) {
            if (! $granted && ConsentPurpose::from($key)->isRequired()) {
                return ApiResponse::error('validation_failed', __('errors.validation_failed'), 422, [
                    "consents.$key" => [__('errors.consent_cannot_withdraw')],
                ]);
            }
        }

        $this->consents->record($request->user(), array_map('boolval', $data['consents']), $request->ip(), (string) $request->header('X-Client', 'api'));

        $audit->log('consent.changed', $request->user(), $data['consents']);

        return $this->show($request);
    }
}
