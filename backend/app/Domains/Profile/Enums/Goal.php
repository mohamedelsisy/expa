<?php

namespace App\Domains\Profile\Enums;

enum Goal: string
{
    case Documents = 'documents';
    case Work = 'work';
    case Study = 'study';
    case Italian = 'italian';
    case Housing = 'housing';
    case Healthcare = 'healthcare';
    case Driving = 'driving';
    case Business = 'business';
    case Family = 'family';
}
