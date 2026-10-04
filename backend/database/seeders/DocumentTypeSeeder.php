<?php

namespace Database\Seeders;

use App\Domains\Documents\Models\DocumentType;
use Illuminate\Database\Seeder;

/** Reference data: kinds of personal documents a user can track. Idempotent. */
class DocumentTypeSeeder extends Seeder
{
    // key => [ar, en, it]
    private const TYPES = [
        'passport' => ['جواز السفر', 'Passport', 'Passaporto'],
        'visa' => ['تأشيرة (Visto)', 'Visa (Visto)', 'Visto'],
        'residence_permit' => ['تصريح الإقامة (Permesso di soggiorno)', 'Residence permit (Permesso di soggiorno)', 'Permesso di soggiorno'],
        'long_term_residence' => ['إقامة طويلة الأمد (Carta di soggiorno)', 'Long-term residence (Carta di soggiorno)', 'Carta di soggiorno'],
        'identity_card' => ['بطاقة الهوية (Carta d\'identità)', 'Identity card (Carta d\'identità)', 'Carta d\'identità'],
        'codice_fiscale' => ['الرقم الضريبي (Codice Fiscale)', 'Tax code (Codice Fiscale)', 'Codice fiscale'],
        'health_card' => ['البطاقة الصحية (Tessera Sanitaria)', 'Health card (Tessera Sanitaria)', 'Tessera sanitaria'],
        'driving_license' => ['رخصة القيادة (Patente)', 'Driving licence (Patente)', 'Patente di guida'],
        'insurance' => ['تأمين (Assicurazione)', 'Insurance (Assicurazione)', 'Assicurazione'],
        'contract' => ['عقد (Contratto)', 'Contract (Contratto)', 'Contratto'],
        'subscription' => ['اشتراك (Abbonamento)', 'Subscription (Abbonamento)', 'Abbonamento'],
        'other' => ['وثيقة أخرى', 'Other document', 'Altro documento'],
    ];

    public function run(): void
    {
        $order = 0;
        foreach (self::TYPES as $key => [$ar, $en, $it]) {
            $type = DocumentType::updateOrCreate(['key' => $key], ['sort_order' => ++$order * 10]);
            $type->setTranslations(['ar' => ['name' => $ar], 'en' => ['name' => $en], 'it' => ['name' => $it]]);
        }
    }
}
