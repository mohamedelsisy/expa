<?php

namespace App\Enums;

enum ContentStatus: string
{
    case Draft = 'draft';
    case Review = 'review';
    case Approved = 'approved';
    case Published = 'published';
    case Archived = 'archived';

    /** @return array<int,self> */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Review],
            self::Review => [self::Draft, self::Approved],       // reject / approve
            self::Approved => [self::Review, self::Published],   // withdraw approval / publish (or scheduler)
            self::Published => [self::Approved, self::Archived], // unpublish / archive
            self::Archived => [self::Draft],                     // restore for rework
        };
    }

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, $this->allowedTransitions(), true);
    }
}
