<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AnalyticsController extends Controller
{
    /**
     * Client-reported behaviour. Always answers 204 (even when dropped for lack of consent) so the response never
     * reveals consent state or breaks the UI. Authenticated callers are judged by their stored `analytics` consent;
     * anonymous callers must assert consent via the header set by the client's cookie/consent banner.
     */
    public function store(Request $request, Analytics $analytics)
    {
        $data = $request->validate([
            'name' => ['required', Rule::in(array_map(fn ($e) => $e->value, AnalyticsEvent::clientReportable()))],
            'subject' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9][a-z0-9\-_\/]*$/i'],
        ]);

        $subject = $data['subject'] ?? null;
        if ($subject !== null && ! DB::table('search_documents')->where('slug', $subject)->exists()) {
            $subject = null; // unknown slug: count the event without a subject instead of growing the table with arbitrary strings
        }

        $analytics->client(
            AnalyticsEvent::from($data['name']), $subject, $request->user('sanctum'),
            strtolower((string) $request->header('X-Analytics-Consent')) === 'granted',
        );

        return response()->noContent();
    }
}
