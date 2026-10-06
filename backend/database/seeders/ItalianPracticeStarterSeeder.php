<?php

namespace Database\Seeders;

use App\Domains\Learning\Models\ItalianExercise;
use App\Domains\Learning\Models\ItalianVocabulary;
use Illuminate\Database\Seeder;

/**
 * A TINY STARTER for vocabulary and quizzes (very common everyday / office / patente words, no dialogues, no claims
 * about procedures). It is language-teaching material that has NOT been reviewed by a teacher: every row is created with
 * reviewed_by_teacher_at = NULL, so the API exposes `reviewed: false` and clients show a notice (task T-034).
 * Outside local/testing the rows enter the review queue instead of going live. No audio is shipped.
 * Idempotent: matched by slug; an existing teacher review is never touched.
 */
class ItalianPracticeStarterSeeder extends Seeder
{
    public function run(): void
    {
        $live = ! app()->isProduction() && ! app()->environment('staging');

        foreach ($this->words() as $i => [$slug, $lemma, $pos, $level, $category, $ar, $en, $example]) {
            $v = ItalianVocabulary::firstOrNew(['slug' => $slug]);
            $v->fill(['lemma' => $lemma, 'part_of_speech' => $pos, 'level' => $level, 'category' => $category, 'example_it' => $example[0] ?? null, 'sort_order' => $i * 10]);
            $v->save();
            $v->setTranslations([
                'ar' => ['gloss' => $ar, 'example_gloss' => $example[1] ?? null],
                'en' => ['gloss' => $en, 'example_gloss' => $example[2] ?? null],
            ]);
            $this->state($v, $live);
        }

        $q = ['ar' => 'ما معنى هذه الكلمة؟', 'en' => 'What does this word mean?', 'it' => 'Che cosa significa questa parola?'];
        $exercises = [
            ['mc-farmacia', 'multiple_choice', 'a1', 'pharmacy', 'farmacia', ['stem' => 'farmacia', 'correct_index' => 0], ['ar' => ['صيدلية', 'بنك', 'مستشفى'], 'en' => ['pharmacy', 'bank', 'hospital']], $q],
            ['mc-appuntamento', 'multiple_choice', 'a1', 'comune', 'appuntamento', ['stem' => 'appuntamento', 'correct_index' => 0], ['ar' => ['موعد', 'عقد', 'شباك الخدمة'], 'en' => ['appointment', 'contract', 'service desk']], $q],
            ['mc-banca', 'multiple_choice', 'a1', 'bank', 'banca', ['stem' => 'banca', 'correct_index' => 1], ['ar' => ['صيدلية', 'بنك', 'بلدية'], 'en' => ['pharmacy', 'bank', 'town hall']], $q],
            ['fill-mi-chiamo', 'fill_blank', 'a0', null, null, ['sentence' => 'Mi ___ Sara.', 'answers' => ['chiamo']], null,
                ['ar' => 'أكمل الجملة: اسمي سارة.', 'en' => 'Complete the sentence: My name is Sara.', 'it' => 'Completa la frase.']],
            ['fill-io-sono', 'fill_blank', 'a0', null, null, ['sentence' => 'Io ___ Mohamed.', 'answers' => ['sono']], null,
                ['ar' => 'أكمل الجملة: أنا محمد.', 'en' => 'Complete the sentence: I am Mohamed.', 'it' => 'Completa la frase.']],
            ['match-places', 'match', 'a1', null, null, ['left' => ['farmacia', 'banca', 'comune']], ['ar' => ['صيدلية', 'بنك', 'بلدية'], 'en' => ['pharmacy', 'bank', 'town hall']],
                ['ar' => 'طابق كل كلمة بمعناها.', 'en' => 'Match each word with its meaning.', 'it' => 'Abbina ogni parola al suo significato.']],
        ];
        foreach ($exercises as $i => [$slug, $type, $level, $scenario, $vocabSlug, $content, $options, $prompts]) {
            $e = ItalianExercise::firstOrNew(['slug' => $slug]);
            $e->fill(['type' => $type, 'level' => $level, 'scenario' => $scenario, 'content' => $content, 'sort_order' => $i * 10]);
            $e->italian_vocabulary_id = $vocabSlug ? ItalianVocabulary::where('slug', $vocabSlug)->value('id') : null;
            $e->save();
            $e->setTranslations(collect($prompts)->map(fn ($p, $loc) => ['prompt' => $p] + ($options && isset($options[$loc]) ? ['options' => $options[$loc]] : []))->all());
            $this->state($e, $live);
        }
    }

    private function state($model, bool $live): void
    {
        $model->forceFill($live ? ['status' => 'published', 'published_at' => $model->published_at ?? now()] : ['status' => 'review'])->save();
    }

    /** @return list<array{0:string,1:string,2:string,3:string,4:?string,5:string,6:string,7:array}> */
    private function words(): array
    {
        return [
            ['buongiorno', 'buongiorno', 'phrase', 'a0', 'general', 'صباح الخير', 'good morning', []],
            ['grazie', 'grazie', 'phrase', 'a0', 'general', 'شكرًا', 'thank you', []],
            ['per-favore', 'per favore', 'phrase', 'a0', 'general', 'من فضلك', 'please', []],
            ['comune-municipio', 'comune', 'noun', 'a1', 'comune', 'البلدية', 'town hall / municipality', []],
            ['documento', 'documento', 'noun', 'a1', 'comune', 'مستند / وثيقة', 'document', []],
            ['modulo', 'modulo', 'noun', 'a1', 'comune', 'نموذج / استمارة', 'form', []],
            ['appuntamento', 'appuntamento', 'noun', 'a1', 'comune', 'موعد', 'appointment', ['Ho un appuntamento.', 'لدي موعد.', 'I have an appointment.']],
            ['certificato', 'certificato', 'noun', 'a2', 'comune', 'شهادة', 'certificate', []],
            ['residenza', 'residenza', 'noun', 'a2', 'comune', 'محل الإقامة المسجَّل', 'registered residence', []],
            ['sportello', 'sportello', 'noun', 'a2', 'comune', 'شباك الخدمة', 'service desk / counter', []],
            ['medico', 'medico', 'noun', 'a1', 'doctor', 'طبيب', 'doctor', []],
            ['farmacia', 'farmacia', 'noun', 'a1', 'pharmacy', 'صيدلية', 'pharmacy', ['Dov\'è la farmacia?', 'أين الصيدلية؟', 'Where is the pharmacy?']],
            ['ricetta', 'ricetta', 'noun', 'a2', 'pharmacy', 'وصفة طبية', 'prescription', []],
            ['banca', 'banca', 'noun', 'a1', 'bank', 'بنك', 'bank', []],
            ['conto-corrente', 'conto corrente', 'noun', 'a2', 'bank', 'حساب جاري', 'current account', []],
            ['affitto', 'affitto', 'noun', 'a1', 'landlord', 'إيجار', 'rent', []],
            ['contratto', 'contratto', 'noun', 'a2', 'landlord', 'عقد', 'contract', []],
            ['proprietario', 'proprietario', 'noun', 'a2', 'landlord', 'المالك', 'landlord / owner', []],
            ['patente-guida', 'patente', 'noun', 'a2', 'patente', 'رخصة القيادة', 'driving licence', []],
            ['segnale-stradale', 'segnale stradale', 'noun', 'a2', 'patente', 'إشارة مرور', 'road sign', []],
            ['precedenza', 'precedenza', 'noun', 'b1', 'patente', 'أولوية المرور', 'right of way', []],
            ['divieto-di-sosta', 'divieto di sosta', 'phrase', 'b1', 'patente', 'ممنوع الوقوف', 'no parking', []],
        ];
    }
}
