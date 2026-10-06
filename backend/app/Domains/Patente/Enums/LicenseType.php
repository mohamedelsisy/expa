<?php

namespace App\Domains\Patente\Enums;

/** How EXPA may use the text of a question. EXPA ships no question bank: every question needs one of these plus proof. */
enum LicenseType: string
{
    case OriginalWork = 'original_work';          // written for EXPA by its own staff / commissioned authors
    case Licensed = 'licensed';                   // a contract with the rights holder
    case OfficialPermission = 'official_permission'; // written permission from the issuing authority
    case CreativeCommons = 'creative_commons';
    case PublicDomain = 'public_domain';
}
