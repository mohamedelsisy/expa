<?php

namespace App\Domains\Study\Enums;

enum DegreeLevel: string
{
    case Bachelor = 'bachelor';
    case Master = 'master';
    case Phd = 'phd';
    case Short = 'short';          // short / vocational / professional courses
    case LanguageCourse = 'language_course';
}
