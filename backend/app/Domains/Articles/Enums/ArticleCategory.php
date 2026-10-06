<?php

namespace App\Domains\Articles\Enums;

enum ArticleCategory: string
{
    case News = 'news';
    case Immigration = 'immigration';
    case Work = 'work';
    case Study = 'study';
    case Housing = 'housing';
    case Healthcare = 'healthcare';
    case Money = 'money';
    case DailyLife = 'daily_life';
    case Culture = 'culture';
    case CityLife = 'city_life';
    case Tips = 'tips';
}
