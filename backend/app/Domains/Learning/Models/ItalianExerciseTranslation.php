<?php

namespace App\Domains\Learning\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class ItalianExerciseTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'italian_exercise_id'];

    protected function casts(): array
    {
        return ['options' => 'array'];
    }

    protected static function booted(): void
    {
        static::saved(function (self $t) {
            if (($t->wasChanged() || $t->wasRecentlyCreated) && $t->exercise?->isReviewed()) {
                $t->exercise->clearReview();
            }
        });
    }

    public function exercise()
    {
        return $this->belongsTo(ItalianExercise::class, 'italian_exercise_id');
    }
}
