<?php

namespace App\Domains\Learning\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class ItalianVocabularyTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'italian_vocabulary_id'];

    protected static function booted(): void
    {
        // Changing the text invalidates a teacher's earlier review.
        static::saved(function (self $t) {
            if (($t->wasChanged() || $t->wasRecentlyCreated) && $t->vocabulary?->isReviewed()) {
                $t->vocabulary->clearReview();
            }
        });
    }

    public function vocabulary()
    {
        return $this->belongsTo(ItalianVocabulary::class, 'italian_vocabulary_id');
    }
}
