<?php

namespace Database\Seeders;

use App\Domains\Learning\Models\ItalianLesson;
use Illuminate\Database\Seeder;

/**
 * A SMALL starter curriculum so the learning module works out of the box. It is language-teaching
 * material only (no claims about official procedures). Content is marked published for convenience, but
 * it MUST be reviewed by a qualified Italian teacher / native Arabic speaker before launch (task T-034).
 * Idempotent: lessons are matched by slug.
 */
class StarterCurriculumSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->lessons() as $i => $l) {
            $lesson = ItalianLesson::firstOrNew(['slug' => $l['slug']]);
            $lesson->fill(['level' => $l['level'], 'type' => $l['type'], 'scenario' => $l['scenario'] ?? null, 'duration_minutes' => $l['minutes'], 'sort_order' => $i * 10]);
            $lesson->save();
            $lesson->setTranslations($l['t']);
            $lesson->forceFill(['status' => 'published', 'published_at' => $lesson->published_at ?? now()])->save();
        }
    }

    private function lessons(): array
    {
        $w = fn (string $it, string $ar, string $en, string $itg, ?string $ex = null, ?string $exAr = null, ?string $exEn = null) => [
            'ar' => ['it' => $it, 'gloss' => $ar, 'example_it' => $ex, 'example_gloss' => $exAr],
            'en' => ['it' => $it, 'gloss' => $en, 'example_it' => $ex, 'example_gloss' => $exEn],
            'it' => ['it' => $it, 'gloss' => $itg, 'example_it' => $ex],
        ];
        $pack = function (array $words) {
            $out = ['ar' => [], 'en' => [], 'it' => []];
            foreach ($words as $x) {
                foreach ($x as $loc => $item) {
                    $out[$loc][] = array_filter($item, fn ($v) => $v !== null);
                }
            }

            return $out;
        };

        $v1 = $pack([
            $w('Buongiorno', 'صباح الخير', 'Good morning', 'Saluto della mattina', 'Buongiorno, signora!', 'صباح الخير يا سيدتي!', 'Good morning, madam!'),
            $w('Buonasera', 'مساء الخير', 'Good evening', 'Saluto della sera', 'Buonasera a tutti.', 'مساء الخير للجميع.', 'Good evening, everyone.'),
            $w('Ciao', 'مرحبًا / وداعًا (غير رسمي)', 'Hi / bye (informal)', 'Saluto informale', 'Ciao, Marco!', 'مرحبًا يا ماركو!', 'Hi, Marco!'),
            $w('Arrivederci', 'إلى اللقاء', 'Goodbye', 'Saluto di congedo', 'Arrivederci e buona giornata.', 'إلى اللقاء ويوم سعيد.', 'Goodbye and have a nice day.'),
            $w('Grazie', 'شكرًا', 'Thank you', 'Per ringraziare', 'Grazie mille!', 'شكرًا جزيلًا!', 'Thanks a lot!'),
        ]);
        $v2 = $pack([
            $w('Prego', 'عفوًا (ردًا على الشكر) / تفضّل', "You're welcome / please, go ahead", 'Risposta a "grazie"; invito a procedere', 'Prego, si accomodi.', 'تفضّل بالجلوس.', 'Please, take a seat.'),
            $w('Per favore', 'من فضلك', 'Please', 'Formula di cortesia per chiedere', 'Un caffè, per favore.', 'قهوة، من فضلك.', 'A coffee, please.'),
            $w('Scusi', 'عذرًا (رسمي)', 'Excuse me (formal)', 'Per attirare l\'attenzione o scusarsi (formale)', 'Scusi, dov\'è la farmacia?', 'عذرًا، أين الصيدلية؟', 'Excuse me, where is the pharmacy?'),
            $w('Sì', 'نعم', 'Yes', 'Risposta affermativa'),
            $w('No', 'لا', 'No', 'Risposta negativa'),
        ]);

        $essere = [
            'ar' => ['io sono — أنا', 'tu sei — أنتَ', 'lui / lei è — هو / هي', 'noi siamo — نحن', 'voi siete — أنتم', 'loro sono — هم'],
            'en' => ['io sono — I am', 'tu sei — you are', 'lui / lei è — he / she is', 'noi siamo — we are', 'voi siete — you (pl.) are', 'loro sono — they are'],
            'it' => ['io sono', 'tu sei', 'lui / lei è', 'noi siamo', 'voi siete', 'loro sono'],
        ];
        $toItems = fn (array $lines) => array_map(fn ($l) => ['it' => explode(' — ', $l)[0], 'gloss' => explode(' — ', $l)[1] ?? null], $lines);

        $dialogue = [
            ['A', 'Buongiorno, come posso aiutarla?', 'صباح الخير، كيف أستطيع مساعدتك؟', 'Good morning, how can I help you?'],
            ['B', 'Buongiorno, vorrei un appuntamento.', 'صباح الخير، أريد موعدًا.', 'Good morning, I would like an appointment.'],
            ['A', 'Per quale servizio?', 'لأي خدمة؟', 'For which service?'],
            ['B', 'Per la residenza.', 'من أجل تسجيل الإقامة السكنية (Residenza).', 'For residency registration (Residenza).'],
            ['A', 'Un attimo, controllo.', 'لحظة، سأتحقق.', 'One moment, let me check.'],
            ['B', 'Grazie mille!', 'شكرًا جزيلًا!', 'Thank you very much!'],
        ];
        $dlg = fn (int $col) => array_map(fn ($d) => ['speaker' => $d[0], 'it' => $d[1], 'gloss' => $col ? $d[$col] : null], $dialogue);
        $strip = fn (array $items) => array_map(fn ($i) => array_filter($i, fn ($v) => $v !== null), $items);

        $pron = [
            ['ciao', 'تشاو', 'chow', 'ci + a = «تشا»'],
            ['grazie', 'غراتسيه', 'GRAH-tsyeh', 'zie = «تسيه»'],
            ['gnocchi', 'نيوكّي', 'NYOK-kee', 'gn = «ني»'],
            ['pizza', 'بيتسا', 'PEET-tsa', 'zz = «تس» قوية'],
            ['scusi', 'سكوزي', 'SKOO-zee', 'sc قبل u = «سك»'],
        ];

        return [
            ['slug' => 'saluti-1', 'level' => 'a0', 'type' => 'vocabulary', 'scenario' => 'everyday', 'minutes' => 2, 't' => [
                'ar' => ['title' => 'التحيات (1)', 'summary' => 'خمس كلمات لتحية الناس كل يوم.', 'items' => $v1['ar']],
                'en' => ['title' => 'Greetings (1)', 'summary' => 'Five words to greet people every day.', 'items' => $v1['en']],
                'it' => ['title' => 'Saluti (1)', 'summary' => 'Cinque parole per salutare ogni giorno.', 'items' => $v1['it']],
            ]],
            ['slug' => 'saluti-2', 'level' => 'a0', 'type' => 'vocabulary', 'scenario' => 'everyday', 'minutes' => 2, 't' => [
                'ar' => ['title' => 'عبارات المجاملة', 'summary' => 'كلمات اللباقة التي تسمعها في كل مكان.', 'items' => $v2['ar']],
                'en' => ['title' => 'Polite expressions', 'summary' => 'Courtesy words you will hear everywhere.', 'items' => $v2['en']],
                'it' => ['title' => 'Formule di cortesia', 'summary' => 'Le parole di cortesia che sentirai ovunque.', 'items' => $v2['it']],
            ]],
            ['slug' => 'essere-presente', 'level' => 'a0', 'type' => 'grammar', 'minutes' => 3, 't' => [
                'ar' => ['title' => 'الفعل essere (يكون)', 'summary' => 'أهم فعل للتعريف بنفسك.', 'body' => 'الفعل essere يعني «يكون». نستخدمه للتعريف بالنفس والجنسية والمهنة. مثال: Io sono egiziano (أنا مصري) / Io sono egiziana (أنا مصرية). لاحظ أن الصفة تتغير حسب الجنس.', 'items' => $strip($toItems($essere['ar']))],
                'en' => ['title' => 'The verb essere (to be)', 'summary' => 'The key verb to introduce yourself.', 'body' => 'Essere means "to be". Use it for identity, nationality and profession. Example: Io sono egiziano / egiziana. Adjectives change with gender.', 'items' => $strip($toItems($essere['en']))],
                'it' => ['title' => 'Il verbo essere', 'summary' => 'Il verbo chiave per presentarsi.', 'body' => "Si usa per identità, nazionalità e professione. Esempio: Io sono egiziano / egiziana. L'aggettivo cambia secondo il genere.", 'items' => $strip($toItems($essere['it']))],
            ]],
            ['slug' => 'al-comune-appuntamento', 'level' => 'a1', 'type' => 'conversation', 'scenario' => 'comune', 'minutes' => 3, 't' => [
                'ar' => ['title' => 'في البلدية: طلب موعد', 'summary' => 'حوار قصير للتدرّب على اللغة. هذا تدريب لغوي وليس شرحًا للإجراءات الرسمية.', 'items' => $strip($dlg(2))],
                'en' => ['title' => 'At the Comune: asking for an appointment', 'summary' => 'A short dialogue for language practice. It is language practice, not an explanation of official procedures.', 'items' => $strip($dlg(3))],
                'it' => ['title' => 'Al Comune: chiedere un appuntamento', 'summary' => 'Un breve dialogo per esercitarsi con la lingua. Non spiega le procedure ufficiali.', 'items' => $strip($dlg(0))],
            ]],
            ['slug' => 'pronuncia-base', 'level' => 'a0', 'type' => 'pronunciation', 'minutes' => 2, 't' => [
                'ar' => ['title' => 'نطق الأصوات الإيطالية الأولى', 'summary' => 'كرّر كل كلمة بصوت عالٍ.', 'items' => array_map(fn ($p) => ['it' => $p[0], 'phonetic' => $p[2], 'tip' => $p[1].' — '.$p[3]], $pron)],
                'en' => ['title' => 'First Italian sounds', 'summary' => 'Repeat each word out loud.', 'items' => array_map(fn ($p) => ['it' => $p[0], 'phonetic' => $p[2]], $pron)],
                'it' => ['title' => 'I primi suoni dell\'italiano', 'summary' => 'Ripeti ogni parola ad alta voce.', 'items' => array_map(fn ($p) => ['it' => $p[0], 'phonetic' => $p[2]], $pron)],
            ]],
            ['slug' => 'missione-saluta', 'level' => 'a0', 'type' => 'mission', 'scenario' => 'everyday', 'minutes' => 1, 't' => [
                'ar' => ['title' => 'مهمة اليوم: حيِّ شخصًا بالإيطالية', 'summary' => 'تدريب واقعي صغير.', 'body' => 'اليوم قل Buongiorno لشخص تقابله (جار، بائع، زميل) وأنهِ حديثك بـ Grazie. لا تقلق من الأخطاء: الناس يقدّرون المحاولة.'],
                'en' => ['title' => "Today's mission: greet someone in Italian", 'summary' => 'A small real-life exercise.', 'body' => "Today say Buongiorno to someone you meet (a neighbour, a shopkeeper, a colleague) and end with Grazie. Don't worry about mistakes: people appreciate the effort."],
                'it' => ['title' => 'Missione di oggi: saluta qualcuno in italiano', 'summary' => 'Un piccolo esercizio dal vivo.', 'body' => 'Oggi di\' Buongiorno a qualcuno che incontri (un vicino, un negoziante, un collega) e concludi con Grazie. Non preoccuparti degli errori: lo sforzo viene apprezzato.'],
            ]],
        ];
    }
}
