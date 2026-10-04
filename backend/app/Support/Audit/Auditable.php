<?php

namespace App\Support\Audit;

use App\Domains\Audit\Services\AuditLogger;

/**
 * Add to content/admin models to record created / updated / deleted with before→after values.
 * Exclude noisy or sensitive columns via `protected array $auditExcept = [...]`.
 * Hidden attributes are always excluded.
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(fn ($m) => $m->writeAudit('created', array_map(fn ($v) => ['new' => $v], $m->auditableAttributes($m->getAttributes()))));

        static::updated(function ($m) {
            $changes = [];
            foreach ($m->auditableAttributes($m->getChanges()) as $key => $new) {
                $changes[$key] = ['old' => $m->getOriginal($key), 'new' => $new];
            }
            if ($changes) {
                $m->writeAudit('updated', $changes);
            }
        });

        static::deleted(fn ($m) => $m->writeAudit('deleted', []));
    }

    private function auditableAttributes(array $attributes): array
    {
        $skip = array_merge(['updated_at', 'created_at', 'deleted_at'], $this->getHidden(), $this->auditExcept ?? []);

        return array_diff_key($attributes, array_flip($skip));
    }

    private function writeAudit(string $event, array $changes): void
    {
        app(AuditLogger::class)->log(strtolower(class_basename($this)).'.'.$event, $this, $changes);
    }
}
