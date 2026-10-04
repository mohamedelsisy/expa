<?php

namespace App\Domains\Government\Enums;

enum OfficeType: string
{
    case Questura = 'questura';
    case Prefettura = 'prefettura';
    case Comune = 'comune';
    case Anagrafe = 'anagrafe';
    case Asl = 'asl';
    case Inps = 'inps';
    case AgenziaEntrate = 'agenzia_entrate';
    case Poste = 'poste';
    case Motorizzazione = 'motorizzazione';
    case University = 'university';
    case Other = 'other';
}
