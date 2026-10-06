<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Patente\Enums\LicenseType;
use App\Domains\Patente\Models\PatenteQuestion;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

/** Data the admin UI needs to edit questions safely: licence vocabulary and the state of the bank's rights. */
class PatenteAdminMetaController extends Controller
{
    public function __invoke()
    {
        $byStatus = DB::table('patente_questions')->whereNull('deleted_at')->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $incomplete = PatenteQuestion::whereIn('status', ['draft', 'review', 'approved'])->get()->reject->rightsComplete()->count();

        return ApiResponse::data([
            'license_types' => array_map(fn ($c) => ['value' => $c->value, 'label' => __("patente.license_types.{$c->value}")], LicenseType::cases()),
            'rights_policy' => [
                'require_rights' => (bool) config('patente.require_rights_note'),
                'legacy_rights_note_allowed' => (bool) config('patente.legacy_rights_note_allowed'),
                'required_fields' => ['license_type', 'rights_holder', 'license_proof_ref'],
            ],
            'questions' => ['by_status' => $byStatus, 'unpublished_with_incomplete_rights' => $incomplete, 'published' => (int) ($byStatus['published'] ?? 0)],
            'exam_rules' => config('patente.exam'),
            'required_locales' => (new PatenteQuestion)->requiredLocales(),
        ]);
    }
}
