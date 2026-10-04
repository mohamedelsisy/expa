<?php

namespace App\Domains\Learning\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class ItalianLessonTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'italian_lesson_id'];

    protected function casts(): array
    {
        return ['items' => 'array'];
    }
}
