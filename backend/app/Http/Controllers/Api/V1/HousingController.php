<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Housing\Models\HousingCheck;
use App\Domains\Housing\Services\HousingChecker;
use App\Domains\Housing\Services\HousingCostEstimator;
use App\Domains\Platform\Services\FeatureQuota;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class HousingController extends Controller
{
    private const FEATURE = 'housing_check';

    /** POST /housing/check — stateless analysis; nothing is stored unless `save` is true (and then only the findings). */
    public function check(Request $request, HousingChecker $checker, ConsentService $consents, FeatureQuota $quota)
    {
        $max = (int) config('housing.max_chars');
        $rules = [
            'text' => ['required', 'string', 'min:'.config('housing.min_chars'), 'max:'.$max],
            'explain' => ['sometimes', 'boolean'],
            'save' => ['sometimes', 'boolean'],
            'label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'extra' => ['sometimes', 'array'],
        ];
        foreach (HousingCostEstimator::EXTRA_FIELDS as $f) {
            $rules["extra.$f"] = ['nullable', 'numeric', 'min:0', 'max:'.config('housing.max_amount')];
        }
        $data = $request->validate($rules);
        $user = $request->user();

        $consents->require($user, ConsentPurpose::HousingAnalysis);
        $save = (bool) ($data['save'] ?? false);
        if ($save && HousingCheck::where('user_id', $user->id)->where('expires_at', '>', now())->count() >= config('housing.max_saved_per_user')) {
            throw new ApiException('housing_saved_limit', __('errors.housing_saved_limit'), 422);
        }
        $remaining = $quota->consume($user, self::FEATURE);

        // Control characters have no place in a listing; they are removed rather than rejected.
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $data['text']) ?? $data['text'];
        $extra = array_filter(array_map(fn ($v) => $v === null ? null : (float) $v, $data['extra'] ?? []), fn ($v) => $v !== null);
        $result = $checker->check($text, app()->getLocale(), array_intersect_key($extra, array_flip(HousingCostEstimator::EXTRA_FIELDS)), (bool) ($data['explain'] ?? false));

        $savedId = null;
        if ($save) {
            $row = new HousingCheck(['label' => $data['label'] ?? null, 'locale' => app()->getLocale(), 'result' => $result, 'expires_at' => now()->addDays(config('housing.retention_days'))]);
            $row->user_id = $user->id;
            $row->save();
            $savedId = $row->id;
            $result['persisted'] = true;
        }

        return ApiResponse::data($result + ['saved_id' => $savedId, 'usage' => ['remaining' => $remaining]]);
    }

    public function usage(Request $request, FeatureQuota $quota)
    {
        $u = $request->user();

        return ApiResponse::data(['limit' => $quota->limitFor($u, self::FEATURE), 'remaining' => $quota->remaining($u, self::FEATURE), 'max_chars' => (int) config('housing.max_chars'),
            'resets_at' => now()->addDay()->startOfDay()->toIso8601String()]);
    }

    public function index(Request $request)
    {
        $rows = HousingCheck::where('user_id', $request->user()->id)->where('expires_at', '>', now())->orderByDesc('id')->limit(100)->get();

        return ApiResponse::data($rows->map(fn ($r) => [
            'id' => $r->id, 'label' => $r->label, 'created_at' => $r->created_at?->toIso8601String(), 'expires_at' => $r->expires_at->toIso8601String(),
            'monthly_total' => $r->result['cost']['monthly_total'] ?? null, 'confidence' => $r->result['confidence'] ?? null,
        ])->values());
    }

    public function show(Request $request, int $id)
    {
        $r = HousingCheck::where('user_id', $request->user()->id)->where('expires_at', '>', now())->findOrFail($id);

        return ApiResponse::data(['id' => $r->id, 'label' => $r->label, 'created_at' => $r->created_at?->toIso8601String(), 'expires_at' => $r->expires_at->toIso8601String(), 'result' => $r->result]);
    }

    public function destroy(Request $request, int $id)
    {
        HousingCheck::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->noContent();
    }
}
