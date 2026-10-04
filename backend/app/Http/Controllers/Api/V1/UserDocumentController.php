<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Audit\Services\AuditLogger;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Documents\Models\UserDocument;
use App\Domains\Documents\Services\AttachmentStore;
use App\Domains\Profile\Enums\ConsentPurpose;
use App\Domains\Profile\Services\ConsentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserDocumentRequest;
use App\Http\Resources\UserDocumentResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Every query is scoped to the authenticated user, so another user's IDs are simply "not found"
 * (no 403 that would confirm the document exists).
 */
class UserDocumentController extends Controller
{
    public function __construct(
        private ConsentService $consents,
        private AttachmentStore $attachments,
        private AuditLogger $audit,
    ) {}

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'filter.type' => ['nullable', 'string', 'max:50'],
            'filter.status' => ['nullable', Rule::in(['valid', 'expiring_soon', 'expired', 'no_expiry'])],
            'sort' => ['nullable', 'string', 'max:30'],
        ]);

        $q = $request->user()->documents()->with(['type.translations', 'attachments', 'reminders']);

        if ($type = $request->input('filter.type')) {
            $q->whereHas('type', fn ($t) => $t->where('key', $type));
        }
        if ($status = $request->input('filter.status')) {
            $today = now()->toDateString();
            $soon = now()->addDays(config('documents.expiring_soon_days'))->toDateString();
            match ($status) {
                'no_expiry' => $q->whereNull('expiry_date'),
                'expired' => $q->where('expiry_date', '<', $today),
                'expiring_soon' => $q->whereBetween('expiry_date', [$today, $soon]),
                'valid' => $q->where('expiry_date', '>', $soon),
            };
        }

        // Soonest expiry first; documents without expiry last.
        $dir = $request->input('sort') === '-expiry_date' ? 'desc' : 'asc';
        $q->orderByRaw('expiry_date IS NULL')->orderBy('expiry_date', $dir)->orderBy('id');

        return ApiResponse::paginated($q->paginate((int) $request->input('per_page', 50)), UserDocumentResource::class);
    }

    public function store(UserDocumentRequest $request)
    {
        $user = $request->user();
        $this->consents->require($user, ConsentPurpose::DocumentStorage);

        $doc = $user->documents()->create($this->fields($request->validated()));
        $this->audit->log('document.created', $doc);
        app(Analytics::class)->system(AnalyticsEvent::DocumentAdded);

        return ApiResponse::data(new UserDocumentResource($this->loaded($doc)), status: 201);
    }

    public function show(Request $request, int $document)
    {
        return ApiResponse::data(new UserDocumentResource($this->loaded($this->find($request, $document))));
    }

    public function update(UserDocumentRequest $request, int $document)
    {
        $this->consents->require($request->user(), ConsentPurpose::DocumentStorage);
        $doc = $this->find($request, $document);

        $doc->update($this->fields($request->validated()));
        $this->audit->log('document.updated', $doc);

        return ApiResponse::data(new UserDocumentResource($this->loaded($doc)));
    }

    public function destroy(Request $request, int $document)
    {
        $doc = $this->find($request, $document);
        foreach ($doc->attachments as $attachment) {
            $this->attachments->delete($attachment);
        }
        $this->audit->log('document.deleted', $doc);
        $doc->delete();

        return response()->noContent();
    }

    public function upload(Request $request, int $document)
    {
        $this->consents->require($request->user(), ConsentPurpose::DocumentStorage);
        $doc = $this->find($request, $document);
        $request->validate(['file' => ['required', 'file']]);

        $attachment = $this->attachments->store($doc, $request->file('file'));
        $this->audit->log('document.attachment_added', $doc, ['mime' => $attachment->mime, 'size' => $attachment->size]);

        return ApiResponse::data(new UserDocumentResource($this->loaded($doc)), status: 201);
    }

    public function download(Request $request, int $document, int $attachment)
    {
        $att = $this->find($request, $document)->attachments()->findOrFail($attachment);
        abort_unless(Storage::disk('documents')->exists($att->storage_path), 404);

        $this->audit->log('document.attachment_downloaded', $att->document);

        return response($this->attachments->read($att), 200, [
            'Content-Type' => $att->mime,
            'Content-Disposition' => 'attachment; filename="'.addcslashes($att->original_name, '"\\').'"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ]);
    }

    public function deleteAttachment(Request $request, int $document, int $attachment)
    {
        $att = $this->find($request, $document)->attachments()->findOrFail($attachment);
        $this->attachments->delete($att);

        return response()->noContent();
    }

    private function find(Request $request, int $id): UserDocument
    {
        return $request->user()->documents()->findOrFail($id);
    }

    private function loaded(UserDocument $doc): UserDocument
    {
        return $doc->refresh()->load(['type.translations', 'attachments', 'reminders']);
    }

    /** Maps the public `type` key to the FK and drops request-only keys. */
    private function fields(array $data): array
    {
        if (isset($data['type'])) {
            $data['document_type_id'] = DocumentType::where('key', $data['type'])->value('id');
            unset($data['type']);
        }

        return $data;
    }
}
