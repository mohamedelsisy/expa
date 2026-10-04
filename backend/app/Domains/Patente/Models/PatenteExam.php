<?php

namespace App\Domains\Patente\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatenteExam extends Model
{
    protected $guarded = ['id', 'user_id'];

    protected function casts(): array
    {
        return [
            'question_ids' => 'array', 'deadline_at' => 'datetime', 'finished_at' => 'datetime',
            'passed' => 'boolean', 'timed_out' => 'boolean',
        ];
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PatenteExamAnswer::class);
    }
}
