<?php

namespace App\Domains\Learning\Enums;

enum LessonType: string
{
    case Vocabulary = 'vocabulary';
    case Grammar = 'grammar';
    case Conversation = 'conversation';
    case Pronunciation = 'pronunciation';
    case Mission = 'mission';

    /** Slot name in the daily plan. */
    public function slot(): string
    {
        return match ($this) {
            self::Vocabulary => 'words',
            default => $this->value,
        };
    }
}
