<?php

namespace App\Domains\Marketplace\Services;

use App\Domains\Documents\Contracts\ContentScanner;
use App\Domains\Documents\Services\ClamdScanner;
use App\Domains\Marketplace\Models\ProviderVerificationDocument;
use App\Domains\Marketplace\Models\ServiceProvider;
use App\Exceptions\ApiException;
use finfo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Verification evidence: validated by real MIME, scanned, ALWAYS encrypted at rest, readable only through admin endpoints. */
class EvidenceStore
{
    public function __construct(private ContentScanner $scanner) {}

    public function store(ServiceProvider $p, UploadedFile $file): ProviderVerificationDocument
    {
        if ($p->evidence()->count() >= config('marketplace.evidence.max_files')) {
            throw new ApiException('evidence_limit_reached', __('marketplace.evidence_limit_reached'), 422);
        }
        $path = $file->getRealPath();
        $size = (int) filesize($path);
        if ($size === 0 || $size > config('marketplace.evidence.max_kb') * 1024) {
            throw new ApiException('evidence_invalid_size', __('marketplace.evidence_invalid_size', ['max' => config('marketplace.evidence.max_kb') / 1024]), 422);
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
        $ext = config('marketplace.evidence.allowed_mimes')[$mime] ?? null;
        if (! $ext) {
            throw new ApiException('evidence_type_not_allowed', __('marketplace.evidence_type_not_allowed'), 422);
        }
        $reason = $this->scanner->reject($path, $mime);
        if ($reason === ClamdScanner::UNAVAILABLE) {
            throw new ApiException('scanner_unavailable', __('errors.scanner_unavailable'), 503);
        }
        if ($reason !== null) {
            throw new ApiException('evidence_rejected', __('marketplace.evidence_rejected'), 422);
        }

        $bytes = (string) file_get_contents($path);
        $storagePath = 'provider-evidence/'.$p->id.'/'.Str::uuid().'.'.$ext.'.enc';
        Storage::disk('documents')->put($storagePath, Crypt::encryptString($bytes));

        $doc = new ProviderVerificationDocument([
            'original_name' => preg_replace('/[^\p{L}\p{N}._ -]/u', '_', mb_substr(basename($file->getClientOriginalName()), 0, 120)) ?: 'document.'.$ext,
            'mime' => $mime, 'size' => $size, 'sha256' => hash('sha256', $bytes),
        ]);
        $doc->service_provider_id = $p->id;
        $doc->storage_path = $storagePath;
        $doc->save();

        return $doc;
    }

    public function read(ProviderVerificationDocument $doc): string
    {
        return Crypt::decryptString((string) Storage::disk('documents')->get($doc->storage_path));
    }

    public function delete(ProviderVerificationDocument $doc): void
    {
        Storage::disk('documents')->delete($doc->storage_path);
        $doc->delete();
    }

    public function purge(ServiceProvider $p): void
    {
        foreach ($p->evidence as $doc) {
            $this->delete($doc);
        }
    }
}
