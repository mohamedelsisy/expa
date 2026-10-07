<?php

namespace App\Providers;

use App\Domains\Documents\Contracts\OcrEngine;
use App\Domains\Documents\Explainer\NullOcrEngine;
use App\Domains\Documents\Explainer\TesseractOcrEngine;
use App\Domains\Housing\Models\HousingRule;
use App\Domains\Housing\Policies\HousingRulePolicy;
use App\Domains\Learning\Models\ItalianExercise;
use App\Domains\Learning\Models\ItalianVocabulary;
use App\Domains\Learning\Policies\ItalianExercisePolicy;
use App\Domains\Learning\Policies\ItalianVocabularyPolicy;
use App\Domains\Legal\Models\LegalDocument;
use App\Domains\Legal\Policies\LegalDocumentPolicy;
use App\Domains\Money\Models\TaxTable;
use App\Domains\Money\Policies\TaxTablePolicy;
use App\Domains\Privacy\Providers\FeatureUsageData;
use App\Domains\Privacy\Providers\HousingData;
use App\Domains\Privacy\Providers\ItalianPracticeData;
use App\Domains\Travel\Models\TravelRequirement;
use App\Domains\Travel\Policies\TravelRequirementPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

/**
 * Wiring for the legal / housing / document-explainer / Italian-learning / patente-rights foundations, kept apart from
 * AppServiceProvider so those modules do not collide with other work in that file.
 */
class PlatformFoundationsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // OCR for the document explainer. `null` (default) tells the client to fall back to pasted text.
        $this->app->bind(OcrEngine::class, fn () => match (config('explainer.ocr.driver')) {
            'null' => new NullOcrEngine,
            'tesseract' => TesseractOcrEngine::isAvailable((array) config('explainer.ocr'))
                ? new TesseractOcrEngine((array) config('explainer.ocr')) : new NullOcrEngine,
            default => throw new \RuntimeException('Unknown explainer.ocr.driver ['.config('explainer.ocr.driver').'].'),
        });

        // Personal-data providers of these modules (export + erasure): appended to the shared tag.
        $this->app->tag([
            FeatureUsageData::class,
            HousingData::class,
            ItalianPracticeData::class,
        ], 'privacy.providers');
    }

    public function boot(): void
    {
        Gate::policy(LegalDocument::class, LegalDocumentPolicy::class);
        Gate::policy(HousingRule::class, HousingRulePolicy::class);
        Gate::policy(TravelRequirement::class, TravelRequirementPolicy::class);
        Gate::policy(TaxTable::class, TaxTablePolicy::class);
        Gate::policy(ItalianVocabulary::class, ItalianVocabularyPolicy::class);
        Gate::policy(ItalianExercise::class, ItalianExercisePolicy::class);

        RateLimiter::for('housing-check', fn (Request $r) => Limit::perMinute(10)->by('housing:'.$r->user()?->id));
        RateLimiter::for('document-explain', fn (Request $r) => [
            Limit::perMinute(6)->by('docx:'.$r->user()?->id),
            Limit::perHour(60)->by('docx-h:'.$r->user()?->id),
        ]);
        RateLimiter::for('italian-practice', fn (Request $r) => Limit::perMinute(120)->by('itprac:'.$r->user()?->id));
    }
}
