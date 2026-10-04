<?php

namespace App\Domains\Government\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class GovernmentServiceTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'government_service_id'];

    protected function casts(): array
    {
        return ['required_documents' => 'array'];
    }
}
