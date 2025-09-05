<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Tag;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Scratchpad>
 */
class ScratchpadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tag_id' => Tag::factory(),
            'data' => [
                'elements' => [],
                'canvas' => [
                    'zoom' => 1.0,
                    'gridEnabled' => true
                ]
            ]
        ];
    }

    /**
     * Create a scratchpad with sample elements.
     */
    public function withElements(): static
    {
        return $this->state(fn (array $attributes) => [
            'data' => [
                'elements' => [
                    [
                        'id' => 'element-1',
                        'type' => 'text',
                        'position' => ['x' => 100, 'y' => 100],
                        'size' => ['width' => 200, 'height' => 100],
                        'data' => ['content' => 'Sample text content'],
                        'styles' => []
                    ],
                    [
                        'id' => 'element-2',
                        'type' => 'checklist',
                        'position' => ['x' => 350, 'y' => 100],
                        'size' => ['width' => 250, 'height' => 150],
                        'data' => [
                            'title' => 'Sample Checklist',
                            'items' => [
                                ['id' => 1, 'text' => 'First item', 'completed' => false],
                                ['id' => 2, 'text' => 'Second item', 'completed' => true]
                            ]
                        ],
                        'styles' => []
                    ]
                ],
                'canvas' => [
                    'zoom' => 1.0,
                    'gridEnabled' => true
                ]
            ]
        ]);
    }
}