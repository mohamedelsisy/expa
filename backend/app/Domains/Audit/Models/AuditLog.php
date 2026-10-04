<?php

namespace App\Domains\Audit\Models;

use Illuminate\Database\Eloquent\Model;
use LogicException;

/** Append-only. Pruning is done with a bulk query delete (see expa:prune-audit-logs), never per-model. */
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['changes' => 'array'];
    }

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Audit logs are immutable.'));
        static::deleting(fn () => throw new LogicException('Audit logs are immutable.'));
    }
}
