<?php

namespace App\Enums;

enum SourceType: string
{
    case Official = 'official';
    case Institutional = 'institutional';
    case VerifiedPartner = 'verified_partner';
    case ThirdParty = 'third_party';
}
