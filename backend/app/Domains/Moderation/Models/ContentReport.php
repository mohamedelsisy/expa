<?php

namespace App\Domains\Moderation\Models;

use Illuminate\Database\Eloquent\Model;

/** A user report about a review / community item. Reporter id is nulled on erasure; moderation outcome stays. */
class ContentReport extends Model
{
    protected $guarded = ['id', 'user_id', 'status', 'handled_by', 'handled_at'];
}
