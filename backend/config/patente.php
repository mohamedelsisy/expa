<?php

/*
| Mock-exam rules. These MUST mirror the current official theory-exam rules for the category; they are
| configuration (not code) so they can be corrected without a release. Verify against the official source
| before launch (task T-035). Practice mode (by topic) has no time limit and no pass/fail.
*/
return [
    'exam' => [
        'questions' => 30,
        'max_errors' => 3,
        'minutes' => 20,
        'late_grace_seconds' => 30,
        // An exam cannot be submitted before this share of its time has passed (stops "start, submit blank, read
        // every answer" scraping). Practice sessions have no timer.
        'min_submit_fraction' => 0.25,
    ],
    // Sessions a user may START per day (counted whether or not they were finished): bounds question scraping.
    'daily_exam_limit' => 10,
    'daily_practice_limit' => 30,
    'practice_max_questions' => 40,

    // A topic is "weak" when accuracy is below this and at least `weak_min_answers` answers exist.
    'weak_accuracy_percent' => 70,
    'weak_min_answers' => 5,

    // Questions may only be published with a recorded provenance/licence (rights_note). Never bundle an unlicensed bank.
    'require_rights_note' => true,

    // Structured licensing (license_type + rights_holder + license_proof_ref) is the standard. true = a question may still be
    // published with only the legacy free-text rights_note (backward compatible). Set false once existing questions are
    // migrated: then publishing is blocked unless all three structured fields are present.
    'legacy_rights_note_allowed' => (bool) env('PATENTE_LEGACY_RIGHTS_NOTE', true),
];
