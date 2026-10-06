<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Government\Models\GovernmentOffice;
use App\Domains\Government\Models\GovernmentService;
use App\Domains\Guides\Models\Guide;
use App\Domains\Patente\Models\PatenteCategory;
use App\Domains\Patente\Models\PatenteTopic;
use App\Domains\Study\Models\StudyProgram;
use App\Domains\Study\Models\University;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

/**
 * Lightweight id/slug/title lists for relation selects in the admin UI (no per-module 100-row cap, no full resources).
 * Access: the module's own `.view` permission, or `.create`/`.update` on a module that links to that kind (an editor
 * choosing a university for a program needs the list, not the whole universities module).
 */
class LookupAdminController extends Controller
{
    /** kind => [model, title column, owning permission prefix, permissions that also grant access] */
    private const KINDS = [
        'universities' => [University::class, 'name', 'universities', ['universities.update', 'universities.create']],
        'programs' => [StudyProgram::class, 'title', 'universities', ['universities.update', 'universities.create']],
        'guides' => [Guide::class, 'title', 'guides', ['appointment_guides.update', 'appointment_guides.create', 'articles.update', 'articles.create', 'government_services.update']],
        'offices' => [GovernmentOffice::class, 'name', 'government_offices', ['government_services.update', 'government_services.create', 'appointment_guides.update', 'appointment_guides.create']],
        'services' => [GovernmentService::class, 'name', 'government_services', ['government_offices.update', 'government_offices.create', 'appointment_guides.update']],
        'topics' => [PatenteTopic::class, 'title', 'patente', ['patente.update', 'patente.create']],
        'patente-categories' => [PatenteCategory::class, 'title', 'patente', ['patente.update', 'patente.create']],
    ];

    public function __invoke(Request $request, string $kind)
    {
        $user = $request->user();
        // A non-editor learns nothing, not even which kinds exist.
        abort_unless(collect(self::KINDS)->contains(fn ($k) => $user->hasPermission($k[2].'.view') || collect($k[3])->contains(fn ($p) => $user->hasPermission($p))), 403);
        abort_unless(isset(self::KINDS[$kind]), 404);
        [$class, $column, $prefix, $also] = self::KINDS[$kind];

        abort_unless($user->hasPermission($prefix.'.view') || collect($also)->contains(fn ($p) => $user->hasPermission($p)), 403);

        $request->validate(['q' => ['nullable', 'string', 'max:100'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'ids' => ['nullable', 'array', 'max:100'], 'ids.*' => ['integer']]);

        $q = $class::query()->with('translations')->orderBy('slug')->orderBy('id');
        if ($ids = $request->input('ids')) {
            $q->whereIn('id', $ids); // resolve the labels of already-selected values
        }
        if ($term = $request->input('q')) {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $q->where(fn ($w) => $w->where('slug', 'like', $like)->orWhereHas('translations', fn ($t) => $t->where($column, 'like', $like)));
        }
        $page = $q->paginate((int) $request->input('per_page', 50));

        return ApiResponse::data($page->getCollection()->map(fn ($m) => [
            'id' => $m->id, 'slug' => $m->slug, 'title' => $m->localized($column), 'status' => $m->status->value,
        ])->values(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()]);
    }
}
