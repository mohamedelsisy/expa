<?php

namespace Tests\Support;

use App\Domains\Content\Concerns\HasContentLifecycle;
use App\Domains\Content\Concerns\HasSource;
use App\Domains\Content\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class TestGuide extends Model
{
    use HasContentLifecycle, HasSource, HasTranslations;

    protected $table = 'test_guides';

    protected $guarded = [];

    protected array $translatable = ['title', 'body'];

    protected bool $requiresSource = true;

    public static function createTables(): void
    {
        Schema::create('test_guides', function (Blueprint $t) {
            $t->id();
            $t->contentLifecycle();
            $t->sourceFields();
            $t->timestamps();
        });
        Schema::create('test_guide_translations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('test_guide_id')->constrained()->cascadeOnDelete();
            $t->string('locale', 2);
            $t->string('title')->nullable();
            $t->text('body')->nullable();
            $t->unique(['test_guide_id', 'locale']);
        });
    }
}

class TestGuideTranslation extends Model
{
    public $timestamps = false;

    protected $table = 'test_guide_translations';

    protected $guarded = [];
}
