<?php

namespace App\Domains\Jobs\Enums;

enum EmploymentType: string
{
    case FullTime = 'full_time';
    case PartTime = 'part_time';
    case Contract = 'contract';
    case Internship = 'internship';
    case Freelance = 'freelance';
    case Other = 'other';
}
