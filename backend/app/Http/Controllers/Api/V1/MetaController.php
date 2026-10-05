<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Validation\Rules\Password;

/** Public, non-secret product rules so clients never hard-code limits that live in server configuration. */
class MetaController extends Controller
{
    public function __invoke()
    {
        $rule = Password::default();
        $min = (fn () => $this->min ?? null)->call($rule);

        return ApiResponse::data([
            'locales' => collect(config('expa.locales'))->map(fn ($l, $k) => ['code' => $k, 'name' => $l['name'], 'dir' => $l['dir']])->values(),
            'default_locale' => config('expa.default_locale'),
            'password' => ['min_length' => $min, 'requires_letters' => true, 'requires_numbers' => true],
            'uploads' => [
                'max_file_mb' => config('documents.max_file_kb') / 1024,
                'max_files_per_document' => config('documents.max_files_per_document'),
                'max_total_mb_per_user' => config('documents.max_total_mb_per_user'),
                'allowed_mimes' => array_keys(config('documents.allowed_mimes')),
            ],
            'ai' => ['max_message_chars' => config('ai.max_message_chars'), 'daily_limits' => config('ai.daily_limits')],
            'patente' => [
                'exam_questions' => config('patente.exam.questions'), 'exam_max_errors' => config('patente.exam.max_errors'),
                'exam_minutes' => config('patente.exam.minutes'), 'daily_exam_limit' => config('patente.daily_exam_limit'), 'daily_practice_limit' => config('patente.daily_practice_limit'),
            ],
            'reminders' => ['default_offsets_days' => config('documents.default_reminder_offsets')],
            'verification_required_for' => ['ai_ask', 'patente_exams', 'admin'],
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
