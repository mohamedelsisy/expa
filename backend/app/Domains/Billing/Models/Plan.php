<?php

namespace App\Domains\Billing\Models;

use App\Domains\Content\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasTranslations;

    protected $guarded = ['id'];

    protected array $translatable = ['name', 'description'];

    protected function casts(): array
    {
        return ['features' => 'array', 'active' => 'boolean', 'vat_rate' => 'decimal:2', 'price_includes_vat' => 'boolean'];
    }

    public function feature(string $key, mixed $default = null): mixed
    {
        return ($this->features ?? [])[$key] ?? $default;
    }
}
