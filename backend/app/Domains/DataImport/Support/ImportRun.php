<?php

namespace App\Domains\DataImport\Support;

use App\Domains\Audit\Services\AuditLogger;
use App\Domains\DataImport\Models\DataImportRun;
use App\Support\Audit\AuditMute;
use Throwable;

/**
 * Tracks one import run: what was read and what happened to each record (added / updated / unchanged / rejected), so
 * every dataset in the database can be traced to a fetch of an official source. Importers call it per record; it
 * never throws on a rejected row.
 */
class ImportRun
{
    private array $rejects = [];

    private bool $finished = false;

    private function __construct(public readonly DataImportRun $row, private readonly bool $persist = true) {}

    /** @param array{dataset:string,source_name:string,source_url:string,license?:?string,license_url?:?string,attribution?:?string,source_edition?:?string,source_published_at?:?string} $meta */
    public static function start(array $meta, bool $persist = true): self
    {
        $attrs = $meta + ['status' => 'running', 'environment' => app()->environment(), 'started_at' => now()];
        if (! $persist) {
            // A dry run leaves no trace: the counters live on an unsaved model so the command can still report them.
            return new self((new DataImportRun)->forceFill($attrs + array_fill_keys(['records_read', 'added', 'updated', 'unchanged', 'rejected', 'stale_marked'], 0)), false);
        }
        AuditMute::on(); // per-row audit entries are replaced by one summary entry in finish()

        return new self(DataImportRun::create($attrs));
    }

    private function bump(string $column, int $by = 1): void
    {
        $this->persist ? $this->row->increment($column, $by) : $this->row->forceFill([$column => $this->row->{$column} + $by]);
    }

    /**
     * Runs the importer body so the run can never be left `running` with audit muted: any exception finishes the run
     * as failed (which un-mutes audit) and is rethrown. The body may call finish() itself; a second finish is a no-op.
     *
     * @template T
     *
     * @param  callable(self):T  $work
     * @return T
     */
    public function guard(callable $work): mixed
    {
        try {
            return $work($this);
        } catch (Throwable $e) {
            $this->finish($e->getMessage());

            throw $e;
        }
    }

    public function fetched(FetchedSource $f): void
    {
        $this->row->forceFill(['fetched_at' => $f->fetchedAt, 'checksum_sha256' => $f->sha256]);
        $this->persist && $this->row->save();
    }

    public function read(): void
    {
        $this->bump('records_read');
    }

    public function added(): void
    {
        $this->bump('added');
    }

    public function updated(): void
    {
        $this->bump('updated');
    }

    public function unchanged(): void
    {
        $this->bump('unchanged');
    }

    public function staleMarked(int $n = 1): void
    {
        $this->bump('stale_marked', $n);
    }

    public function reject(string $reason, array|string|null $record = null): void
    {
        $this->bump('rejected');
        if (count($this->rejects) < (int) config('dataimport.max_logged_rejects')) {
            $this->rejects[] = ['reason' => $reason, 'record' => is_array($record) ? array_slice($record, 0, 12, true) : $record];
        }
    }

    public function finish(?string $error = null): DataImportRun
    {
        if ($this->finished) {
            return $this->row;
        }
        $this->finished = true;
        $status = $error ? 'failed' : ($this->row->rejected > 0 ? 'partial' : 'succeeded');
        $this->row->forceFill(['status' => $status, 'error' => $error, 'rejects' => $this->rejects ?: null, 'finished_at' => now()]);
        if (! $this->persist) {
            return $this->row;
        }
        try {
            $this->row->save();
        } finally {
            AuditMute::off(); // even if the save fails, audit must not stay muted for the rest of the process
        }
        app(AuditLogger::class)->log('data.import', $this->row, [
            'dataset' => $this->row->dataset, 'status' => $status, 'source' => $this->row->source_url, 'licence' => $this->row->license,
            'read' => $this->row->records_read, 'added' => $this->row->added, 'updated' => $this->row->updated,
            'unchanged' => $this->row->unchanged, 'rejected' => $this->row->rejected,
        ], null);

        return $this->row->refresh();
    }
}
