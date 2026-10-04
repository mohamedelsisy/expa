<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    public static function data(mixed $data, array $meta = [], int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => array_merge(['locale' => app()->getLocale()], $meta),
        ], $status);
    }

    /** @param  class-string<JsonResource>  $resource */
    public static function paginated(LengthAwarePaginator $page, string $resource): JsonResponse
    {
        return self::data($resource::collection($page->getCollection())->resolve(), [
            'page' => $page->currentPage(),
            'per_page' => $page->perPage(),
            'total' => $page->total(),
            'last_page' => $page->lastPage(),
        ]);
    }

    public static function error(string $code, string $message, int $status, array $details = []): JsonResponse
    {
        $error = ['code' => $code, 'message' => $message];
        if ($details !== []) {
            $error['details'] = $details;
        }

        return response()->json(['error' => $error], $status);
    }
}
