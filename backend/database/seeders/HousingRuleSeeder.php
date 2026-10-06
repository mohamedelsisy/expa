<?php

namespace Database\Seeders;

use App\Domains\Housing\Models\HousingRule;
use Illuminate\Database\Seeder;

/**
 * Conservative GENERAL-GUIDANCE rules for the rental checker: practical "ask / be careful" advice that makes no legal
 * claim and contains no numbers. Statutory limits (maximum deposit, contract durations, ...) are NOT seeded: they must be
 * entered by an editor as `sourced` rules with a verified source (docs/CONTENT_VERIFICATION.md).
 * Texts must be reviewed by a native Arabic/Italian speaker before launch; outside local/testing they enter the review
 * queue instead of going live. Idempotent: matched by slug.
 */
class HousingRuleSeeder extends Seeder
{
    public function run(): void
    {
        $live = ! app()->isProduction() && ! app()->environment('staging');
        foreach ($this->rules() as $i => $r) {
            $rule = HousingRule::firstOrNew(['slug' => $r['slug']]);
            $rule->fill(['kind' => $r['kind'], 'signal' => $r['signal'], 'condition' => $r['cond'], 'severity' => $r['sev'], 'basis' => 'general_guidance', 'sort_order' => $i * 10]);
            $rule->save();
            $rule->setTranslations($r['t']);
            $rule->forceFill($live ? ['status' => 'published', 'published_at' => $rule->published_at ?? now()] : ['status' => 'review'])->save();
        }
    }

    private function rules(): array
    {
        $t = fn (array $ar, array $en, array $it) => ['ar' => $this->tr($ar), 'en' => $this->tr($en), 'it' => $this->tr($it)];

        return [
            ['slug' => 'ask-written-contract', 'kind' => 'question', 'signal' => 'written_contract_mentioned', 'cond' => 'absent', 'sev' => 'info', 't' => $t(
                ['اطلب عقدًا مكتوبًا', 'لم نجد ذكرًا لعقد في النص. قبل دفع أي مبلغ اطلب العقد مكتوبًا واقرأه جيدًا.', 'هل يمكنني الحصول على العقد المكتوب وقراءته قبل دفع أي مبلغ؟'],
                ['Ask for a written contract', 'The text does not mention a contract. Before paying anything, ask for the contract in writing and read it carefully.', 'Can I get the written contract to read before I pay anything?'],
                ['Chiedi un contratto scritto', 'Nel testo non si parla di un contratto. Prima di pagare qualsiasi cosa, chiedi il contratto per iscritto e leggilo con attenzione.', 'Posso avere il contratto scritto da leggere prima di pagare qualsiasi cosa?'])],
            ['slug' => 'deposit-in-contract', 'kind' => 'question', 'signal' => 'deposit_mentioned', 'cond' => 'present', 'sev' => 'info', 't' => $t(
                ['تأكد من كتابة مبلغ التأمين في العقد', 'ذُكر مبلغ تأمين (Caparra). من الجيد أن يُكتب مبلغه وسبب أخذه وشروط إرجاعه في العقد.', 'هل مبلغ التأمين وشروط إرجاعه مكتوبة في العقد؟'],
                ['Make sure the deposit is written in the contract', 'A deposit (caparra) is mentioned. It is good practice for its amount, purpose and return conditions to be written in the contract.', 'Are the deposit amount and the conditions for returning it written in the contract?'],
                ['Verifica che il deposito sia scritto nel contratto', 'Si parla di un deposito (caparra). È buona prassi che importo, scopo e condizioni di restituzione siano scritti nel contratto.', 'L\'importo del deposito e le condizioni di restituzione sono scritti nel contratto?'])],
            ['slug' => 'no-contract-mentioned', 'kind' => 'red_flag', 'signal' => 'no_contract_mentioned', 'cond' => 'present', 'sev' => 'warning', 't' => $t(
                ['يبدو أن النص يذكر غياب العقد', 'يبدو أن النص يتحدث عن إيجار بدون عقد أو باتفاق شفهي. هذه إشارة تستدعي الحذر: اطلب عقدًا مكتوبًا قبل دفع أي شيء.', null],
                ['The text seems to mention no contract', 'The text seems to describe a rental without a contract or with a verbal agreement. This calls for caution: ask for a written contract before paying anything.', null],
                ['Il testo sembra citare l\'assenza di contratto', 'Il testo sembra descrivere un affitto senza contratto o con accordo verbale. È un segnale di cautela: chiedi un contratto scritto prima di pagare.', null])],
            ['slug' => 'cash-payment-mentioned', 'kind' => 'red_flag', 'signal' => 'cash_payment_mentioned', 'cond' => 'present', 'sev' => 'caution', 't' => $t(
                ['ذُكر الدفع نقدًا', 'الدفع النقدي يصعب إثباته. فضّل وسيلة دفع يمكن تتبعها واطلب إيصالًا مكتوبًا.', null],
                ['Cash payment is mentioned', 'Cash payments are hard to prove. Prefer a traceable payment method and ask for a written receipt.', null],
                ['Si parla di pagamento in contanti', 'I pagamenti in contanti sono difficili da dimostrare. Preferisci un metodo tracciabile e chiedi una ricevuta scritta.', null])],
            ['slug' => 'advance-payment-mentioned', 'kind' => 'red_flag', 'signal' => 'advance_payment_mentioned', 'cond' => 'present', 'sev' => 'warning', 't' => $t(
                ['طلب دفع قبل المعاينة', 'يبدو أن النص يطلب مالًا أو تحويلًا قبل أن ترى الشقة أو تقابل المؤجر. كن حذرًا جدًا: عاين الشقة وتحقق من هوية المؤجر أولًا.', null],
                ['Payment requested before viewing', 'The text seems to ask for money or a transfer before you see the apartment or meet the landlord. Be very careful: view the apartment and check who the landlord is first.', null],
                ['Pagamento richiesto prima della visita', 'Il testo sembra chiedere denaro o un bonifico prima di vedere l\'appartamento o incontrare il proprietario. Fai molta attenzione: prima visita l\'appartamento e verifica chi è il proprietario.', null])],
            ['slug' => 'pressure-language', 'kind' => 'red_flag', 'signal' => 'pressure_language', 'cond' => 'present', 'sev' => 'caution', 't' => $t(
                ['لغة تستعجلك', 'النص يستخدم عبارات تضغط عليك لتقرر بسرعة. خذ وقتك وقارن ولا تدفع قبل أن تتأكد.', null],
                ['Language that pressures you', 'The text uses wording that pushes you to decide quickly. Take your time, compare, and do not pay before you are sure.', null],
                ['Linguaggio che mette fretta', 'Il testo usa espressioni che spingono a decidere in fretta. Prenditi il tempo per confrontare e non pagare prima di essere sicuro.', null])],
            ['slug' => 'unregistered-mentioned', 'kind' => 'red_flag', 'signal' => 'unregistered_mentioned', 'cond' => 'present', 'sev' => 'caution', 't' => $t(
                ['يبدو أن العقد غير مسجل', 'يذكر النص عدم تسجيل العقد. اسأل عن السبب وتأكد من الوضع مع مختص قبل التوقيع.', null],
                ['The contract seems to be unregistered', 'The text mentions the contract not being registered. Ask why, and check the situation with a professional before signing.', null],
                ['Il contratto sembra non registrato', 'Il testo cita la mancata registrazione del contratto. Chiedi il motivo e verifica la situazione con un professionista prima di firmare.', null])],
            ['slug' => 'ask-registration', 'kind' => 'question', 'signal' => 'registration_mentioned', 'cond' => 'absent', 'sev' => 'info', 't' => $t(
                ['اسأل عن تسجيل العقد', 'لم نجد ذكرًا لتسجيل العقد (Registrazione) في النص.', 'هل سيتم تسجيل العقد، ومن سيتولى ذلك؟'],
                ['Ask about registering the contract', 'The text does not mention registration of the contract (registrazione).', 'Will the contract be registered, and who will take care of it?'],
                ['Chiedi della registrazione del contratto', 'Nel testo non si parla di registrazione del contratto.', 'Il contratto verrà registrato e chi se ne occuperà?'])],
            ['slug' => 'ask-utilities', 'kind' => 'question', 'signal' => 'utilities_stated', 'cond' => 'absent', 'sev' => 'info', 't' => $t(
                ['اسأل عن الفواتير', 'لا يوضح النص إن كانت الفواتير (كهرباء، غاز، ماء، إنترنت) مشمولة في الإيجار.', 'أي الفواتير مشمولة في الإيجار وكم يبلغ متوسطها الشهري؟'],
                ['Ask about utilities', 'The text does not say whether utilities (electricity, gas, water, internet) are included in the rent.', 'Which utilities are included in the rent, and what do they usually cost per month?'],
                ['Chiedi delle utenze', 'Il testo non dice se le utenze (luce, gas, acqua, internet) sono incluse nel canone.', 'Quali utenze sono incluse nel canone e quanto costano di solito al mese?'])],
            ['slug' => 'ask-notice-period', 'kind' => 'question', 'signal' => 'notice_period_mentioned', 'cond' => 'absent', 'sev' => 'info', 't' => $t(
                ['اسأل عن مدة الإشعار', 'لم نجد ذكرًا لمدة الإشعار (Preavviso) عند إنهاء العقد.', 'ما مدة الإشعار المطلوبة إذا أردت إنهاء العقد؟'],
                ['Ask about the notice period', 'The text does not mention the notice period (preavviso) for ending the contract.', 'How much notice is needed if I want to end the contract?'],
                ['Chiedi del preavviso', 'Nel testo non si parla del preavviso per terminare il contratto.', 'Quanto preavviso serve se voglio terminare il contratto?'])],
            ['slug' => 'ask-agency-fee', 'kind' => 'question', 'signal' => 'agency_fee_mentioned', 'cond' => 'present', 'sev' => 'info', 't' => $t(
                ['اسأل عن عمولة الوكالة', 'ذُكرت عمولة أو أتعاب وكالة. اسأل عن مبلغها وما تغطيه وموعد دفعها.', 'ما قيمة عمولة الوكالة، وما الذي تغطيه، ومتى تُدفع؟'],
                ['Ask about the agency fee', 'An agency fee or commission is mentioned. Ask for its amount, what it covers and when it is due.', 'How much is the agency fee, what does it cover, and when is it due?'],
                ['Chiedi della provvigione dell\'agenzia', 'Si parla di una provvigione o commissione di agenzia. Chiedi importo, cosa copre e quando è dovuta.', 'Quanto è la provvigione dell\'agenzia, cosa copre e quando va pagata?'])],
        ];
    }

    /** @return array{title:string,explanation:string,question:?string} */
    private function tr(array $x): array
    {
        return ['title' => $x[0], 'explanation' => $x[1], 'question' => $x[2]];
    }
}
