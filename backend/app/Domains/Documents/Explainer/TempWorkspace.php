<?php

namespace App\Domains\Documents\Explainer;

/**
 * A private, per-request scratch directory (mode 0700, random name). Every file inside is created by us with a random
 * name and a fixed extension: client-supplied names never touch the filesystem (no path traversal by construction).
 */
class TempWorkspace
{
    private ?string $dir = null;

    public function dir(): string
    {
        if ($this->dir === null) {
            $base = config('explainer.ocr.temp_dir') ?: storage_path('app/private/ocr-tmp');
            if (! is_dir($base) && ! @mkdir($base, 0700, true) && ! is_dir($base)) {
                throw new \RuntimeException('Cannot create the OCR temp directory.');
            }
            $dir = $base.'/'.bin2hex(random_bytes(16));
            if (! mkdir($dir, 0700)) {
                throw new \RuntimeException('Cannot create the OCR workspace.');
            }
            $this->dir = $dir;
        }

        return $this->dir;
    }

    /** Copy a file into the workspace under a random name; returns the new path. */
    public function adopt(string $source, string $extension): string
    {
        $extension = preg_replace('/[^a-z0-9]/', '', strtolower($extension)) ?? 'bin';
        $target = $this->dir().'/'.bin2hex(random_bytes(8)).'.'.$extension;
        if (! copy($source, $target)) {
            throw new \RuntimeException('Cannot copy the file into the workspace.');
        }
        chmod($target, 0600);

        return $target;
    }

    public function cleanup(): void
    {
        if ($this->dir === null) {
            return;
        }
        foreach (glob($this->dir.'/*') ?: [] as $f) {
            @unlink($f);
        }
        @rmdir($this->dir);
        $this->dir = null;
    }

    public function path(): ?string
    {
        return $this->dir;
    }

    public function __destruct()
    {
        $this->cleanup();
    }
}
