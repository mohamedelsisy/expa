<?php

/*
| POST /api/v1/documents/explain. Nothing the user sends is stored: files live in a private temp directory for the
| duration of the request and are deleted in a finally block; the text only goes to the (optional) LLM after redaction.
*/
return [
    'max_file_kb' => (int) env('EXPLAIN_MAX_FILE_KB', 8 * 1024),
    // Allowed by DETECTED content type (finfo), never by extension or client MIME.
    'allowed_mimes' => ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png'],
    // Decompression-bomb guards: a small file can decode to gigabytes of pixels. Checked from the header BEFORE decoding.
    'max_pixels' => (int) env('EXPLAIN_MAX_PIXELS', 25_000_000),
    'max_dimension' => (int) env('EXPLAIN_MAX_DIMENSION', 10_000),
    'max_pdf_pages' => (int) env('EXPLAIN_MAX_PDF_PAGES', 5),

    'max_text_chars' => (int) env('EXPLAIN_MAX_TEXT_CHARS', 15000),
    'min_text_chars' => 15,

    'ocr' => [
        // null = OCR disabled (clients fall back to pasting text); tesseract = shell out to the binary (no shell, timeouts).
        'driver' => env('OCR_DRIVER', 'null'),
        'tesseract_binary' => env('OCR_TESSERACT_BINARY'),   // absolute path, or null to search PATH
        'pdftotext_binary' => env('OCR_PDFTOTEXT_BINARY'),
        'pdftoppm_binary' => env('OCR_PDFTOPPM_BINARY'),
        'languages' => env('OCR_LANGUAGES', 'ita+eng+ara'), // must match installed traineddata
        'timeout_seconds' => (int) env('OCR_TIMEOUT_SECONDS', 25),
        'pdf_dpi' => 200,
        'temp_dir' => env('OCR_TEMP_DIR'),                   // default storage/app/private/ocr-tmp
    ],
];
