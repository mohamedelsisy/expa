<?php

namespace App\Domains\Housing\Services;

/**
 * Deterministic, rule-based fact extraction from a pasted rental listing / contract (Arabic, Italian, English).
 * It reports only what the text literally contains; it never infers a legal status. Absence of a signal means
 * "not detected in the pasted text", never "not in the contract".
 */
class HousingExtractor
{
    public const BOOL_SIGNALS = [
        'deposit_mentioned', 'utilities_included', 'utilities_excluded', 'utilities_stated', 'agency_fee_mentioned',
        'registration_mentioned', 'unregistered_mentioned', 'cedolare_secca_mentioned', 'notice_period_mentioned',
        'cash_payment_mentioned', 'no_contract_mentioned', 'written_contract_mentioned', 'advance_payment_mentioned',
        'pressure_language', 'contract_type_4_4', 'contract_type_3_2', 'contract_type_transitory', 'contract_type_student',
    ];

    public const NUMERIC_SIGNALS = ['rent_monthly', 'deposit_amount', 'deposit_months', 'expenses_monthly', 'agency_fee_amount', 'notice_period_months'];

    public const SIGNALS = [...self::BOOL_SIGNALS, ...self::NUMERIC_SIGNALS];

    /** Signals that tell how complete the picture is (drive `confidence`). */
    public const CORE = ['rent_monthly', 'deposit_mentioned', 'utilities_stated', 'registration_mentioned', 'notice_period_mentioned'];

    private const KW = [
        'rent' => ['canone', 'affitto', 'pigione', 'rent', 'ايجار', 'اجار'],
        'deposit' => ['caparra', 'cauzione', 'deposito', 'deposit', 'تامين', 'وديعه', 'ضمان'],
        'expenses' => ['spese', 'condominio', 'condominiali', 'utenze', 'bollette', 'bills', 'utilities', 'service charge', 'مصاريف', 'فواتير', 'خدمات'],
        'agency' => ['agenzia', 'provvigione', 'commissione', 'mediazione', 'agency', 'commission', 'finder fee', 'وسيط', 'عموله', 'وساطه'],
        'monthly' => ['al mese', 'mensile', 'mensili', '/mese', 'a month', 'per month', 'monthly', '/month', 'شهري', 'في الشهر', 'بالشهر'],
        'utilities_included' => ['spese incluse', 'utenze incluse', 'comprese le spese', 'comprese spese', 'spese comprese', 'utenze comprese', 'bollette incluse', 'bills included', 'utilities included', 'all inclusive', 'all-inclusive', 'tutto incluso', 'الفواتير شامله', 'شامل الفواتير', 'شامل المصاريف', 'المصاريف شامله', 'شامل كل'],
        'utilities_excluded' => ['spese escluse', 'utenze escluse', 'escluse le spese', 'escluse spese', 'bollette escluse', 'spese a carico', 'utenze a carico', 'bills not included', 'bills excluded', 'utilities not included', 'excluding bills', 'plus bills', 'plus utilities', 'spese condominiali escluse', 'غير شامل', 'الفواتير على المستاجر', 'بدون فواتير'],
        'agency_fee' => ['provvigione', 'commissione di agenzia', 'spese di agenzia', 'mediazione', 'agency fee', 'agency commission', 'finder fee', 'عموله', 'اتعاب الوسيط'],
        'registration' => ['registrazione', 'registrato', 'registrare', 'registered', 'registration of the contract', 'تسجيل العقد', 'العقد مسجل'],
        'unregistered' => ['non registrato', 'senza registrazione', 'non registrare', 'not registered', 'unregistered', 'غير مسجل', 'بدون تسجيل'],
        'cedolare' => ['cedolare secca', 'cedolare', 'flat tax on rent', 'flat-rate tax'],
        'notice' => ['preavviso', 'notice', 'اشعار', 'اخطار', 'مهله'],
        'cash' => ['contanti', 'in nero', 'cash', 'نقدا', 'نقدي', 'كاش'],
        'no_contract' => ['senza contratto', 'no contract', 'without contract', 'without a contract', 'no written contract', 'in nero', 'contratto verbale', 'verbal agreement', 'بدون عقد', 'من غير عقد', 'بلا عقد', 'اتفاق شفهي'],
        'contract' => ['contratto', 'contract', 'lease', 'عقد'],
        'pressure' => ['urgente', 'urgent', 'affrettati', 'ultimo appartamento', 'ultima disponibilita', 'decidere subito', 'decidi subito', 'oggi stesso', 'solo oggi', 'molte richieste', 'tante richieste', 'first come', 'hurry', 'act now', 'limited time', 'last apartment', 'many people interested', 'many requests', 'today only', 'عاجل', 'الفرصه الاخيره', 'قرر الان', 'اليوم فقط', 'طلبات كثيره', 'بسرعه'],
        'student' => ['studenti', 'studente', 'student', 'universitario', 'طلاب', 'طالب'],
        'transitory' => ['transitorio', 'transitory', 'temporary lease', 'عقد مؤقت'],
    ];

    private const ADVANCE_PATTERNS = [
        '/(?:pagamento anticipato|anticipo prima|bonifico prima|caparra prima|prima della visita|prima di visitare|prima di vedere|before viewing|before the viewing|before you see|before visiting|send (?:the )?(?:money|deposit)|western union|moneygram|postepay|gift card|bitcoin|crypto|قبل المعاينه|قبل الزياره|ارسل المبلغ|ارسال المال|ويسترن|مونيجرام)/u',
        '/(?:bonifico|transfer|wire|تحويل|pag\w*|pay\w*|versa\w*)[^.\n]{0,40}(?:prima di|before|قبل)[^.\n]{0,20}(?:vedere|visita|visitare|view|visit|المعاينه|الزياره|رؤيه)/u',
    ];

    private const NUMBER_WORDS = ['un' => 1, 'una' => 1, 'uno' => 1, 'one' => 1, 'due' => 2, 'two' => 2, 'tre' => 3, 'three' => 3, 'quattro' => 4, 'four' => 4, 'cinque' => 5, 'five' => 5, 'sei' => 6, 'six' => 6,
        'شهرين' => 2, 'ثلاثه' => 3, 'ثلاث' => 3, 'اربعه' => 4, 'اربع' => 4];

    public function normalize(string $text): string
    {
        $text = mb_strtolower($text);
        $text = strtr($text, ['٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9', '٫' => ',', '٬' => '.',
            'à' => 'a', 'è' => 'e', 'é' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
            'أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ى' => 'ي', 'ة' => 'ه', 'ـ' => '']);
        $text = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $text) ?? $text; // Arabic diacritics

        return preg_replace('/[ \t]+/u', ' ', $text) ?? $text;
    }

    /**
     * @return array{signals:array<string,bool|float|null>,evidence:array<string,string>,language:string,notes:list<string>}
     */
    public function extract(string $raw): array
    {
        $t = $this->normalize($raw);
        $s = array_fill_keys(self::SIGNALS, null);
        foreach (self::BOOL_SIGNALS as $b) {
            $s[$b] = false;
        }
        $ev = [];
        $notes = [];

        // ---- amounts ------------------------------------------------------------------------------
        $amounts = $this->amounts($t);
        $byCat = ['rent' => [], 'deposit' => [], 'expenses' => [], 'agency' => []];
        foreach ($amounts as $a) {
            $cat = $this->categoryOf($t, $a);
            if ($cat) {
                $byCat[$cat][] = $a;
            }
        }
        $rents = array_values(array_filter($byCat['rent'], fn ($a) => $a['value'] >= 50 && $a['value'] <= 20000));
        if ($rents) {
            $s['rent_monthly'] = $rents[0]['value'];
            $ev['rent_monthly'] = $this->snippet($t, $rents[0]);
            if (count(array_unique(array_column($rents, 'value'))) > 1) {
                $notes[] = 'rent_ambiguous';
            }
        }
        if ($byCat['deposit']) {
            $s['deposit_amount'] = $byCat['deposit'][0]['value'];
            $ev['deposit_amount'] = $this->snippet($t, $byCat['deposit'][0]);
        }
        if ($byCat['expenses']) {
            $s['expenses_monthly'] = $byCat['expenses'][0]['value'];
            $ev['expenses_monthly'] = $this->snippet($t, $byCat['expenses'][0]);
        }
        if ($byCat['agency']) {
            $s['agency_fee_amount'] = $byCat['agency'][0]['value'];
            $ev['agency_fee_amount'] = $this->snippet($t, $byCat['agency'][0]);
        }

        // ---- deposit ------------------------------------------------------------------------------
        $s['deposit_mentioned'] = $this->has($t, 'deposit') || $s['deposit_amount'] !== null;
        $months = $this->depositMonths($t);
        if ($months !== null) {
            $s['deposit_months'] = $months;
        } elseif ($s['deposit_amount'] !== null && $s['rent_monthly']) {
            $s['deposit_months'] = round($s['deposit_amount'] / $s['rent_monthly'], 2);
            $notes[] = 'deposit_months_derived';
        }

        // ---- utilities ------------------------------------------------------------------------------
        $inc = $this->has($t, 'utilities_included');
        $exc = $this->has($t, 'utilities_excluded');
        $s['utilities_included'] = $inc && ! $exc;
        $s['utilities_excluded'] = $exc && ! $inc;
        $s['utilities_stated'] = $s['utilities_included'] || $s['utilities_excluded'];
        if ($inc && $exc) {
            $notes[] = 'utilities_ambiguous';
        }

        // ---- contract / registration / tax ----------------------------------------------------------------
        $s['no_contract_mentioned'] = $this->has($t, 'no_contract');
        $s['written_contract_mentioned'] = $this->has($t, 'contract') && ! $s['no_contract_mentioned'];
        $s['unregistered_mentioned'] = $this->has($t, 'unregistered');
        $s['registration_mentioned'] = $this->has($t, 'registration') && ! $s['unregistered_mentioned'];
        $s['cedolare_secca_mentioned'] = $this->has($t, 'cedolare');
        $s['contract_type_4_4'] = (bool) preg_match('/(?<!\d)4\s*\+\s*4(?!\d)/u', $t);
        $s['contract_type_3_2'] = (bool) preg_match('/(?<!\d)3\s*\+\s*2(?!\d)/u', $t);
        $s['contract_type_transitory'] = $this->has($t, 'transitory');
        $s['contract_type_student'] = $this->has($t, 'student');

        // ---- notice period ----------------------------------------------------------------------------
        $s['notice_period_mentioned'] = $this->has($t, 'notice');
        $s['notice_period_months'] = $this->noticeMonths($t);

        // ---- fees, payment, pressure ------------------------------------------------------------------------
        $s['agency_fee_mentioned'] = $this->has($t, 'agency_fee') || $s['agency_fee_amount'] !== null;
        $s['cash_payment_mentioned'] = $this->has($t, 'cash');
        $s['advance_payment_mentioned'] = (bool) array_filter(self::ADVANCE_PATTERNS, fn ($p) => preg_match($p, $t));
        $s['pressure_language'] = $this->has($t, 'pressure');

        return ['signals' => $s, 'evidence' => $ev, 'language' => $this->language($raw), 'notes' => $notes];
    }

    // ---- helpers --------------------------------------------------------------------------------------

    private function kwRegex(string $kw): string
    {
        $q = preg_quote($kw, '/');

        // Latin keywords must start a word (so "rent" does not match "current"); Arabic ones may carry prefixes (ال، و، ب).
        return (preg_match('/^[a-z0-9]/', $kw) ? '(?<![\p{L}\p{N}])' : '').$q;
    }

    private function has(string $t, string $group): bool
    {
        foreach (self::KW[$group] as $kw) {
            if (preg_match('/'.$this->kwRegex($kw).'/u', $t)) {
                return true;
            }
        }

        return false;
    }

    /** @return list<array{value:float,start:int,end:int,currency:bool}> byte offsets into the normalized text */
    private function amounts(string $t): array
    {
        $out = [];
        $re = '/(?<![\d.,\/+-])(€\s*)?(\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?![\d]|[.,\/-]\d|\s*\+\s*\d)(\s*(?:€|euro\b|eur\b|يورو))?/u';
        if (! preg_match_all($re, $t, $m, PREG_OFFSET_CAPTURE | PREG_SET_ORDER)) {
            return [];
        }
        foreach ($m as $x) {
            $raw = $x[2][0];
            $digits = preg_replace('/\D/', '', $raw);
            $currency = ($x[1][0] ?? '') !== '' || ($x[3][0] ?? '') !== '';
            if (strlen($digits) >= 7 || (! $currency && strlen($digits) >= 6)) {
                continue; // phone numbers, ids
            }
            $value = $this->parseNumber($raw);
            $tail = mb_strcut($t, $x[0][1] + strlen($x[0][0]), 16);
            // Counts ("3 mensilità", "6 mesi", "30 giorni", "10%") and tiny bare numbers are not money.
            if (! $currency && ($value < 20 || preg_match('/^\s*(?:%|mensilit|mesi|mese|months?|giorni|days?|اشهر|شهور|شهر|يوم|ايام|metri|mq|m2|stanz|camer|room|bed|piano|floor)/u', $tail))) {
                continue;
            }
            if ($value <= 0 || $value > config('housing.max_amount', 100000)) {
                continue;
            }
            $start = $x[0][1];
            $out[] = ['value' => $value, 'start' => $start, 'end' => $start + strlen($x[0][0]), 'currency' => $currency];
        }

        return $out;
    }

    private function parseNumber(string $raw): float
    {
        $raw = preg_replace('/\s/', '', $raw) ?? $raw;
        if (preg_match('/^\d{1,3}([.,]\d{3})+$/', $raw)) {
            return (float) preg_replace('/[.,]/', '', $raw);
        }
        if (preg_match('/^\d{1,3}([.,]\d{3})+[.,]\d{1,2}$/', $raw)) {
            return (float) (preg_replace('/[.,]/', '', substr($raw, 0, -3)).'.'.substr($raw, -2));
        }

        return (float) str_replace(',', '.', $raw);
    }

    /** The category keyword nearest to the amount (≤ 40 chars before / 25 after); a monthly marker alone means rent. */
    private function categoryOf(string $t, array $a): ?string
    {
        $from = max(0, $a['start'] - 80);
        $before = mb_strcut($t, $from, $a['start'] - $from);
        $after = mb_strcut($t, $a['end'], 60);
        $best = null;
        $bestDist = PHP_INT_MAX;
        foreach (['rent', 'deposit', 'expenses', 'agency'] as $cat) {
            foreach (self::KW[$cat] as $kw) {
                $re = '/'.$this->kwRegex($kw).'/u';
                if (preg_match_all($re, $before, $mm, PREG_OFFSET_CAPTURE)) {
                    $last = end($mm[0]);
                    $dist = strlen($before) - ($last[1] + strlen($last[0]));
                    if ($dist <= 40 && $dist < $bestDist) {
                        [$best, $bestDist] = [$cat, $dist];
                    }
                }
                if (preg_match($re, mb_strcut($after, 0, 40), $mm, PREG_OFFSET_CAPTURE)) {
                    $dist = $mm[0][1];
                    if ($dist <= 25 && $dist < $bestDist) {
                        [$best, $bestDist] = [$cat, $dist];
                    }
                }
            }
        }
        if ($best === null && $a['currency']) {
            foreach (self::KW['monthly'] as $kw) {
                if (preg_match('/^\s{0,2}'.$this->kwRegex($kw).'/u', mb_strcut($after, 0, 20))) {
                    return 'rent';
                }
            }
        }

        return $best;
    }

    private function depositMonths(string $t): ?float
    {
        $words = implode('|', array_map('preg_quote', array_keys(self::NUMBER_WORDS)));
        $re = '/(?<![\p{L}\p{N}])(\d{1,2}(?:[.,]5)?|'.$words.')\s*(?:mensilita|mesi|mese|months?|اشهر|شهور|شهر)(?![\p{L}])|(?<![\p{L}])(شهرين)/u';
        if (! preg_match_all($re, $t, $m, PREG_OFFSET_CAPTURE | PREG_SET_ORDER)) {
            return null;
        }
        foreach ($m as $x) {
            $ctx = mb_strcut($t, max(0, $x[0][1] - 50), 100 + strlen($x[0][0]));
            foreach (self::KW['deposit'] as $kw) {
                if (preg_match('/'.$this->kwRegex($kw).'/u', $ctx)) {
                    $n = ($x[1][0] ?? '') !== '' ? $x[1][0] : 'شهرين';

                    return (float) (self::NUMBER_WORDS[$n] ?? str_replace(',', '.', $n));
                }
            }
        }

        return null;
    }

    private function noticeMonths(string $t): ?float
    {
        foreach (self::KW['notice'] as $kw) {
            if (preg_match('/'.$this->kwRegex($kw).'[^.\n]{0,30}?(?<![\d])(\d{1,2})\s*(mesi|mese|months?|اشهر|شهور|شهر|giorni|days?|يوم|ايام)/u', $t, $m)) {
                $n = (float) $m[1];
                $unit = $m[2];

                return in_array($unit, ['giorni', 'day', 'days', 'يوم', 'ايام'], true) ? round($n / 30, 1) : $n;
            }
        }

        return null;
    }

    private function snippet(string $t, array $a): string
    {
        return trim(mb_strcut($t, max(0, $a['start'] - 20), 60));
    }

    public function language(string $raw): string
    {
        $ar = preg_match_all('/\p{Arabic}/u', $raw);
        $letters = max(1, preg_match_all('/\p{L}/u', $raw));
        if ($ar / $letters > 0.3) {
            return 'ar';
        }
        $it = preg_match_all('/\b(il|la|di|che|con|per|della|dello|mese|affitto|canone|euro|sono|è)\b/iu', $raw);
        $en = preg_match_all('/\b(the|and|with|is|are|month|rent|for|of|bills|deposit)\b/iu', $raw);

        return $it > $en ? 'it' : 'en';
    }
}
