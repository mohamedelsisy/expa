<?php

namespace App\Domains\Patente\Models;

use Illuminate\Database\Eloquent\Model;

class PatenteExamAnswer extends Model
{
    public $timestamps = false;

    protected $guarded = ['id', 'user_id', 'patente_exam_id'];

    protected function casts(): array
    {
        return ['answer' => 'boolean', 'correct' => 'boolean'];
    }
}
