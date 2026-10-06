<?php

namespace App\Domains\Documents\Explainer;

use App\Support\Text\TextNormalizer;

/**
 * Finds dates that are literally written in the text. A date without a year is returned with `date: null` (the day and
 * month are reported, the year is NOT guessed). Nothing is computed relative to today.
 */
class KeyDateExtractor
{
    private const MONTHS = [
        1 => ['gennaio', 'january', 'يناير', 'كانون الثاني', 'جانفي'],
        2 => ['febbraio', 'february', 'فبراير', 'شباط', 'فيفري'],
        3 => ['marzo', 'march', 'مارس', 'اذار'],
        4 => ['aprile', 'april', 'ابريل', 'نيسان', 'افريل'],
        5 => ['maggio', 'may', 'مايو', 'ايار', 'ماي'],
        6 => ['giugno', 'june', 'يونيو', 'حزيران', 'جوان'],
        7 => ['luglio', 'july', 'يوليو', 'تموز', 'جويليه'],
        8 => ['agosto', 'august', 'اغسطس', 'اوت', 'اب'],
        9 => ['settembre', 'september', 'سبتمبر', 'ايلول'],
        10 => ['ottobre', 'october', 'اكتوبر', 'تشرين الاول'],
        11 => ['novembre', 'november', 'نوفمبر', 'تشرين الثاني'],
        12 => ['dicembre', 'december', 'ديسمبر', 'كانون الاول'],
    ];

    /** Context words → label key, first group that matches wins. */
    private const LABELS = [
        'appointment' => ['appuntamento', 'convocat', 'presentarsi', 'appointment', 'interview', 'موعد', 'مقابله', 'استدعاء'],
        'issued' => ['emesso', 'emissione', 'rilasciat', 'issued', 'issue date', 'صادر', 'اصدار'],
        'deadline' => ['entro', 'scadenza', 'scade', 'termine', 'non oltre', 'by ', 'until', 'deadline', 'due ', 'expires', 'expiry', 'before', 'خلال', 'قبل', 'اخر موعد', 'الموعد النهائي', 'ينتهي', 'تنتهي', 'صلاحيه'],
    ];

    private const PAYMENT = ['pagamento', 'pagare', 'versare', 'importo', 'payment', 'pay ', 'amount', 'الدفع', 'سداد', 'المبلغ'];

    private const MAX_DATES = 10;

    public function __construct(private TextNormalizer $normalizer) {}

    /** @return list<array{label_key:string,date:?string,day:int,month:int,year:?int,raw:string}> */
    public function extract(string $text): array
    {
        $t = $this->normalizer->normalize($text);
        $found = [];

        if (preg_match_all('/(?<![\d.\/-])(\d{4})-(\d{1,2})-(\d{1,2})(?![\d])/u', $t, $m, PREG_OFFSET_CAPTURE | PREG_SET_ORDER)) {
            foreach ($m as $x) {
                $found[] = [$x[0][1], $x[0][0], (int) $x[3][0], (int) $x[2][0], (int) $x[1][0]];
            }
        }
        if (preg_match_all('/(?<![\d.\/-])(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4}|\d{2})(?![\d])/u', $t, $m, PREG_OFFSET_CAPTURE | PREG_SET_ORDER)) {
            foreach ($m as $x) {
                $y = (int) $x[3][0];
                $found[] = [$x[0][1], $x[0][0], (int) $x[1][0], (int) $x[2][0], $y < 100 ? 2000 + $y : $y];
            }
        }
        $names = [];
        foreach (self::MONTHS as $n => $list) {
            foreach ($list as $name) {
                $names[$name] = $n;
            }
        }
        uksort($names, fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a)); // "kanun al-thani" before shorter names
        $alt = implode('|', array_map(fn ($n) => preg_quote($n, '/'), array_keys($names)));
        if (preg_match_all('/(?<![\d.\/-])(\d{1,2})\s*(?:°|º|st|nd|rd|th)?\s+(?:di |of |من |de )?('.$alt.')(?![\p{L}])(?:\s*,?\s*(\d{4})(?![\d]))?/u', $t, $m, PREG_OFFSET_CAPTURE | PREG_SET_ORDER)) {
            foreach ($m as $x) {
                $found[] = [$x[0][1], $x[0][0], (int) $x[1][0], $names[$x[2][0]], isset($x[3]) && $x[3][0] !== '' ? (int) $x[3][0] : null];
            }
        }
        usort($found, fn ($a, $b) => $a[0] <=> $b[0]);

        $out = [];
        $seen = [];
        foreach ($found as [$offset, $raw, $day, $month, $year]) {
            if ($day < 1 || $day > 31 || $month < 1 || $month > 12 || ($year !== null && ($year < 1990 || $year > 2100))) {
                continue;
            }
            $valid = $year === null ? checkdate($month, $day, 2000) : checkdate($month, $day, $year);
            if (! $valid) {
                continue;
            }
            $date = $year === null ? null : sprintf('%04d-%02d-%02d', $year, $month, $day);
            $key = $date ?? "?-$month-$day";
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $out[] = ['label_key' => $this->label($t, $offset, strlen($raw)), 'date' => $date, 'day' => $day, 'month' => $month, 'year' => $year, 'raw' => trim($raw)];
            if (count($out) >= self::MAX_DATES) {
                break;
            }
        }

        return $out;
    }

    private function label(string $t, int $offset, int $len): string
    {
        $from = max(0, $offset - 45);
        $ctx = ' '.mb_strcut($t, $from, $offset - $from).' ';
        $after = ' '.mb_strcut($t, $offset + $len, 20);
        foreach (self::LABELS as $key => $words) {
            foreach ($words as $w) {
                if (str_contains($ctx, $w) || ($key === 'appointment' && str_contains($after, $w))) {
                    if ($key === 'deadline') {
                        foreach (self::PAYMENT as $p) {
                            if (str_contains($ctx.$after, $p)) {
                                return 'payment_due';
                            }
                        }
                    }

                    return $key;
                }
            }
        }

        return 'date';
    }
}
