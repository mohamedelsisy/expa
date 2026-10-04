<?php

namespace App\Domains\Profile\Enums;

/** Self-declared situation used only for personalization. Not a legal determination. */
enum ResidenceType: string
{
    case NotArrived = 'not_arrived';
    case Visa = 'visa';
    case Permesso = 'permesso';
    case LongTerm = 'long_term';
    case EuCitizen = 'eu_citizen';
    case ItalianCitizen = 'italian_citizen';
    case Other = 'other';
}
