<?php

namespace App\Domains\Documents\Explainer;

use App\Domains\Documents\Contracts\ContentScanner;
use App\Domains\Documents\Services\ClamdScanner;
use App\Domains\Documents\Services\ScannerAlert;
use App\Exceptions\ApiException;
use finfo;
use Illuminate\Http\UploadedFile;

/** Validates an uploaded file by its CONTENT before anything reads or decodes it. */
class UploadInspector
{
    public function __construct(private ContentScanner $scanner) {}

    /** @return array{0:string,1:string} detected [mime, extension] */
    public function inspect(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        if ($path === false || ! is_file($path)) {
            throw new ApiException('attachment_rejected', __('errors.attachment_rejected'), 422);
        }
        $size = (int) filesize($path);
        if ($size === 0 || $size > config('explainer.max_file_kb') * 1024) {
            throw new ApiException('attachment_invalid_size', __('errors.attachment_invalid_size', ['max' => config('explainer.max_file_kb') / 1024]), 422);
        }

        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
        $ext = config('explainer.allowed_mimes')[$mime] ?? null;
        if (! $ext) {
            throw new ApiException('attachment_type_not_allowed', __('errors.explain_type_not_allowed'), 422);
        }

        if ($mime === 'application/pdf') {
            $this->assertPdfPages($path);
        } else {
            $this->assertImageSize($path);
        }

        $reason = $this->scanner->reject($path, $mime);
        if ($reason === ClamdScanner::UNAVAILABLE) {
            app(ScannerAlert::class)->unavailable();
            throw new ApiException('scanner_unavailable', __('errors.scanner_unavailable'), 503);
        }
        if ($reason !== null) {
            throw new ApiException('attachment_rejected', __('errors.attachment_rejected'), 422);
        }

        return [$mime, $ext];
    }

    /** Dimensions come from the header: the pixel buffer is never allocated for an oversized image. */
    private function assertImageSize(string $path): void
    {
        $info = @getimagesize($path);
        if ($info === false) {
            throw new ApiException('attachment_rejected', __('errors.attachment_rejected'), 422);
        }
        [$w, $h] = $info;
        if ($w < 1 || $h < 1 || $w > config('explainer.max_dimension') || $h > config('explainer.max_dimension') || $w * $h > config('explainer.max_pixels')) {
            throw new ApiException('image_too_large', __('errors.explain_image_too_large'), 422);
        }
    }

    /** Counts page objects without parsing the file. A heuristic, deliberately conservative (it can over-count). */
    private function assertPdfPages(string $path): void
    {
        // The file is already capped at max_file_kb, so reading it whole is bounded.
        $pages = preg_match_all('~/Type\s*/Page(?![A-Za-z])~', (string) file_get_contents($path));
        if ($pages > config('explainer.max_pdf_pages')) {
            throw new ApiException('pdf_too_many_pages', __('errors.explain_pdf_too_many_pages', ['max' => config('explainer.max_pdf_pages')]), 422);
        }
    }
}
