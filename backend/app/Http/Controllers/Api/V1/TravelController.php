<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Travel\Models\TravelRequirement;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class TravelController extends Controller
{
    /**
     * Lookup of published, sourced entries. The inputs are query parameters only: nothing is read from the user's
     * profile and nothing is stored. No matching entry means "we have no verified information", never "allowed".
     */
    public function requirements(Request $request)
    {
        $d = $request->validate([
            'nationality' => ['required', 'string', 'regex:/^[A-Za-z]{2}$/'],
            'destination' => ['required', 'string', 'regex:/^[A-Za-z]{2}$/'],
            'residence_status' => ['sometimes', 'nullable', 'string', 'regex:/^[a-z_]{2,40}$/'],
        ]);

        $items = TravelRequirement::published()->with('translations')
            ->for($d['nationality'], $d['destination'], $d['residence_status'] ?? null)->orderBy('sort_order')->orderBy('id')->get();

        return ApiResponse::data([
            'available' => $items->isNotEmpty(),
            'nationality' => strtoupper($d['nationality']), 'destination' => strtoupper($d['destination']),
            'residence_status' => $d['residence_status'] ?? null,
            'message' => $items->isEmpty() ? __('travel.no_verified_entries') : null,
            'disclaimer' => __('travel.disclaimer'),
            'items' => $items->map(fn (TravelRequirement $r) => [
                'slug' => $r->slug, 'residence_status' => $r->residence_status, 'nationality' => $r->nationality,
                'title' => $r->localized('title'), 'summary' => $r->localized('summary'),
                'requirements' => $r->localized('requirements'), 'notes' => $r->localized('notes'),
                'source' => $r->sourcePayload(),
            ])->values(),
        ]);
    }
}
