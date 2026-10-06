<?php

return [
    // Leitner boxes 1..5: days until a card is due again after being answered correctly into that box.
    // Box 1 is also where a missed card returns. Simple on purpose; tune from real learner data.
    'leitner_days' => [1 => 1, 2 => 2, 3 => 4, 4 => 8, 5 => 16],

    'review_batch' => 10,
    'review_batch_max' => 30,
    'daily_new_cards' => 5,
    'daily_quiz_size' => 5,

    // true: content cannot be published before a teacher marked it reviewed (reviewed_by_teacher_at). Default false so the
    // starter content can ship, visibly flagged `reviewed:false`, while a teacher is found (task T-034).
    'require_teacher_review_to_publish' => (bool) env('LEARNING_REQUIRE_TEACHER_REVIEW', false),

    'vocabulary_extra_categories' => ['patente', 'general'],
];
