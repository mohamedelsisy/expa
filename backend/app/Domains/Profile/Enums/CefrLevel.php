<?php

namespace App\Domains\Profile\Enums;

/** CEFR. A0 = beginner/none. Italian content tops out at C1; English self-assessment may use C2. */
enum CefrLevel: string
{
    case A0 = 'a0';
    case A1 = 'a1';
    case A2 = 'a2';
    case B1 = 'b1';
    case B2 = 'b2';
    case C1 = 'c1';
    case C2 = 'c2';
}
