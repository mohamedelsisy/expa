<?php

namespace App\Support\Text;

/**
 * Multilingual (ar / en / it) text normalization for search and retrieval.
 *  - Arabic: strips diacritics (tashkeel) and tatweel, unifies alef / ya / ta-marbuta / hamza-carriers,
 *    converts Arabic-Indic digits, drops the definite article "ال"
 *  - Latin: lowercases and strips accents (è → e), so "perche" matches "perché"
 */
class TextNormalizer
{
    private const STOPWORDS = [
        'ar' => ['في', 'من', 'الى', 'على', 'عن', 'ما', 'ماذا', 'هل', 'كيف', 'اين', 'متى', 'هو', 'هي', 'هذا', 'هذه', 'ان', 'او', 'و', 'لا', 'انا', 'لي', 'مع', 'ثم', 'كل', 'اي', 'عند', 'بعد', 'قبل'],
        'en' => ['the', 'a', 'an', 'is', 'are', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'how', 'what', 'do', 'does', 'i', 'my', 'can', 'where', 'when', 'it', 'be', 'with', 'at', 'me', 'need'],
        'it' => ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'e', 'o', 'che', 'come', 'cosa', 'dove', 'quando', 'mi', 'si', 'del', 'della', 'dei', 'delle', 'al', 'alla', 'nel', 'nella', 'posso', 'devo', 'ho'],
    ];

    public function normalize(string $text): string
    {
        $text = preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{0640}]/u', '', $text) ?? $text; // tashkeel + tatweel
        $text = strtr($text, [
            'أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ٱ' => 'ا',
            'ى' => 'ي', 'ة' => 'ه', 'ؤ' => 'و', 'ئ' => 'ي',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4', '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4', '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
        ]);
        $text = mb_strtolower($text);
        $text = strtr($text, [
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ä' => 'a', 'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i', 'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'ö' => 'o',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u', 'ç' => 'c', 'ñ' => 'n',
        ]);

        return trim(preg_replace('/\s+/u', ' ', $text) ?? $text);
    }

    /** @return list<string> normalized, de-duplicated search tokens without stopwords */
    public function tokens(string $text): array
    {
        $norm = $this->normalize($text);
        preg_match_all('/[\p{L}\p{N}]+/u', $norm, $m);

        $stop = array_flip(array_merge(...array_values(self::STOPWORDS)));
        $out = [];
        foreach ($m[0] as $t) {
            $t = $this->stripArabicArticle($t);
            if ((mb_strlen($t) < 2 && ! ctype_digit($t)) || isset($stop[$t])) {
                continue;
            }
            $out[$t] = true;
        }

        return array_keys($out);
    }

    private function stripArabicArticle(string $t): string
    {
        // "الإقامة" → "اقامه": drop "ال" only when enough of the word remains
        if (preg_match('/^[\x{0600}-\x{06FF}]/u', $t)) {
            foreach (['وال', 'بال', 'لل', 'ال'] as $prefix) {
                if (str_starts_with($t, $prefix) && mb_strlen($t) - mb_strlen($prefix) >= 3) {
                    return mb_substr($t, mb_strlen($prefix));
                }
            }
        }

        return $t;
    }

    /** Loose word match: equal, or one is a prefix of the other (len ≥ 4) to absorb simple plurals/inflection. */
    public function matches(string $a, string $b): bool
    {
        if ($a === $b) {
            return true;
        }

        return min(mb_strlen($a), mb_strlen($b)) >= 4 && (str_starts_with($a, $b) || str_starts_with($b, $a));
    }
}
