<?php

namespace App\Domains\Profile\Enums;

enum AgeRange: string
{
    case Under18 = 'under_18';
    case From18To24 = '18_24';
    case From25To34 = '25_34';
    case From35To44 = '35_44';
    case From45To54 = '45_54';
    case Over55 = '55_plus';
}
