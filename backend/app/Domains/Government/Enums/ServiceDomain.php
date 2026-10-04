<?php

namespace App\Domains\Government\Enums;

enum ServiceDomain: string
{
    case Immigration = 'immigration';
    case Tax = 'tax';
    case Health = 'health';
    case CivilRegistry = 'civil_registry';
    case SocialSecurity = 'social_security';
    case Identity = 'identity';
    case Transport = 'transport';
    case Postal = 'postal';
    case Education = 'education';
    case Labor = 'labor';
    case Other = 'other';
}
