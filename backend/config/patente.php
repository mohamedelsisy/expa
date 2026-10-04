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
    ],
    'practice_max_questions' => 40,

    // A topic is "weak" when accuracy is below this and at least `weak_min_answers` answers exist.
    'weak_accuracy_percent' => 70,
    'weak_min_answers' => 5,

    // Questions may only be published with a recorded provenance/licence (rights_note). Never bundle an unlicensed bank.
    'require_rights_note' => true,
];
