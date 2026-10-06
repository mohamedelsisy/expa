<?php

namespace App\Domains\Documents\Explainer;

use App\Domains\Documents\Contracts\OcrEngine;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * Shells out to `tesseract` (images) and, for PDFs, `pdftotext` then `pdftoppm` + tesseract (scanned pages).
 * Safety: argument arrays only (no shell, nothing interpolated), absolute binaries, fixed language list from config,
 * a hard timeout per process, a page cap, and input paths that we generated ourselves. Content is never logged.
 */
class TesseractOcrEngine implements OcrEngine
{
    public function __construct(private array $config, private ?TempWorkspace $workspace = null) {}

    public static function isAvailable(array $config): bool
    {
        return self::binary($config['tesseract_binary'] ?? null, 'tesseract') !== null;
    }

    private static function binary(?string $configured, string $name): ?string
    {
        if ($configured) {
            return is_file($configured) && is_executable($configured) ? $configured : null;
        }

        return (new ExecutableFinder)->find($name);
    }

    public function extract(string $absolutePath, string $mime): OcrResult
    {
        $tesseract = self::binary($this->config['tesseract_binary'] ?? null, 'tesseract');
        if ($tesseract === null) {
            return new OcrResult(OcrResult::UNAVAILABLE);
        }
        try {
            $text = $mime === 'application/pdf' ? $this->pdf($absolutePath, $tesseract) : $this->image($absolutePath, $tesseract);
        } catch (Throwable $e) {
            // Message only (never the output): process errors can echo recognised text.
            report(new \RuntimeException('OCR failed: '.class_basename($e)));

            return new OcrResult(OcrResult::FAILED);
        }
        if ($text === null) {
            return new OcrResult(OcrResult::UNAVAILABLE);
        }
        $text = trim($text);

        return $text === '' ? new OcrResult(OcrResult::EMPTY) : OcrResult::ok($text);
    }

    private function image(string $path, string $tesseract): string
    {
        return $this->run([$tesseract, $path, 'stdout', '-l', $this->languages(), '--psm', '3']);
    }

    /** @return string|null null when a scanned PDF needs a converter that is not installed */
    private function pdf(string $path, string $tesseract): ?string
    {
        $pages = (int) config('explainer.max_pdf_pages');
        $pdftotext = self::binary($this->config['pdftotext_binary'] ?? null, 'pdftotext');
        if ($pdftotext) {
            $text = trim($this->run([$pdftotext, '-layout', '-l', (string) $pages, $path, '-']));
            if (mb_strlen($text) >= 30) {
                return $text; // a digital PDF: no OCR needed
            }
        }
        $pdftoppm = self::binary($this->config['pdftoppm_binary'] ?? null, 'pdftoppm');
        if (! $pdftoppm) {
            return $pdftotext ? '' : null;
        }

        $ws = $this->workspace ?? new TempWorkspace;
        $prefix = $ws->dir().'/p'.bin2hex(random_bytes(4));
        $this->run([$pdftoppm, '-r', (string) ($this->config['pdf_dpi'] ?? 200), '-l', (string) $pages, '-png', $path, $prefix]);
        $out = [];
        $files = glob($prefix.'-*.png') ?: [];
        sort($files);
        foreach (array_slice($files, 0, $pages) as $png) {
            $out[] = $this->image($png, $tesseract);
        }

        return implode("\n", $out);
    }

    private function languages(): string
    {
        $l = (string) ($this->config['languages'] ?? 'ita+eng');

        return preg_match('/^[a-z_]{3,10}(\+[a-z_]{3,10}){0,4}$/', $l) ? $l : 'ita+eng';
    }

    /** @param  list<string>  $command */
    private function run(array $command): string
    {
        $p = new Process($command, null, ['OMP_THREAD_LIMIT' => '1', 'LC_ALL' => 'C.UTF-8']);
        $p->setTimeout((float) ($this->config['timeout_seconds'] ?? 25));
        $p->mustRun();

        return $p->getOutput();
    }
}
