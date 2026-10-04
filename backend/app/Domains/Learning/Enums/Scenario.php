<?php

namespace App\Domains\Learning\Enums;

enum Scenario: string
{
    case Comune = 'comune';
    case Doctor = 'doctor';
    case Pharmacy = 'pharmacy';
    case Bank = 'bank';
    case Work = 'work';
    case JobInterview = 'job_interview';
    case Landlord = 'landlord';
    case Restaurant = 'restaurant';
    case Supermarket = 'supermarket';
    case Police = 'police';
    case PostOffice = 'post_office';
    case ImmigrationOffice = 'immigration_office';
    case Everyday = 'everyday';
}
