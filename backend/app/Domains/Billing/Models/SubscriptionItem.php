<?php

namespace App\Domains\Billing\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionItem extends Model
{
    protected $guarded = ['id', 'subscription_id'];
}
