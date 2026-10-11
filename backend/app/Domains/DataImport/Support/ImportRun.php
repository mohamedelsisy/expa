<?php

namespace App\Domains\DataImport\Support;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\DataImport\Models\DataImportRun;
use App\Support\Audit\AuditMute;

/**
 * Tracks one import run: what was read and what happened to each record (added / updated / unchanged / rejected), so
 * every dataset in the database can be traced to a fetch of an official source. Importers call it per record; it
 * never throws on a rejected row.
 */
class ImportRun
{
    private array $rejects = [];

    private function __construct(public readonly DataImportRun $row) {}

    /** @param array{dataset:string,source_name:string,source_url:string,license?:?string,license_url?:?string,attribution?:?string,source_edition?:?string,source_published_at?:?string} $meta */
    public static function start(array $meta): self
    {
        AuditMute::on(); // per-row audit entries are replaced by one summary entry in finish()

        return new self(DataImportRun::create($meta + ['status' => 'running', 'environment' => app()->environment(), 'started_at' => now()]));
    }

    public function fetched(FetchedSource $f): void
    {
        $this->row->forceFill(['fetched_at' => $f->fetchedAt, 'checksum_sha256' => $f->sha256])->save();
    }

    public function read(): void
    {
        $this->row->increment('records_read');
    }

    public function added(): void
    {
        $this->row->increment('added');
    }

    public function updated(): void
    {
        $this->row->increment('updated');
    }

    public function unchanged(): void
    {
        $this->row->increment('unchanged');
    }

    public function staleMarked(int $n = 1): void
    {
        $this->row->increment('stale_marked', $n);
    }

    public function reject(string $reason, array|string|null $record = null): void
    {
        $this->row->increment('rejected');
        if (count($this->rejects) < (int) config('dataimport.max_logged_rejects')) {
            $this->rejects[] = ['reason' => $reason, 'record' => is_array($record) ? array_slice($record, 0, 12, true) : $record];
        }
    }

    public function finish(?string $error = null): DataImportRun
    {
        $status = $error ? 'failed' : ($this->row->rejected > 0 ? 'partial' : 'succeeded');
        $this->row->forceFill(['status' => $status, 'error' => $error, 'rejects' => $this->rejects ?: null, 'finished_at' => now()])->save();
        AuditMute::off();
        app(AuditLogger::class)->log('data.import', $this->row, [
            'dataset' => $this->row->dataset, 'status' => $status, 'source' => $this->row->source_url, 'licence' => $this->row->license,
            'read' => $this->row->records_read, 'added' => $this->row->added, 'updated' => $this->row->updated,
            'unchanged' => $this->row->unchanged, 'rejected' => $this->row->rejected,
        ], null);

        return $this->row->refresh();
    }
}
