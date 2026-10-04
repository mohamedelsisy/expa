<?php

namespace Database\Seeders;

use App\Domains\Access\Services\AccessSynchronizer;
use Illuminate\Database\Seeder;

class AccessSeeder extends Seeder
{
    public function run(): void
    {
        app(AccessSynchronizer::class)->sync();
    }
}
