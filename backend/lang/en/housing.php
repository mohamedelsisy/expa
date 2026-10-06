<?php

return [
    'disclaimer' => 'This is an automatic, general check of the text you pasted. It is not legal advice and not a legal conclusion. Confirm important points with the landlord in writing and, if in doubt, with a qualified professional or a tenants\' association.',
    'signals' => [
        'rent_monthly' => 'Monthly rent',
        'deposit_mentioned' => 'Security deposit',
        'utilities_stated' => 'Whether utilities are included',
        'registration_mentioned' => 'Registration of the contract (registrazione)',
        'notice_period_mentioned' => 'Notice period',
        'utilities_cost' => 'Cost of utilities',
    ],
    'assumptions' => [
        'rent_missing' => 'No monthly rent was found in the text, so no monthly total could be computed. You can enter it yourself.',
        'utilities_included' => 'The text says utilities/expenses are included, so none were added.',
        'expenses_assumed_monthly' => 'The expenses amount found in the text is assumed to be monthly.',
        'utilities_not_counted_excluded' => 'The text says utilities are not included and no estimate was given: they are NOT counted. Enter your own estimate to include them.',
        'utilities_not_counted_unknown' => 'The text does not say whether utilities are included: they are NOT counted. Ask, or enter your own estimate.',
        'deposit_from_months' => 'The deposit amount was computed from the number of months found in the text multiplied by the rent.',
    ],
    'notes' => [
        'rent_ambiguous' => 'Several different rent amounts appear in the text: check which one applies.',
        'utilities_ambiguous' => 'The text mentions utilities both as included and as excluded: ask for clarification.',
        'deposit_months_derived' => 'The deposit in months was computed from the deposit amount and the rent.',
    ],
];
