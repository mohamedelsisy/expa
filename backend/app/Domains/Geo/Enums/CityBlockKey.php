<?php

namespace App\Domains\Geo\Enums;

use App\Domains\Guides\Enums\GuideCategory;

enum CityBlockKey: string
{
    case Overview = 'overview';
    case Transport = 'transport';
    case Housing = 'housing';
    case Healthcare = 'healthcare';
    case Work = 'work';
    case Study = 'study';
    case Bureaucracy = 'bureaucracy';
    case DailyLife = 'daily_life';
    case Costs = 'costs';

    /** City block shown next to a guide of this category (the region/city-specific information hook). */
    public static function forGuideCategory(GuideCategory $c): ?self
    {
        return match ($c) {
            GuideCategory::Immigration, GuideCategory::Documents, GuideCategory::Legal => self::Bureaucracy,
            GuideCategory::Housing => self::Housing,
            GuideCategory::Healthcare => self::Healthcare,
            GuideCategory::Work, GuideCategory::Business => self::Work,
            GuideCategory::Study => self::Study,
            GuideCategory::Money => self::Costs,
            GuideCategory::DailyLife, GuideCategory::Family => self::DailyLife,
            default => null,
        };
    }
}
