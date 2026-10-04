<?php

namespace App\Domains\Government\Enums;

enum BookingMethod: string
{
    case Online = 'online';
    case Phone = 'phone';
    case Email = 'email';
    case InPerson = 'in_person';
    case Unknown = 'unknown';
}
