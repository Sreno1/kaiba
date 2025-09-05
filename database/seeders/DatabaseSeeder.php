<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call the TagSeeder for initial tag setup
        $this->call([
            TagSeeder::class,
        ]);
    }
}
