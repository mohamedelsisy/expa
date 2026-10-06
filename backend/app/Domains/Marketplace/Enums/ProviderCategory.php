<?php

namespace App\Domains\Marketplace\Enums;

enum ProviderCategory: string
{
    case Translator = 'translator';
    case Interpreter = 'interpreter';
    case Caf = 'caf';
    case Patronato = 'patronato';
    case Commercialista = 'commercialista';
    case Lawyer = 'lawyer';
    case Moving = 'moving';
    case Cleaning = 'cleaning';
    case Babysitter = 'babysitter';
    case Relocation = 'relocation';
    case DrivingSchool = 'driving_school';
}
