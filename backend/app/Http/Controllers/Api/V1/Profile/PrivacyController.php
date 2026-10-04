<?php

namespace App\Http\Controllers\Api\V1\Profile;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Privacy\Services\PersonalDataExporter;
use App\Domains\Privacy\Services\UserEraser;
use App\Http\Controllers\Controller;
use App\Jobs\EraseUserData;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PrivacyController extends Controller
{
    /** GDPR Art. 15/20: everything we hold about the user, machine-readable. */
    public function export(Request $request, PersonalDataExporter $exporter, AuditLogger $audit)
    {
        $audit->log('privacy.export_requested', $request->user());

        return ApiResponse::data($exporter->export($request->user()))
            ->header('Content-Disposition', 'attachment; filename="expa-data-export.json"');
    }

    /**
     * GDPR Art. 17. Irreversible, so the password must be re-entered.
     * Access is cut immediately; data erasure completes asynchronously.
     */
    public function destroy(Request $request, UserEraser $eraser)
    {
        $data = $request->validate(['password' => ['required', 'string']]);
        $user = $request->user();

        if (! Hash::check($data['password'], $user->password)) {
            return ApiResponse::error('validation_failed', __('errors.validation_failed'), 422, [
                'password' => [__('errors.current_password_incorrect')],
            ]);
        }

        $eraser->lockForErasure($user);
        EraseUserData::dispatch($user->id);

        return ApiResponse::data(['message' => __('messages.erasure_started')], status: 202);
    }
}
