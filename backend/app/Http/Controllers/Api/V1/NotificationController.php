<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Documents\Models\UserDocument;
use App\Domains\Notifications\Models\UserNotification;
use App\Domains\Notifications\Services\NotificationPresenter;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationPresenter $presenter) {}

    public function index(Request $request)
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'unread' => ['nullable', 'boolean']]);

        $q = UserNotification::where('user_id', $request->user()->id)->latest('created_at')->latest('id');
        if ($request->boolean('unread')) {
            $q->whereNull('read_at');
        }
        $page = $q->paginate((int) $request->input('per_page', 20));

        // One query for every referenced document instead of one per notification.
        $docIds = UserDocument::where('user_id', $request->user()->id)
            ->whereIn('id', $page->getCollection()->map(fn ($n) => $n->data['document_id'] ?? null)->filter()->all())->pluck('id');

        $items = $page->getCollection()->map(fn (UserNotification $n) => [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $this->presenter->title($n),
            'body' => $this->presenter->body($n),
            'cta' => $this->presenter->cta($n, $docIds),
            'read' => $n->read_at !== null,
            'created_at' => $n->created_at?->toIso8601String(),
        ]);

        return ApiResponse::data($items, [
            'page' => $page->currentPage(), 'per_page' => $page->perPage(), 'total' => $page->total(), 'last_page' => $page->lastPage(),
            'unread' => UserNotification::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
        ]);
    }

    public function read(Request $request, string $id)
    {
        $n = UserNotification::where('user_id', $request->user()->id)->findOrFail($id);
        $n->read_at ??= now();
        $n->save();

        return response()->noContent();
    }

    public function readAll(Request $request)
    {
        UserNotification::where('user_id', $request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->noContent();
    }

    public function destroy(Request $request, string $id)
    {
        UserNotification::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->noContent();
    }
}
