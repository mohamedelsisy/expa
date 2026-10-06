<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Legal\Models\LegalDocument;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;

/** Public legal texts. 404 until a version has been published through the admin workflow: nothing is seeded. */
class LegalController extends Controller
{
    public function show(string $slug)
    {
        abort_unless(in_array($slug, config('legal.slugs'), true), 404);
        $doc = LegalDocument::currentPublished($slug) ?? abort(404);

        $data = [
            'slug' => $doc->slug,
            'title' => $doc->localized('title'),
            'body' => $doc->localized('body'),
            'format' => 'markdown',
            'version' => $doc->version,
            'published_at' => $doc->published_at?->toIso8601String(),
            'locale' => $doc->resolveLocale(),
            'fallback' => $doc->usesFallback(),
        ];
        if (filled($doc->source_name)) {
            $data['source'] = $doc->sourcePayload();
        }

        return ApiResponse::data($data)->header('Cache-Control', 'public, max-age=300');
    }
}
