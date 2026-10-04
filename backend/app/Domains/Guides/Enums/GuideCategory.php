<?php

namespace App\Domains\Guides\Enums;

enum GuideCategory: string
{
    case Immigration = 'immigration';
    case Documents = 'documents';
    case Work = 'work';
    case Study = 'study';
    case Housing = 'housing';
    case Healthcare = 'healthcare';
    case Money = 'money';
    case Business = 'business';
    case Family = 'family';
    case DailyLife = 'daily_life';
    case Driving = 'driving';
    case Travel = 'travel';
    case Legal = 'legal';
    case Language = 'language';
}
