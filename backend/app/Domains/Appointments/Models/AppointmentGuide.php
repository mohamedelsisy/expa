<?php

namespace App\Domains\Appointments\Models;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use App\Domains\Government\Enums\BookingMethod;
use App\Domains\Government\Enums\OfficeType;
use App\Support\Audit\Auditable;
use Database\Factories\AppointmentGuideFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AppointmentGuide extends Model
{
    /** @use HasFactory<AppointmentGuideFactory> */
    use Auditable, HasContentLifecycle, HasFactory, HasSource, HasTranslations, SoftDeletes;

    protected $guarded = ['id', 'status', 'publish_at', 'published_at', 'created_by', 'updated_by'];

    protected array $translatable = ['title', 'summary', 'steps', 'tips', 'cautions'];

    public array $requiredTranslatableFields = ['title', 'summary'];

    protected bool $requiresSource = true;

    protected function casts(): array
    {
        return ['office_type' => OfficeType::class, 'booking_method' => BookingMethod::class];
    }

    public static function contentAttributes(): array
    {
        return ['slug', 'office_type', 'booking_method', 'booking_portal_url', 'sort_order',
            'source_name', 'source_url', 'source_type', 'last_verified_at'];
    }

    public function urlFields(): array
    {
        return ['booking_portal_url'];
    }

    protected static function newFactory(): AppointmentGuideFactory
    {
        return AppointmentGuideFactory::new();
    }
}
