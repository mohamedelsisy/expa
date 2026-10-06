<?php

namespace App\Domains\Documents\Services;

use App\Domains\Documents\Contracts\ContentScanner;
use App\Domains\Documents\Models\DocumentAttachment;
use App\Domains\Documents\Models\UserDocument;
use App\Exceptions\ApiException;
use App\Models\User;
use finfo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentStore
{
    public function __construct(private ContentScanner $scanner) {}

    public function store(UserDocument $document, UploadedFile $file): DocumentAttachment
    {
        $user = $document->user_id;

        if ($document->attachments()->count() >= config('documents.max_files_per_document')) {
            throw new ApiException('attachment_limit_reached', __('errors.attachment_limit_reached'), 422);
        }

        $path = $file->getRealPath();
        $size = (int) filesize($path);
        if ($size === 0 || $size > config('documents.max_file_kb') * 1024) {
            throw new ApiException('attachment_invalid_size', __('errors.attachment_invalid_size', ['max' => config('documents.max_file_kb') / 1024]), 422);
        }

        // Trust content, not the client: detect the real MIME type from the bytes.
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
        $ext = config('documents.allowed_mimes')[$mime] ?? null;
        if (! $ext) {
            throw new ApiException('attachment_type_not_allowed', __('errors.attachment_type_not_allowed'), 422);
        }

        $reason = $this->scanner->reject($path, $mime);
        if ($reason === ClamdScanner::UNAVAILABLE) {
            // Fail closed: an unscanned file is never stored. Admins are alerted (rate limited); the user gets a retry message.
            app(ScannerAlert::class)->unavailable();
            throw new ApiException('scanner_unavailable', __('errors.scanner_unavailable'), 503);
        }
        if ($reason !== null) {
            throw new ApiException('attachment_rejected', __('errors.attachment_rejected'), 422);
        }

        $bytes = (string) file_get_contents($path);
        $encrypt = (bool) config('documents.encrypt_at_rest');
        $storagePath = $user.'/'.Str::uuid().'.'.$ext.($encrypt ? '.enc' : '');
        $name = $this->safeName($file->getClientOriginalName(), $ext);

        try {
            return DB::transaction(function () use ($document, $user, $size, $storagePath, $bytes, $encrypt, $mime, $name) {
                // Serialise this user's uploads: the file-count and quota checks below must see every concurrent
                // insert, otherwise parallel requests could each pass them and exceed the limits.
                User::whereKey($user)->lockForUpdate()->first();

                if ($document->attachments()->count() >= config('documents.max_files_per_document')) {
                    throw new ApiException('attachment_limit_reached', __('errors.attachment_limit_reached'), 422);
                }
                $used = (int) DocumentAttachment::where('user_id', $user)->sum('size');
                if ($used + $size > config('documents.max_total_mb_per_user') * 1024 * 1024) {
                    throw new ApiException('storage_quota_exceeded', __('errors.storage_quota_exceeded'), 422);
                }

                Storage::disk('documents')->put($storagePath, $encrypt ? Crypt::encryptString($bytes) : $bytes);

                $attachment = new DocumentAttachment([
                    'storage_path' => $storagePath,
                    // Client-supplied name is display-only: strip any path and control characters, bound the length.
                    'original_name' => $name,
                    'mime' => $mime,
                    'size' => $size,
                    'sha256' => hash('sha256', $bytes),
                    'encrypted' => $encrypt,
                ]);
                // Ownership keys are guarded against mass assignment, so set them explicitly.
                $attachment->user_id = $user;
                $attachment->user_document_id = $document->id;
                $attachment->save();

                return $attachment;
            });
        } catch (\Throwable $e) {
            Storage::disk('documents')->delete($storagePath); // never leave an orphaned (encrypted) file behind
            throw $e;
        }
    }

    public function read(DocumentAttachment $attachment): string
    {
        $raw = Storage::disk('documents')->get($attachment->storage_path);

        return $attachment->encrypted ? Crypt::decryptString($raw) : $raw;
    }

    public function delete(DocumentAttachment $attachment): void
    {
        Storage::disk('documents')->delete($attachment->storage_path);
        $attachment->delete();
    }

    private function safeName(string $name, string $ext): string
    {
        $base = pathinfo(str_replace(['\\', '/'], '/', $name), PATHINFO_FILENAME);
        $base = preg_replace('/[\x00-\x1F\x7F<>:"|?*]+/u', '', $base) ?? '';
        $base = trim(mb_substr($base, 0, 100));

        return ($base !== '' ? $base : 'document').'.'.$ext;
    }
}
