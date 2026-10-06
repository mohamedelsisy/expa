<?php

return [
    'types' => [
        'comune' => 'Letter from the Comune',
        'questura' => 'Questura / immigration office',
        'inps' => 'INPS (social security)',
        'agenzia_entrate' => 'Agenzia delle Entrate (tax office)',
        'bolletta' => 'Utility bill',
        'busta_paga' => 'Payslip',
        'multa' => 'Traffic fine / penalty notice',
        'contratto' => 'Contract',
        'sanitaria' => 'Healthcare (ASL / hospital)',
        'scuola' => 'School',
        'unknown' => 'Unrecognised document',
    ],
    'date_labels' => [
        'appointment' => 'Appointment date',
        'issued' => 'Issue date',
        'deadline' => 'Deadline',
        'payment_due' => 'Payment due',
        'date' => 'Date found in the document',
    ],
    'disclaimer' => 'This explanation is automatic and general. It may be wrong or incomplete and it is not legal, tax or medical advice. Check the original document and the official source, and ask the office that sent it if you are unsure.',
    'summary_unavailable' => 'I couldn\'t process that right now. Please try again. The type and dates below were read directly from the text.',
    'actions' => [
        'reminder' => 'Create a reminder for :date',
        'guide' => 'Read the EXPA guide: :term',
        'appointment' => 'How to book an appointment',
    ],
];
