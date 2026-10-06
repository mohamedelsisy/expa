<?php

namespace App\Domains\Profile\Enums;

/**
 * Every purpose for which EXPA processes personal data on a basis other than a legal duty.
 * Human-readable text lives in lang/{locale}/privacy.php under `purposes.<value>`.
 */
enum ConsentPurpose: string
{
    case Terms = 'terms';
    case Privacy = 'privacy';
    case ProfilePersonalization = 'profile_personalization';
    case DocumentStorage = 'document_storage';
    case AiPersonalization = 'ai_personalization';
    case EmailReminders = 'email_reminders';
    case PushNotifications = 'push_notifications';
    case Analytics = 'analytics';
    case Marketing = 'marketing';
    case HousingAnalysis = 'housing_analysis';
    case DocumentAnalysis = 'document_analysis';

    /** Required purposes cannot be withdrawn without deleting the account. */
    public function isRequired(): bool
    {
        return in_array($this, [self::Terms, self::Privacy], true);
    }

    public function legalBasis(): string
    {
        return match ($this) {
            self::Terms => 'contract',
            self::Privacy => 'legal_obligation',
            default => 'consent',
        };
    }
}
