<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Tag;
use App\Models\Scratchpad;

class ScratchpadTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\TagSeeder::class);
    }

    public function test_can_get_scratchpad_for_tag()
    {
        $tag = Tag::first();
        
        $response = $this->get("/tags/{$tag->id}/scratchpad");
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'tag_id',
            'data',
            'created_at',
            'updated_at'
        ]);
    }

    public function test_creates_empty_scratchpad_if_none_exists()
    {
        $tag = Tag::first();
        
        // Ensure no scratchpad exists
        $this->assertDatabaseMissing('scratchpads', ['tag_id' => $tag->id]);
        
        $response = $this->get("/tags/{$tag->id}/scratchpad");
        
        $response->assertStatus(200);
        $this->assertDatabaseHas('scratchpads', ['tag_id' => $tag->id]);
        
        $scratchpad = $response->json();
        $this->assertEquals([], $scratchpad['data']['elements']);
        $this->assertEquals(1.0, $scratchpad['data']['canvas']['zoom']);
        $this->assertTrue($scratchpad['data']['canvas']['gridEnabled']);
    }

    public function test_can_update_scratchpad_data()
    {
        $tag = Tag::first();
        $scratchpadData = [
            'elements' => [
                [
                    'id' => 'element-1',
                    'type' => 'text',
                    'position' => ['x' => 100, 'y' => 200],
                    'size' => ['width' => 200, 'height' => 100],
                    'data' => ['content' => 'Test content'],
                    'styles' => []
                ]
            ],
            'canvas' => [
                'zoom' => 1.5,
                'gridEnabled' => false
            ]
        ];

        $response = $this->put("/tags/{$tag->id}/scratchpad", [
            'data' => $scratchpadData
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('scratchpads', [
            'tag_id' => $tag->id,
        ]);

        $scratchpad = Scratchpad::where('tag_id', $tag->id)->first();
        $this->assertEquals($scratchpadData, $scratchpad->data);
    }

    public function test_can_create_new_scratchpad_via_update()
    {
        $tag = Tag::first();
        $scratchpadData = [
            'elements' => [],
            'canvas' => ['zoom' => 2.0, 'gridEnabled' => true]
        ];

        // Ensure no scratchpad exists
        $this->assertDatabaseMissing('scratchpads', ['tag_id' => $tag->id]);

        $response = $this->put("/tags/{$tag->id}/scratchpad", [
            'data' => $scratchpadData
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('scratchpads', ['tag_id' => $tag->id]);

        $scratchpad = Scratchpad::where('tag_id', $tag->id)->first();
        $this->assertEquals($scratchpadData, $scratchpad->data);
    }

    public function test_update_requires_valid_data_structure()
    {
        $tag = Tag::first();

        // Test missing data key
        $response = $this->putJson("/tags/{$tag->id}/scratchpad", []);
        $response->assertStatus(422);

        // Test invalid data structure
        $response = $this->putJson("/tags/{$tag->id}/scratchpad", [
            'data' => 'invalid'
        ]);
        $response->assertStatus(422);
    }

    public function test_can_delete_scratchpad()
    {
        $tag = Tag::first();
        
        // Create a scratchpad first
        Scratchpad::create([
            'tag_id' => $tag->id,
            'data' => ['elements' => [], 'canvas' => ['zoom' => 1.0, 'gridEnabled' => true]]
        ]);

        $this->assertDatabaseHas('scratchpads', ['tag_id' => $tag->id]);

        $response = $this->delete("/tags/{$tag->id}/scratchpad");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('scratchpads', ['tag_id' => $tag->id]);
    }

    public function test_delete_non_existent_scratchpad_returns_204()
    {
        $tag = Tag::first();

        $response = $this->delete("/tags/{$tag->id}/scratchpad");
        $response->assertStatus(204);
    }

    public function test_scratchpad_is_deleted_when_tag_is_deleted()
    {
        $tag = Tag::first();
        
        // Create a scratchpad
        Scratchpad::create([
            'tag_id' => $tag->id,
            'data' => ['elements' => [], 'canvas' => ['zoom' => 1.0, 'gridEnabled' => true]]
        ]);

        $this->assertDatabaseHas('scratchpads', ['tag_id' => $tag->id]);

        // Delete the tag
        $tag->delete();

        // Scratchpad should be deleted due to cascade
        $this->assertDatabaseMissing('scratchpads', ['tag_id' => $tag->id]);
    }

    public function test_tag_has_scratchpad_relationship()
    {
        $tag = Tag::first();
        
        // Create a scratchpad
        $scratchpad = Scratchpad::create([
            'tag_id' => $tag->id,
            'data' => ['elements' => [], 'canvas' => ['zoom' => 1.0, 'gridEnabled' => true]]
        ]);

        $this->assertEquals($scratchpad->id, $tag->scratchpad->id);
        $this->assertEquals($tag->id, $scratchpad->tag->id);
    }

    public function test_returns_404_for_non_existent_tag()
    {
        $response = $this->get("/tags/999/scratchpad");
        $response->assertStatus(404);

        $response = $this->put("/tags/999/scratchpad", [
            'data' => ['elements' => [], 'canvas' => ['zoom' => 1.0, 'gridEnabled' => true]]
        ]);
        $response->assertStatus(404);

        $response = $this->delete("/tags/999/scratchpad");
        $response->assertStatus(404);
    }
}