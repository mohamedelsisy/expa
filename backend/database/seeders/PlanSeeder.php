<?php

namespace Database\Seeders;

use App\Domains\Billing\Models\Plan;
use Illuminate\Database\Seeder;

/**
 * Seeds the plan catalogue ONCE. Existing plans are never overwritten (prices/features are edited in the
 * database/admin afterwards); only missing plans are created. Prices in config are placeholders.
 */
class PlanSeeder extends Seeder
{
    private const NAMES = [
        'free' => ['ar' => ['مجاني', 'الأساسيات: الأدلة والبحث وعدد محدود من أسئلة المساعد.'], 'en' => ['Free', 'The basics: guides, search and a limited number of assistant questions.'], 'it' => ['Gratuito', 'Le basi: guide, ricerca e un numero limitato di domande all\'assistente.']],
        'plus' => ['ar' => ['بلس', 'مساعد متقدم، تذكيرات متقدمة، ولوحة تحكم مخصصة.'], 'en' => ['Plus', 'Advanced assistant, advanced reminders and a personalised dashboard.'], 'it' => ['Plus', 'Assistente avanzato, promemoria avanzati e dashboard personalizzata.']],
        'pro' => ['ar' => ['برو', 'كل مزايا بلس مع تحليل المستندات ورصيد مساعدة بشرية ودعم ذو أولوية.'], 'en' => ['Pro', 'Everything in Plus with document analysis, human-assistance credits and priority support.'], 'it' => ['Pro', 'Tutto Plus, con analisi dei documenti, crediti di assistenza umana e supporto prioritario.']],
    ];

    public function run(): void
    {
        foreach (config('billing.plans') as $key => $def) {
            if (Plan::where('key', $key)->exists()) {
                continue;
            }
            $plan = Plan::create(['key' => $key, 'interval' => $def['interval'], 'price_minor' => $def['price_minor'], 'currency' => config('billing.currency'),
                'features' => $def['features'], 'sort_order' => $def['sort'], 'active' => true]);
            $plan->setTranslations(collect(self::NAMES[$key])->map(fn ($t) => ['name' => $t[0], 'description' => $t[1]])->all());
        }
    }
}
