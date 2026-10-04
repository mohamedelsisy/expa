<?php

namespace App\Domains\Privacy\Services;

use App\Domains\Privacy\Contracts\PersonalDataProvider;
use App\Models\User;

class PersonalDataExporter
{
    /** @param  iterable<PersonalDataProvider>  $providers */
    public function __construct(private iterable $providers) {}

    public function export(User $user): array
    {
        $bundle = ['format_version' => 1, 'generated_at' => now()->toIso8601String()];
        foreach ($this->providers as $provider) {
            $bundle[$provider->key()] = $provider->export($user);
        }

        return $bundle;
    }
}
