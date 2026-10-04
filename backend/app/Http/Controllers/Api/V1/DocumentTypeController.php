<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Documents\Models\DocumentType;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;

class DocumentTypeController extends Controller
{
    public function index()
    {
        return ApiResponse::data(DocumentType::withTranslations()->orderBy('sort_order')->get()->map(fn ($t) => [
            'key' => $t->key,
            'name' => $t->localized('name'),
        ]));
    }
}
