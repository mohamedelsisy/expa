<?php

namespace Tests\Feature\DocumentExplainer;

use App\Domains\Documents\Contracts\OcrEngine;
use App\Domains\Documents\Explainer\NullOcrEngine;
use Tests\TestCase;

/**
 * Regression: `.env.example` ships OCR_DRIVER=null and Laravel's env() turns the string "null" into PHP null,
 * which once made the OcrEngine binding throw on any clean checkout (CI copies .env.example, dev machines don't).
 */
class EnvExampleOcrDriverTest extends TestCase
{
    public function test_null_driver_value_as_parsed_from_env_resolves_to_the_null_engine(): void
    {
        foreach ([null, 'null'] as $value) {
            config(['explainer.ocr.driver' => $value]);
            $this->app->forgetInstance(OcrEngine::class);
            $this->assertInstanceOf(NullOcrEngine::class, $this->app->make(OcrEngine::class));
        }
    }
}
