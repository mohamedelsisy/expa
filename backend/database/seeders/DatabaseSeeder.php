<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([AccessSeeder::class, GeographySeeder::class, DocumentTypeSeeder::class, StarterCurriculumSeeder::class, PlanSeeder::class]);

        // Local demo accounts only; never seed credentials in staging/production.
        if (app()->environment('local')) {
            User::factory()->create(['name' => 'Demo User', 'email' => 'demo@expa.test'])
                ->syncRoleKeys(['user']);
        }
    }
}
