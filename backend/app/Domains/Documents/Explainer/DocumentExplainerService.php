<?php

namespace App\Domains\Documents\Explainer;

use App\Domains\Ai\Contracts\LlmClient;
use App\Domains\Ai\Services\AiAssistant;
use App\Domains\Ai\Services\KeywordRetriever;
use App\Domains\Ai\Services\PromptBuilder;
use App\Domains\Ai\Services\ResponseProcessor;
use App\Domains\Ai\Services\SourceVerifier;
use App\Domains\Analytics\Analytics;
use App\Domains\Analytics\AnalyticsEvent;
use App\Domains\Documents\Contracts\OcrEngine;
use App\Domains\Housing\Services\HousingExtractor;
use App\Exceptions\ApiException;
use Illuminate\Http\UploadedFile;
use Throwable;

/**
 * Document (photo / PDF / pasted text) → text → classification → key dates → sources → AI explanation → actions.
 * Stateless by design: the upload lives in a private temp directory for this request only (deleted in `finally`),
 * nothing about the document is persisted, and nothing about its content is logged.
 */
class DocumentExplainerService
{
    /** Types for which "how do I book an appointment" is a sensible next step. */
    private const APPOINTMENT_TYPES = ['comune', 'questura', 'inps', 'agenzia_entrate', 'sanitaria'];

    /** Official Italian term used to point at EXPA's own search (no URL is invented). */
    private const SEARCH_TERM = [
        'comune' => 'Comune', 'questura' => 'Permesso di soggiorno', 'inps' => 'INPS', 'agenzia_entrate' => 'Agenzia delle Entrate',
        'bolletta' => 'bolletta', 'busta_paga' => 'busta paga', 'multa' => 'multa', 'contratto' => 'contratto', 'sanitaria' => 'Tessera sanitaria', 'scuola' => 'scuola',
    ];

    public function __construct(
        private UploadInspector $inspector,
        private OcrEngine $ocr,
        private DocumentClassifier $classifier,
        private KeyDateExtractor $dates,
        private TextRedactor $redactor,
        private KeywordRetriever $retriever,
        private SourceVerifier $verifier,
        private PromptBuilder $prompts,
        private LlmClient $llm,
        private ResponseProcessor $processor,
        private AiAssistant $assistant,
    ) {}

    /** Validates and OCRs an upload. @throws ApiException `ocr_unavailable` | `ocr_failed` | `ocr_empty` and the inspection errors */
    public function textFromFile(UploadedFile $file): string
    {
        [$mime, $ext] = $this->inspector->inspect($file);

        $ws = new TempWorkspace;
        try {
            $copy = $ws->adopt($file->getRealPath(), $ext);
            $result = $this->ocr->extract($copy, $mime);
        } finally {
            $ws->cleanup();
        }

        if (! $result->isOk()) {
            $status = $result->status;
            throw new ApiException($status, __("errors.$status"), 422, ['fallback' => ['text']]);
        }

        return $result->text;
    }

    public function explain(string $text, string $locale): array
    {
        $text = $this->clean($text);
        $classification = $this->classifier->classify($text);
        $dates = $this->dates->extract($text);

        // Verified sources for this kind of document, from EXPA's own knowledge base (never from the model).
        $term = self::SEARCH_TERM[$classification['type']] ?? null;
        $sources = $term ? $this->verifier->verify($this->retriever->retrieve($term, $locale)) : [];

        $summary = $this->summarise($text, $classification, $dates, $sources, $locale, $degraded);

        app(Analytics::class)->system(AnalyticsEvent::DocumentExplained);

        $label = $this->assistant->label($sources);

        return [
            'classification' => ['type' => $classification['type'], 'type_label' => __("documents_explain.types.{$classification['type']}"), 'confidence' => $classification['confidence']],
            'summary' => $summary,
            'label' => $label,
            'label_text' => __("ai.labels.$label"),
            'key_dates' => array_map(fn ($d) => [
                'label' => __("documents_explain.date_labels.{$d['label_key']}"),
                'label_key' => $d['label_key'],
                'date' => $d['date'],
                'text' => $d['raw'],
                'year_missing' => $d['date'] === null,
                'past' => $d['date'] !== null && $d['date'] < now()->toDateString(),
            ], $dates),
            'suggested_actions' => $this->actions($classification['type'], $dates, $term),
            'language' => (new HousingExtractor)->language($text),
            'disclaimer' => __('documents_explain.disclaimer'),
            'sources' => array_map(fn ($s) => ['title' => $s['title'], 'url' => $s['source']['url'], 'name' => $s['source']['name'], 'type' => $s['source']['type'], 'last_verified_at' => $s['source']['last_verified_at'], 'ref' => $s['ref']], $sources),
            'degraded' => $degraded,
            'persisted' => false,
        ];
    }

    private function summarise(string $text, array $c, array $dates, array $sources, string $locale, ?bool &$degraded): string
    {
        $degraded = false;
        $detected = ['type' => $c['type'], 'dates' => array_values(array_filter(array_map(fn ($d) => $d['date'] ?? $d['raw'], $dates)))];
        $system = $this->prompts->system($locale, (bool) $sources)."\n".implode("\n", [
            'The <user_message> is the text of a document the user received (letter, bill, payslip, notice). Explain in simple words what it appears to be, what it asks for and what the user may need to do next.',
            'Only mention dates that appear in <detected>. Never invent amounts, deadlines, offices or consequences. If something is unclear in the text, say so. Personal identifiers were removed ([redacted]).',
            'This is not legal, tax or medical advice. Keep it under 150 words.',
        ]);
        $turn = $this->prompts->userTurn($this->stripForgedTags($this->redactor->redact($text)), $sources, [])
            ."\n<detected>".json_encode($detected, JSON_UNESCAPED_UNICODE).'</detected>';

        try {
            $r = $this->llm->complete($system, [['role' => 'user', 'content' => $turn]]);
        } catch (Throwable $e) {
            report($e);
            $degraded = true;

            return __('documents_explain.summary_unavailable');
        }

        $out = $this->processor->process($r->text, array_column(array_column($sources, 'source'), 'url'), count($sources), implode("\n", array_merge(...array_column($sources, 'excerpts') ?: [[]])));
        if ($out['text'] === '') {
            $degraded = true;

            return __('documents_explain.summary_unavailable');
        }

        return $out['text'];
    }

    private function actions(string $type, array $dates, ?string $term): array
    {
        $actions = [];
        $future = array_values(array_filter($dates, fn ($d) => $d['date'] !== null && $d['date'] >= now()->toDateString()));
        if ($future) {
            $d = $future[0];
            // `target` is an API route of EXPA (the reminders live on a tracked document): nothing is created here.
            $actions[] = ['type' => 'reminder', 'label' => __('documents_explain.actions.reminder', ['date' => $d['date']]), 'target' => 'my-documents', 'date' => $d['date']];
        }
        if ($term) {
            $actions[] = ['type' => 'guide', 'label' => __('documents_explain.actions.guide', ['term' => $term]), 'target' => 'search?q='.rawurlencode($term)];
        }
        if (in_array($type, self::APPOINTMENT_TYPES, true)) {
            $actions[] = ['type' => 'appointment', 'label' => __('documents_explain.actions.appointment'), 'target' => 'appointments/hub'];
        }

        return $actions;
    }

    /** Pasted/OCR text: control characters out, bounded length. */
    private function clean(string $text): string
    {
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text) ?? $text;

        return trim(mb_substr($text, 0, (int) config('explainer.max_text_chars')));
    }

    private function stripForgedTags(string $text): string
    {
        return preg_replace('/<\/?\s*(source|profile|user_message|detected)\b[^>]*>/i', '', $text) ?? $text;
    }
}
