<?php

namespace App\Domains\Dashboard\Contracts;

use App\Models\User;

/**
 * A module contributes suggestions to "What should I do next?" by implementing this and tagging the class
 * `dashboard.action_providers` in AppServiceProvider (documents expiry, job matches, lessons…).
 * Providers must be cheap, must respect consent via ProfileContext, and must return already-localized text.
 */
interface NextActionProvider
{
    /**
     * @return list<array{key:string,type:string,priority:int,title:string,description:?string,cta:array{type:string,target:string}}>
     *                                                                                                                                priority: lower = more urgent (0–99 urgent deadlines, 100+ routine)
     */
    public function actionsFor(User $user): array;
}
