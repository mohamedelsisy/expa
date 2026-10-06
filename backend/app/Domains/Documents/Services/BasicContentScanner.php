<?php

namespace App\Domains\Documents\Services;

use App\Domains\Documents\Contracts\ContentScanner;

/**
 * Built-in heuristics, NOT an antivirus. They reject structurally suspicious files:
 *  - declared type must match real structure (PDF magic, decodable image)
 *  - PDFs with active content (JavaScript, Launch, embedded files, auto-actions)
 *  - images carrying a PHP/script payload tail (polyglots)
 */
class BasicContentScanner implements ContentScanner
{
    private const PDF_ACTIVE = ['/JavaScript', '/JS', '/Launch', '/OpenAction', '/AA', '/EmbeddedFile', '/RichMedia', '/XFA'];

    public function reject(string $absolutePath, string $detectedMime): ?string
    {
        $head = (string) file_get_contents($absolutePath, false, null, 0, 8);

        if ($detectedMime === 'application/pdf') {
            if (! str_starts_with($head, '%PDF-')) {
                return 'invalid_pdf';
            }
            // PDF names allow hex escapes (/Java#53cript = /JavaScript): decode them before matching (BE-4).
            $raw = (string) preg_replace_callback('/#([0-9A-Fa-f]{2})/', fn ($m) => chr((int) hexdec($m[1])), (string) file_get_contents($absolutePath));
            foreach (self::PDF_ACTIVE as $token) {
                if (preg_match('/'.preg_quote($token, '/').'(?![A-Za-z])/', $raw)) {
                    return 'pdf_active_content';
                }
            }

            return null;
        }

        // Images must be decodable and must not smuggle executable script.
        if (@getimagesize($absolutePath) === false) {
            return 'invalid_image';
        }
        $raw = (string) file_get_contents($absolutePath);
        if (preg_match('/<\?php|<script\b/i', $raw)) {
            return 'image_script_payload';
        }

        return null;
    }
}
