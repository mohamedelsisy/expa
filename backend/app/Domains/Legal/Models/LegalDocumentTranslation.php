<?php

namespace App\Domains\Legal\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class LegalDocumentTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'legal_document_id'];

    // The body is long legal text: the audit trail records that it changed, not the full text twice.
    protected array $auditExcept = ['body'];
}
