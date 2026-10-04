<?php

namespace App\Domains\Guides\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class GuideTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'guide_id'];

    protected function casts(): array
    {
        return ['required_documents' => 'array', 'steps' => 'array'];
    }
}
