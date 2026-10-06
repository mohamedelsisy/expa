<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Documents\Contracts\OcrEngine;
use App\Domains\Documents\Explainer\DocumentExplainerService;
use App\Domains\Documents\Explainer\NullOcrEngine;
use App\Domains\Platform\Services\FeatureQuota;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class DocumentExplainController extends Controller
{
    private const FEATURE = 'document_explain';

    /** POST /documents/explain — multipart `file` (jpg/png/pdf) OR `text`. Nothing is stored. */
    public function explain(Request $request, DocumentExplainerService $service, ConsentService $consents, FeatureQuota $quota)
    {
        $data = $request->validate([
            'file' => ['required_without:text', 'prohibits:text', 'file', 'max:'.config('explainer.max_file_kb')],
            'text' => ['required_without:file', 'prohibits:file', 'string', 'min:'.config('explainer.min_text_chars'), 'max:'.config('explainer.max_text_chars')],
        ]);
        $user = $request->user();

        $consents->require($user, ConsentPurpose::DocumentAnalysis);
        $quota->consume($user, self::FEATURE);

        try {
            $text = $request->hasFile('file') ? $service->textFromFile($request->file('file')) : $data['text'];
            if (mb_strlen(trim($text)) < config('explainer.min_text_chars')) {
                throw new ApiException('ocr_empty', __('errors.ocr_empty'), 422, ['fallback' => ['text']]);
            }
        } catch (ApiException $e) {
            $quota->refund($user, self::FEATURE); // nothing was explained
            throw $e;
        }

        return ApiResponse::data($service->explain($text, app()->getLocale()) + ['usage' => ['remaining' => $quota->remaining($user, self::FEATURE)]]);
    }

    public function usage(Request $request, FeatureQuota $quota)
    {
        $u = $request->user();

        return ApiResponse::data(['limit' => $quota->limitFor($u, self::FEATURE), 'remaining' => $quota->remaining($u, self::FEATURE),
            'ocr_available' => ! app(OcrEngine::class) instanceof NullOcrEngine,
            'max_file_kb' => (int) config('explainer.max_file_kb'), 'max_text_chars' => (int) config('explainer.max_text_chars')]);
    }
}
