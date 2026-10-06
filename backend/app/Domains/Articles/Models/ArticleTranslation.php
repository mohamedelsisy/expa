<?php

namespace App\Domains\Articles\Models;

use App\Support\Audit\Auditable;
use Illuminate\Database\Eloquent\Model;

class ArticleTranslation extends Model
{
    use Auditable;

    public $timestamps = false;

    protected $guarded = ['id', 'article_id'];

    protected array $auditExcept = ['body'];
}
