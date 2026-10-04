<?php

namespace App\Domains\Documents\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentAttachment extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = ['id', 'user_id', 'user_document_id'];

    protected function casts(): array
    {
        return ['original_name' => 'encrypted', 'encrypted' => 'boolean', 'size' => 'integer'];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(UserDocument::class, 'user_document_id');
    }
}
