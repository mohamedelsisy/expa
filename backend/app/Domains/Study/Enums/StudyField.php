<?php

namespace App\Domains\Study\Enums;

enum StudyField: string
{
    case Engineering = 'engineering';
    case ComputerScience = 'computer_science';
    case Medicine = 'medicine';
    case Economics = 'economics';
    case Law = 'law';
    case Humanities = 'humanities';
    case ArtsDesign = 'arts_design';
    case Sciences = 'sciences';
    case Architecture = 'architecture';
    case Education = 'education';
    case Languages = 'languages';
    case Other = 'other';
}
