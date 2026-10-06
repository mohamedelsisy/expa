<?php

namespace App\Domains\Documents\Explainer;

use App\Support\Text\TextNormalizer;

/**
 * Rule-based classification of the kind of document (Italian / Arabic / English keywords). It says what the document
 * APPEARS to be with a confidence derived from keyword evidence; it never claims certainty and returns `unknown`
 * rather than guessing.
 */
class DocumentClassifier
{
    public const TYPES = ['comune', 'questura', 'inps', 'agenzia_entrate', 'bolletta', 'busta_paga', 'multa', 'contratto', 'sanitaria', 'scuola'];

    /** Keywords are written in the normalized form (no accents, Arabic alef/ya/ta-marbuta unified). */
    private const KEYWORDS = [
        'comune' => ['comune di', 'comune', 'anagrafe', 'residenza anagrafica', 'stato civile', 'sindaco', 'ufficio anagrafe', 'municipality', 'town hall', 'registry office', 'resident certificate', 'البلديه', 'بلديه', 'السجل المدني', 'سجل السكان'],
        'questura' => ['questura', 'permesso di soggiorno', 'polizia di stato', 'ufficio immigrazione', 'rinnovo permesso', 'commissariato', 'residence permit', 'police headquarters', 'immigration office', 'kit postale', 'مديريه الامن', 'تصريح الاقامه', 'الهجره'],
        'inps' => ['inps', 'previdenza sociale', 'previdenza', 'assegno unico', 'naspi', 'contributi', 'social security', 'unemployment benefit', 'التامينات الاجتماعيه', 'المعاش'],
        'agenzia_entrate' => ['agenzia delle entrate', 'agenzia entrate', 'codice fiscale', 'dichiarazione dei redditi', 'modello 730', 'f24', 'cartella esattoriale', 'partita iva', 'tax return', 'revenue agency', 'tax code', 'الرقم الضريبي', 'وكاله الايرادات', 'الضرائب'],
        'bolletta' => ['bolletta', 'fattura', 'kwh', 'smc', 'consumi', 'fornitura', 'energia elettrica', 'scadenza pagamento', 'electricity bill', 'utility bill', 'water bill', 'فاتوره الكهرباء', 'فاتوره', 'استهلاك'],
        'busta_paga' => ['busta paga', 'cedolino', 'retribuzione', 'stipendio', 'trattenute', 'tfr', 'payslip', 'salary slip', 'net pay', 'gross pay', 'قسيمه الراتب', 'كشف الراتب', 'الراتب'],
        'multa' => ['multa', 'verbale', 'contravvenzione', 'sanzione amministrativa', 'codice della strada', 'infrazione', 'autovelox', 'polizia locale', 'traffic fine', 'speeding ticket', 'penalty notice', 'مخالفه', 'غرامه'],
        'contratto' => ['contratto', 'locazione', 'canone', 'clausola', 'locatore', 'conduttore', 'tenant', 'landlord', 'lease', 'employment contract', 'عقد ايجار', 'المؤجر', 'المستاجر', 'عقد'],
        'sanitaria' => ['asl', 'azienda sanitaria', 'tessera sanitaria', 'ricetta', 'medico di base', 'ospedale', 'referto', 'ticket sanitario', 'health card', 'prescription', 'hospital', 'medical report', 'وصفه طبيه', 'مستشفي', 'بطاقه صحيه', 'الطبيب'],
        'scuola' => ['scuola', 'istituto comprensivo', 'iscrizione', 'insegnante', 'dirigente scolastico', 'scuola primaria', 'school', 'enrolment', 'teacher', 'المدرسه', 'تسجيل الطالب', 'المعلم'],
    ];

    public function __construct(private TextNormalizer $normalizer) {}

    /** @return array{type:string,confidence:float} */
    public function classify(string $text): array
    {
        $t = ' '.$this->normalizer->normalize($text).' ';
        $scores = [];
        foreach (self::KEYWORDS as $type => $kws) {
            $score = 0;
            foreach ($kws as $kw) {
                if (preg_match('/'.(preg_match('/^[a-z0-9]/', $kw) ? '(?<![\p{L}\p{N}])' : '').preg_quote($kw, '/').(preg_match('/[a-z0-9]$/', $kw) && mb_strlen($kw) <= 4 ? '(?![\p{L}\p{N}])' : '').'/u', $t)) {
                    $score += str_contains($kw, ' ') ? 2 : 1; // multi-word phrases are stronger evidence
                }
            }
            $scores[$type] = $score;
        }
        arsort($scores);
        $top = array_key_first($scores);
        $best = $scores[$top];
        $second = array_values($scores)[1] ?? 0;
        if ($best === 0 || ($best === $second && $best < 2)) {
            return ['type' => 'unknown', 'confidence' => 0.0];
        }

        return ['type' => $top, 'confidence' => round(min(0.95, $best / ($best + $second + 1.5)), 2)];
    }
}
