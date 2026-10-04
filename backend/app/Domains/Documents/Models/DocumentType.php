<?php

namespace App\Domains\Documents\Models;

use App\Domains\Content\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    use HasTranslations;

    protected $guarded = [];

    protected array $translatable = ['name'];
}
