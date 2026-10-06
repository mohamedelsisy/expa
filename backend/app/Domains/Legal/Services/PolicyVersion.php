<?php

namespace App\Domains\Legal\Services;

use App\Domains\Legal\Models\LegalDocument;

/**
 * The privacy-policy version recorded with every consent. When a privacy document has been published through the
 * legal workflow its version wins; otherwise the configured (draft) value keeps working (backward compatible).
 * Publishing a new version therefore flags existing consents as outdated (re-consent), exactly like a config bump.
 */
class PolicyVersion
{
    public static function current(): string
    {
        $published = LegalDocument::currentPublished((string) config('legal.consent_document', 'privacy'));

        return $published ? mb_substr($published->version, 0, 20) : (string) config('privacy.policy_version');
    }

    public static function isFromPublishedDocument(): bool
    {
        return LegalDocument::currentPublished((string) config('legal.consent_document', 'privacy')) !== null;
    }
}
