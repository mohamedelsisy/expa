<?php

namespace App\Domains\Ai\Services;

use App\Support\Text\TextNormalizer;

class IntentDetector
{
    /** Intents whose answers are factual claims about procedures/law/health/money and therefore need verified sources. */
    public const SENSITIVE = ['immigration', 'documents', 'health', 'money', 'business', 'housing', 'appointments', 'patente', 'study'];

    private const EMERGENCY_PHRASES = ['chest pain', 'heart attack', 'dolore al petto', 'infarto', 'non respira', 'cant breathe', 'الم في الصدر', 'سكته قلبيه', 'لا يتنفس'];

    private const KEYWORDS = [
        'emergency' => ['emergenza', 'ambulanza', '112', '118', '113', '115', 'soccorso', 'emergency', 'ambulance', 'اسعاف', 'طوارئ', 'نجده', 'حريق', 'نزيف'],
        'immigration' => ['permesso', 'soggiorno', 'questura', 'visto', 'visa', 'permit', 'ricongiungimento', 'cittadinanza', 'citizenship', 'residence permit', 'اقامه', 'تصريح', 'تاشيره', 'فيزا', 'جنسيه', 'لم شمل', 'تجديد'],
        'documents' => ['fiscale', 'spid', 'cie', 'tessera', 'anagrafe', 'residenza', 'identita', 'documento', 'document', 'documents', 'codice', 'ضريبي', 'هويه', 'وثيقه', 'وثايق', 'بطاقه', 'اوراق'],
        'appointments' => ['appuntamento', 'prenotare', 'prenotazione', 'appointment', 'booking', 'book', 'موعد', 'حجز', 'احجز'],
        'health' => ['medico', 'ospedale', 'ssn', 'farmacia', 'doctor', 'hospital', 'pharmacy', 'health', 'طبيب', 'دكتور', 'مستشفي', 'صحه', 'صيدليه', 'دواء'],
        'money' => ['tasse', 'irpef', 'banca', 'iban', 'stipendio', 'bank', 'tax', 'taxes', 'salary', 'payslip', 'ضريبه', 'ضرايب', 'بنك', 'راتب', 'حساب بنكي'],
        'business' => ['partita iva', 'forfettario', 'ateco', 'freelance', 'commercialista', 'عمل حر', 'فاتوره', 'شركه'],
        'housing' => ['affitto', 'locazione', 'casa', 'rent', 'apartment', 'lease', 'landlord', 'ايجار', 'شقه', 'سكن', 'مالك'],
        'jobs' => ['lavoro', 'job', 'jobs', 'cv', 'assunzione', 'work', 'عمل', 'وظيفه', 'وظايف', 'شغل'],
        'study' => ['universita', 'university', 'scholarship', 'borsa', 'study', 'studiare', 'جامعه', 'دراسه', 'منحه'],
        'learning' => ['italiano', 'grammar', 'grammatica', 'lezione', 'learn', 'vocabulary', 'تعلم', 'قواعد', 'مفردات', 'لغه'],
        'patente' => ['patente', 'driving', 'licence', 'license', 'guida', 'رخصه', 'قياده', 'باتنتي'],
    ];

    public function __construct(private TextNormalizer $normalizer) {}

    public function detect(string $message): string
    {
        $norm = $this->normalizer->normalize($message);

        foreach (self::EMERGENCY_PHRASES as $phrase) {
            if (str_contains($norm, $this->normalizer->normalize($phrase))) {
                return 'emergency';
            }
        }

        $tokens = $this->normalizer->tokens($message);
        $best = ['general', 0];
        foreach (self::KEYWORDS as $intent => $words) {
            $hits = 0;
            foreach ($words as $w) {
                $w = $this->normalizer->normalize($w);
                $hits += str_contains($w, ' ')
                    ? (int) str_contains($norm, $w)
                    : (int) collect($tokens)->contains(fn ($t) => $t === $w || ($intent !== 'emergency' && $this->normalizer->matches($t, $w)));
            }
            // 'emergency' wins outright on any hit; otherwise the highest count, first-listed wins ties
            if ($intent === 'emergency' && $hits > 0) {
                return 'emergency';
            }
            if ($hits > $best[1]) {
                $best = [$intent, $hits];
            }
        }

        return $best[0];
    }

    public function isSensitive(string $intent): bool
    {
        return in_array($intent, self::SENSITIVE, true);
    }
}
