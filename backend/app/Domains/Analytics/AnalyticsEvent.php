<?php

namespace App\Domains\Analytics;

/** Closed list: anything else is rejected, so analytics can never become a free-form tracking channel. */
enum AnalyticsEvent: string
{
    case Signup = 'signup';
    case Login = 'login';
    case GuideView = 'guide_view';
    case JobView = 'job_view';
    case JobApplyClick = 'job_apply_click';
    case LessonStarted = 'lesson_started';
    case LessonCompleted = 'lesson_completed';
    case AiQuestion = 'ai_question';
    case DocumentAdded = 'document_added';
    case ReminderCreated = 'reminder_created';
    case AppointmentClicked = 'appointment_clicked';
    case SubscriptionStarted = 'subscription_started';
    case PatentePractice = 'patente_practice';
    case VocabularyPractice = 'vocabulary_practice';
    case DocumentExplained = 'document_explained';
    case HousingCheck = 'housing_check';

    /** Behaviour the client reports itself (needs consent). Everything else is a server-side system counter. */
    public static function clientReportable(): array
    {
        return [self::GuideView, self::JobView, self::AppointmentClicked, self::LessonStarted];
    }

    /** Events that may carry a content identifier (never a person). */
    public function allowsSubject(): bool
    {
        return in_array($this, [self::GuideView, self::AppointmentClicked, self::LessonStarted, self::LessonCompleted], true);
    }
}
