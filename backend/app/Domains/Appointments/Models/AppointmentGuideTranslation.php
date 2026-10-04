<?php

namespace App\Domains\Appointments\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class AppointmentGuideTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'appointment_guide_id'];

    protected function casts(): array
    {
        return ['steps' => 'array'];
    }
}
