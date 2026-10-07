<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Ai\Models\AiConversation;
use App\Domains\Ai\Services\AiAssistant;
use App\Domains\Ai\Services\AiUsageService;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function ask(Request $request, AiAssistant $assistant)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:'.config('ai.max_message_chars')],
            'conversation_id' => ['nullable', 'integer'],
            // Patente Teacher: explain one published theory topic or one licensed exam question (by slug).
            'patente_topic' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'patente_question' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
        ]);

        $conversation = isset($data['conversation_id'])
            ? AiConversation::where('user_id', $request->user()->id)->findOrFail($data['conversation_id'])
            : null;

        $r = $assistant->ask($request->user(), trim(strip_tags($data['message'])), app()->getLocale(), $conversation, ['topic' => $data['patente_topic'] ?? null, 'question' => $data['patente_question'] ?? null]);

        return ApiResponse::data([
            'conversation_id' => $r['conversation']->id,
            'message' => $this->message($r['message']),
            'usage' => ['remaining' => $r['remaining']],
        ], ['degraded' => $r['message']->degraded]);
    }

    public function usage(Request $request, AiUsageService $usage)
    {
        return ApiResponse::data(['limit' => $usage->limitFor($request->user()), 'remaining' => $usage->remaining($request->user()), 'resets_at' => now()->addDay()->startOfDay()->toIso8601String()]);
    }

    public function conversations(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $page = AiConversation::where('user_id', $request->user()->id)->latest('updated_at')->paginate((int) $request->input('per_page', 20));

        return ApiResponse::data($page->getCollection()->map(fn ($c) => [
            'id' => $c->id, 'title' => $c->title, 'updated_at' => $c->updated_at?->toIso8601String(),
        ])->values(), ['page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage()]);
    }

    public function show(Request $request, int $id)
    {
        $c = AiConversation::where('user_id', $request->user()->id)->with('messages')->findOrFail($id);

        return ApiResponse::data([
            'id' => $c->id, 'title' => $c->title,
            'messages' => $c->messages->map(fn ($m) => $this->message($m))->values(),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        AiConversation::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->noContent();
    }

    private function message($m): array
    {
        return [
            'id' => $m->id,
            'role' => $m->role,
            'content' => $m->content,
            'label' => $m->label,
            'label_text' => $m->label ? __('ai.labels.'.$m->label) : null,
            'sources' => $m->sources ?? [],
            'actions' => $m->actions ?? [],
            'disclaimer' => $m->disclaimer,
            'degraded' => $m->degraded,
            'created_at' => $m->created_at?->toIso8601String(),
        ];
    }
}
