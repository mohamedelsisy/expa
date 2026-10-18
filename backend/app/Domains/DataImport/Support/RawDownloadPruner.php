<?php

namespace App\Domains\DataImport\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Raw dataset downloads are kept (checksummed) so a run can be reproduced, but they are not needed forever: each
 * dataset directory keeps its newest `keep` files regardless of age and drops the rest once older than `$days`.
 * Orphaned `.part-*` temp files from interrupted downloads go after a day.
 */
class RawDownloadPruner
{
    public function prune(int $days, int $keep = 1): int
    {
        $disk = Storage::disk('local');
        $root = trim((string) config('dataimport.storage_dir'), '/');
        $removed = 0;

        foreach ($disk->directories($root) as $dir) {
            $files = collect($disk->files($dir))
                ->map(fn ($f) => ['path' => $f, 'at' => $disk->lastModified($f), 'part' => str_starts_with(basename($f), '.part-')])
                ->sortByDesc('at')->values();

            $partCutoff = now()->subDay()->getTimestamp();
            $cutoff = now()->subDays($days)->getTimestamp();
            $real = $files->reject(fn ($f) => $f['part'])->values();

            $stale = $files->filter(fn ($f) => $f['part'] && $f['at'] < $partCutoff)
                ->merge($real->slice($keep)->filter(fn ($f) => $f['at'] < $cutoff));
            foreach ($stale as $f) {
                $disk->delete($f['path']) && $removed++;
            }
        }

        return $removed;
    }
}
