<?php

namespace Tests\Feature;

use App\Models\Tag;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that tags can be created.
     */
    public function test_can_create_tag()
    {
        $tagData = [
            'name' => 'Work',
            'color' => '#ff0000',
            'description' => 'Work related tasks'
        ];
        
        $response = $this->postJson('/tags', $tagData);
        
        $response->assertStatus(201);
        $response->assertJson([
            'name' => 'Work',
            'color' => '#ff0000',
            'description' => 'Work related tasks'
        ]);
        
        $this->assertDatabaseHas('tags', ['name' => 'Work']);
    }

    /**
     * Test that tag name is required.
     */
    public function test_tag_name_is_required()
    {
        $response = $this->postJson('/tags', [
            'color' => '#ff0000'
        ]);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    /**
     * Test that all tags can be viewed.
     */
    public function test_can_view_all_tags()
    {
        Tag::factory()->count(3)->create();
        
        $response = $this->getJson('/tags');
        
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    /**
     * Test that tags can be updated.
     */
    public function test_can_update_tag()
    {
        $tag = Tag::factory()->create([
            'name' => 'Original Name'
        ]);
        
        $updateData = [
            'name' => 'Updated Name',
            'color' => '#00ff00'
        ];
        
        $response = $this->putJson('/tags/' . $tag->id, $updateData);
        
        $response->assertStatus(200);
        $response->assertJson([
            'name' => 'Updated Name',
            'color' => '#00ff00'
        ]);
        
        $this->assertDatabaseHas('tags', [
            'id' => $tag->id,
            'name' => 'Updated Name'
        ]);
    }

    /**
     * Test that tags can be deleted.
     */
    public function test_can_delete_tag()
    {
        $tag = Tag::factory()->create();
        
        $response = $this->deleteJson('/tags/' . $tag->id);
        
        $response->assertStatus(204);
        
        $this->assertDatabaseMissing('tags', [
            'id' => $tag->id
        ]);
    }

    /**
     * Test that deleting a tag removes it from todos.
     */
    public function test_deleting_tag_removes_it_from_todos()
    {
        $tag = Tag::factory()->create();
        $todo = Todo::factory()->create();
        
        // Attach the tag to the todo
        $todo->tags()->attach($tag->id);
        
        $this->assertDatabaseHas('todo_tag', [
            'todo_id' => $todo->id,
            'tag_id' => $tag->id
        ]);
        
        $response = $this->deleteJson('/tags/' . $tag->id);
        
        $response->assertStatus(204);
        
        // Verify the pivot relationship is also deleted
        $this->assertDatabaseMissing('todo_tag', [
            'todo_id' => $todo->id,
            'tag_id' => $tag->id
        ]);
    }
}