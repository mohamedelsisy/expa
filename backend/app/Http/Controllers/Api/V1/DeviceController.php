<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Notifications\Models\DeviceToken;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeviceController extends Controller
{
    public function store(Request $request, ConsentService $consents)
    {
        $consents->require($request->user(), ConsentPurpose::PushNotifications);
        $data = $request->validate([
            'token' => ['required', 'string', 'min:8', 'max:512'],
            'platform' => ['required', Rule::in(['ios', 'android', 'web'])],
        ]);

        // A token belongs to one device; if it moves to another account, it moves here (never two owners).
        $device = DeviceToken::firstOrNew(['token' => $data['token']]);
        $max = (int) config('expa.limits.devices', 10);
        if (! $device->exists && DeviceToken::where('user_id', $request->user()->id)->count() >= $max) {
            // keep the newest devices: drop the least recently used registration instead of refusing a new phone
            DeviceToken::where('user_id', $request->user()->id)->orderBy('last_used_at')->orderBy('id')->limit(DeviceToken::where('user_id', $request->user()->id)->count() - $max + 1)->get()->each->delete();
        }
        $device->user_id = $request->user()->id;
        $device->platform = $data['platform'];
        $device->last_used_at = now();
        $device->save();

        return ApiResponse::data(['registered' => true], status: 201);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate(['token' => ['required', 'string', 'max:512']]);
        DeviceToken::where('user_id', $request->user()->id)->where('token', $data['token'])->delete();

        return response()->noContent();
    }
}
