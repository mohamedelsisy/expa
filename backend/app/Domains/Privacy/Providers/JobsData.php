<?php

namespace App\Domains\Privacy\Providers;

use App\Domains\Jobs\Models\JobProfile;
use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class JobsData implements PersonalDataProvider
{
    public function key(): string
    {
        return 'jobs';
    }

    public function export(User $user): array
    {
        $p = JobProfile::where('user_id', $user->id)->first();

        return [
            'preferences' => $p ? $p->only(['skills', 'experience_years', 'education', 'remote_preference', 'employment_types', 'salary_min_year']) : null,
            'saved_jobs' => DB::table('job_saves')->join('job_listings', 'job_listings.id', '=', 'job_saves.job_id')
                ->where('job_saves.user_id', $user->id)->orderBy('job_saves.id')->get(['job_listings.title', 'job_listings.company', 'job_saves.created_at'])->map(fn ($r) => (array) $r)->all(),
        ];
    }

    public function erase(User $user): void
    {
        DB::table('job_saves')->where('user_id', $user->id)->delete();
        JobProfile::where('user_id', $user->id)->delete();
    }
}
