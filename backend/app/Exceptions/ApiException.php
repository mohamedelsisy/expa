<?php

namespace App\Exceptions;

use RuntimeException;

/** A business-rule failure with a stable machine code; rendered as the standard error envelope. */
class ApiException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly int $status = 422,
        public readonly array $details = [],
    ) {
        parent::__construct($message);
    }
}
