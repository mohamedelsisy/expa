<?php

namespace App\Domains\Profile\Enums;

enum Segment: string
{
    case Newcomer = 'newcomer';
    case Worker = 'worker';
    case Student = 'student';
    case SelfEmployed = 'self_employed';
    case Family = 'family';
    case Other = 'other';
}
