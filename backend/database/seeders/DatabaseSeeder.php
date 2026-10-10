<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /** Seed the application's database. */
    public function run(): void
    {
        $this->call([
            AccessSeeder::class,
            GeographySeeder::class,
            DocumentTypeSeeder::class,
            StarterCurriculumSeeder::class,
            HousingRuleSeeder::class,
            ItalianPracticeStarterSeeder::class,
            PlanSeeder::class,
            OfficialContentV1Seeder::class,
            OfficialContentV2Seeder::class,
            OfficialContentV3Seeder::class,
            OfficialContentV4Seeder::class,
            OfficialContentV5Seeder::class,
            OfficialContentV6Seeder::class,
            VerifiedItalyJobsV1Seeder::class,
            VerifiedItalyJobsV2Seeder::class,
            VerifiedItalyJobsV3Seeder::class,
        ]);

        // Rebuild indexes locally where seeded content is published. In staging/production,
        // content stays in review and is indexed by the normal publish workflow.
        if (app()->environment('local', 'testing')) {
            $this->command?->call('expa:search-reindex');
            $this->command?->call('expa:ai-reindex');
        }

        // Local demo accounts only; never seed credentials in staging/production.
        if (app()->environment('local')) {
            User::factory()->create(['name' => 'Demo User', 'email' => 'demo@expa.test'])
                ->syncRoleKeys(['user']);
        }
    }
}
