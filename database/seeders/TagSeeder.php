<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Work', 'color' => '#3B82F6', 'description' => 'Work-related tasks'],
            ['name' => 'Personal', 'color' => '#10B981', 'description' => 'Personal tasks and activities'],
            ['name' => 'Urgent', 'color' => '#EF4444', 'description' => 'High priority urgent tasks'],
            ['name' => 'Shopping', 'color' => '#8B5CF6', 'description' => 'Shopping and errands'],
            ['name' => 'Health', 'color' => '#F59E0B', 'description' => 'Health and fitness related'],
            ['name' => 'Learning', 'color' => '#6366F1', 'description' => 'Educational and learning tasks'],
        ];

        foreach ($tags as $tag) {
            \App\Models\Tag::create($tag);
        }
    }
}
