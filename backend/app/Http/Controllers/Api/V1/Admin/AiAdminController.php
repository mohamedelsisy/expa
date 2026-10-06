<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domains\Ai\Models\AiConversation;
use App\Domains\Ai\Models\KnowledgeChunk;
use App\Domains\Ai\Services\KnowledgeIndexer;
use App\Domains\Audit\Services\AuditLogger;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * AI administration (MVP-15). GDPR: conversation CONTENT (titles, messages) is encrypted personal data and is never
 * exposed here. Support staff see counts, intents and degradation rates, never what a user asked or was answered.
 */
class AiAdminController extends Controller
{
    /** `ai.manage_knowledge`: what the assistant may cite (published public content only, derived index). */
    public function knowledge(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'locale' => ['nullable', 'in:ar,en,it'], 'source_type' => ['nullable', 'in:official,institutional,verified_partner,third_party']]);
        $q = KnowledgeChunk::query()->selectRaw('item_type, item_id, item_slug, locale, min(title) as title, min(source_name) as source_name, min(source_url) as source_url, min(source_type) as source_type, min(last_verified_at) as last_verified_at, count(*) as chunks')
            ->groupBy('item_type', 'item_id', 'item_slug', 'locale')->orderBy('item_type')->orderBy('item_id')->orderBy('locale');
        if ($l = $request->input('locale')) {
            $q->where('locale', $l);
        }
        if ($s = $request->input('source_type')) {
            $q->where('source_type', $s);
        }
        $page = $q->paginate((int) $request->input('per_page', 50));

        return ApiResponse::data($page->items(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
            'chunks_total' => KnowledgeChunk::count(), 'stale_after_days' => config('content.freshness.stale_after_days')]);
    }

    public function reindex(AuditLogger $audit)
    {
        $n = app(KnowledgeIndexer::class)->rebuildAll();
        $audit->log('admin.ai.knowledge_reindexed', null, ['chunks' => $n]);

        return ApiResponse::data(['chunks' => $n]);
    }

    /** `ai.view_conversations`: metadata only. */
    public function conversations(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $page = AiConversation::query()->select(['id', 'user_id', 'locale', 'created_at', 'updated_at'])
            ->withCount('messages')->withCount(['messages as degraded_count' => fn ($m) => $m->where('degraded', true)])->orderByDesc('id')->paginate((int) $request->input('per_page', 25));

        return ApiResponse::data($page->getCollection()->map(fn ($c) => [
            'id' => $c->id, 'user_id' => $c->user_id, 'locale' => $c->locale, 'messages' => $c->messages_count, 'degraded' => $c->degraded_count,
            'created_at' => $c->created_at?->toIso8601String(), 'updated_at' => $c->updated_at?->toIso8601String(),
        ])->values(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()]);
    }

    public function usage()
    {
        $since = now()->subDays(30);
        $base = DB::table('ai_messages')->where('created_at', '>=', $since);

        return ApiResponse::data([
            'questions_30d' => (clone $base)->where('role', 'user')->count(),
            'degraded_30d' => (clone $base)->where('role', 'assistant')->where('degraded', true)->count(),
            'tokens_in_30d' => (int) (clone $base)->sum('input_tokens'),
            'tokens_out_30d' => (int) (clone $base)->sum('output_tokens'),
            'by_intent' => (clone $base)->where('role', 'user')->whereNotNull('intent')->selectRaw('intent, count(*) as total')->groupBy('intent')->orderByDesc('total')->get()
                ->map(fn ($r) => ['intent' => $r->intent, 'total' => (int) $r->total])->all(),
        ]);
    }
}
