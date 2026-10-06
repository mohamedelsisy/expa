<?php

namespace App\Domains\Learning\Enums;

enum ExerciseType: string
{
    case MultipleChoice = 'multiple_choice';
    case FillBlank = 'fill_blank';
    case Match = 'match';
    case Listening = 'listening';
}
