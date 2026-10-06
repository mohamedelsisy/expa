<?php

namespace App\Domains\Learning\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItalianVocabProgress extends Model
{
    protected $table = 'italian_vocab_progress';

    protected $guarded = ['id', 'user_id', 'italian_vocabulary_id'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime', 'last_reviewed_at' => 'datetime', 'box' => 'integer'];
    }

    public function vocabulary(): BelongsTo
    {
        return $this->belongsTo(ItalianVocabulary::class, 'italian_vocabulary_id');
    }
}
