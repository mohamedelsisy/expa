<?php

namespace App\Domains\Jobs\Enums;

enum RemoteMode: string
{
    case Onsite = 'onsite';
    case Hybrid = 'hybrid';
    case Remote = 'remote';
}
